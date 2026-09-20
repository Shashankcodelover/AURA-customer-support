# AURA — Autonomous Unified Resolution Agent

***"It doesn't just answer tickets. It investigates them."***

A multi-agent AI customer support system built for the **CUSTOMER SUPPORT** hackathon track. AURA routes incoming issues to specialist agents, investigates root causes across orders/tickets/knowledge base, auto-resolves what it safely can, and hands everything else to a human with a complete **Context Capsule** instead of a raw chat log — then learns from every resolution.

Built with **Next.js 14 + TypeScript + Tailwind**, reasoning powered by **Qwen**, orchestrated as a set of clean agent nodes designed to map directly onto an **EnterPro** workflow graph in production.

---

## ✨ The Wow Factors (what to point out to judges)

| # | Feature | Where to see it |
|---|---|---|
| 1 | **Live Agent Network Diagram** — an animated pipeline (Router → 4 specialist agents → Reasoning → Escalation) that lights up node by node as the real agent handling the case changes | Home page, appears the instant you send a case |
| 2 | **Data Source Evidence Panel** — Customer Profile / Order Records / Ticket History / Knowledge Base flip from pending to ✓ found in real time, visually proving cross-source investigation | Home page, next to the network diagram |
| 3 | **Live Reasoning Timeline** — full chain-of-thought streams into view step by step, fully transparent | Home page, below the evidence panel |
| 4 | **Root-Cause Detective** — traces symptom → actual cause across orders + tickets + KB, not just a category tag | Reasoning steps text |
| 5 | **Confidence Gauge** — a circular meter (not just a number) shown on every resolution and every Context Capsule | Home page result card, Agent Dashboard |
| 6 | **Context Capsule Handoff** — structured case file (sentiment trend, confidence, attempted actions, recommendation) instead of a chat transcript | Agent Dashboard, after an escalation |
| 7 | **Self-Learning Loop** — resolving a capsule auto-drafts a new KB article, confirmed with a toast | Agent Dashboard → "Resolve this case" |
| 8 | **Multimodal Screenshot Analysis** — attach a real screenshot; AURA calls a vision-capable Qwen model if configured, and is honest (not fake) when it isn't | Home page → 📎 attach icon |
| 9 | **System Pulse** — live stats strip (cases handled, auto-resolve rate) that updates in real time as you run cases | Top of Home page |
| 10 | **Churn Radar + Emerging Complaint Signals** — recurring issue clusters, at-risk customer scoring, and keyword-frequency trend detection | `/analytics` page |
| 11 | **Toast confirmations** — visible feedback the instant an action is taken (refund executed, case escalated, KB updated) | Bottom-right, throughout |
| 12 | **Reset Demo button** — clears session state instantly for a clean re-run between judge walkthroughs | Top nav, circular arrow icon |
| 13 | **Registered Workflow Definition** — a portable, inspectable node graph (`enterpro.workflow.json`) that the runtime literally executes against — the real EnterPro-satisfying artifact, not just a claim | `/workflow` page, and referenced in every reasoning trace |
| 14 | **Genuinely Independent Specialist Agents** — Billing/Technical/Order/Account each live in their own file with their own domain logic (order-value risk, recurring-bug detection, shipment staleness, identity-verification risk) and are dispatched through a registry, not an if/else ladder | `lib/agents/specialists/*.ts`, reasoning trace shows each specialist's distinct checks |
| 15 | **Cross-Source Knowledge Reasoning Engine** — real TF-IDF term-weighted retrieval across KB articles + resolved-ticket precedents + order records, not single-source keyword matching | `lib/agents/reasoningEngine.ts`, reasoning trace shows "Cross-referenced N source(s)" |
| 16 | **Multi-Turn Conversation Memory** — free-text messages carry the full running thread; a second message about the same issue is recognized as a follow-up, urgency/confidence adjust accordingly, and the resolution message acknowledges the earlier turn | Home page — send a message, then send a related follow-up in the same session |

---

## 🔌 How AURA satisfies the EnterPro requirement

Being straightforward about this: **we could not find public API docs for "EnterPro"** as referenced in the track requirements — it's very likely a sponsor-specific tool provisioned directly by the hackathon organizers (check your event portal/Discord for credentials, since this is common for sponsor tracks).

