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

test('AURA Enterprise Fleet: CSV Parsing Utility', () => {
  const csvData = `customerId,category,subject,status
cust-stripe-99,Billing,Webhook duplication error,Open
cust-vercel-44,Technical,Edge function cold start timeout,Resolved`;

  const parsed = parseCSV(csvData);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].customerId, 'cust-stripe-99');
  assert.equal(parsed[0].category, 'Billing');
  assert.equal(parsed[1].customerId, 'cust-vercel-44');
  assert.equal(parsed[1].status, 'Resolved');
});

test('AURA Enterprise Fleet: CSV Parsing Edge Cases (Empty and Quoted Values)', () => {
  const emptyParsed = parseCSV('');
  assert.equal(emptyParsed.length, 0);

  const singleHeader = parseCSV('customerId,category,subject');
  assert.equal(singleHeader.length, 0);

  const quotedCsv = `customerName,category,originalMessage
"Acme, Corp",Billing,"He said: ""We need a refund now"""
"Global Tech",Technical,"Cluster partition warning"`;

  const parsed = parseCSV(quotedCsv);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].customerName, 'Acme, Corp');
  assert.equal(parsed[0].category, 'Billing');
});

test('AURA Enterprise Fleet: Ticket CRUD & Cascading Deletion', () => {
  const initialCount = getTickets().length;
  const newTicket = {
    id: 'test-ticket-999',
    customerId: 'cust-enterprise-vip',
    category: 'Billing',
    subject: 'Overcharge on compute credits',
    status: 'Open',
    date: new Date().toISOString(),
    sentiment: 'Negative',
  };

  addTicket(newTicket);
  assert.equal(getTickets().length, initialCount + 1);

  // Link a capsule to this customer
  addCapsule({
    id: 'capsule-linked-test',
    customerName: 'cust-enterprise-vip',
    customerTier: 'Enterprise',
    category: 'Billing',
    urgency: 'High',
    sentimentTrend: [40, 20, 10],
    rootCause: 'Compute credit glitch',
    confidence: 98,
    attemptedActions: ['Credit ledger audit'],
    recommendedAction: 'Manual override approval',
    originalMessage: 'Overcharge on compute credits',
    createdAt: new Date().toISOString(),
  });

  // Verify capsule exists
  const capsuleExists = getCapsules().some((c) => c.id === 'capsule-linked-test');
  assert.equal(capsuleExists, true);

  // Cascading deletion
  const result = deleteTicket('test-ticket-999');
  assert.equal(result.success, true);
  assert.equal(result.deletedId, 'test-ticket-999');
  assert.equal(result.cascadedCapsules >= 1, true);

  // Verify capsule was removed in cascade
  const capsuleAfter = getCapsules().some((c) => c.id === 'capsule-linked-test');
  assert.equal(capsuleAfter, false);
});

test('AURA Enterprise Fleet: Multi-Capsule Cascade Integrity', () => {
  const customer = 'MegaCorp Enterprise';
  addCapsule({
    id: 'cap-multi-1',
    customerName: customer,
    customerTier: 'Enterprise',
    category: 'Technical',
    urgency: 'High',
    sentimentTrend: [50, 20],
    rootCause: 'DB lock',
    confidence: 99,
    attemptedActions: ['Lock purge'],
    recommendedAction: 'Restart worker',
    originalMessage: 'DB locked',
    createdAt: new Date().toISOString(),
  });
  addCapsule({
    id: 'cap-multi-2',
    customerName: customer,
    customerTier: 'Enterprise',
    category: 'Technical',
    urgency: 'High',
    sentimentTrend: [40, 10],
    rootCause: 'Replication lag',
    confidence: 97,
    attemptedActions: ['Scale replica'],
    recommendedAction: 'Promote standby',
    originalMessage: 'Replication lag',
    createdAt: new Date().toISOString(),
  });

  addTicket({
    id: 'tick-megacorp',
    customerId: customer,
    category: 'Technical',
    subject: 'MegaCorp infrastructure alert',
    status: 'Open',
    date: new Date().toISOString(),
    sentiment: 'Negative',
  });

  const del = deleteTicket('tick-megacorp');
  assert.equal(del.cascadedCapsules, 2);
  assert.equal(getCapsules().some((c) => c.customerName === customer), false);
});

test('AURA Enterprise Fleet: Context Capsule Lifecycle', () => {
  const initialCount = getCapsules().length;
  const sampleCapsule = {
    id: 'capsule-unit-test-1',
    customerName: 'Datadog EMEA',
    customerTier: 'Enterprise',
    category: 'Technical',
    urgency: 'High',
    sentimentTrend: [50, 30, 20],
    rootCause: 'Kafka partition rebalance stall',
    confidence: 95,
    attemptedActions: ['Restart consumer pool'],
    recommendedAction: 'Increase fetch timeout',
    originalMessage: 'Consumer group lag exceeding 100k messages',
    createdAt: new Date().toISOString(),
  };

  addCapsule(sampleCapsule);
  assert.equal(getCapsules().length, initialCount + 1);

  const delResult = deleteCapsule('capsule-unit-test-1');
  assert.equal(delResult.success, true);
  assert.equal(getCapsules().some((c) => c.id === 'capsule-unit-test-1'), false);
});

