import { createRequire } from 'node:module';
import { Ticket, ContextCapsule, KBArticle, AgentCorridor, MeshMetrics } from '../types';

const require = createRequire(import.meta.url);
const ticketsSeed = require('./tickets.json');
const kbSeed = require('./knowledgeBase.json');

export const INITIAL_CORRIDORS: AgentCorridor[] = [
  {
    id: 'corridor-1',
    sourceAgent: 'Cognitive Router',
    targetAgent: 'Billing Specialist',
    protocol: 'gRPC',
    latencyMs: 14,
    slaTargetMs: 50,
    status: 'ACTIVE',
    throughputTokPerSec: 1420,
    routeTier: 'Enterprise',
    description: 'Direct high-priority pipeline for Stripe invoice queries & chargeback mediation',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'corridor-2',
    sourceAgent: 'Cognitive Router',
    targetAgent: 'Technical Specialist',
    protocol: 'Neural Stream',
    latencyMs: 22,
    slaTargetMs: 80,
    status: 'ACTIVE',
    throughputTokPerSec: 1850,
    routeTier: 'Enterprise',
    description: 'Zero-latency WebSocket stream for cluster logs & API deadlock diagnosis',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'corridor-3',
    sourceAgent: 'Cognitive Router',
    targetAgent: 'Order Concierge',
    protocol: 'HTTP/REST',
    latencyMs: 31,
    slaTargetMs: 100,
    status: 'ACTIVE',
    throughputTokPerSec: 920,
    routeTier: 'Pro',
    description: 'RESTful sync with warehouse fulfillment and carrier transit telemetry',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'corridor-4',
    sourceAgent: 'Cognitive Router',
    targetAgent: 'Account Specialist',
    protocol: 'gRPC',
    latencyMs: 18,
    slaTargetMs: 60,
    status: 'ACTIVE',
    throughputTokPerSec: 1150,
    routeTier: 'Global',
    description: 'SSO/SAML policy validation and role-based workspace authorization',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'corridor-5',
    sourceAgent: 'Technical Specialist',
    targetAgent: 'Escalation Arbiter',
    protocol: 'Neural Stream',
    latencyMs: 8,
    slaTargetMs: 30,
    status: 'ACTIVE',
    throughputTokPerSec: 2400,
    routeTier: 'Enterprise',
    description: 'Autonomous high-urgency fallback for human supervisor context capsules',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'corridor-6',
    sourceAgent: 'Billing Specialist',
    targetAgent: 'Escalation Arbiter',
    protocol: 'HTTP/REST',
    latencyMs: 28,
    slaTargetMs: 90,
    status: 'STANDBY',
    throughputTokPerSec: 680,
    routeTier: 'Pro',
    description: 'Hot-standby route for refund approvals exceeding $2,500 threshold',
    createdAt: new Date().toISOString(),
  },
];

// Singleton store instance in global scope
declare global {
  // eslint-disable-next-line no-var
  var __aura_enterprise_store: {
    tickets: Ticket[];
    capsules: ContextCapsule[];
    kbArticles: KBArticle[];
    corridors: AgentCorridor[];
  } | undefined;
}

