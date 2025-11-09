# REAL-WORLD ACCEPTANCE TESTING GUIDE

**Objective**: Validate that all platform outputs meet real-world standards through continuous role-based simulations

---

## QUICK START

### 1. Test a Quote
```bash
curl -X POST http://localhost:3001/api/trpc/acceptance.executeImprovementLoop \
  -H "Content-Type: application/json" \
  -d '{
    "outputId": "quote-001",
    "outputType": "quote",
    "content": "## Project Quote\n\nMaterial: Lysaght Colorbond Steel\nQuantity: 100 sheets\nPrice: $5,000\n\nTotal: $5,000"
  }'
```

### 2. Simulate All Archetypes
```bash
curl -X POST http://localhost:3001/api/trpc/acceptance.simulateAllArchetypes \
  -H "Content-Type: application/json" \
  -d '{
    "outputType": "quote",
    "content": "## Project Quote\n\nMaterial: Lysaght Colorbond Steel\nQuantity: 100 sheets\nPrice: $5,000\n\nTotal: $5,000"
  }'
```

### 3. Get Archetype Profiles
```bash
curl -X GET http://localhost:3001/api/trpc/acceptance.getArchetypeProfiles
```

---

## TESTING WORKFLOW

### Phase 1: Generate Output
Create a document, quote, report, or UI screen that you want to validate.

### Phase 2: Execute Improvement Loop
Run the improvement loop to:
1. Simulate perception from all 10 archetypes
2. Identify gaps and issues
3. Auto-refine the output
4. Re-evaluate acceptance
5. Make deployment decision

### Phase 3: Review Results
Check the improvement loop results:
- Initial acceptance score
- Final acceptance score
- Improvement made
- Refinements applied
- Deployment decision (deploy/minor refinements/major revision)
- Real-world standard met (yes/no)

### Phase 4: Deploy or Refine
Based on the decision:
- **Deploy**: Output is ready for production
- **Minor Refinements**: Make small tweaks and re-test
- **Major Revision**: Significant changes needed, re-test

---

## CRITICAL DOCUMENTS TO TEST

### 1. Quote/Proposal
**Test Scenario**: Customer receives quote for $50,000 roofing project

**Archetypes to Focus On**:
- Estimator (pricing accuracy)
- Strata Manager (budget clarity)
- High-Detail Homeowner (professionalism)
- Insurer (compliance)

**Acceptance Criteria**:
- [ ] All materials itemized with quantities and prices
- [ ] Labor costs clearly broken down
- [ ] Total cost clearly visible and correct
- [ ] Timeline realistic and detailed
- [ ] Compliance standards referenced
- [ ] Warranty terms comprehensive
- [ ] Professional formatting
- [ ] Risks and exclusions clearly marked

**Real-World Standard**: 8.0+ acceptance from all archetypes

---

### 2. Invoice
**Test Scenario**: Customer receives invoice for $50,000 completed work

**Archetypes to Focus On**:
- Admin (data accuracy)
- Director (financial impact)
- Strata Manager (payment terms)

**Acceptance Criteria**:
- [ ] Invoice number and date clear
- [ ] Project clearly identified
- [ ] Work completed clearly described
- [ ] Costs itemized and accurate
- [ ] Total clearly visible
- [ ] Payment instructions clear
- [ ] Payment methods listed
- [ ] Professional formatting

**Real-World Standard**: 8.0+ acceptance from all archetypes

---

### 3. Compliance Documentation
**Test Scenario**: Insurer reviews compliance documentation

**Archetypes to Focus On**:
- Insurer (code compliance)
- Government/Asset Manager (regulation compliance)
- Builder (specification compliance)

**Acceptance Criteria**:
- [ ] All applicable standards listed (AS 1562.1, AS/NZS 1170.2, AS 3959, NCC 2022)
- [ ] Compliance checklist complete
- [ ] Test results documented
- [ ] Certifications included
- [ ] Photos professional and clear
- [ ] Warranty terms comprehensive
- [ ] Legally defensible language

**Real-World Standard**: 8.0+ acceptance from all archetypes

---

### 4. Project Schedule
**Test Scenario**: Site lead receives project schedule

**Archetypes to Focus On**:
- Site Lead (schedule realism)
- Admin (milestone tracking)
- Strata Manager (disruption minimization)

**Acceptance Criteria**:
- [ ] Phases clearly defined
- [ ] Timeline realistic and detailed
- [ ] Milestones clearly marked
- [ ] Deliverables specified
- [ ] Resource requirements clear
- [ ] Risks identified
- [ ] Contingencies planned

