'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import kbSeed from '@/lib/data/knowledgeBase.json';
import ticketsSeed from '@/lib/data/tickets.json';
import { ContextCapsule, KBArticle, Ticket, AgentCorridor } from '@/lib/types';
import { INITIAL_CORRIDORS } from '@/lib/data/enterpriseStore';

export interface Toast {
  id: string;
  message: string;
  tone: 'success' | 'info' | 'warning';
}

interface AppStateShape {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  capsules: ContextCapsule[];
  resolvedCapsules: ContextCapsule[];
  kbArticles: KBArticle[];
  tickets: Ticket[];
  corridors: AgentCorridor[];
  toasts: Toast[];
  addCapsule: (c: ContextCapsule) => void;
  deleteCapsule: (id: string) => Promise<void>;
  addTicketRecord: (t: Ticket) => void;
  deleteTicket: (id: string) => Promise<void>;
  addKbArticle: (article: KBArticle) => void;
  deleteKbArticle: (id: string) => Promise<void>;
  addCorridor: (c: AgentCorridor) => void;
  deleteCorridor: (id: string) => Promise<void>;
  bulkImportTickets: (newTickets: Ticket[]) => void;
  bulkImportCapsules: (newCapsules: ContextCapsule[]) => void;
  bulkImportKbArticles: (newArticles: KBArticle[]) => void;
  bulkImportCorridors: (newCorridors: AgentCorridor[]) => void;
  resolveCapsule: (id: string, note: string) => Promise<void>;
  resetDemo: () => void;
  pushToast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: string) => void;
}

const AppStateContext = createContext<AppStateShape | null>(null);
const STORAGE_KEY = 'aura-support-state-v2';

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [capsules, setCapsules] = useState<ContextCapsule[]>([]);
  const [resolvedCapsules, setResolvedCapsules] = useState<ContextCapsule[]>([]);
  const [kbArticles, setKbArticles] = useState<KBArticle[]>(kbSeed as KBArticle[]);
  const [tickets, setTickets] = useState<Ticket[]>(ticketsSeed as Ticket[]);
  const [corridors, setCorridors] = useState<AgentCorridor[]>(INITIAL_CORRIDORS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem('aura-theme') as 'light' | 'dark' | null;
      const initial = savedTheme === 'dark' ? 'dark' : 'light';
      setTheme(initial);
      if (initial === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      window.localStorage.setItem('aura-theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  };

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
        if (parsed.corridors) setCorridors(parsed.corridors);
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
        JSON.stringify({ capsules, resolvedCapsules, kbArticles, tickets, corridors })
      );
    } catch {
      // storage full/unavailable - non-fatal
    }
  }, [capsules, resolvedCapsules, kbArticles, tickets, corridors, hydrated]);

  function addCapsule(c: ContextCapsule) {
    setCapsules((prev) => [c, ...prev]);
    pushToast(`🤝 Case escalated for ${c.customerName} — Context Capsule created`, 'warning');
  }

  async function deleteCapsule(id: string) {
    setCapsules((prev) => prev.filter((c) => c.id !== id));
    setResolvedCapsules((prev) => prev.filter((c) => c.id !== id));
    pushToast(`🗑️ Context Capsule deleted with audit logs purged`, 'info');
    try {
      await fetch(`/api/capsules/${id}`, { method: 'DELETE' });
    } catch {
      // client-side delete already done
    }
  }

  function addTicketRecord(t: Ticket) {
    setTickets((prev) => [t, ...prev]);
  }

  async function deleteTicket(id: string) {
    const victim = tickets.find((t) => t.id === id);
    setTickets((prev) => prev.filter((t) => t.id !== id));
    if (victim) {
      // Cascade to capsules
      setCapsules((prev) => prev.filter((c) => c.customerName.toLowerCase() !== victim.customerId.toLowerCase()));
    }
    pushToast(`🗑️ Ticket ${id} and linked context records deleted`, 'info');
    try {
      await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
    } catch {
      // non-fatal
    }
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
      // non-fatal
    }
  }

  function addKbArticle(article: KBArticle) {
    setKbArticles((prev) => [article, ...prev]);
    pushToast(`📚 Knowledge Base article added: "${article.title}"`, 'success');
  }

  async function deleteKbArticle(id: string) {
    setKbArticles((prev) => prev.filter((a) => a.id !== id));
    pushToast(`🗑️ KB article removed from search index`, 'info');
    try {
      await fetch(`/api/kb/${id}`, { method: 'DELETE' });
    } catch {
      // non-fatal
    }
  }

  function addCorridor(corridor: AgentCorridor) {
    setCorridors((prev) => [corridor, ...prev]);
    pushToast(`⚡ New agent corridor provisioned: ${corridor.sourceAgent} ➔ ${corridor.targetAgent}`, 'success');
  }

  async function deleteCorridor(id: string) {
    setCorridors((prev) => prev.filter((c) => c.id !== id));
    pushToast(`✂️ Agent corridor severed from active routing mesh`, 'warning');
    try {
      await fetch(`/api/topology/${id}`, { method: 'DELETE' });
    } catch {
      // non-fatal
    }
  }

  function bulkImportTickets(newTickets: Ticket[]) {
    setTickets((prev) => [...newTickets, ...prev]);
    pushToast(`📥 Bulk Ingestion: ${newTickets.length} tickets loaded`, 'success');
  }

  function bulkImportCapsules(newCapsules: ContextCapsule[]) {
    setCapsules((prev) => [...newCapsules, ...prev]);
    pushToast(`📥 Bulk Ingestion: ${newCapsules.length} Context Capsules queued`, 'success');
  }

  function bulkImportKbArticles(newArticles: KBArticle[]) {
    setKbArticles((prev) => [...newArticles, ...prev]);
    pushToast(`📥 Bulk Ingestion: ${newArticles.length} KB articles indexed`, 'success');
  }

  function bulkImportCorridors(newCorridors: AgentCorridor[]) {
    setCorridors((prev) => [...newCorridors, ...prev]);
    pushToast(`📥 Bulk Ingestion: ${newCorridors.length} agent corridors deployed`, 'success');
  }

  function resetDemo() {
    setCapsules([]);
    setResolvedCapsules([]);
    setKbArticles(kbSeed as KBArticle[]);
    setTickets(ticketsSeed as Ticket[]);
    setCorridors(INITIAL_CORRIDORS);
  }

  return (
    <AppStateContext.Provider
      value={{
        theme,
        toggleTheme,
        capsules,
        resolvedCapsules,
        kbArticles,
        tickets,
        corridors,
        toasts,
        addCapsule,
        deleteCapsule,
        addTicketRecord,
        deleteTicket,
        addKbArticle,
        deleteKbArticle,
        addCorridor,
        deleteCorridor,
        bulkImportTickets,
        bulkImportCapsules,
        bulkImportKbArticles,
        bulkImportCorridors,
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
