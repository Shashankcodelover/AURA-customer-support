'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import kbSeed from '@/lib/data/knowledgeBase.json';
import ticketsSeed from '@/lib/data/tickets.json';
import { ContextCapsule, KBArticle, Ticket } from '@/lib/types';

/**
 * ── ARCHITECTURE NOTE ───────────────────────────────────────────────
 * On Vercel, serverless API routes are stateless between invocations —
 * there's no guaranteed shared memory between the request that creates
 * a Context Capsule and the request that later loads the dashboard.
 *
 * Rather than bolt on a database just to make a hackathon demo reliable,
 * application state (capsules, KB growth, ticket log) lives here in the
 * browser (React Context + localStorage), while the actual AI reasoning
 * (classification, investigation, root-cause analysis) stays server-side
 * in the API routes. This is a deliberate, honest trade-off for demo
 * reliability — swap this provider for real reads/writes against
 * Postgres + a vector DB to go to production.
 * ─────────────────────────────────────────────────────────────────────
 */

export interface Toast {
  id: string;
  message: string;
  tone: 'success' | 'info' | 'warning';
}

interface AppStateShape {
  capsules: ContextCapsule[];
  resolvedCapsules: ContextCapsule[];
  kbArticles: KBArticle[];
  tickets: Ticket[];
  toasts: Toast[];
  addCapsule: (c: ContextCapsule) => void;
  addTicketRecord: (t: Ticket) => void;
  resolveCapsule: (id: string, note: string) => Promise<void>;
  resetDemo: () => void;
  pushToast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: string) => void;
}

const AppStateContext = createContext<AppStateShape | null>(null);
const STORAGE_KEY = 'aura-support-state-v1';

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [capsules, setCapsules] = useState<ContextCapsule[]>([]);
  const [resolvedCapsules, setResolvedCapsules] = useState<ContextCapsule[]>([]);
  const [kbArticles, setKbArticles] = useState<KBArticle[]>(kbSeed as KBArticle[]);
  const [tickets, setTickets] = useState<Ticket[]>(ticketsSeed as Ticket[]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hydrated, setHydrated] = useState(false);

  function pushToast(message: string, tone: Toast['tone'] = 'info') {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.capsules) setCapsules(parsed.capsules);
        if (parsed.resolvedCapsules) setResolvedCapsules(parsed.resolvedCapsules);
        if (parsed.kbArticles) setKbArticles(parsed.kbArticles);
        if (parsed.tickets) setTickets(parsed.tickets);
      }
    } catch {
      // ignore corrupt storage, start fresh
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ capsules, resolvedCapsules, kbArticles, tickets })
      );
    } catch {
      // storage full/unavailable - non-fatal
    }
  }, [capsules, resolvedCapsules, kbArticles, tickets, hydrated]);

  function addCapsule(c: ContextCapsule) {
    setCapsules((prev) => [c, ...prev]);
    pushToast(`🤝 Case escalated for ${c.customerName} — Context Capsule created`, 'warning');
  }

  function addTicketRecord(t: Ticket) {
    setTickets((prev) => [t, ...prev]);
  }

  async function resolveCapsule(id: string, note: string) {
    const capsule = capsules.find((c) => c.id === id);
    if (!capsule) return;

    setCapsules((prev) => prev.filter((c) => c.id !== id));
    setResolvedCapsules((prev) => [{ ...capsule }, ...prev]);

    try {
      const res = await fetch('/api/draft-kb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rootCause: capsule.rootCause, resolutionNote: note, category: capsule.category }),
      });
      const data = await res.json();
      if (data?.title && data?.content) {
        setKbArticles((prev) => [
          {
            id: `kb-${Date.now()}`,
            title: data.title,
            category: capsule.category,
            content: data.content,
            tags: [capsule.category.toLowerCase()],
          },
          ...prev,
        ]);
        pushToast(`📚 Self-learning loop: new KB article drafted — "${data.title}"`, 'success');
      }
    } catch {
      // non-fatal: capsule is still marked resolved even if KB drafting fails
    }
  }

  function resetDemo() {
    setCapsules([]);
    setResolvedCapsules([]);
    setKbArticles(kbSeed as KBArticle[]);
    setTickets(ticketsSeed as Ticket[]);
  }

  return (
    <AppStateContext.Provider
      value={{
        capsules,
        resolvedCapsules,
        kbArticles,
        tickets,
        toasts,
        addCapsule,
        addTicketRecord,
        resolveCapsule,
        resetDemo,
        pushToast,
        dismissToast,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within an AppStateProvider');
  return ctx;
}