**Real-World Standard**: 8.0+ acceptance from all archetypes

---

### 5. Site Measurement Report
**Test Scenario**: Estimator receives site measurement data

**Archetypes to Focus On**:
- Estimator (measurement accuracy)
- Site Lead (completeness)
- Installer (clarity)

**Acceptance Criteria**:
- [ ] Photos clear and professional
- [ ] Measurements accurate and complete
- [ ] Material specs detailed
- [ ] Quantities calculated correctly
- [ ] Environmental factors noted
- [ ] Risks identified
- [ ] Professional documentation

**Real-World Standard**: 8.0+ acceptance from all archetypes

---

## ACCEPTANCE SCORING GUIDE

### Clarity Score (0-10)
**9-10**: Immediately understandable to all archetypes
- Simple language used throughout
- Clear structure and organization
- Key information highlighted
- No jargon or technical terms
- Visual hierarchy is obvious

**7-8**: Clear with minor clarifications needed
- Mostly simple language with some technical terms explained
- Logical structure with some unclear sections
- Key information mostly highlighted
- Generally good visual hierarchy

**5-6**: Understandable but requires effort
- Mix of simple and technical language
- Structure could be clearer
- Key information present but not highlighted
- Visual hierarchy needs improvement

**3-4**: Confusing, needs significant revision
- Too much technical language
- Poor structure and organization
- Key information hard to find
- Weak visual hierarchy

**0-2**: Incomprehensible, major revision required
- Incomprehensible to most readers
- No clear structure
- Key information missing
- No visual hierarchy

---

### Compliance Score (0-10)
**9-10**: Exceeds all requirements
- All applicable standards referenced
- Comprehensive compliance documentation
- All requirements met and exceeded
- Legally defensible language
- Insurance requirements met

**7-8**: Meets all requirements
- All applicable standards referenced
- Compliance documentation complete
- All requirements met
- Legally sound language
- Insurance requirements met

**5-6**: Meets most requirements, minor gaps
- Most standards referenced
- Compliance documentation mostly complete
- Minor compliance gaps
- Generally sound language
- Most insurance requirements met

**3-4**: Missing significant requirements
- Some standards missing
- Incomplete compliance documentation
- Significant compliance gaps
- Language could be stronger
- Some insurance requirements missing

**0-2**: Major compliance gaps
- Most standards missing
- Minimal compliance documentation
- Major compliance gaps
- Weak legal language
- Insurance requirements not met

---

### Professionalism Score (0-10)
**9-10**: Exceeds professional standards
- No spelling or grammar errors
- Excellent formatting and design
- Professional headers and structure
- Professional photos and visuals
- Consistent branding throughout
- Proper signatures and dates

**7-8**: Professional and polished
- No spelling or grammar errors
- Good formatting and design
- Professional headers and structure
- Professional visuals
- Consistent branding
- Proper signatures and dates

**5-6**: Acceptable but could be better
- Minor spelling/grammar errors
- Adequate formatting
- Basic structure
- Acceptable visuals
- Mostly consistent branding
- Signatures/dates present

**3-4**: Below professional standards
- Multiple spelling/grammar errors
- Poor formatting
- Weak structure
- Low-quality visuals
- Inconsistent branding
- Missing signatures/dates

**0-2**: Unprofessional
- Many spelling/grammar errors
- Very poor formatting
- No clear structure
- Poor or missing visuals
- No consistent branding
- No signatures/dates

---

### Risk Visibility Score (0-10)
**9-10**: All risks clearly visible and explained
- All risks explicitly listed
- Exclusions clearly marked
- Assumptions documented
- Contingencies identified
- Warning sections prominent
- Risks explained in simple language

**7-8**: Most risks visible, minor gaps
- Most risks listed
- Exclusions mostly marked
- Assumptions mostly documented
- Some contingencies identified
- Warning sections present
- Risks mostly explained

**5-6**: Some risks visible, significant gaps
- Some risks listed
- Some exclusions marked
- Few assumptions documented
- Contingencies not clear
- Limited warning sections
- Risk explanations incomplete

**3-4**: Few risks visible
- Few risks listed
- Exclusions not marked
- Assumptions not documented
- No contingencies identified
- No warning sections
- Risks not explained

**0-2**: Risks hidden or unclear
- No risks listed
- No exclusions marked
- No assumptions documented
- No contingencies
- No warning sections
- Risks completely unclear

---

## REAL-WORLD STANDARD CHECKLIST

For every document, quote, report, workflow, and UI screen:

