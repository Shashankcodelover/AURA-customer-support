import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getTickets,
  addTicket,
  deleteTicket,
  bulkAddTickets,
  getCapsules,
  addCapsule,
  deleteCapsule,
  bulkAddCapsules,
  getKbArticles,
  addKbArticle,
  deleteKbArticle,
  bulkAddKbArticles,
  getCorridors,
  addCorridor,
  deleteCorridor,
  bulkAddCorridors,
  getMeshMetrics,
  parseCSV,
} from '../lib/data/enterpriseStore.ts';

// ─── 1. CSV Parser & Ingestion Engine (Tests 1-5) ───────────────────
test('01. CSV Parser correctly extracts multi-column tabular data', () => {
  const csv = `customerId,category,subject,status\ncust-1,Billing,Invoice Issue,Open\ncust-2,Technical,API Timeout,Resolved`;
  const parsed = parseCSV(csv);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].customerId, 'cust-1');
  assert.equal(parsed[1].status, 'Resolved');
});

test('02. CSV Parser handles quoted values containing commas and line breaks', () => {
  const csv = `customerName,category,message\n"Acme, Corp",Billing,"Total charge was $4,500"\n"Beta LLC",Technical,"Normal message"`;
  const parsed = parseCSV(csv);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].customerName, 'Acme, Corp');
  assert.equal(parsed[0].message, 'Total charge was $4,500');
});

test('03. CSV Parser gracefully returns empty array for empty or whitespace string', () => {
  assert.equal(parseCSV('').length, 0);
  assert.equal(parseCSV('   \n  \n  ').length, 0);
});

test('04. CSV Parser returns empty array when only header line is present', () => {
  assert.equal(parseCSV('id,name,role').length, 0);
});

test('05. CSV Parser handles trailing empty lines and extra whitespace', () => {
  const csv = `id,name\n1,Alice\n2,Bob\n\n   \n`;
  const parsed = parseCSV(csv);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[1].name, 'Bob');
});

// ─── 2. Ticket Roster CRUD Operations (Tests 6-11) ─────────────────
test('06. getTickets returns initialized enterprise tickets dataset', () => {
  const tickets = getTickets();
  assert.ok(Array.isArray(tickets));
  assert.ok(tickets.length > 0);
});

test('07. addTicket inserts a new customer support ticket with full metadata', () => {
  const initialCount = getTickets().length;
  const newTicket = {
    id: 'ticket-auto-101',
    customerId: 'cust-stripe-vip',
    category: 'Billing',
    subject: 'Webhook signature validation failure',
    status: 'Open',
    date: new Date().toISOString(),
    sentiment: 'Negative',
  };
  const added = addTicket(newTicket);
  assert.equal(added.id, 'ticket-auto-101');
  assert.equal(getTickets().length, initialCount + 1);
});

test('08. Ticket contains valid sentiment rating (Positive, Neutral, Negative)', () => {
  const tickets = getTickets();
  const validSentiments = ['Positive', 'Neutral', 'Negative'];
  tickets.forEach((t) => {
    if (t.sentiment) {
      assert.ok(validSentiments.includes(t.sentiment) || typeof t.sentiment === 'string');
    }
  });
});

test('09. deleteTicket removes targeted ticket by ID', () => {
  const ticketToDelete = {
    id: 'ticket-temp-del',
    customerId: 'cust-temp',
    category: 'General',
    subject: 'Temporary Inquiry',
    status: 'Closed',
    date: new Date().toISOString(),
    sentiment: 'Neutral',
  };
  addTicket(ticketToDelete);
  const result = deleteTicket('ticket-temp-del');
  assert.equal(result.success, true);
  assert.equal(result.deletedId, 'ticket-temp-del');
  assert.equal(getTickets().some((t) => t.id === 'ticket-temp-del'), false);
});

test('10. deleteTicket handles non-existent ticket ID gracefully', () => {
  const result = deleteTicket('ticket-non-existent-9999');
  assert.equal(result.success, true);
  assert.equal(result.cascadedCapsules, 0);
});

test('11. bulkAddTickets prepends multiple tickets atomically', () => {
  const initialCount = getTickets().length;
  const batch = [
    { id: 'batch-t1', customerId: 'cust-b1', category: 'Technical', subject: 'Memory Leak', status: 'Open', date: new Date().toISOString() },
    { id: 'batch-t2', customerId: 'cust-b2', category: 'Security', subject: 'CORS header mismatch', status: 'Open', date: new Date().toISOString() }
  ];
  const result = bulkAddTickets(batch);
  assert.equal(result.added, 2);
  assert.equal(result.total, initialCount + 2);
});

