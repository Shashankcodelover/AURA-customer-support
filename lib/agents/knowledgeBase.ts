import kb from '@/lib/data/knowledgeBase.json';
import { KBArticle } from '@/lib/types';

/**
 * Lightweight keyword-overlap retriever standing in for a vector-DB RAG
 * lookup. Swap the body of this function for a real embedding similarity
 * search (Chroma/Pinecone/pgvector) in production — every call site in the
 * app only depends on this function's signature, not its implementation.
 */
export function searchKnowledgeBase(category: string, message: string): KBArticle | null {
  const text = message.toLowerCase();
  const articles = kb as KBArticle[];
  const candidates = articles.filter((a) => a.category === category);
  const pool = candidates.length ? candidates : articles;

  let best: KBArticle | null = null;
  let bestScore = 0;

  for (const article of pool) {
    const score = article.tags.filter((tag) => text.includes(tag.replace('-', ' ')) || text.includes(tag)).length;
    if (score > bestScore) {
      bestScore = score;
      best = article;
    }
  }

  return best ?? pool[0] ?? null;
}
