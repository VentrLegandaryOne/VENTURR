# VENTURR OS TRANSFORMATION ROADMAP

**Vision:** Transform Venturr into production-ready Apple-level product for Australian tradesmen

**Core Philosophy:** "Measure. Quote. Comply. Deliver." - Built for the hands that built this country.

---

## PHASE 1: KNOWLEDGE BASE INTEGRATION ✅ IN PROGRESS

### Downloaded Lysaght Manuals (36MB)
- [x] Roofing & Walling Installation Manual (2.7 MB)
- [x] Cyclonic Area Manual (3.3 MB)
- [x] NCC Ventilation Guide (8.5 MB)
- [x] NCC Energy Efficiency (7.3 MB)
- [x] Wind Classification PAB10 (404 KB)
- [x] Fasteners PAB04 (330 KB)
- [x] Flashing Guide (2.5 MB)
- [x] NSW Design Guide (7.0 MB)
- [x] Rainwater Solutions NSW (3.5 MB)

### Knowledge Extraction Tasks
- [ ] Extract fastening schedules from PAB04 (screw types, spacing, wind zones)
- [ ] Extract wind classification data from PAB10 (N1-N6, C1-C4 zones)
- [ ] Extract NCC 7-star energy efficiency requirements
- [ ] Extract roof ventilation requirements (AS 4200.2)
- [ ] Extract cyclonic design requirements (C1-C4 zones)
- [ ] Extract flashing details and specifications
- [ ] Extract material compatibility matrices
- [ ] Create structured database tables for all extracted data

---

## PHASE 2: MVP CORE WORKFLOW

### Lead Manager Module
- [ ] CRUD lead management with status pipeline
- [ ] Job tags: Strata, Insurance, Private, Govt
- [ ] Attachments: photos, plans, emails
- [ ] Auto-naming: "22 Burrawan St – Roof & Gutter Replacement"
- [ ] AI pre-reads brief → Job Intelligence Card

### Measure Studio Module
- [ ] Elite Dot Drawing tool (trace roofs on satellite/plans)
- [ ] Roof planes, line snap, label-by-slope
- [ ] Import laser data (HOTO/Venturr device)
- [ ] Export to take-off
- [ ] Preliminary vs Actual reconciliation

### Take-Off Engine Module
- [ ] Rule-based calculators (HB-39, NCC, roof profiles)
- [ ] Profile selection (e.g., Trimdek .48 Surfmist)
- [ ] Auto-calculate: sheets, flashings, fixings, sarking, waste, access gear
- [ ] Supplier pricing integration or baseline Venturr Standards
- [ ] Markup tiers: materials, labour, plant

### Quote Composer Module
- [ ] Integrate scope + take-off + compliance notes
- [ ] Professional ThomCo-style quote template
- [ ] Client-friendly vs Contractor detail views
- [ ] Variation framework (prevent underquoting)
- [ ] One-click send with e-signature
- [ ] Status change: Quoted → Active → Completed

### Archive & Learning Module
- [ ] Auto-update Knowledge Graph on job completion
- [ ] Future quote suggestions (price ranges, access notes, risk notes)
- [ ] Pattern recognition (same suburb, roof type, builder)

---

## PHASE 3: DUAL-CORE INTELLIGENCE ARCHITECTURE

### Layer 1: LLM Core (Normalisation)
- [ ] Natural language input handling
- [ ] Quote generation from description
- [ ] Email drafting, scope documents, method statements
- [ ] HBCF descriptions
- [ ] Client wording → Trade language normalisation

### Layer 2: Spiking Brain 7B Engine
- [ ] Pattern recognition in real jobs
- [ ] Learn user behaviour (e.g., "Jaye always adds 16m apron flashing")
- [ ] Spot: underscored gutters, missed flashings, coastal allowances
- [ ] Prioritise correctness + repeatability over creativity

### Layer 3: VENTURR Standards Layer
- [ ] Baseline Australian trade pricing
- [ ] Minimum safety inclusions
- [ ] Weather allowances
- [ ] Flag non-compliant or underpriced items
- [ ] Protect tradesman from being squeezed

---

## PHASE 4: APPLE-LEVEL UI/UX

### Visual Design System
- [ ] Light neutral base + Venturr blue accents
- [ ] Single modern sans-serif font with hierarchy
- [ ] Microinteractions: save states, validation, AI suggestions
- [ ] Empty states with clear guidance
- [ ] No raw JSON or developer leakage

### 3-Panel Layout
- [ ] **Command Rail (Left):** Jobs, Leads, Archive, Knowledge, Settings
- [ ] **Work Canvas (Centre):** Active job tools (dot-drawing, mud maps, take-offs, quote builder)
- [ ] **Insight Drawer (Right):** AI suggestions, pricing warnings, compliance alerts, client history

### Interaction Patterns
- [ ] Two-clicks to outcome
- [ ] Gradual slide-ins (avoid abrupt jumps)
- [ ] Clear status indicators (green ticks for completed stages)
- [ ] Alerts for missing compliance items

---

## PHASE 5: COMPLIANCE INTEGRATION

