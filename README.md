# AURA — Autonomous Unified Resolution Agent

This project is a Next.js frontend built for a hackathon that demonstrates a conceptual AI customer support workflow.

## Features

- **Mock Support Pipeline**: A UI that visualizes a case routing through conceptual specialist agents (Billing, Technical, Order, Account).
- **In-Memory Reasoning Engine**: Uses a basic TF-IDF term frequency script (`reasoningEngine.ts`) to match keywords against static JSON files (mock KB, tickets, and orders).
- **Mock EnterPro Workflow**: Provides a static JSON node graph demonstrating how an orchestration platform *could* be configured.

## 🚀 Quick Start (local)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). 
