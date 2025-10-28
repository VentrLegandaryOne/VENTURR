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
- [x] Integrate Stripe Checkout for subscriptions
- [x] Add subscription plan selection (Starter/Pro/Growth/Enterprise)
- [x] Implement 14-day trial period management
- [x] Create tRPC subscriptions router
- [x] Add Stripe service module with safety checks
- [ ] Create Stripe webhook handler
- [ ] Fix rate limiting issue for Stripe Checkout in dev environment
- [ ] Test complete Stripe Checkout flow in production
- [ ] Add access control middleware
- [ ] Protect routes based on subscription status
- [x] Create pricing page component
- [x] Add subscription status display
- [x] Update home page with trial messaging
- [x] Add subscription widget to dashboard
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





#### 4. Mobile Optimization & Responsive Design
- [x] Create mobile-specific CSS with touch-friendly targets (44px minimum)
- [x] Add viewport meta tag configuration
- [x] Create responsive navigation component (MobileNav)
- [x] Implement bottom navigation for mobile
- [x] Add hamburger menu for mobile header
- [ ] Update Dashboard to use MobileNav component
- [ ] Optimize measurement tool for touch input
- [ ] Test on actual mobile devices
- [ ] Add safe area insets for notched devices
- [ ] Optimize forms for mobile keyboards

#### 5. Address Autocomplete, Client CRM, Form Validation
- [ ] Integrate Google Places API for address autocomplete
- [ ] Create client database schema
- [ ] Build client management interface
- [ ] Add client search and filtering
- [ ] Implement form validation library (React Hook Form + Zod)
- [ ] Add real-time validation feedback
- [ ] Create reusable form components

#### 6. Onboarding Tutorial & Project Templates
- [ ] Create interactive onboarding flow
- [ ] Add product tour library integration
- [ ] Build project template system
- [ ] Create default templates (residential, commercial, industrial)
- [ ] Add template selection during project creation
- [ ] Implement skip/dismiss onboarding option




### CRITICAL DESIGN & UX IMPROVEMENTS (User Feedback 2025-10-28)

#### Navigation & Flow Issues
- [x] Fix Home button to navigate to Dashboard (not homepage)
- [ ] Ensure intuitive flow - no repeated actions or double-ups
- [ ] Implement smart context awareness for navigation

#### Compliance Section Overhaul
- [ ] Move Installation Notes into Compliance section
- [ ] Add comprehensive metal roofing compliance codes
- [ ] Integrate AS 1562.1:2018 standards
- [ ] Add AS/NZS 1170.2:2021 wind load calculations
- [ ] Include AS 3959:2018 bushfire requirements
- [ ] Add NCC 2022 Building Code compliance
- [ ] Create AI-powered compliance document generation
- [ ] Add financial structures for metal roofing companies

#### Takeoff Calculator Improvements
- [ ] Make measurement flow intuitive and linear
- [ ] Auto-populate fields from previous steps
- [ ] Remove redundant data entry
- [ ] Add qualitative testing for all features
- [ ] Ensure each feature references previous data
- [ ] Implement smart defaults based on project type

#### Site Measurement Tool Enhancement
- [ ] Auto-extract measurements from satellite drawings
- [ ] Auto-fill measurement boxes from drawing data
- [ ] Save measurements to project automatically
- [ ] Pass measurements down the workflow intuitively
- [ ] Ensure measurements are to scale and accurate
- [ ] Train platform to recognize measurement patterns

#### Quote Generator Complete Redesign
- [x] Fix blank PDF preview issue
- [x] Populate PDF with all quote data automatically
- [x] Add professional header with company branding
- [x] Include custom logo upload functionality
- [x] Add business name personalization
- [x] Update PDF generator to use Settings data
- [x] Add print CSS for browser preview
- [x] Create print-friendly quote markup
- [x] Integrate business settings in QuoteGenerator
- [ ] Create multiple PDF template options
- [ ] Add itemized breakdown with materials/labor
- [ ] Include compliance documentation references
- [x] Add terms and conditions section
- [ ] Implement digital signature capability

#### Settings & Personalization Dashboard
- [x] Create comprehensive Settings page
- [x] Add company logo upload
- [x] Add business name configuration
- [x] Add business address and contact details
- [x] Add ABN/ACN configuration
- [x] Add default markup percentages
- [x] Add default labor rates
- [x] Add custom branding colors
- [x] Add tagline configuration
- [x] Add quote template customization

#### Google-Level Design & Polish
- [ ] Implement consistent design system
- [ ] Add micro-interactions and animations
- [ ] Improve typography hierarchy
- [ ] Enhance color palette for psychology
- [ ] Add loading states and skeletons
- [ ] Implement smooth transitions
- [ ] Add empty states with helpful guidance
- [ ] Create immersive user experience
- [ ] Add contextual help tooltips
- [ ] Implement progressive disclosure
- [ ] Add success/error feedback animations
- [ ] Optimize for visual hierarchy

#### Complete Venturr Branding
- [ ] Design professional logo suite
- [ ] Create brand guidelines document
- [ ] Implement consistent color scheme
- [ ] Add branded illustrations
- [ ] Create icon library
- [ ] Design marketing materials
- [ ] Add brand personality to copy
- [ ] Implement voice and tone guidelines

#### Quality Assurance & Testing
- [ ] Run quantitative testing on all features
- [ ] Conduct qualitative user testing
- [ ] Test all workflows end-to-end
- [ ] Verify no duplicate actions
- [ ] Ensure data flows logically
- [ ] Test on multiple devices
- [ ] Verify accessibility standards
- [ ] Performance optimization
- [ ] Cross-browser testing




### Measurement Auto-Population Workflow
- [x] Create measurements database table/schema (already exists)
- [x] Create measurements tRPC router (save/get/list/delete)
- [x] Register measurements router in main routers
- [x] Update LeafletSiteMeasurement to use tRPC measurements router
- [x] Add auto-save functionality when measurements are drawn (1s debounce)
- [x] Load existing measurements when page opens
- [ ] Auto-load measurements in Takeoff Calculator
- [ ] Add measurement history/versions
- [ ] Allow manual override/refinement of auto-loaded data
- [ ] Display measurement source (manual vs auto-extracted)
- [ ] Add measurement validation and error checking