function getStore() {
  if (!globalThis.__aura_enterprise_store) {
    globalThis.__aura_enterprise_store = {
      tickets: [...(ticketsSeed as Ticket[])],
      capsules: [
        {
          id: 'capsule-init-1',
          customerName: 'Acme Global Corp',
          customerTier: 'Enterprise',
          category: 'Billing',
          urgency: 'High',
          sentimentTrend: [40, 25, 15, 10],
          rootCause: 'Duplicate recurring payment webhook generated double billing cycle on annual enterprise plan',
          confidence: 96,
          attemptedActions: ['Verified Stripe invoice idempotency key', 'Calculated overcharge credit of $4,800'],
          recommendedAction: 'Issue immediate credit ledger reversal and dispatch account executive VIP notification',
          originalMessage: 'We were charged twice for our annual enterprise subscription this morning! Please fix this immediately.',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: 'capsule-init-2',
          customerName: 'NovaTech Systems',
          customerTier: 'Enterprise',
          category: 'Technical',
          urgency: 'High',
          sentimentTrend: [60, 45, 30, 20],
          rootCause: 'Deadlock in PostgreSQL connection pool during batch data migration under 10k RPS load',
          confidence: 92,
          attemptedActions: ['Inspected pgbouncer query queue', 'Triaged connection leak in worker node #4'],
          recommendedAction: 'Increase max pool threshold to 250 and restart worker replica pool',
          originalMessage: 'Production cluster is reporting 504 Gateway Timeout on /api/v2/stream. Critical customer impact.',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
      ],
      kbArticles: [...(kbSeed as KBArticle[])],
      corridors: [...INITIAL_CORRIDORS],
    };
  }
  return globalThis.__aura_enterprise_store;
}

// Tickets Operations
export function getTickets(): Ticket[] {
  return getStore().tickets;
}

export function addTicket(ticket: Ticket): Ticket {
  const store = getStore();
  store.tickets = [ticket, ...store.tickets];
  return ticket;
}

export function deleteTicket(id: string): { success: boolean; deletedId: string; cascadedCapsules: number } {
  const store = getStore();
  const ticket = store.tickets.find((t) => t.id === id);
  store.tickets = store.tickets.filter((t) => t.id !== id);

  // Cascading cleanup: delete related capsules if customer match
  let cascadedCapsules = 0;
  if (ticket) {
    const beforeCount = store.capsules.length;
    store.capsules = store.capsules.filter(
      (c) => !c.id.includes(id) && !(c.customerName && ticket.customerId && c.customerName.toLowerCase() === ticket.customerId.toLowerCase())
    );
    cascadedCapsules = beforeCount - store.capsules.length;
  }

  return { success: true, deletedId: id, cascadedCapsules };
}

export function bulkAddTickets(newTickets: Ticket[]): { added: number; total: number } {
  const store = getStore();
  store.tickets = [...newTickets, ...store.tickets];
  return { added: newTickets.length, total: store.tickets.length };
}

// Context Capsules Operations
export function getCapsules(): ContextCapsule[] {
  return getStore().capsules;
}

export function addCapsule(capsule: ContextCapsule): ContextCapsule {
  const store = getStore();
  store.capsules = [capsule, ...store.capsules];
  return capsule;
}

export function deleteCapsule(id: string): { success: boolean; deletedId: string } {
  const store = getStore();
  store.capsules = store.capsules.filter((c) => c.id !== id);
  return { success: true, deletedId: id };
}

export function bulkAddCapsules(newCapsules: ContextCapsule[]): { added: number; total: number } {
  const store = getStore();
  store.capsules = [...newCapsules, ...store.capsules];
  return { added: newCapsules.length, total: store.capsules.length };
}

// KB Articles Operations
export function getKbArticles(): KBArticle[] {
  return getStore().kbArticles;
}

export function addKbArticle(article: KBArticle): KBArticle {
  const store = getStore();
  store.kbArticles = [article, ...store.kbArticles];
  return article;
}

export function deleteKbArticle(id: string): { success: boolean; deletedId: string } {
  const store = getStore();
  store.kbArticles = store.kbArticles.filter((a) => a.id !== id);
  return { success: true, deletedId: id };
}

export function bulkAddKbArticles(newArticles: KBArticle[]): { added: number; total: number } {
  const store = getStore();
  store.kbArticles = [...newArticles, ...store.kbArticles];
  return { added: newArticles.length, total: store.kbArticles.length };
}

// Agent Corridors Operations
export function getCorridors(): AgentCorridor[] {
  return getStore().corridors;
}

export function addCorridor(corridor: AgentCorridor): AgentCorridor {
  const store = getStore();
  store.corridors = [corridor, ...store.corridors];
  return corridor;
}

export function deleteCorridor(id: string): { success: boolean; deletedId: string } {
  const store = getStore();
  store.corridors = store.corridors.filter((c) => c.id !== id);
  return { success: true, deletedId: id };
}

export function bulkAddCorridors(newCorridors: AgentCorridor[]): { added: number; total: number } {
  const store = getStore();
  store.corridors = [...newCorridors, ...store.corridors];
  return { added: newCorridors.length, total: store.corridors.length };
}

export function getMeshMetrics(): MeshMetrics {
  const corridors = getCorridors();
  const total = corridors.length;
  const active = corridors.filter((c) => c.status === 'ACTIVE').length;
  const avgLatency = total > 0 ? Math.round(corridors.reduce((acc, c) => acc + c.latencyMs, 0) / total) : 0;
  const totalThroughput = corridors.reduce((acc, c) => acc + (c.status === 'ACTIVE' ? c.throughputTokPerSec : 0), 0);
  const slaAdherence =
    total > 0
      ? Math.round((corridors.filter((c) => c.latencyMs <= c.slaTargetMs).length / total) * 100)
      : 100;

  return {
    totalCorridors: total,
    activeCorridors: active,
    standbyCorridors: corridors.filter((c) => c.status === 'STANDBY').length,
    degradedCorridors: corridors.filter((c) => c.status === 'DEGRADED').length,
    averageLatencyMs: avgLatency,
    totalThroughputTokSec: totalThroughput,
    slaAdherencePercent: slaAdherence,
  };
}

// CSV Parser Helper
export function parseCSV(csvText: string): Array<Record<string, string>> {
  const lines = csvText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const results: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;
    const line = lines[i];

    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim().replace(/^["']|["']$/g, ''));

    if (row.length === headers.length) {
      const entry: Record<string, string> = {};
      headers.forEach((h, idx) => {
        entry[h] = row[idx] || '';
      });
      results.push(entry);
    }
  }

  return results;
}