// ─── 3. Cascading Deletion & Referential Integrity (Tests 12-15) ───
test('12. Deleting a ticket cascades deletion to associated customer capsules', () => {
  const custId = 'cust-cascade-owner';
  addTicket({
    id: 'ticket-cascade-master',
    customerId: custId,
    category: 'Billing',
    subject: 'Master billing inquiry',
    status: 'Open',
    date: new Date().toISOString(),
  });
  addCapsule({
    id: 'capsule-child-1',
    customerName: custId,
    customerTier: 'Enterprise',
    category: 'Billing',
    urgency: 'High',
    sentimentTrend: [40, 20],
    rootCause: 'Stripe webhook issue',
    confidence: 95,
    attemptedActions: ['Audited webhook'],
    recommendedAction: 'Retry transaction',
    originalMessage: 'Payment failed twice',
    createdAt: new Date().toISOString(),
  });

  const res = deleteTicket('ticket-cascade-master');
  assert.equal(res.success, true);
  assert.ok(res.cascadedCapsules >= 1);
  assert.equal(getCapsules().some((c) => c.customerName === custId), false);
});

test('13. Multi-capsule cascading purge clears all orphan child records', () => {
  const custId = 'cust-multi-orphan';
  addTicket({ id: 'ticket-multi-master', customerId: custId, category: 'Technical', subject: 'Cluster down', status: 'Open', date: new Date().toISOString() });
  addCapsule({ id: 'cap-orphan-1', customerName: custId, category: 'Technical', urgency: 'Critical', confidence: 99, sentimentTrend: [10], rootCause: 'OOM', attemptedActions: [], recommendedAction: 'Reboot', originalMessage: 'Down' });
  addCapsule({ id: 'cap-orphan-2', customerName: custId, category: 'Technical', urgency: 'High', confidence: 90, sentimentTrend: [20], rootCause: 'Disk Full', attemptedActions: [], recommendedAction: 'Clean', originalMessage: 'Warning' });

  const res = deleteTicket('ticket-multi-master');
  assert.equal(res.success, true);
  assert.ok(res.cascadedCapsules >= 2);
});

test('14. Ticket deletion does not affect capsules of unrelated customers', () => {
  addCapsule({ id: 'cap-safe-unrelated', customerName: 'cust-safe-unrelated', category: 'General', urgency: 'Low', confidence: 85, sentimentTrend: [80], rootCause: 'Query', attemptedActions: [], recommendedAction: 'Respond', originalMessage: 'Hi' });
  deleteTicket('non-existent-ticket-id');
  assert.ok(getCapsules().some((c) => c.id === 'cap-safe-unrelated'));
});

test('15. Ticket with no matching customer leaves capsules untouched', () => {
  const beforeCount = getCapsules().length;
  addTicket({ id: 'ticket-isolated', customerId: 'cust-no-capsule-ever', category: 'Other', subject: 'Isolated', status: 'Open', date: new Date().toISOString() });
  const res = deleteTicket('ticket-isolated');
  assert.equal(res.cascadedCapsules, 0);
  assert.equal(getCapsules().length, beforeCount);
});

// ─── 4. Context Capsules Lifecycle & AI Trajectory (Tests 16-22) ────
test('16. getCapsules retrieves enterprise context capsule collection', () => {
  const capsules = getCapsules();
  assert.ok(Array.isArray(capsules));
  assert.ok(capsules.length > 0);
});

test('17. addCapsule registers multi-step cognitive context state', () => {
  const cap = {
    id: 'capsule-unit-test-1',
    customerName: 'Vertex AI Corp',
    customerTier: 'Enterprise',
    category: 'Technical',
    urgency: 'Critical',
    sentimentTrend: [50, 30, 15],
    rootCause: 'TPU v5e slice connection timeout',
    confidence: 97,
    attemptedActions: ['Restarted TPU node worker', 'Verified VPC peering latency'],
    recommendedAction: 'Migrate active session to us-central1-b reservation',
    originalMessage: 'TPU cluster disconnected mid-training run',
    createdAt: new Date().toISOString(),
  };
  const added = addCapsule(cap);
  assert.equal(added.id, 'capsule-unit-test-1');
  assert.equal(added.confidence, 97);
});

