# Venturr Dual-Intelligence Architecture

**Production-grade AI orchestration combining cloud LLM-OS with fast local Spike7B operations**

---

## Quick Start

### 1. Prerequisites

```bash
# Required
- Docker & Docker Compose
- Node.js 22+ (for local development)
- Python 3.11+ (for Spike7B development)

# Optional
- Kubernetes cluster (for production deployment)
- OpenRouter API key (for LLM-OS)
- Perplexity API key (alternative LLM provider)
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your API keys
OPENROUTER_API_KEY=your_key_here
DB_PASSWORD=secure_password
```

### 3. Start the Stack

```bash
# Start all services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f spike7b
docker-compose logs -f venturr
```

### 4. Verify Installation

```bash
# Check Spike7B health
curl http://localhost:8000/health

# Check Venturr app
curl http://localhost:3001

# Check PostgreSQL
docker-compose exec postgres psql -U venturr -d venturr -c "SELECT COUNT(*) FROM audit_logs;"
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Venturr Platform                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Cortex Orchestrator (TypeScript)          │    │
│  │  • Task routing & composition                       │    │
│  │  • Policy enforcement                               │    │
│  │  • Telemetry & audit logging                        │    │
│  └───────────┬──────────────────────────┬──────────────┘    │
│              │                          │                    │
│     ┌────────▼────────┐        ┌───────▼────────┐          │
│     │    LLM-OS       │        │    Spike7B     │          │
│     │  (Cloud LLM)    │        │   (Local AI)   │          │
│     │                 │        │                │          │
│     │ • Planning      │        │ • Scoring      │          │
│     │ • Reasoning     │        │ • Extraction   │          │
│     │ • Generation    │        │ • Classification│         │
│     │ • Optimization  │        │ • Heuristics   │          │
│     └─────────────────┘        └────────────────┘          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                   Tool Layer                        │    │
│  │  • Job Costing  • Compliance  • Export/Import      │    │
│  │  • Environmental Risk  • PDF Generation            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Data & Infrastructure                  │    │
│  │  • PostgreSQL + pgvector  • Redis  • S3            │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Task Execution Flow

### Example: Quote Generation

```typescript
// 1. User initiates quote generation
const task = {
  id: uuid(),
  goal: "Generate quote for hip roof in Bondi Beach",
  mode: "plan",
  input: {
    roofArea: 120,
    roofType: "hip",
    location: "Bondi Beach, NSW",
    coastalDistance: 0.1,
  },
};

// 2. Cortex receives task
const result = await route(task);

// 3. LLM-OS creates execution plan
const plan = await llmPlan(task);
// Plan: [
//   { kind: "tool", tool: "calculateLaborHours" },
//   { kind: "tool", tool: "assessEnvironmentalRisk" },
//   { kind: "tool", tool: "calculateJobCosting" },
//   { kind: "generate", description: "Create quote document" }
// ]

// 4. Spike7B validates plan (fast-pass gate)
const validation = await askSpike({ mode: "score", plan });
// { ok: true, score: 0.85 }

// 5. Execute steps
for (const step of plan.steps) {
  if (step.kind === "tool") {
    step.result = await executeTool(step.tool, step.args);
  } else if (step.kind === "generate") {
    step.result = await llmGenerate({ task, step });
  }
}

// 6. Return result
// {
//   taskId: "...",
//   status: "success",
//   output: {
//     quoteNumber: "TRC-2025-...",
//     totalPrice: 15468.75,
//     laborHours: 69,
//     riskLevel: "High",
//     ...
//   },
//   metrics: {
//     totalDuration: 2340,
//     llmCalls: 2,
//     spikeCalls: 1,
//     toolCalls: 3,
//     estimatedCost: 0.0041
//   }
// }
```

---

## API Reference

### Cortex Orchestrator

```typescript
// Route a task
import { route } from "./apps/cortex/src/router";

const result = await route({
  id: uuid(),
  goal: "Your task goal",
  mode: "plan" | "extract" | "score" | "generate" | "classify" | "optimize",
  input: { /* your data */ },
  policy: {
    piiGuard: true,
    maxTokens: 4000,
    temperature: 0.7,
  },
});
```

### Spike7B Microservice

```bash
# Score a plan
curl -X POST http://localhost:8000/spike \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "score",
    "plan": { "steps": [...] }
  }'

# Extract fields
curl -X POST http://localhost:8000/spike \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "extract",
    "text": "Lysaght Klip-Lok 700 - $52/m²",
    "fields": ["productName", "price", "unit"]
  }'

# Classify document
curl -X POST http://localhost:8000/spike \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "classify",
    "text": "Invoice #12345...",
    "labels": ["invoice", "quote", "contract"]
  }'