Rather than fake an integration or skip the requirement, we built the actual artifact an orchestration platform needs to ingest, and made the app run against it live:

- **`lib/workflow/enterpro.workflow.json`** — a declarative node graph (Router → Specialist Dispatch → 4 specialist agents → Reasoning → Escalation Decision → Auto-Resolve / Context Capsule → Human Handoff → Self-Learning Loop). This is the exact shape a workflow/orchestration platform imports.
- **`lib/workflow/workflowEngine.ts`** — the single integration seam. Every part of the app calls functions from this file, never a hypothetical SDK directly. The file's own comments are a step-by-step checklist for wiring in the real EnterPro SDK the moment you have their docs: install their package, replace `getWorkflowDefinition()` to register with their platform instead of reading the local JSON, and replace node execution with their dispatch call. No other file needs to change.
- **The runtime actually references it** — every case (scripted or free-text) opens its reasoning trace with `Executing registered workflow "aura-customer-support-pipeline v1.0"`, pulled live from the JSON file via `getWorkflowSummary()`. This isn't decorative text; it's a real function call reading a real config file.
- **`/workflow` page** — renders the full node graph so judges can inspect it directly instead of taking your word for it.

**If you get EnterPro credentials before submitting**, send me their docs and I'll wire `workflowEngine.ts` to actually call their API — the architecture is built so that's a small, contained change.

---

## 🚀 Quick Start (local)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). **No API key required** — the app runs fully on a built-in local reasoning engine + 4 scripted demo scenarios, so it works perfectly offline or with zero setup.

## ☁️ Deploy to Vercel

1. Push this folder to a new GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Leave all settings as default (Next.js is auto-detected) → **Deploy**.
4. That's it — no environment variables are required for the demo to work.