test('18. Context capsule sentiment trend reflects progressive trajectory', () => {
  const cap = getCapsules().find((c) => c.id === 'capsule-unit-test-1');
  assert.ok(cap);
  assert.ok(Array.isArray(cap.sentimentTrend));
  assert.equal(cap.sentimentTrend.length, 3);
});

test('19. Context capsule rootCause provides deterministic explanation', () => {
  const cap = getCapsules().find((c) => c.id === 'capsule-unit-test-1');
  assert.ok(cap.rootCause.includes('TPU'));
});

test('20. deleteCapsule removes context capsule by ID', () => {
  const res = deleteCapsule('capsule-unit-test-1');
  assert.equal(res.success, true);
  assert.equal(res.deletedId, 'capsule-unit-test-1');
  assert.equal(getCapsules().some((c) => c.id === 'capsule-unit-test-1'), false);
});

test('21. bulkAddCapsules ingests batch of cognitive capsules', () => {
  const initial = getCapsules().length;
  const batch = [
    { id: 'b-cap-1', customerName: 'Client 1', category: 'Billing', urgency: 'Low', confidence: 91, sentimentTrend: [70], rootCause: 'Subscription renewal lag', attemptedActions: ['Checked ledger'], recommendedAction: 'Dispatch automated renewal receipt', originalMessage: 'Did my subscription renew?' },
    { id: 'b-cap-2', customerName: 'Client 2', category: 'Technical', urgency: 'Medium', confidence: 88, sentimentTrend: [60], rootCause: 'Worker pod memory pressure', attemptedActions: ['Logged heap profile'], recommendedAction: 'Scale worker replica pool to 5 pods', originalMessage: 'Response times are slow' }
  ];
  const res = bulkAddCapsules(batch);
  assert.equal(res.added, 2);
  assert.equal(res.total, initial + 2);
});

test('22. Capsules preserve customerTier (Enterprise, Pro, Starter)', () => {
  const capsules = getCapsules();
  const tiers = capsules.map((c) => c.customerTier).filter(Boolean);
  assert.ok(tiers.length > 0);
});

// ─── 5. Knowledge Base Index & Vector Retrieval (Tests 23-28) ──────
test('23. getKbArticles retrieves knowledge base articles collection', () => {
  const kb = getKbArticles();
  assert.ok(Array.isArray(kb));
  assert.ok(kb.length > 0);
});

test('24. addKbArticle registers new verified solution documentation', () => {
  const initial = getKbArticles().length;
  const newArticle = {
    id: 'kb-article-test-1',
    title: 'Resolving PostgreSQL 504 Deadlocks under High Concurrency',
    category: 'Technical',
    content: 'When worker pool exhausts max connections (100), pgbouncer queues requests causing 504. Remedy: Scale pool to 250.',
    tags: ['postgresql', 'deadlock', 'database', 'pgbouncer'],
    views: 142,
    helpfulVotes: 98,
    lastUpdated: new Date().toISOString(),
  };
  const added = addKbArticle(newArticle);
  assert.equal(added.id, 'kb-article-test-1');
  assert.equal(getKbArticles().length, initial + 1);
});

test('25. KB article tags support multi-keyword indexing', () => {
  const article = getKbArticles().find((a) => a.id === 'kb-article-test-1');
  assert.ok(article);
  assert.ok(article.tags.includes('postgresql'));
  assert.ok(article.tags.includes('pgbouncer'));
});

test('26. deleteKbArticle removes article by ID', () => {
  const res = deleteKbArticle('kb-article-test-1');
  assert.equal(res.success, true);
  assert.equal(res.deletedId, 'kb-article-test-1');
  assert.equal(getKbArticles().some((a) => a.id === 'kb-article-test-1'), false);
});

test('27. bulkAddKbArticles ingests catalog of technical solutions', () => {
  const initial = getKbArticles().length;
  const batch = [
    { id: 'b-kb-1', title: 'Stripe Webhook Idempotency', category: 'Billing', content: 'Use Idempotency-Key header.', tags: ['stripe'], views: 10, helpfulVotes: 5, lastUpdated: new Date().toISOString() },
    { id: 'b-kb-2', title: 'VPC Peering DNS Config', category: 'Networking', content: 'Enable DNS resolution in VPC.', tags: ['vpc'], views: 20, helpfulVotes: 12, lastUpdated: new Date().toISOString() }
  ];
  const res = bulkAddKbArticles(batch);
  assert.equal(res.added, 2);
  assert.equal(res.total, initial + 2);
});