### Australian Standards Integration
- [ ] HB 39:2015 (Installation Code for Metal Roofing)
- [ ] AS/NZS 1562.1:2018 (Sheet Roof and Wall Cladding)
- [ ] AS/NZS 1170.2:2021 (Wind Actions)
- [ ] NCC 2022 (National Construction Code)
- [ ] AS 4200.2 (Roof Ventilation)

### Compliance Pack Generation
- [ ] SWMS (Safe Work Method Statements)
- [ ] Methodology/Facilitation Plan
- [ ] Installation code references
- [ ] Inclusive/exclusive items
- [ ] Weather delay clauses
- [ ] HBCF-ready statements

### Validation & Alerts
- [ ] Wind zone classification (N1-N6, C1-C4)
- [ ] Corrosion class selection (coastal vs inland)
- [ ] Fastener compatibility checks
- [ ] Height/access safety requirements
- [ ] 7-star energy efficiency compliance
- [ ] Roof ventilation requirements

---

## PHASE 6: CLIENT PORTAL

### Client-Facing Features
- [ ] View quotes with beautiful branding
- [ ] E-signature capability
- [ ] Message tradesman
- [ ] Upload additional photos
- [ ] Payment status visibility
- [ ] Project progress tracking

### Automation
- [ ] Email notifications on quote sent
- [ ] Status updates (accepted, in progress, completed)
- [ ] Deposit request on acceptance
- [ ] Compliance pack delivery

---

## PHASE 7: VENTURR STANDARDS LAYER

### Baseline Pricing Database
- [ ] NSW supplier pricing (Lysaght, Stramit, Metroll)
- [ ] Labour rates by trade category
- [ ] Plant/equipment hire rates
- [ ] Regional adjustments (coastal, remote)

### Safety & Compliance Minimums
- [ ] Scaffolding requirements by height
- [ ] Edge protection standards
- [ ] Weather delay allowances
- [ ] Public liability requirements

### Underpricing Protection
- [ ] Flag quotes below cost + minimum margin
- [ ] Suggest missing line items (flashings, fixings)
- [ ] Warn about coastal allowances
- [ ] Highlight scope creep risks

---

## PHASE 8: DOCUMENTATION & TESTING

### User Documentation
- [ ] Getting Started Guide
- [ ] Measure Studio Tutorial
- [ ] Take-Off Engine Guide
- [ ] Quote Composer Guide
- [ ] Compliance Pack Guide
- [ ] Video tutorials (micro-lessons)

### Acceptance Tests
- [ ] Create project → add capture → run take-off → create quote → send → mark accepted
- [ ] If take-off missing → quote fails with readable error
- [ ] If address missing → project cannot move to Active
- [ ] Compliance alerts trigger correctly
- [ ] Knowledge Graph learns from completed jobs

### Training Modules
- [ ] Public liability basics
- [ ] Scaffolding necessity
- [ ] Profit-First cashflow
- [ ] HBCF compliance
- [ ] NCC 2022 overview

---

## PHASE 9: PRODUCTION DEPLOYMENT

### Integrations
- [ ] Xero/MYOB (auto-create invoices on acceptance)
- [ ] Dropbox/Drive (mirror job folders)
- [ ] SendGrid/M365 (log all communications)
- [ ] Supplier APIs (latest sheet prices)
- [ ] Stripe (payment processing)

### Monitoring & Analytics
- [ ] User activity tracking
- [ ] Quote conversion rates
- [ ] Average job value
- [ ] Knowledge Graph growth
- [ ] Error logging and alerting

### Launch Preparation
- [ ] Landing page (Apple-style)
- [ ] Waitlist system
- [ ] Early access program
- [ ] Customer support system
- [ ] Knowledge base/FAQ

---

## SUCCESS METRICS

### Business Impact
- **Quote Time:** 2 hours → 15 minutes
- **Quote Accuracy:** ±25% → ±10%
- **Conversion Rate:** 25% → 40-50%
- **Admin Time:** 10 hours/week → 2 hours/week

### Knowledge Accuracy
- **Current:** 85% (good standards, core compliance)
- **Target:** 98% (industry-leading, specific references)

### User Experience
- **Estimator:** 9.3/10 (Excellent)
- **Director:** 6.3/10 → 8.5/10 (with financial dashboard)
- **Crew:** 5.7/10 → 9.0/10 (with mobile optimization)
- **Client:** 7.5/10 → 9.0/10 (with persuasion elements)

---

## MISSION STATEMENT

**"VENTURR was designed in Australia for Australian tradesmen to reclaim their time, income, and dignity. By standardising pricing, safety, and documentation, we eliminate the uncertainty that hinders small operators and empower them with the same leverage as large builders. Built for Australia, VENTURR is now ready to expand globally."**

---

## NEXT IMMEDIATE ACTIONS

1. **Extract Fastening Schedules** - Parse PAB04 PDF for screw types, spacing, wind zones
2. **Extract Wind Classifications** - Parse PAB10 PDF for N1-N6, C1-C4 zone data
3. **Build Knowledge Database** - Create structured tables for extracted data
4. **Update Intelligence Engine** - Integrate extracted knowledge into AI prompts
5. **Implement Compliance Checker** - Validate quotes against NCC 2022 requirements

---

**Status:** Phase 1 in progress - 9 critical manuals downloaded, ready for knowledge extraction
**Next Checkpoint:** After knowledge extraction and database integration complete

