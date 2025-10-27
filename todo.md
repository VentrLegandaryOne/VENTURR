# Venturr Platform - Development TODO

## Critical Fixes from Comprehensive Testing

### P0 BLOCKERS (Must Fix Before Launch)

#### 1. Implement Mapbox Satellite Imagery Integration
- [x] Install Mapbox GL JS and dependencies
- [x] Add Mapbox API key to environment variables
- [x] Implement geocoding service (address → coordinates)
- [x] Load satellite tiles on Site Measurement page
- [x] Center map on project address automatically
- [x] Add zoom/pan controls
- [x] Integrate drawing tools with map layer
- [x] Test satellite imagery loads correctly
- [x] Verify measurements are accurate
- [x] Add loading states and error handling

#### 2. Implement Authentication & Subscription Flow
- [ ] Create sign-up form component
- [ ] Add email/password validation
- [ ] Implement email verification flow
- [ ] Integrate Stripe Checkout for subscriptions
- [ ] Add subscription plan selection (Starter/Pro/Enterprise)
- [ ] Implement 14-day trial period management
- [ ] Add access control middleware
- [ ] Protect routes based on subscription status
- [ ] Add "Upgrade" prompts for free users
- [ ] Test complete sign-up to payment flow

### P1 HIGH PRIORITY

#### 3. Address Autocomplete
- [ ] Integrate Google Places or Mapbox Geocoding API
- [ ] Add autocomplete component to address fields
- [ ] Store coordinates with addresses
- [ ] Test autocomplete functionality
- [ ] Add fallback for manual entry

#### 4. Client Database/CRM
- [ ] Create clients table in database schema
- [ ] Add client CRUD operations (tRPC router)
- [ ] Add client autocomplete to project form
- [ ] Show client history and past projects
- [ ] Test client reuse workflow
- [ ] Add client search functionality

#### 5. Project Templates
- [ ] Create templates table in database
- [ ] Add "Use Template" button to project creation
- [ ] Add "Save as Template" to existing projects
- [ ] Implement template CRUD operations
- [ ] Create default templates (residential re-roof, commercial repair, etc.)
- [ ] Test template workflow end-to-end

#### 6. Onboarding/Tutorial System
- [ ] Install react-joyride or similar
- [ ] Create onboarding steps for Dashboard
- [ ] Create onboarding for Project Creation
- [ ] Create onboarding for Site Measurement
- [ ] Create onboarding for Quote Generator
- [ ] Add tooltips to all technical terms
- [ ] Implement first-visit detection
- [ ] Add "Skip Tour" and "Replay Tour" options
- [ ] Test onboarding flow with new users

#### 7. Mobile Optimization
- [ ] Add responsive CSS breakpoints
- [ ] Increase touch target sizes (minimum 44px)
- [ ] Optimize forms for mobile keyboards
- [ ] Add mobile-specific navigation (hamburger menu)
- [ ] Test on real mobile devices (iOS/Android)
- [ ] Add voice input for forms
- [ ] Add camera integration for site photos
- [ ] Implement GPS location for addresses
- [ ] Add offline mode for field work

#### 8. Form Validation Feedback
- [ ] Install react-hook-form and zod
- [ ] Add validation schemas to Project Creation form
- [ ] Add validation to Quote Generator
- [ ] Add validation to all other forms
- [ ] Show inline error messages
- [ ] Add success confirmations (toasts)
- [ ] Test validation on all forms

#### 9. Save Draft Functionality
- [ ] Implement auto-save every 30 seconds
- [ ] Add "Save Draft" button to Project Creation
- [ ] Add "Save Draft" to Quote Generator
- [ ] Add "Resume Draft" detection on return
- [ ] Store drafts in database with user ID
- [ ] Add draft cleanup (delete old drafts)
- [ ] Test draft save/resume workflow

#### 10. Keyboard Shortcuts
- [ ] Implement useHotkeys hook
- [ ] Add Ctrl+N for new project
- [ ] Add Ctrl+S for save
- [ ] Add Ctrl+Q for new quote
- [ ] Add / for search focus
- [ ] Add Esc to close modals
- [ ] Show keyboard shortcuts help (Ctrl+?)

#### 11. Bulk Import
- [ ] Create CSV import component
- [ ] Parse and validate CSV data
- [ ] Bulk create projects from CSV
- [ ] Show import progress
- [ ] Handle and report errors
- [ ] Provide CSV template download

#### 12. Project Status Workflow
- [ ] Define project status enum (Draft → Measuring → Quoting → etc.)
- [ ] Add status transitions
- [ ] Add status change notifications
- [ ] Show status timeline on project
- [ ] Test status workflow

### P2 MEDIUM PRIORITY

#### 13. Collaboration Features
- [ ] Add project assignment to team members
- [ ] Implement comments/notes system
- [ ] Add @mention notifications
- [ ] Create activity timeline
- [ ] Implement role-based permissions

#### 14. Measurement History
- [ ] Save all measurements to database
- [ ] Show measurement list on project
- [ ] Allow viewing/editing past measurements
- [ ] Compare measurements over time

#### 15. Photo Upload
- [ ] Implement react-dropzone
- [ ] Upload photos to S3
- [ ] Attach photos to projects
- [ ] Show photo gallery
- [ ] Add photo annotations

#### 16. Weather Integration
- [ ] Integrate weather API (OpenWeather or similar)
- [ ] Show 7-day forecast for project location
- [ ] Warn about rain/wind on scheduled dates
- [ ] Suggest alternative dates

#### 17. Calendar/Scheduling
- [ ] Add calendar component
- [ ] Implement drag-and-drop scheduling
- [ ] Add crew assignment
- [ ] Implement resource allocation
- [ ] Add conflict detection

#### 18. Financial Dashboard
- [ ] Create dashboard page
- [ ] Add revenue charts (daily/weekly/monthly)
- [ ] Show outstanding invoices widget
- [ ] Add profit margin analysis
- [ ] Integrate with Xero data

#### 19. Export Functionality
- [ ] Add PDF export for quotes
- [ ] Add Excel export for project list
- [ ] Add CSV export for reports
- [ ] Add print-friendly views

#### 20. Search Functionality
- [ ] Implement global search
- [ ] Search across projects, clients, quotes
- [ ] Add filters (date, status, type)
- [ ] Show search results with highlighting