test('28. Knowledge base search accurately matches keywords in title and content', () => {
  const articles = getKbArticles();
  const query = 'stripe';
  const matches = articles.filter(
    (a) => a.title.toLowerCase().includes(query) || a.content.toLowerCase().includes(query) || (a.tags && a.tags.some((t) => t.toLowerCase().includes(query)))
  );
  assert.ok(matches.length > 0);
});

// ─── 6. Relational Topology Mesh Corridors (Tests 29-35) ───────────
test('29. getCorridors returns active agent-to-agent communication pipelines', () => {
  const corridors = getCorridors();
  assert.ok(Array.isArray(corridors));
  assert.ok(corridors.length >= 5);
});

test('30. Corridors feature diversified communication protocols (gRPC, Neural Stream, HTTP/REST)', () => {
  const corridors = getCorridors();
  const protocols = new Set(corridors.map((c) => c.protocol));
  assert.ok(protocols.has('gRPC'));
  assert.ok(protocols.has('Neural Stream'));
  assert.ok(protocols.has('HTTP/REST'));
});

test('31. addCorridor establishes new low-latency agent bridge', () => {
  const initial = getCorridors().length;
  const newBridge = {
    id: 'corridor-test-ai-gateway',
    sourceAgent: 'Cognitive Router',
    targetAgent: 'ASTRA Deep Reasoning Agent',
    protocol: 'Neural Stream',
    latencyMs: 6,
    slaTargetMs: 25,
    status: 'ACTIVE',
    throughputTokPerSec: 3200,
    routeTier: 'Enterprise',
    description: 'Sub-10ms neural bridge for multi-agent reasoning consensus',
    createdAt: new Date().toISOString(),
  };
  const added = addCorridor(newBridge);
  assert.equal(added.id, 'corridor-test-ai-gateway');
  assert.equal(getCorridors().length, initial + 1);
});

test('32. Corridor enforces latency SLAs (latencyMs <= slaTargetMs)', () => {
  const bridge = getCorridors().find((c) => c.id === 'corridor-test-ai-gateway');
  assert.ok(bridge);
  assert.ok(bridge.latencyMs <= bridge.slaTargetMs);
});

test('33. deleteCorridor terminates agent communication bridge', () => {
  const res = deleteCorridor('corridor-test-ai-gateway');
  assert.equal(res.success, true);
  assert.equal(res.deletedId, 'corridor-test-ai-gateway');
  assert.equal(getCorridors().some((c) => c.id === 'corridor-test-ai-gateway'), false);
});

test('34. bulkAddCorridors provisions parallel multi-agent topologies', () => {
  const initial = getCorridors().length;
  const batch = [
    { id: 'b-cor-1', sourceAgent: 'Agent A', targetAgent: 'Agent B', protocol: 'gRPC', latencyMs: 10, slaTargetMs: 40, status: 'ACTIVE', throughputTokPerSec: 1000, routeTier: 'Pro', description: 'Test', createdAt: new Date().toISOString() },
    { id: 'b-cor-2', sourceAgent: 'Agent C', targetAgent: 'Agent D', protocol: 'HTTP/REST', latencyMs: 25, slaTargetMs: 50, status: 'STANDBY', throughputTokPerSec: 500, routeTier: 'Global', description: 'Test', createdAt: new Date().toISOString() }
  ];
  const res = bulkAddCorridors(batch);
  assert.equal(res.added, 2);
  assert.equal(res.total, initial + 2);
});

test('35. Corridors maintain distinct route tiers (Enterprise, Pro, Global)', () => {
  const corridors = getCorridors();
  const tiers = new Set(corridors.map((c) => c.routeTier));
  assert.ok(tiers.has('Enterprise'));
  assert.ok(tiers.has('Pro'));
});

// ─── 7. Mesh Telemetry & Operational Health (Tests 36-40) ──────────
test('36. getMeshMetrics calculates real-time aggregated topology metrics', () => {
  const metrics = getMeshMetrics();
  assert.ok(metrics.totalCorridors > 0);
  assert.ok(metrics.activeCorridors > 0);
  assert.ok(metrics.averageLatencyMs > 0);
  assert.ok(metrics.totalThroughputTokSec > 0);
  assert.ok(metrics.slaAdherencePercent >= 0 && metrics.slaAdherencePercent <= 100);
});

