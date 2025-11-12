# VENTURR MVP Core Workflow

## Overview
The MVP Core Workflow implements the essential Lead→Site Capture→Takeoff→Quote→Archive loop that forms the backbone of VENTURR OS.

## Workflow Stages

### 1. LEAD (Project Input)
**Current Implementation:** ✅ ProjectInputForm.tsx
- Client name, address, contact details
- Job type selection
- Difficulty level assessment
- Coastal exposure detection
- Urgency classification
- Custom notes

**Data Flow:**
- Input: User form submission
- Output: Project record in database
- Next Stage: Site Capture

### 2. SITE CAPTURE (Measurement)
**Current Implementation:** ✅ LeafletSiteMeasurement.tsx
- Satellite imagery via Mapbox
- Drawing tools for roof outlines
- Automatic area calculation
- Measurement persistence
- GPS coordinates

**Data Flow:**
- Input: Project ID
- Output: Measurements record (totalArea, roofPitch, roofType, drawings)
- Next Stage: Takeoff

### 3. TAKEOFF (Material Calculation)
**Current Implementation:** ✅ CalculatorEnhanced.tsx
- Auto-load measurements from Site Capture
- Material quantity calculations
- Waste percentage
- Labor rate configuration
- Profit margin settings

**Data Flow:**
- Input: Project ID + Measurements
- Output: Takeoff record (materials, calculations, costs)
- Next Stage: Quote

### 4. QUOTE (Proposal Generation)
**Current Implementation:** ✅ QuoteGenerator.tsx
- Line item management
- PDF generation
- Client presentation
- Terms and conditions
- Digital signature (future)

**Data Flow:**
- Input: Project ID + Takeoff data
- Output: Quote record (PDF, line items, total cost)
- Next Stage: Archive

### 5. ARCHIVE (Project Completion)
**Current Implementation:** ⚠️ Partial (Projects list exists, needs completion workflow)
- Project status tracking
- Document storage
- Historical reference
- Analytics data

**Data Flow:**
- Input: Completed project
- Output: Archived project record
- Next Stage: N/A (End of workflow)

## Current Gaps

### 1. Workflow Navigation
- ❌ No clear "Next Step" buttons between stages
- ❌ No workflow progress indicator
- ❌ No automatic stage transitions

### 2. Data Flow Automation
- ⚠️ Measurements auto-load in Takeoff (implemented)
- ❌ Takeoff data doesn't auto-populate Quote
- ❌ No automatic project status updates

### 3. Stage Validation
- ❌ No validation that Site Capture is complete before Takeoff
- ❌ No validation that Takeoff is complete before Quote
- ❌ No completion checklist

### 4. User Guidance
- ❌ No onboarding for workflow stages
- ❌ No contextual help
- ❌ No workflow visualization

## Implementation Plan

### Phase 3A: Workflow Navigation Enhancement
1. Add WorkflowStepper component (visual progress indicator)
2. Add "Next Step" buttons to each stage
3. Add "Back" navigation
4. Add workflow status in project detail

### Phase 3B: Data Flow Automation
1. Auto-populate Quote from Takeoff data
2. Auto-update project status on stage completion
3. Add workflow state machine
4. Add automatic stage unlocking

### Phase 3C: Stage Validation
1. Add completion checks for each stage
2. Add validation before stage transitions
3. Add missing data warnings
4. Add completion percentage

### Phase 3D: User Guidance
1. Add workflow onboarding tour
2. Add contextual tooltips
3. Add workflow visualization dashboard
4. Add "What's Next" suggestions

## Success Metrics

- **Time to Quote:** Reduce from 2 hours to 15 minutes
- **Data Re-entry:** Eliminate 90% of manual re-entry
- **Error Rate:** Reduce missing data errors by 80%
- **User Satisfaction:** Achieve 9/10 workflow clarity score

## Technical Architecture

### Workflow State Machine
```typescript
enum WorkflowStage {
  LEAD = 'lead',
  SITE_CAPTURE = 'site_capture',
  TAKEOFF = 'takeoff',
  QUOTE = 'quote',
  ARCHIVE = 'archive',
}

interface WorkflowState {
  currentStage: WorkflowStage;
  completedStages: WorkflowStage[];
  nextStage: WorkflowStage | null;
  canProgress: boolean;
  validationErrors: string[];
}
```

### Data Flow
```
ProjectInputForm → Project (DB)
                 ↓
LeafletSiteMeasurement → Measurements (DB)
                       ↓
CalculatorEnhanced → Takeoff (DB)
                   ↓
QuoteGenerator → Quote (DB)
             ↓
ProjectArchive → Project (status: completed)
```

## Next Actions

1. ✅ Document current workflow implementation
2. ⏳ Create WorkflowStepper component
3. ⏳ Add workflow state management
4. ⏳ Implement auto-population from Takeoff to Quote
5. ⏳ Add stage validation logic
6. ⏳ Create workflow visualization dashboard
7. ⏳ Add onboarding tour
8. ⏳ Test end-to-end workflow
9. ⏳ Measure time-to-quote improvement

