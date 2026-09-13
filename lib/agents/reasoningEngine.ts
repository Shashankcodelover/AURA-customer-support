import kb from '@/lib/data/knowledgeBase.json';
import tickets from '@/lib/data/tickets.json';
import orders from '@/lib/data/orders.json';
import { KBArticle, Ticket, Order } from '@/lib/types';

/**
 * ── KNOWLEDGE REASONING ENGINE ──────────────────────────────────────
 * Combines three real, distinct sources — KB articles, resolved tickets'
 * resolution summaries, and order records/notes — into one scored corpus
 * and retrieves the most relevant matches for a message via TF-IDF term
 * weighting (term frequency x inverse document frequency), a standard,
 * genuine statistical retrieval technique.
 *
 * Honest scope note: this is TF-IDF over a small in-memory corpus, not a
 * production vector-embedding similarity search — there is no neural
 * encoder here, no ANN index, no semantic (synonym-level) matching. Swap
 * `crossSourceRetrieve()` for a real embedding-based lookup (pgvector,
 * Pinecone, Chroma) in production; every call site only depends on this
 * function's signature and return shape, not its internals.
 * ─────────────────────────────────────────────────────────────────────
 */

export type RetrievalSource = 'Knowledge Base' | 'Resolved Ticket' | 'Order Record';

export interface RetrievalMatch {
  id: string;
  source: RetrievalSource;
  category: string;
  title: string;
  text: string;
  score: number;
}

interface SourceDoc {
  id: string;
  source: RetrievalSource;
  category: string;
  title: string;
  text: string;
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'and', 'or', 'in',
  'on', 'for', 'with', 'i', 'my', 'me', 'it', 'this', 'that', 'please', 'you',
  'your', 'be', 'am', 'im', 'have', 'has', 'had', 'do', 'does', 'did', 'as',
  'at', 'but', 'so', 'if', 'not', 'still', 'just', 'been',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function buildCorpus(): SourceDoc[] {
  const docs: SourceDoc[] = [];

  (kb as KBArticle[]).forEach((a) =>
    docs.push({
      id: a.id,
      source: 'Knowledge Base',
      category: a.category,
      title: a.title,
      text: `${a.title} ${a.content} ${a.tags.join(' ')}`,
    })
  );

  (tickets as Ticket[])
    .filter((t) => t.status === 'Resolved' && t.resolutionSummary)
    .forEach((t) =>
      docs.push({
        id: t.id,
        source: 'Resolved Ticket',
        category: t.category,
        title: t.subject,
        text: `${t.subject} ${t.resolutionSummary}`,
      })
    );

  (orders as Order[])
    .filter((o) => o.notes)
    .forEach((o) =>
      docs.push({
        id: o.id,
        source: 'Order Record',
        category: 'Order',
        title: `${o.product} (${o.status})`,
        text: `${o.product} ${o.status} ${o.notes}`,
      })
    );

  return docs;
}

const CORPUS = buildCorpus();

function computeIdf(corpus: SourceDoc[]): Map<string, number> {
  const df = new Map<string, number>();
  corpus.forEach((doc) => {
    new Set(tokenize(doc.text)).forEach((term) => df.set(term, (df.get(term) ?? 0) + 1));
  });
  const idf = new Map<string, number>();
  const N = corpus.length || 1;
  df.forEach((count, term) => idf.set(term, Math.log((N + 1) / (count + 1)) + 1));
  return idf;
}

const IDF = computeIdf(CORPUS);

/**
 * Retrieve the top-K most relevant documents across KB + resolved tickets +
 * order records for a given message, weighted by TF-IDF overlap and boosted
 * for category match. Returns an empty array (never throws) if nothing
 * scores above zero.
 */
export function crossSourceRetrieve(category: string, message: string, topK = 3): RetrievalMatch[] {
  const queryTerms = tokenize(message);
  if (!queryTerms.length) return [];

  const queryTf = new Map<string, number>();
  queryTerms.forEach((t) => queryTf.set(t, (queryTf.get(t) ?? 0) + 1));

  const scored = CORPUS.map((doc) => {
    const docTf = new Map<string, number>();
    tokenize(doc.text).forEach((t) => docTf.set(t, (docTf.get(t) ?? 0) + 1));

    let score = 0;
    queryTf.forEach((qCount, term) => {
      const dCount = docTf.get(term);
      if (dCount) {
        const idf = IDF.get(term) ?? 1;
        score += qCount * dCount * idf * idf;
      }
    });

    if (doc.category === category) score *= 1.35;

    return { ...doc, score };
  });

  return scored
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/** Convenience: best single KB-only match, used where a specific policy article is needed. */
export function bestKbMatch(matches: RetrievalMatch[]): RetrievalMatch | null {
  return matches.find((m) => m.source === 'Knowledge Base') ?? null;
}
