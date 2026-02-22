# Market Data Next Steps - VENTURR VALDT Beta

## Current Data Status

### Preserved Legitimate Data

| Table | Records | Description |
|-------|---------|-------------|
| `price_benchmarks` | 25 | Project-level pricing benchmarks by region |
| `market_rates` | 193 | Line-item rates by trade and state |

### Cleared Test Data

| Table | Records Cleared | Reason |
|-------|-----------------|--------|
| `quotes` | 497 | Seeded test quotes |
| `contractors` | 25 | Seeded test contractors |
| `verifications` | 11 | Seeded test verifications |
| `certifications` | 7 | Seeded test certifications |
| `portfolio_projects` | 4 | Seeded test portfolio items |
| `comparison_items` | 23 | Seeded comparison data |
| `comparison_groups` | 8 | Seeded comparison groups |

---

## Market Data Structure

### Price Benchmarks (`price_benchmarks`)

Current coverage by project type:
- Roof replacement
- Bathroom renovation
- Kitchen renovation
- Solar installation
- Deck construction
- And more...

**Fields:**
- `project_type` - Type of construction project
- `region` - Geographic region (e.g., Sydney Metro, Melbourne Metro)
- `avg_cost` - Average cost in cents
- `min_cost` - Minimum typical cost
- `max_cost` - Maximum typical cost
- `sample_size` - Number of data points
- `confidence_score` - Data reliability (0-100)

### Market Rates (`market_rates`)

Current coverage by trade:
- **Roofing** - ~40 line items
- **Plumbing** - ~40 line items
- **Electrical** - ~40 line items
- **General Construction** - ~40 line items
- **HVAC** - ~33 line items

**Fields:**
- `trade` - Trade category
- `item_code` - Unique item identifier
- `name` - Item description
- `unit` - Unit of measurement (sqm, lm, each, etc.)
- `base_rate` - Base rate in cents
- `state` - Australian state
- Regional adjustment factors

---

## Next Steps for Production Data

### Phase 1: Data Validation (Immediate)

1. **Review existing rates for accuracy**
   - Compare against industry sources (Rawlinsons, Cordell)
   - Validate regional adjustment factors
   - Check unit consistency

2. **Add missing trades**
   - Painting & Decorating
   - Landscaping
   - Fencing
   - Concrete & Paving
   - Carpentry & Joinery

3. **Expand regional coverage**
   - Currently: Sydney, Melbourne, Brisbane, Perth, Adelaide
   - Add: Regional NSW, Regional VIC, Tasmania, NT, ACT

### Phase 2: Data Sources (Week 1-2)

1. **Primary Sources**
   - Rawlinsons Australian Construction Handbook (annual subscription)
   - Cordell Housing Building Cost Guide
   - ABS Construction Price Index
   - Fair Work Australia award rates

2. **Secondary Sources**
   - Industry association rate cards
   - Supplier price lists (CSR, Boral, BlueScope)
   - Government tender databases

3. **Validation Sources**
   - Real quotes from beta users (anonymized)
   - Contractor feedback on rate accuracy
   - Regional builder associations

### Phase 3: Data Pipeline (Week 2-4)

1. **Automated Updates**
   - Quarterly rate refresh from primary sources
   - CPI-based automatic adjustments
   - Regional factor recalculation

2. **User Contribution System**
   - Allow contractors to submit rate corrections
   - Crowdsourced validation with reputation weighting
   - Admin review queue for submissions

3. **API Integrations**
   - ABS statistics API for CPI data
   - Material supplier APIs for live pricing
   - Weather/seasonal adjustment factors

### Phase 4: Quality Assurance (Ongoing)

1. **Confidence Scoring**
   - Track data age and source reliability
   - Weight by sample size and recency
   - Flag stale or low-confidence rates

2. **Anomaly Detection**
   - Alert on rates outside expected ranges
   - Track rate change velocity
   - Regional comparison validation

3. **User Feedback Loop**
   - "Rate seems wrong" button on comparisons
   - Track verification accuracy over time
   - Adjust confidence based on outcomes

---

## Recommended Data Sources

### Commercial (Paid)

| Source | Coverage | Update Frequency | Cost |
|--------|----------|------------------|------|
| Rawlinsons | Comprehensive | Annual | ~$500/year |
| Cordell | Residential focus | Quarterly | ~$400/year |
| BMT Tax Depreciation | Depreciation rates | Annual | Free reports |

### Government (Free)

| Source | Data Type | URL |
|--------|-----------|-----|
| ABS | Construction indices | abs.gov.au |
| Fair Work | Award rates | fairwork.gov.au |
| ABCB | Building codes | abcb.gov.au |

### Industry (Free/Membership)

| Source | Coverage | Access |
|--------|----------|--------|
| HIA | Housing industry | Member only |
| MBA | Master builders | Member only |
| QBCC | QLD rates | Public |

---

## Data Entry Templates

### Adding New Market Rates

```sql
INSERT INTO market_rates (
  trade, item_code, name, unit, base_rate, 
  state, min_rate, max_rate, 
  regional_adjustment_metro, regional_adjustment_regional, regional_adjustment_rural,
  source, confidence_score, effective_date
) VALUES (
  'plumbing', 'PLB-NEW-001', 'New Item Description', 'each', 15000,
  'nsw', 12000, 18000,
  1.00, 0.95, 0.85,
  'Rawlinsons 2025', 85, NOW()
);
```

### Adding New Price Benchmarks

```sql
INSERT INTO price_benchmarks (
  project_type, region, avg_cost, min_cost, max_cost,
  sample_size, confidence_score
) VALUES (
  'new_project_type', 'Sydney Metro', 2500000, 2000000, 3000000,
  50, 80
);
```

---

## Priority Actions for Beta Launch

1. ✅ **Clear test data** - Completed
2. ✅ **Preserve market rates** - 193 rates retained
3. ✅ **Preserve price benchmarks** - 25 benchmarks retained
4. ⬜ **Review rate accuracy** - Manual review needed
5. ⬜ **Add missing trades** - Painting, Landscaping, etc.
6. ⬜ **Expand regional coverage** - Add regional areas
7. ⬜ **Set up quarterly update process** - Automation needed

---

## Contact for Data Questions

For questions about market data accuracy or to submit corrections:
- Use the in-app **Send Feedback** button
- Select category: **Market Rates**
- Include specific item codes and suggested corrections

---

*Document created: January 5, 2026*
*Last updated: January 5, 2026*
