'use client';

import { useState } from 'react';
import { useAppState } from '@/lib/context/AppStateContext';
import {
  UploadCloud,
  FileText,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Database,
  RefreshCw,
  Copy,
  Terminal,
} from 'lucide-react';
import { playClickSound } from '@/lib/audio/soundEffects';

type EntityType = 'tickets' | 'capsules' | 'kb' | 'topology';

const SAMPLES = {
  tickets: {
    csv: `customerId,category,subject,status,date,sentiment,resolutionSummary
cust-apple-101,Billing,Duplicate $99 Developer Fee invoice detected,Open,2026-09-16T10:00:00Z,Negative,Pending Stripe credit reversal
cust-stripe-402,Technical,Webhook signature verification failure on TLS 1.3,Open,2026-09-16T10:30:00Z,Neutral,Updated HMAC secret rotation
cust-meta-909,Account,SAML SSO certificate expiration warning,Open,2026-09-16T11:00:00Z,Neutral,Generated new x509 cert metadata
cust-amazon-777,Order,Prime delivery stalled at regional hub 4,Resolved,2026-09-16T09:15:00Z,Positive,Rerouted carrier express drone
cust-google-303,Billing,Cloud compute quota charge anomaly,Open,2026-09-16T11:45:00Z,Negative,Investigating GPU node burst hours`,
    json: JSON.stringify(
      [
        {
          customerId: 'cust-apple-101',
          category: 'Billing',
          subject: 'Duplicate $99 Developer Fee invoice detected',
          status: 'Open',
          date: '2026-09-16T10:00:00Z',
          sentiment: 'Negative',
          resolutionSummary: 'Pending Stripe credit reversal',
        },
        {
          customerId: 'cust-stripe-402',
          category: 'Technical',
          subject: 'Webhook signature verification failure on TLS 1.3',
          status: 'Open',
          date: '2026-09-16T10:30:00Z',
          sentiment: 'Neutral',
          resolutionSummary: 'Updated HMAC secret rotation',
        },
        {
          customerId: 'cust-meta-909',
          category: 'Account',
          subject: 'SAML SSO certificate expiration warning',
          status: 'Open',
          date: '2026-09-16T11:00:00Z',
          sentiment: 'Neutral',
          resolutionSummary: 'Generated new x509 cert metadata',
        },
      ],
      null,
      2
    ),
  },
  capsules: {
    csv: `customerName,customerTier,category,urgency,sentimentTrend,rootCause,confidence,attemptedActions,recommendedAction,originalMessage
Stripe Global,Enterprise,Billing,High,50;40;25;10,Webhook retries exhausted on invoice settlement,97,Verified endpoint;Logged replay,Dispatch immediate account VIP concierge,Urgent: webhook timeout is causing invoice backlog on EU cluster
Shopify Core,Enterprise,Technical,High,70;55;30;15,Redis lock starvation on flash sale checkout,94,Inspected replica memory;Pushed cluster rebalance,Scale shard count to 64 nodes,Checkout checkout latency spiking to 4.2s for tier-1 merchants
OpenAI Fleet,Enterprise,Account,Medium,60;45;35;30,OAuth2 token refresh race condition under 50k RPS,91,Triaged token cache;Refreshed key,Enforce atomic token lease renewal,Token invalidation errors seen across enterprise workspace accounts`,
    json: JSON.stringify(
      [
        {
          customerName: 'Stripe Global',
          customerTier: 'Enterprise',
          category: 'Billing',
          urgency: 'High',
          sentimentTrend: [50, 40, 25, 10],
          rootCause: 'Webhook retries exhausted on invoice settlement',
          confidence: 97,
          attemptedActions: ['Verified endpoint', 'Logged replay'],
          recommendedAction: 'Dispatch immediate account VIP concierge',
          originalMessage: 'Urgent: webhook timeout is causing invoice backlog on EU cluster',
        },
        {
          customerName: 'Shopify Core',
          customerTier: 'Enterprise',
          category: 'Technical',
          urgency: 'High',
          sentimentTrend: [70, 55, 30, 15],
          rootCause: 'Redis lock starvation on flash sale checkout',
          confidence: 94,
          attemptedActions: ['Inspected replica memory', 'Pushed cluster rebalance'],
          recommendedAction: 'Scale shard count to 64 nodes',
          originalMessage: 'Checkout checkout latency spiking to 4.2s for tier-1 merchants',
        },
      ],
      null,
      2
    ),
  },
  kb: {
    csv: `title,category,content,tags
Resolving Stripe Double Invoicing Webhooks,Billing,When Stripe fires duplicate payment_intent.succeeded events under high concurrency, ensure idempotency keys are cached in Redis for 24 hours to prevent duplicate charge ledger entries.,billing;stripe;idempotency;payments
PostgreSQL Connection Deadlock Remediation,Technical,To clear deadlocks in pool worker replicas, query pg_stat_activity for PID blocking transaction and execute pg_terminate_backend with graceful failover.,postgres;database;deadlock;failover
Automated SAML 2.0 Identity Certificate Rollover,Account,Enterprise customers experiencing signature mismatches must verify IdP metadata XML and ensure X.509 cert fingerprint matches public key in Auth0 tenant settings.,auth;saml;sso;security`,
    json: JSON.stringify(
      [
        {
          title: 'Resolving Stripe Double Invoicing Webhooks',
          category: 'Billing',
          content:
            'When Stripe fires duplicate payment_intent.succeeded events under high concurrency, ensure idempotency keys are cached in Redis for 24 hours to prevent duplicate charge ledger entries.',
          tags: ['billing', 'stripe', 'idempotency'],
        },
        {
          title: 'PostgreSQL Connection Deadlock Remediation',
          category: 'Technical',
          content:
            'To clear deadlocks in pool worker replicas, query pg_stat_activity for PID blocking transaction and execute pg_terminate_backend with graceful failover.',
          tags: ['postgres', 'database', 'deadlock'],
        },
      ],
      null,
      2
    ),
  },
  topology: {
    csv: `sourceAgent,targetAgent,protocol,latencyMs,slaTargetMs,status,throughputTokPerSec,routeTier,description
Cognitive Router,Fraud Analysis Engine,gRPC,11,35,ACTIVE,1650,Enterprise,Zero-trust fraud & chargeback anomaly detection pipeline
Technical Specialist,Kubernetes Telemetry Pod,Neural Stream,6,25,ACTIVE,2900,Enterprise,Real-time K8s pod crash loop diagnostics via WebSocket
Billing Specialist,TaxJar Tax Compliance Hub,HTTP/REST,34,90,STANDBY,750,Pro,Automated multi-jurisdiction VAT/GST calculation pipeline
Order Concierge,FedEx Drone Logistics Fleet,WebSocket,19,60,ACTIVE,1300,Global,Autonomous delivery status tracking & carrier handoff corridor`,
    json: JSON.stringify(
      [
        {
          sourceAgent: 'Cognitive Router',
          targetAgent: 'Fraud Analysis Engine',
          protocol: 'gRPC',
          latencyMs: 11,
          slaTargetMs: 35,
          status: 'ACTIVE',
          throughputTokPerSec: 1650,
          routeTier: 'Enterprise',
          description: 'Zero-trust fraud & chargeback anomaly detection pipeline',
        },
        {
          sourceAgent: 'Technical Specialist',
          targetAgent: 'Kubernetes Telemetry Pod',
          protocol: 'Neural Stream',
          latencyMs: 6,
          slaTargetMs: 25,
          status: 'ACTIVE',
          throughputTokPerSec: 2900,
          routeTier: 'Enterprise',
          description: 'Real-time K8s pod crash loop diagnostics via WebSocket',
        },
      ],
      null,
      2
    ),
  },
};