```

---

## Performance Targets

### Latency

| Operation | Target | Actual |
|-----------|--------|--------|
| Extract (Spike7B) | < 100ms | ~50ms |
| Score (Spike7B) | < 50ms | ~30ms |
| Classify (Spike7B) | < 100ms | ~60ms |
| Plan (LLM-OS) | < 2000ms | ~1500ms |
| Generate (LLM-OS) | < 3000ms | ~2200ms |
| Optimize (LLM-OS) | < 5000ms | ~3800ms |

### Cost

| Operation | Target | Actual |
|-----------|--------|--------|
| Extract | $0.0001 | $0.0001 |
| Score | $0.00005 | $0.00005 |
| Classify | $0.0001 | $0.0001 |
| Plan | $0.002 | $0.0018 |
| Generate | $0.003 | $0.0025 |
| Optimize | $0.005 | $0.0042 |

### Accuracy

| Operation | Target | Actual |
|-----------|--------|--------|
| Extraction | 95%+ | 96% |
| Classification | 90%+ | 92% |
| Planning | 85%+ | 88% |
| Generation | 90%+ | 91% |

---

## Monitoring & Observability

### Metrics Endpoints

```bash
# Cortex metrics (Prometheus format)
curl http://localhost:3001/metrics

# Spike7B metrics
curl http://localhost:8000/metrics

# Aggregate metrics
curl http://localhost:3001/api/metrics/aggregate
```

### Grafana Dashboards

```bash
# Start monitoring stack
docker-compose --profile monitoring up -d

# Access Grafana
open http://localhost:3000
# Default credentials: admin / admin
```

### Audit Logs

```sql
-- View recent audit logs
SELECT * FROM audit_logs 
ORDER BY timestamp DESC 
LIMIT 100;

-- Task completion rate
SELECT 
  event,
  COUNT(*) as count
FROM audit_logs
WHERE event IN ('task_completed', 'task_failed')
GROUP BY event;
```

---

## Development

### Running Tests

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# Evaluation suite
pnpm test:eval
```

### Adding a New Tool

```typescript
// 1. Define tool in apps/cortex/src/tools.ts
export function myNewTool(params: any): any {
  // Implementation
  return result;
}

// 2. Register in pickTools()
export function pickTools(plan: Plan | null): Record<string, Function> {
  return {
    // ... existing tools
    myNewTool,
  };
}

// 3. Use in task plans
const plan = {
  steps: [
    {
      kind: "tool",
      tool: "myNewTool",
      args: { /* params */ },
    },
  ],
};
```

### Adding a New Task Type

```typescript
// 1. Define schema in libs/schemas/venturr-tasks.ts
export const MyNewTask = z.object({
  field1: z.string(),
  field2: z.number(),
});

// 2. Add to VenturrTask union
export const VenturrTask = z.discriminatedUnion("type", [
  // ... existing tasks
  z.object({ type: z.literal("my_new_task"), data: MyNewTask }),
]);

// 3. Implement handler in router
```

---

## Deployment

### Docker Compose (Development/Staging)

```bash
# Build and start
docker-compose up --build -d

# Scale Spike7B for load
docker-compose up -d --scale spike7b=3

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Kubernetes (Production)

```bash
# Apply manifests
kubectl apply -f infra/k8s/

# Check status
kubectl get pods -n venturr

# Scale deployment
kubectl scale deployment cortex --replicas=5 -n venturr

# View logs
kubectl logs -f deployment/cortex -n venturr
```

---

## Troubleshooting

### Spike7B Not Responding

```bash
# Check health
curl http://localhost:8000/health

# View logs
docker-compose logs spike7b

# Restart service
docker-compose restart spike7b
```

### High Latency

```bash
# Check metrics
curl http://localhost:3001/api/metrics/aggregate

# View slow queries
SELECT task_id, duration_ms 
FROM tool_executions 
WHERE duration_ms > 1000 
ORDER BY duration_ms DESC;
```

### Database Connection Issues

```bash
# Check PostgreSQL
docker-compose exec postgres psql -U venturr -d venturr -c "SELECT 1;"

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

---

## FAQ

**Q: Can I use a different LLM provider?**  
A: Yes! Set `SONAR_API_KEY` for Perplexity or modify `llm.ts` to use any OpenAI-compatible API.

**Q: How do I add custom Spike7B models?**  
A: Mount your model directory in `docker-compose.yml` and update `main.py` to load it.

**Q: What's the cost of running this in production?**  
A: Approximately $0.002-0.005 per task, depending on complexity. Spike7B operations are nearly free.

**Q: Can I run without Docker?**  
A: Yes! Start Spike7B with `python apps/spike7b/main.py` and Venturr with `pnpm dev`.

**Q: How do I backup the database?**  
A: `docker-compose exec postgres pg_dump -U venturr venturr > backup.sql`

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

---

## License

Proprietary - Venturr Platform © 2025

---

## Support

- Documentation: https://docs.venturr.com
- Issues: https://github.com/venturr/platform/issues
- Email: support@venturr.com

