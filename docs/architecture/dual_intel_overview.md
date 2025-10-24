# Venturr Dual-Intelligence Architecture Overview

**Version**: 2.0.0  
**Last Updated**: 2025-01-22  
**Status**: Production Implementation

---

## Executive Summary

The Venturr Dual-Intelligence system combines a **Large-Language Operating System (LLOS)** for strategic planning and synthesis with a **Spike7B brain** for fast, structured reasoning. This hybrid architecture delivers enterprise-grade compliance checking, automated takeoff processing, and intelligent quoting while maintaining sub-second latency for critical operations.

### Key Metrics

- **Latency**: P95 < 800ms (Spike7B), < 4s (LLOS with retrieval)
- **Accuracy**: ≥ 90% clause-grounding on compliance tasks
- **Hallucination Rate**: ≤ 2% on compliance assertions
- **Cost**: Average $0.003 per task
- **Availability**: 99.9% uptime target

---

## System Components

### 1. Orchestrator (LLOS)

**Purpose**: Central intelligence hub for task routing, planning, and memory management

**Technology**: TypeScript/Node.js (NestJS)

**Location**: `/apps/llos-orchestrator/`

**Capabilities**:
- Multi-step task planning and decomposition
- Tool composition and execution
- Long-context reasoning (up to 200K tokens)
- Memory management and context retention
- Policy enforcement and audit logging

**Tools**:
- `retrieval` - Vector search over knowledge base
- `cite-aware-summarizer` - Summarization with source attribution
- `compliance-checker` - HB-39/NCC validation
- `takeoff-parser` - BOM extraction from documents
- `scope-writer` - Scope of works generation
- `bom-normalizer` - SKU normalization across suppliers

### 2. Specialist Brain (Spike7B)

**Purpose**: Fast, local-ish model for structured reasoning and latency-critical operations

**Technology**: Python/FastAPI with quantized 7B parameter model

**Location**: `/apps/spike7b-service/`

**Capabilities**:
- Structured data extraction (BOM, material specs)
- Rapid classification and scoring
- Uncertainty quantification
- Heuristic-based validation
- Re-ranking and filtering

**Endpoints**:
- `/infer` - General inference
- `/rerank` - Re-rank retrieval results
- `/reason_structured` - Structured reasoning tasks
- `/score_uncertainty` - Confidence scoring

### 3. Ensemble Router

**Purpose**: Intelligent routing between LLOS and Spike7B based on task characteristics

**Technology**: TypeScript/Node.js

**Location**: `/apps/router/`

**Routing Policy** (`/configs/router.yaml`):

```yaml
routes:
  spike7b_only:
    conditions:
      - task_type: ["extract", "classify", "score"]
      - context_length: < 2000
      - latency_budget: < 1000ms
    
  llos_only:
    conditions:
      - task_type: ["plan", "synthesize", "draft"]
      - context_length: > 5000
      - requires_reasoning: true
    
  dual_pass:
    conditions:
      - task_type: ["compliance_check", "scope_generation"]
      - risk_level: ["high", "critical"]
    flow:
      - step: spike7b_prefilter
      - step: llos_synthesis
      - step: spike7b_validation
```

**Signals**:
- Task type (takeoff, compliance, scope drafting)
- Input modality (text, CSV, image metadata)
- Risk level (low, medium, high, critical)
- Uncertainty score from Spike7B
- Retrieval overlap percentage
- Latency budget
- Cost budget
- Safety flags

### 4. Memory & Retrieval

**Vector Store**: PostgreSQL 16 with pgvector extension

**Collections**:
- `codes_hb39` - HB-39:2015 Installation code clauses
- `codes_ncc` - National Construction Code (NCC 2022)
- `codes_safework` - SafeWork NSW regulations
- `supplier_manuals` - Lysaght, Metroll, Stramit, Matrix Steel, No.1 Roofing
- `venturr_ops` - Venturr operational procedures
- `thomco_procedures` - ThomCo Roofing internal SOPs
- `faq` - Frequently asked questions
- `prompts` - Prompt templates and examples

**Symbolic Store**: Postgres tables for structured references

```sql
-- Code clause references
CREATE TABLE code_clauses (
  id UUID PRIMARY KEY,
  code_name TEXT NOT NULL,  -- 'HB-39', 'NCC', 'SafeWork'
  clause_id TEXT NOT NULL,  -- '3.2.1', 'J1.5', etc.
  title TEXT,
  content TEXT,
  jurisdiction TEXT,
  version TEXT,
  effective_date DATE,
  superseded_by UUID REFERENCES code_clauses(id),
  metadata JSONB
);

-- Product specifications
CREATE TABLE product_specs (
  id UUID PRIMARY KEY,
  supplier TEXT NOT NULL,  -- 'Lysaght', 'Metroll', etc.
  product_code TEXT NOT NULL,
  profile TEXT,
  thickness DECIMAL,
  coating TEXT,
  min_pitch DECIMAL,
  max_span INTEGER,
  fixing_type TEXT,
  fasteners_per_sqm INTEGER,
  compliance_standards TEXT[],
  metadata JSONB
);

-- BAL/Coastal rules
CREATE TABLE environmental_rules (
  id UUID PRIMARY KEY,
  rule_type TEXT NOT NULL,  -- 'BAL', 'coastal', 'wind'
  condition JSONB,  -- e.g., {"coastal_distance": {"<": 0.2}}
  recommendation JSONB,
  warnings TEXT[],
  requirements TEXT[],
  references TEXT[]  -- Clause IDs
);
```

