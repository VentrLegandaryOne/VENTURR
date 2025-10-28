# CRITICAL FIXES - Single Source of Truth Workflow

## User's Vision
**Single Measurement → All Outputs**
- Draw site measurements ONCE on satellite imagery
- All tools auto-populate from this baseline data
- No repeated data entry
- Consistent, professional outputs

## Critical Issues Blocking This Vision

### 🔴 ISSUE 1: Projects Not Persisting to Dashboard
**Problem:** Created projects don't appear on dashboard
**Impact:** Users can't access their projects
**Root Cause:** Need to investigate database schema mismatch (created_at column error)
**Fix Priority:** CRITICAL - Blocks entire workflow

### 🔴 ISSUE 2: Quick Actions Navigation
**Problem:** "Roofing Takeoff" button redirects to New Project form
**Impact:** Users can't access calculator directly
**Expected:** Should go to calculator with project selection
**Fix Priority:** HIGH - Confusing UX

### 🔴 ISSUE 3: Form Validation Visual Feedback
**Problem:** Colored borders show immediately on all fields
**Impact:** Looks aggressive, confuses users
**Expected:** Only show after user touches field
**Fix Priority:** MEDIUM - UX polish

## Implementation Plan

### Phase 1: Fix Project Persistence (30 mins)
- [ ] Check database schema for projects table
- [ ] Verify created_at column exists
- [ ] Run migration if needed
- [ ] Test project creation
- [ ] Verify projects appear on dashboard

### Phase 2: Fix Quick Actions Routing (15 mins)
- [ ] Update Dashboard Quick Actions to route correctly
- [ ] Site Measure → /projects/new (requires project)
- [ ] Roofing Takeoff → /calculator (standalone or project-based)
- [ ] Quote Generator → /projects/new (requires project)
- [ ] Test all Quick Action buttons

### Phase 3: Complete End-to-End Workflow Test (45 mins)
- [ ] Create new project
- [ ] Draw measurements on satellite imagery
- [ ] Verify measurements save to database
- [ ] Open Takeoff Calculator
- [ ] Verify measurements auto-load
- [ ] Generate quote
- [ ] Verify quote includes all data
- [ ] Test PDF generation

### Phase 4: Soften Form Validation (15 mins)
- [ ] Review ValidatedInput component (already has touch-based logic)
- [ ] Check why it's showing colors immediately
- [ ] Fix if needed
- [ ] Test forms

## Success Criteria
✅ Projects persist and appear on dashboard
✅ Quick Actions route to correct pages
✅ Measurements flow from Site Measurement → Calculator → Quote
✅ Form validation only shows after user interaction
✅ Complete workflow works end-to-end

## Time Estimate
**Total:** 2 hours for all critical fixes