*(Alternative: install the [Vercel CLI](https://vercel.com/docs/cli) and run `vercel` from this folder.)*

### Optional: enable real Qwen reasoning

Copy `.env.example` to `.env.local` (locally) or add the same variables under Vercel → Project → Settings → Environment Variables:

```
QWEN_API_KEY=your_key_here
QWEN_API_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen-plus
```

With a key set, free-text messages get classified and reasoned about by the real Qwen model, and KB articles are LLM-drafted instead of templated. Attaching a screenshot will also trigger a real vision call (`QWEN_VISION_MODEL`, defaults to `qwen-vl-plus`). Without any key, everything still works — see `lib/agents/qwen.ts`.

---

## 🎬 90-Second Judge Demo Script

1. **Home page** → click **💳 Duplicate Charge**. Narrate: *"Watch the agent network light up — Router hands off to Billing, evidence panel confirms it's pulling from order records, ticket history, and the knowledge base in real time."* Let the reasoning timeline finish, point out the confidence gauge and auto-refund action.
2. Click **⚠️ Cancel Subscription** → narrate: *"This time confidence is only 55% and it's a $4,800 Enterprise account — the system knows not to auto-act, and instead builds a Context Capsule."* Point out the toast confirming the escalation.
3. Go to **Agent Dashboard** → *"This is what a human agent sees — full case file, sentiment trend, exactly what was already tried, and a recommended action. Zero 'can you repeat the issue' moments."* Type a resolution note, click **Resolve** → point out the toast and the new KB article that just appeared (self-learning loop).
4. Back on **Home**, try typing a free-text message and **attach a real screenshot** using the 📎 icon — narrate that this is genuine multimodal input, not just text.
5. Go to **Churn Radar** (`/analytics`) → *"Every ticket feeds this — recurring issue clusters, emerging complaint signals, and at-risk customers, so the business sees problems before they cause churn."*
6. Go to **Workflow** (`/workflow`) → *"This is the actual node graph the system runs against — Router, four specialist agents, reasoning, escalation, self-learning loop — written as a portable definition so it plugs directly into an enterprise orchestration platform."*
7. Close: *"Router → Specialist Agents → Reasoning Engine → Escalation Intelligence → Self-Learning Loop, powered by Qwen, executing against a registered workflow graph designed for EnterPro-style orchestration."*

*(Tip: use the reset icon in the top nav to clear state for a clean re-run before judging starts.)*

---

## 🏗️ Architecture

```
Customer message
    │
    ▼
Router Agent (Qwen)              — intent, urgency, sentiment, customer match, conversation memory check
    │
    ▼
Specialist Dispatch              — routes to an independent agent module per category
    │  ├── lib/agents/specialists/billingAgent.ts
    │  ├── lib/agents/specialists/technicalAgent.ts
    │  ├── lib/agents/specialists/orderAgent.ts
    │  └── lib/agents/specialists/accountAgent.ts
    ▼
Knowledge Reasoning Engine       — cross-source TF-IDF retrieval over KB + resolved tickets + order records
    │
    ▼
Reasoning / Root-Cause Engine    — synthesizes evidence + conversation history, states root cause
    │
    ▼
Escalation Intelligence          — decides auto-resolve vs escalate + confidence
    │
    ├── Auto-Resolve ──────────► Customer notified directly
    │
    └── Escalate ──────────────► Context Capsule ──► Agent Dashboard
                                                          │
                                                          ▼
                                              Self-Learning Loop
                                              (new KB article drafted)
                                                          │
                                                          ▼
                                          Churn Radar / CX Analytics
```

## 📁 Project Structure

```
app/
  page.tsx                 Customer chat demo (scenario buttons + free text)
  dashboard/page.tsx        Agent Dashboard (Context Capsules + KB growth)
  analytics/page.tsx        Churn Radar / CX Analytics
  workflow/page.tsx         Registered workflow graph viewer (EnterPro artifact)
  api/investigate/route.ts  Main investigation endpoint
  api/draft-kb/route.ts     Self-learning KB drafting endpoint
  layout.tsx, globals.css   Root layout, fonts, dark theme

components/
  AgentNetworkDiagram.tsx  Live pipeline diagram (Wow #1)
  EvidencePanel.tsx        Cross-source investigation proof (Wow #2)
  ReasoningTimeline.tsx    Live streaming agent reasoning (Wow #3)
  ConfidenceGauge.tsx      Circular confidence meter (Wow #5)
  ContextCapsuleCard.tsx   Structured handoff card (Wow #6)
  ChurnRadar.tsx           Recurring issue + churn risk dashboard
  TrendingIssues.tsx       Emerging complaint keyword detection
  ToastStack.tsx           Action confirmation toasts (Wow #11)
  Nav.tsx                  Top navigation + reset demo

lib/
  agents/
    qwen.ts                 Qwen API wrapper — text + vision, graceful no-key fallback
    classify.ts              Intent/urgency/sentiment classification
    reasoningEngine.ts        Knowledge Reasoning Engine — TF-IDF retrieval across KB + resolved tickets + order records
    knowledgeBase.ts          Legacy single-source KB keyword search (superseded by reasoningEngine.ts, kept for reference)
    investigate.ts            Core orchestrator — Router → Specialist Dispatch → Reasoning → Escalation (+ screenshot analysis, conversation memory)
    scenarios.ts              4 fully-scripted demo cases for reliable judging (deterministic, no conversation history)
    specialists/
      types.ts                Shared SpecialistContext/Output contract
      billingAgent.ts          Independent Billing agent module (charge disputes, refund policy, order-value risk)
      technicalAgent.ts        Independent Technical agent module (recurring bugs, auth failures, screenshot evidence)
      orderAgent.ts            Independent Order agent module (shipment staleness, fulfillment failure detection)
      accountAgent.ts          Independent Account agent module (identity/ownership verification risk)
      registry.ts              Dispatch table mapping category → specialist module
  workflow/
    enterpro.workflow.json   Portable node graph — the EnterPro-compatible workflow definition
    workflowEngine.ts         Integration seam — the one file to change for a real EnterPro SDK
  context/AppStateContext.tsx  Client-side app state (capsules, KB, tickets, toasts)
  data/                     Mock customers, orders, tickets, KB articles
  types.ts                  Shared TypeScript interfaces
```

## 🔧 Tech Stack

- **Frontend:** Next.js 14 (App Router) + React + TypeScript + Tailwind CSS
- **AI Reasoning:** Qwen (via OpenAI-compatible chat completions API), with a deterministic local fallback so the app never breaks without a key
- **Orchestration:** Custom agent-node pipeline in `lib/agents/`, structured to map 1:1 onto an EnterPro workflow graph (Router node → Specialist nodes → Escalation node)
- **Data layer:** JSON-seeded mock customers/orders/tickets/KB (swap for Postgres + a vector DB in production)
- **Charts:** Recharts
- **Deployment:** Zero-config on Vercel

## ✅ Status of the 7 track capabilities (honest, item-by-item)

| # | Capability | Status |
|---|---|---|
| 1 | Autonomous Support Agent (multi-step resolution) | ✅ Real — full Router → Specialist → Reasoning → Escalation pipeline, executes real resolutions |
| 2 | Intelligent Ticket Router (intent/urgency/sentiment/history) | ✅ Real |
| 3 | Multi-Agent System (Billing/Technical/Order/Account) | ✅ Real — four independently-defined modules in `lib/agents/specialists/`, each with distinct domain logic, dispatched via a registry (not an inline branch). Each is still invoked in-process, not as four separately-deployed services/LLM calls — a real next step, not a hidden gap. |
| 4 | Knowledge Reasoning Engine (docs + tickets + product info) | ✅ Real — `lib/agents/reasoningEngine.ts` does genuine TF-IDF term-weighted retrieval across KB articles, resolved-ticket precedents, and order records. Honest scope: this is statistical term-overlap, not neural embedding similarity — see Known Simplifications below. |
| 5a | Root-Cause Investigation | ✅ Real |
| 5b | Context-Aware Response Generator (history + prior conversations + policies) | ✅ Real — the frontend keeps a running conversation thread and sends it with every free-text message; the backend detects follow-ups, raises urgency/lowers confidence on unresolved recurring issues, and the resolution message explicitly acknowledges earlier turns. Scripted demo-scenario buttons intentionally stay stateless (deterministic for judging); the free-text chat box is where memory is live. |
| 6 | Escalation Intelligence | ✅ Real |
| 7 | CX Analytics Engine | ✅ Real, on a small mock dataset |

Sponsor tools: **Qwen** ✅ real integration with honest local fallback. **EnterPro** — not integrated with a live sponsor SDK (see the dedicated section above); the workflow graph artifact is real and honestly labeled `"status": "pending-sponsor-credentials"`.

## ⚠️ Known Simplifications (be upfront about these with judges)

- **State persistence** uses `localStorage` on the client rather than a database, because Vercel serverless functions are stateless between invocations. This keeps the demo 100% reliable without infra setup — swap `lib/context/AppStateContext.tsx` for real API reads/writes against Postgres to go to production.
- **Knowledge Reasoning Engine** uses TF-IDF term-frequency weighting, a real and standard retrieval algorithm, but it is *lexical* (matches on shared words), not *semantic* (matching by meaning via neural embeddings). It won't connect "keyboard stuck in transit" to "peripheral shipment delayed" the way a real embedding model would. Swap `crossSourceRetrieve()` in `lib/agents/reasoningEngine.ts` for pgvector/Pinecone/Chroma in production — every caller only depends on its function signature.
- **Multi-agent specialists** are four genuinely separate modules/functions with distinct logic, dispatched through a registry — but they still run in-process in a single Node runtime, not as four independently deployed agents or parallel LLM calls. The separation is real; full process/service isolation is the natural next step.
- **Conversation memory** is held client-side in React state for the current browser session (not persisted across page reloads or devices) — intentional for a stateless-serverless demo, and clearly upgradeable to a server-side session store.
- **EnterPro** is satisfied via a real, inspectable artifact: `lib/workflow/enterpro.workflow.json` (a portable node graph) and `lib/workflow/workflowEngine.ts` (the integration seam), which the running app actually reads from at investigation time — see the "How AURA satisfies the EnterPro requirement" section above. We couldn't find public docs for a product by this exact name, so this is built to be honest about that while still satisfying the spirit (and literal architecture) of the requirement.
- **Mock data** (5 customers, 4 orders, 8 tickets, 6 KB articles) stands in for a real CRM/order database — the four demo scenarios are scripted against this data for guaranteed-reliable live judging.

Being upfront about these trade-offs, and clearly showing where the production upgrade path is, is intentional — it's stronger than pretending everything is already at enterprise scale.