test('AURA Enterprise Fleet: Knowledge Base Index Management', () => {
  const initialKbCount = getKbArticles().length;
  const testArticle = {
    id: 'kb-test-article',
    title: 'Resolving Kafka Partition Lag',
    category: 'Technical',
    content: 'Tune max.poll.interval.ms and increase worker consumer concurrency.',
    tags: ['kafka', 'tuning', 'streaming'],
  };

  addKbArticle(testArticle);
  assert.equal(getKbArticles().length, initialKbCount + 1);

  const delResult = deleteKbArticle('kb-test-article');
  assert.equal(delResult.success, true);
  assert.equal(getKbArticles().some((a) => a.id === 'kb-test-article'), false);
});

test('AURA Enterprise Fleet: Relational Topology Mesh Corridors', () => {
  const initialCorridorCount = getCorridors().length;
  const newCorridor = {
    id: 'corridor-test-mesh',
    sourceAgent: 'Cognitive Router',
    targetAgent: 'Escalation Arbiter',
    protocol: 'Neural Stream',
    latencyMs: 9,
    slaTargetMs: 25,
    status: 'ACTIVE',
    throughputTokPerSec: 3200,
    routeTier: 'Enterprise',
    description: 'Ultra-low latency direct arbitration bridge',
    createdAt: new Date().toISOString(),
  };

  addCorridor(newCorridor);
  assert.equal(getCorridors().length, initialCorridorCount + 1);

  const metrics = getMeshMetrics();
  assert.equal(metrics.totalCorridors >= 7, true);
  assert.equal(metrics.activeCorridors >= 5, true);
  assert.equal(metrics.averageLatencyMs > 0, true);
  assert.equal(metrics.totalThroughputTokSec > 5000, true);

  // Sever link
  const severResult = deleteCorridor('corridor-test-mesh');
  assert.equal(severResult.success, true);
  assert.equal(getCorridors().some((c) => c.id === 'corridor-test-mesh'), false);
});

test('AURA Enterprise Fleet: Mesh Metrics Calculation with Degraded Route', () => {
  const slowCorridor = {
    id: 'corridor-slow-route',
    sourceAgent: 'Legacy Gateway',
    targetAgent: 'Escalation Arbiter',
    protocol: 'HTTP/REST',
    latencyMs: 120, // Exceeds SLA of 40ms
    slaTargetMs: 40,
    status: 'DEGRADED',
    throughputTokPerSec: 250,
    routeTier: 'Global',
    createdAt: new Date().toISOString(),
  };

  addCorridor(slowCorridor);
  const metrics = getMeshMetrics();
  assert.equal(metrics.degradedCorridors >= 1, true);

  deleteCorridor('corridor-slow-route');
});

test('AURA Enterprise Fleet: Bulk Batch Ingestion (Tickets, Corridors, KB, Capsules)', () => {
  const batchTickets = [
    {
      id: 'tick-bulk-1',
      customerId: 'cust-bulk-alpha',
      category: 'Billing',
      subject: 'Bulk ticket 1',
      status: 'Open',
      date: new Date().toISOString(),
      sentiment: 'Neutral',
    },
    {
      id: 'tick-bulk-2',
      customerId: 'cust-bulk-beta',
      category: 'Technical',
      subject: 'Bulk ticket 2',
      status: 'Resolved',
      date: new Date().toISOString(),
      sentiment: 'Positive',
    },
  ];

  const ticketResult = bulkAddTickets(batchTickets);
  assert.equal(ticketResult.added, 2);

  const batchCorridors = [
    {
      id: 'corridor-bulk-1',
      sourceAgent: 'Fraud Specialist',
      targetAgent: 'Account Specialist',
      protocol: 'gRPC',
      latencyMs: 12,
      slaTargetMs: 40,
      status: 'ACTIVE',
      throughputTokPerSec: 1500,
      routeTier: 'Enterprise',
      createdAt: new Date().toISOString(),
    },
  ];

  const corridorResult = bulkAddCorridors(batchCorridors);
  assert.equal(corridorResult.added, 1);

  const batchCapsules = [
    {
      id: 'cap-bulk-1',
      customerName: 'Uber Technologies',
      customerTier: 'Enterprise',
      category: 'Billing',
      urgency: 'High',
      sentimentTrend: [50, 25, 10],
      rootCause: 'Fleet surge billing discrepancy',
      confidence: 96,
      attemptedActions: ['Trip ID match'],
      recommendedAction: 'Fare correction',
      originalMessage: 'Driver payout mismatch on ride batch #84',
      createdAt: new Date().toISOString(),
    },
  ];

  const capResult = bulkAddCapsules(batchCapsules);
  assert.equal(capResult.added, 1);

  const batchKb = [
    {
      id: 'kb-bulk-1',
      title: 'Batch Ingested Security Policy',
      category: 'Account',
      content: 'Multi-factor authentication must be enabled for all workspace members.',
      tags: ['security', 'mfa'],
    },
  ];

  const kbResult = bulkAddKbArticles(batchKb);
  assert.equal(kbResult.added, 1);
});