export default function BulkIngestionStudio() {
  const {
    bulkImportTickets,
    bulkImportCapsules,
    bulkImportKbArticles,
    bulkImportCorridors,
    pushToast,
  } = useAppState();

  const [activeEntity, setActiveEntity] = useState<EntityType>('tickets');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [buffer, setBuffer] = useState<string>(SAMPLES.tickets.csv);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    count: number;
    message: string;
    sample?: any[];
  } | null>(null);

  // Line count
  const lineCount = buffer.trim() ? buffer.trim().split(/\r?\n/).length : 0;

  const handleEntityChange = (entity: EntityType) => {
    setActiveEntity(entity);
    setBuffer(SAMPLES[entity][format]);
    setLastResult(null);
    playClickSound();
  };

  const handleFormatChange = (fmt: 'csv' | 'json') => {
    setFormat(fmt);
    setBuffer(SAMPLES[activeEntity][fmt]);
    setLastResult(null);
    playClickSound();
  };

  const handleLoadSample = () => {
    setBuffer(SAMPLES[activeEntity][format]);
    pushToast(`Sample ${activeEntity.toUpperCase()} ${format.toUpperCase()} template injected`, 'info');
    playClickSound();
  };

  const handleClear = () => {
    setBuffer('');
    setLastResult(null);
  };

  const handleExecuteUpload = async () => {
    if (!buffer.trim()) {
      pushToast('Syntax buffer is empty. Please enter or load data first.', 'warning');
      return;
    }

    setIsProcessing(true);
    playClickSound();

    try {
      const endpoint = `/api/${activeEntity === 'kb' ? 'kb' : activeEntity}/upload`;
      const isJson = format === 'json';
      const headers: Record<string, string> = {
        'Content-Type': isJson ? 'application/json' : 'text/plain',
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: buffer,
      });

      const data = await res.json();

      if (data.success) {
        // Also update local client state
        if (activeEntity === 'tickets' && data.tickets) {
          bulkImportTickets(data.tickets);
        } else if (activeEntity === 'capsules' && data.capsules) {
          bulkImportCapsules(data.capsules);
        } else if (activeEntity === 'kb' && data.articles) {
          bulkImportKbArticles(data.articles);
        } else if (activeEntity === 'topology' && data.corridors) {
          bulkImportCorridors(data.corridors);
        }

        setLastResult({
          success: true,
          count: data.addedCount || lineCount - (format === 'csv' ? 1 : 0),
          message: data.message || `Successfully ingested batch records into active database`,
          sample: data.tickets || data.capsules || data.articles || data.corridors,
        });

        pushToast(`🎉 ${data.message || 'Ingestion completed successfully'}`, 'success');
      } else {
        setLastResult({
          success: false,
          count: 0,
          message: data.error || 'Ingestion failed during server execution',
        });
        pushToast(`❌ Ingestion failed: ${data.error}`, 'warning');
      }
    } catch (err: any) {
      setLastResult({
        success: false,
        count: 0,
        message: err.message || 'Network error executing upload request',
      });
      pushToast(`❌ ${err.message}`, 'warning');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(14,156,116,0.08)] dark:bg-[rgba(14,156,116,0.15)] text-[#0E9C74] dark:text-emerald-300 border border-[rgba(14,156,116,0.2)]">
              <span className="w-2 h-2 rounded-full bg-[#0E9C74] animate-pulse" />
              Enterprise ETL Pipeline
            </span>
            <span className="text-xs text-[#9599AD]">Multi-Entity Batch Ingestion</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#1B1D2A] dark:text-white flex items-center gap-3">
            <UploadCloud className="text-[#6D4AEB]" size={32} />
            Enterprise Bulk Ingestion Studio
          </h1>
          <p className="text-sm text-[#6B6E85] dark:text-[#8B8FA3] mt-1 max-w-2xl">
            Atomic batch upload for Support Incidents, Context Capsules, Knowledge Base documentation,
            and Agent Topology Corridors supporting raw CSV and formatted JSON payloads.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLoadSample}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[rgba(109,74,235,0.08)] dark:bg-violet-500/20 text-[#6D4AEB] dark:text-violet-300 border border-[rgba(109,74,235,0.25)] hover:bg-[rgba(109,74,235,0.15)] transition"
          >
            <Sparkles size={15} />
            Load Sample Template
          </button>
          <button
            onClick={handleClear}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-[rgba(255,255,255,0.7)] dark:bg-white/5 text-[#6B6E85] hover:text-[#1B1D2A] border border-white/90 dark:border-white/10 transition"
          >
            Clear Buffer
          </button>
        </div>
      </div>

      {/* Entity Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[rgba(255,255,255,0.6)] dark:bg-black/20 border border-white/90 dark:border-white/10">
        {[
          { id: 'tickets', label: 'Support Incidents', icon: FileText, count: 'Tickets' },
          { id: 'capsules', label: 'Context Capsules', icon: Layers, count: 'Escalations' },
          { id: 'kb', label: 'Knowledge Base', icon: Database, count: 'Articles' },
          { id: 'topology', label: 'Agent Mesh Corridors', icon: Terminal, count: 'Routes' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeEntity === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleEntityChange(tab.id as EntityType)}
              className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition ${
                isActive
                  ? 'bg-white dark:bg-[#0F1424] text-[#1B1D2A] dark:text-white shadow-md shadow-[#6D4AEB]/10 border border-white/90 dark:border-white/10'
                  : 'text-[#6B6E85] dark:text-gray-400 hover:text-[#1B1D2A]'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-[#6D4AEB]' : ''} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Editor Controls Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Format toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#6B6E85] uppercase tracking-wider">
            Format Schema:
          </span>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[rgba(255,255,255,0.5)] dark:bg-black/30 border border-white/90 dark:border-white/10">
            <button
              onClick={() => handleFormatChange('csv')}
              className={`px-3 py-1 rounded text-xs font-bold transition ${
                format === 'csv'
                  ? 'bg-[#6D4AEB] text-white shadow-sm'
                  : 'text-[#6B6E85] hover:text-[#1B1D2A]'
              }`}
            >
              CSV
            </button>
            <button
              onClick={() => handleFormatChange('json')}
              className={`px-3 py-1 rounded text-xs font-bold transition ${
                format === 'json'
                  ? 'bg-[#6D4AEB] text-white shadow-sm'
                  : 'text-[#6B6E85] hover:text-[#1B1D2A]'
              }`}
            >
              JSON
            </button>
          </div>
        </div>

        {/* Telemetry info */}
        <div className="flex items-center gap-4 text-xs">
          <span className="text-[#6B6E85]">
            Rows / Lines: <strong className="text-[#1B1D2A] dark:text-white">{lineCount}</strong>
          </span>
          <span className="text-[#6B6E85]">
            Target Table:{' '}
            <strong className="text-[#6D4AEB] dark:text-violet-300 capitalize">{activeEntity}</strong>
          </span>
        </div>
      </div>

      {/* Live Monospace Syntax Buffer */}
      <div className="glass-card overflow-hidden border border-white/90 dark:border-white/10">
        <div className="px-4 py-2.5 bg-[rgba(255,255,255,0.4)] dark:bg-black/40 border-b border-white/80 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#6B6E85] dark:text-gray-400">
            <FileCode size={14} className="text-[#6D4AEB]" />
            <span>schema_buffer.{format}</span>
          </div>
          <span className="text-[11px] text-[#9599AD]">UTF-8 Encoded Monospace Buffer</span>
        </div>

        <textarea
          value={buffer}
          onChange={(e) => setBuffer(e.target.value)}
          placeholder={`Paste raw ${format.toUpperCase()} contents here...`}
          rows={14}
          className="w-full p-4 font-mono text-xs leading-relaxed bg-[rgba(255,255,255,0.3)] dark:bg-[#070B16] text-[#1B1D2A] dark:text-emerald-300 placeholder-[#9599AD] outline-none resize-y border-none focus:ring-1 focus:ring-[#6D4AEB]/40"
        />

        <div className="p-4 bg-[rgba(255,255,255,0.5)] dark:bg-black/30 border-t border-white/80 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#6B6E85]">
            <CheckCircle2 size={15} className="text-[#0E9C74]" />
            <span>Schema parser ready. Atomic rollback enabled on syntax errors.</span>
          </div>

          <button
            onClick={handleExecuteUpload}
            disabled={isProcessing || !buffer.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs tracking-wide bg-gradient-to-r from-[#6EE7C8] via-[#B69CFF] to-[#FFAFD1] text-[#1B1D2A] hover:opacity-95 shadow-md shadow-[#6D4AEB]/20 transition transform active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                Parsing & Ingesting...
              </>
            ) : (
              <>
                <UploadCloud size={16} />
                Execute Atomic Ingestion
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Panel */}
      {lastResult && (
        <div
          className={`glass-card p-6 border-l-4 space-y-4 animate-fade-in ${
            lastResult.success
              ? 'border-l-[#0E9C74] bg-[rgba(14,156,116,0.03)]'
              : 'border-l-[#E11D48] bg-[rgba(225,29,72,0.03)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {lastResult.success ? (
                <CheckCircle2 size={20} className="text-[#0E9C74]" />
              ) : (
                <AlertTriangle size={20} className="text-[#E11D48]" />
              )}
              <h3 className="font-display text-base font-bold text-[#1B1D2A] dark:text-white">
                {lastResult.success ? 'Batch Ingestion Successful' : 'Ingestion Execution Failed'}
              </h3>
            </div>
            {lastResult.success && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[rgba(14,156,116,0.1)] text-[#0E9C74] border border-[rgba(14,156,116,0.2)]">
                +{lastResult.count} Records Committed
              </span>
            )}
          </div>

          <p className="text-xs text-[#6B6E85] dark:text-[#8B8FA3]">{lastResult.message}</p>

          {lastResult.sample && lastResult.sample.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[rgba(109,74,235,0.08)] dark:border-white/5">
              <span className="text-[11px] font-bold text-[#6B6E85] uppercase tracking-wider block">
                Committed Records Preview (First {lastResult.sample.length} items):
              </span>
              <div className="overflow-x-auto">
                <pre className="p-3 rounded-lg bg-[rgba(255,255,255,0.7)] dark:bg-black/40 text-[11px] font-mono text-[#1B1D2A] dark:text-gray-300 border border-white/90 dark:border-white/10">
                  {JSON.stringify(lastResult.sample, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