### 5. Data Plane: Ingestion Pipelines

**Purpose**: Ingest, chunk, embed, and store knowledge from multiple sources

**Technology**: Python with Apache Airflow

**Location**: `/apps/ingest/dags/`

**Pipeline Stages**:

1. **Fetch**: Download PDFs, scrape web manuals, read internal docs
2. **Parse**: Extract text with source-specific parsers
3. **Chunk**: Semantic chunking with clause-awareness
4. **Embed**: Generate embeddings (same model family for LLOS & Spike7B)
5. **Store**: Write to pgvector with metadata
6. **Index**: Update symbolic store with structured references

**Chunking Strategy**:
- Keep clause IDs intact (don't split mid-clause)
- Target chunk size: 500-1000 tokens
- Overlap: 100 tokens
- Preserve document structure (headings, lists, tables)

**Metadata Schema**:
```json
{
  "source_uri": "https://www.abcb.gov.au/ncc/...",
  "publisher": "Australian Building Codes Board",
  "pub_date": "2022-05-01",
  "clause_id": "J1.5",
  "product_code": "KLIPLOK-700-042-CB",
  "jurisdiction": "NSW",
  "version": "NCC 2022",
  "chunk_index": 5,
  "total_chunks": 42
}
```

**De-duplication**:
- Hash-based deduplication
- Keep latest version
- Mark superseded documents
- Track version history

### 6. Safety/Compliance Layer

**Purpose**: Ensure all outputs are safe, compliant, and properly attributed

**Technology**: Python/TypeScript hybrid

**Location**: `/apps/guardrails/`

**Components**:

#### A. Rule Checker (`/apps/guardrails/checks/hb39_ncc.py`)

```python
class ComplianceChecker:
    def check_hb39(self, scope: str, materials: List[Material]) -> ComplianceFinding:
        """Check against HB-39:2015 requirements"""
        findings = []
        
        # Check fastener specifications
        for material in materials:
            clause = self.retrieve_clause("HB-39", "3.2.1")
            if not self.validate_fasteners(material, clause):
                findings.append(Finding(
                    severity="error",
                    clause_id="HB-39:3.2.1",
                    message=f"Fastener spec for {material.name} does not meet HB-39 requirements",
                    source_uri=clause.source_uri
                ))
        
        return ComplianceFinding(findings=findings)
```

#### B. PII Scrubber

- Redact client names, addresses, phone numbers, emails
- Replace with placeholders: `[CLIENT_NAME]`, `[ADDRESS]`, etc.
- Log redactions for audit trail

#### C. Hallucination Guard

**Attribution-First Answer Mode**:
- Every compliance assertion MUST include clause ID + source URI
- If no source found, return: "Unable to verify. Please consult [relevant standard]."
- Confidence threshold: 0.7 (below this, surface uncertainty)

**Example Output**:
```json
{
  "answer": "For coastal locations < 200m from the coast, stainless steel 316 fasteners are required.",
  "citations": [
    {
      "clause_id": "HB-39:3.2.1",
      "source_uri": "https://normsplash.com.au/hb-39/...",
      "excerpt": "In severe marine environments (< 200m from coast), use stainless steel 316 fasteners..."
    }
  ],
  "confidence": 0.95
}
```

### 7. Observation & Evaluation

**Metrics Collection**:
- Task latency (P50, P95, P99)
- LLM token usage and cost
- Spike7B inference time
- Retrieval quality (relevance, recall)
- Clause-grounding accuracy
- Hallucination rate
- User satisfaction scores

**Tracing**: OpenTelemetry spans for:
- `ingest` - Document ingestion
- `retrieval` - Vector search
- `route` - Routing decision
- `guardrail` - Compliance check
- `infer` - Model inference

**Regression Suites**:
- Golden task sets with expected outputs
- Adversarial prompts to test robustness
- A/B router tests to optimize routing policy

**Dashboards**: Grafana + Prometheus
- Real-time metrics
- Cost tracking
- Quality trends
- Anomaly detection

### 8. Events Bus

**Technology**: NATS

**Topics**:
- `ingest.started` - Document ingestion started
- `ingest.completed` - Document ingestion completed
- `ingest.failed` - Document ingestion failed
- `eval.task_completed` - Evaluation task completed
- `router.decision` - Routing decision made
- `guardrail.violation` - Compliance violation detected
- `guardrail.uncertainty` - High uncertainty surfaced

---

## Data Flow Examples

### Example 1: Compliance Check

```
User Request: "Check if this scope complies with HB-39 for coastal location"
    ↓
Router: Analyze task
    ├─ Task type: compliance_check
    ├─ Risk level: high (coastal)
    ├─ Decision: dual_pass
    ↓
Spike7B: Pre-filter
    ├─ Extract key requirements from scope
    ├─ Identify relevant clauses (HB-39:3.2.1, 3.2.2)
    ├─ Score: 0.85 (high confidence)
    ↓
LLOS: Synthesis
    ├─ Retrieve: HB-39 clauses from vector store
    ├─ Tool: compliance-checker
    ├─ Generate: Detailed findings with citations
    ↓
Spike7B: Validation
    ├─ Verify all citations are valid
    ├─ Check for hallucinations
    ├─ Score: 0.92 (pass)
    ↓
Guardrails: Final check
    ├─ PII scrubbing
    ├─ Attribution verification
    ├─ Uncertainty surfacing
    ↓
Response: Compliance findings with clause IDs + source URIs
```

### Example 2: Takeoff → BOM

```
User Upload: CSV file with material descriptions
    ↓
Router: Analyze task
    ├─ Task type: extract
    ├─ Input: structured (CSV)
    ├─ Decision: spike7b_only
    ↓
Spike7B: Extraction
    ├─ Parse CSV rows
    ├─ Extract: product name, quantity, unit
    ├─ Normalize SKUs (Lysaght/Metroll)
    ├─ Confidence: 0.91
    ↓
Tool: BOM normalizer
    ├─ Retrieve: Product specs from symbolic store
    ├─ Match: Lysaght Klip-Lok 700 0.42mm COLORBOND
    ├─ Enrich: Add specs (min pitch, max span, etc.)
    ↓
Response: Normalized BOM with product specs + manual citations
```

---

## Deployment Architecture

### Local Development

```bash
# Start infrastructure
docker-compose up -d postgres redis nats

# Run migrations
pnpm db:migrate

# Start services
pnpm dev:llos        # Port 3001
pnpm dev:spike7b     # Port 8000
pnpm dev:router      # Port 3002
pnpm dev:guardrails  # Port 3003
```

### Production (Kubernetes)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: llos-orchestrator
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: llos
        image: venturr/llos-orchestrator:latest
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spike7b-service
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: spike7b
        image: venturr/spike7b-service:latest
        resources:
          requests:
            memory: "8Gi"
            cpu: "2000m"
            nvidia.com/gpu: 1
          limits:
            memory: "16Gi"
            cpu: "4000m"
            nvidia.com/gpu: 1
```

---

## Security & Compliance

### Data Protection
- All PII redacted before processing
- Encryption at rest (Postgres + S3)
- Encryption in transit (TLS 1.3)
- Audit logs for all compliance checks

### Access Control
- Role-based access control (RBAC)
- API key authentication
- Rate limiting per client
- IP whitelisting for sensitive endpoints

### Compliance Standards
- HB-39:2015 - Installation code for metal roof & wall cladding
- NCC 2022 - National Construction Code
- SafeWork NSW - Work Health and Safety regulations
- ISO 27001 - Information security management

---

## Monitoring & Alerting

### Health Checks
- `/health` endpoint on all services
- Database connection pool monitoring
- Vector store query latency
- NATS message queue depth

### Alerts
- P95 latency > 5s (LLOS)
- P95 latency > 1s (Spike7B)
- Hallucination rate > 2%
- Clause-grounding accuracy < 90%
- Error rate > 1%
- Cost per task > $0.01

### Dashboards
- Real-time task throughput
- Cost tracking (daily/weekly/monthly)
- Quality metrics (accuracy, hallucination rate)
- System health (CPU, memory, disk, network)

---

## Future Enhancements

### Phase 1: Advanced AI
- [ ] Conversation memory for multi-turn interactions
- [ ] Streaming responses for long-running tasks
- [ ] Custom fine-tuned models for roofing domain
- [ ] Active learning loop for continuous improvement

### Phase 2: Scale & Performance
- [ ] Horizontal auto-scaling based on load
- [ ] Multi-region deployment for low latency
- [ ] Edge caching with CDN
- [ ] GraphQL API layer for flexible queries

### Phase 3: Business Intelligence
- [ ] Predictive analytics for project outcomes
- [ ] Anomaly detection for unusual quotes
- [ ] Automated insights and recommendations
- [ ] Recommendation engine for material selection

---

## References

- [Dual-Intelligence Blueprint](/docs/DUAL_INTELLIGENCE_COMPLETE_BLUEPRINT.md)
- [Datasource Catalog](/docs/architecture/datasource_catalog.md)
- [Router Configuration](/configs/router.yaml)
- [Guardrails Configuration](/configs/guardrails.yaml)
- [Evaluation Results](/apps/eval/results/baseline.json)

---

**Document Version**: 2.0.0  
**Last Updated**: 2025-01-22  
**Maintained By**: Venturr Engineering Team