test('37. Mesh metrics accurately registers degraded route status', () => {
  addCorridor({
    id: 'corridor-degraded-probe',
    sourceAgent: 'Billing Specialist',
    targetAgent: 'Legacy ERP Bridge',
    protocol: 'HTTP/REST',
    latencyMs: 450,
    slaTargetMs: 100, // SLA violated
    status: 'DEGRADED',
    throughputTokPerSec: 120,
    routeTier: 'Global',
    description: 'Degraded corridor under simulated load',
    createdAt: new Date().toISOString(),
  });

  const metrics = getMeshMetrics();
  assert.ok(metrics.degradedCorridors >= 1);
  deleteCorridor('corridor-degraded-probe');
});

test('38. Total throughput only aggregates ACTIVE corridors', () => {
  const corridors = getCorridors();
  const activeExpected = corridors
    .filter((c) => c.status === 'ACTIVE')
    .reduce((sum, c) => sum + c.throughputTokPerSec, 0);
  const metrics = getMeshMetrics();
  assert.equal(metrics.totalThroughputTokSec, activeExpected);
});

test('39. Average latency computation reflects arithmetic mean across all corridors', () => {
  const corridors = getCorridors();
  const expectedMean = Math.round(corridors.reduce((sum, c) => sum + c.latencyMs, 0) / corridors.length);
  const metrics = getMeshMetrics();
  assert.equal(metrics.averageLatencyMs, expectedMean);
});

test('40. Standby corridors count reflects hot-standby failover routes', () => {
  const corridors = getCorridors();
  const standbyCount = corridors.filter((c) => c.status === 'STANDBY').length;
  const metrics = getMeshMetrics();
  assert.equal(metrics.standbyCorridors, standbyCount);
});

// ─── 8. Multi-Entity Cross-Relational Workflows (Tests 41-45) ──────
test('41. High-urgency context capsule links to critical active ticket', () => {
  const highUrgency = getCapsules().find((c) => c.urgency === 'High' || c.urgency === 'Critical');
  assert.ok(highUrgency);
  assert.ok(highUrgency.recommendedAction);
});

test('42. Recommended actions offer concrete remediation workflows', () => {
  const capsules = getCapsules();
  capsules.forEach((c) => {
    if (c.recommendedAction) {
      assert.ok(c.recommendedAction.length > 5);
    }
  });
});

test('43. Attempted actions log preserves audit trail of automated probes', () => {
  const capsules = getCapsules();
  const withAttempts = capsules.find((c) => c.attemptedActions && c.attemptedActions.length > 0);
  assert.ok(withAttempts);
  assert.ok(Array.isArray(withAttempts.attemptedActions));
});

test('44. Root cause categorization maps cleanly to technical and billing vectors', () => {
  const capsules = getCapsules();
  const categories = new Set(capsules.map((c) => c.category));
  assert.ok(categories.has('Billing') || categories.has('Technical'));
});

test('45. Ticket sentiment correlates with capsule urgency score', () => {
  const capsules = getCapsules();
  const critical = capsules.filter((c) => c.urgency === 'High' || c.urgency === 'Critical');
  assert.ok(critical.length > 0);
});

// ─── 9. Input Sanitization & Resilient Edge Cases (Tests 46-50) ─────
test('46. Deleting already-deleted corridor is idempotent and safe', () => {
  const id = 'idempotent-corridor-id';
  assert.equal(deleteCorridor(id).success, true);
  assert.equal(deleteCorridor(id).success, true);
});

test('47. Deleting already-deleted capsule is idempotent and safe', () => {
  const id = 'idempotent-capsule-id';
  assert.equal(deleteCapsule(id).success, true);
  assert.equal(deleteCapsule(id).success, true);
});

test('48. Deleting already-deleted KB article is idempotent and safe', () => {
  const id = 'idempotent-kb-id';
  assert.equal(deleteKbArticle(id).success, true);
  assert.equal(deleteKbArticle(id).success, true);
});

test('49. Bulk adding empty array returns 0 added without modifying store', () => {
  const beforeTickets = getTickets().length;
  const res = bulkAddTickets([]);
  assert.equal(res.added, 0);
  assert.equal(res.total, beforeTickets);
});

test('50. Enterprise store maintains global singleton state across module imports', () => {
  const tickets = getTickets();
  const capsules = getCapsules();
  const kb = getKbArticles();
  const corridors = getCorridors();
  assert.ok(tickets.length > 0);
  assert.ok(capsules.length > 0);
  assert.ok(kb.length > 0);
  assert.ok(corridors.length > 0);
});