### Clarity Checklist
- [ ] Would a typical user understand this immediately?
- [ ] Is the language simple and direct?
- [ ] Is the structure logical and easy to follow?
- [ ] Are key points highlighted?
- [ ] Are there any unexplained technical terms?

### Compliance Checklist
- [ ] Does this meet all legal requirements?
- [ ] Are all applicable standards referenced?
- [ ] Is the warranty information complete?
- [ ] Is liability properly allocated?
- [ ] Would this hold up in court?

### Professionalism Checklist
- [ ] Does this reflect well on our business?
- [ ] Are there any spelling or grammar errors?
- [ ] Is the formatting professional?
- [ ] Are the visuals professional?
- [ ] Is the branding consistent?

### Risk Visibility Checklist
- [ ] Are all risks clearly disclosed?
- [ ] Are exclusions clearly marked?
- [ ] Are assumptions documented?
- [ ] Are contingencies identified?
- [ ] Would the recipient understand the risks?

### Completeness Checklist
- [ ] Is all necessary information present?
- [ ] Are all required sections included?
- [ ] Are there any missing details?
- [ ] Is the information accurate and up-to-date?
- [ ] Is there anything that needs clarification?

---

## CONTINUOUS MONITORING

### Weekly Acceptance Audit
Every week, test a sample of outputs:
- 1 quote
- 1 invoice
- 1 compliance document
- 1 project report
- 1 UI screen

Track acceptance scores and identify trends.

### Monthly Archetype Review
Every month, review acceptance scores by archetype:
- Which archetypes are most satisfied?
- Which archetypes have concerns?
- What patterns emerge?
- What improvements are needed?

### Quarterly Improvement Planning
Every quarter, plan improvements based on:
- Acceptance score trends
- Archetype feedback
- User feedback
- Industry standards
- Competitive analysis

---

## TROUBLESHOOTING

### Low Clarity Scores
**Symptoms**: Clarity score < 7 from multiple archetypes
**Causes**: 
- Technical jargon not explained
- Poor structure and organization
- Key information not highlighted
- Complex sentences

**Solutions**:
- Simplify language
- Add clear headers and structure
- Highlight key information
- Break up long paragraphs
- Add visual hierarchy

### Low Compliance Scores
**Symptoms**: Compliance score < 7 from multiple archetypes
**Causes**:
- Missing standard references
- Incomplete warranty information
- Unclear liability allocation
- Missing assumptions

**Solutions**:
- Add all applicable standard references
- Include comprehensive warranty information
- Clearly allocate liability
- Document all assumptions
- Add risk disclosures

### Low Professionalism Scores
**Symptoms**: Professionalism score < 7 from multiple archetypes
**Causes**:
- Spelling or grammar errors
- Poor formatting
- Low-quality visuals
- Inconsistent branding

**Solutions**:
- Proofread carefully
- Improve formatting and design
- Use professional visuals
- Ensure consistent branding
- Add company logo and contact info

### Low Risk Visibility Scores
**Symptoms**: Risk visibility score < 7 from multiple archetypes
**Causes**:
- Risks not explicitly listed
- Exclusions not clearly marked
- Assumptions not documented
- Contingencies not identified

**Solutions**:
- Explicitly list all risks
- Clearly mark all exclusions
- Document all assumptions
- Identify all contingencies
- Add warning sections

---

## SUCCESS METRICS

### Target Acceptance Scores
- **Overall Average**: 8.5+ across all archetypes
- **Minimum Score**: 7.0+ for any archetype
- **Real-World Standard**: 90%+ of outputs meet standard

### Improvement Targets
- **Clarity**: 95%+ of outputs score 8.0+
- **Compliance**: 100% of outputs score 8.0+
- **Professionalism**: 95%+ of outputs score 8.0+
- **Risk Visibility**: 95%+ of outputs score 8.0+

### User Satisfaction
- **Director**: 90%+ satisfaction
- **Admin**: 90%+ satisfaction
- **Estimator**: 90%+ satisfaction
- **Site Lead**: 90%+ satisfaction
- **Installer**: 90%+ satisfaction
- **Strata Manager**: 90%+ satisfaction
- **Insurer**: 90%+ satisfaction
- **Builder**: 90%+ satisfaction
- **Homeowner**: 90%+ satisfaction
- **Government/Asset Manager**: 90%+ satisfaction

---

## SIGN-OFF

**Framework Status**: ✅ READY FOR IMPLEMENTATION
**Expected Outcome**: Real-World Standard Across All Outputs
**Timeline**: Continuous implementation and monitoring

