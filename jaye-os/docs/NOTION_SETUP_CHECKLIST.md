# Jaye OS — Notion Setup Checklist

## Overview

This checklist walks you through the complete setup of the One-Thing-Aligned Notion Operating System. Follow it in order. Each step builds on the previous one. Total setup time: approximately 90 minutes.

---

## Phase 1: Create the Core Structure (20 minutes)

### Step 1 — Master Dashboard Page
- [ ] Create a new top-level page in your Notion workspace
- [ ] Name it: **"Jaye OS — Master Dashboard"**
- [ ] Set the icon to a target emoji (🎯) or your preferred icon
- [ ] Add a cover image (optional — keep it minimal)

### Step 2 — Create the Five Databases
Create each as a **full-page database** (Table view) inside the Master Dashboard page, then move them to top-level if you prefer. The databases are:

| # | Database Name | Primary View | Purpose |
|---|---|---|---|
| 1 | **Nightly Reset** | Table sorted by Date (newest first) | Daily energy tracking and ONE Thing logging |
| 2 | **Weekly Calibration** | Table sorted by Week Starting (newest first) | Weekly lead domino and alignment scoring |
| 3 | **Monthly Measurement** | Table sorted by Month (newest first) | Monthly kill/systemise decisions |
| 4 | **Quarterly Reset** | Table sorted by Quarter Start Date (newest first) | Quarterly strategy and role transition |
| 5 | **Yearly Reinvention** | Table sorted by Year (newest first) | Annual identity and direction alignment |

### Step 3 — Add Properties to Each Database

**Nightly Reset Properties:**
| Property Name | Type | Notes |
|---|---|---|
| Date | Date | Primary identifier — set to today's date |
| Needle Mover | Text | What moved the needle today |
| Energy Leak | Text | Biggest drain on energy |
| Must Happen Tomorrow | Text | Single most important action |
| Self Instruction | Text | One instruction to tomorrow-you |
| Energy (1-10) | Number | Subjective energy rating |
| ONE Thing Completed | Checkbox | Did you complete the protected block? |
| Notes | Text | Optional context |

**Weekly Calibration Properties:**
| Property Name | Type | Notes |
|---|---|---|
| Week Starting | Date | Monday of the week |
| Weekly ONE Thing | Text | The lead domino for this week |
| Lead Domino Output | Text | What completing the ONE Thing produces |
| Money Focus (1 line) | Text | Single-line cash/revenue focus |
| Top Bottleneck | Text | Biggest constraint this week |
| Next Week Constraint | Text | What will limit next week |
| Status | Select | Options: Planned / In Progress / Done |
| Relation to Nightly Reset | Relation | Link to that week's nightly entries |
| Avg Energy | Rollup | Average of related Nightly Reset Energy values |
| Focus Integrity (%) | Rollup | % of related Nightly Reset entries where ONE Thing Completed = true |
| Alignment Score | Formula | See formula below |

**Monthly Measurement Properties:**
| Property Name | Type | Notes |
|---|---|---|
| Month | Date | First of the month |
| Monthly ONE Thing | Text | Lead domino for the month |
| What To Kill | Text | One thing to eliminate |
| What To Systemise | Text | One thing to make repeatable |
| Revenue (Optional) | Number | Monthly revenue if tracked |
| Stress Level (1-10) | Number | Subjective stress rating |
| Decision | Select | Options: Expand / Stabilise / Reduce |
| Notes | Text | Context and reflections |

**Quarterly Reset Properties:**
| Property Name | Type | Notes |
|---|---|---|
| Quarter Start Date | Date | First day of the quarter |
| Quarterly ONE Thing | Text | Lead domino for the quarter |
| Diagnosis (Constraint) | Text | What is the binding constraint |
| Guiding Policy | Text | One policy that addresses the constraint |
| Coherent Actions (3 max) | Text | Maximum three actions that execute the policy |
| Operator Load Target (%) | Number | Target percentage of time on operator work |
| Architect Load Target (%) | Number | Target percentage of time on architect work |
| Decision | Select | Options: Consolidate / Expand / Scale |

**Yearly Reinvention Properties:**
| Property Name | Type | Notes |
|---|---|---|
| Year | Date | January 1 of the year (e.g., 2026-01-01) |
| Yearly ONE Thing | Text | The defining move for the year |
| Identity Standard (Non-Negotiable) | Text | The standard you refuse to drop below |
| What Must Die | Text | What you will no longer tolerate |
| What Must Grow | Text | What must compound this year |
| Top Metrics | Text | 3-5 metrics that prove progress |
| Notes | Text | Reflections and context |

---

## Phase 2: Add Linked Views to Master Dashboard (15 minutes)

### Step 4 — Build the Dashboard Layout
Return to the **Jaye OS — Master Dashboard** page and add the following sections using linked database views:

**Section 1: "Today's ONE Thing"**
- [ ] Add a linked view of **Weekly Calibration**
- [ ] Filter: Status = "In Progress"
- [ ] Show only: Weekly ONE Thing, Lead Domino Output
- [ ] This is the first thing you see every day

**Section 2: "Nightly Reset — Last 7 Entries"**
- [ ] Add a linked view of **Nightly Reset**
- [ ] Sort: Date descending
- [ ] Limit: 7 entries (use filter: Date is within past week)
- [ ] Show: Date, Needle Mover, Energy, ONE Thing Completed

**Section 3: "This Week — Weekly Calibration"**
- [ ] Add a linked view of **Weekly Calibration**
- [ ] Filter: Week Starting is within this week
- [ ] Show all properties

**Section 4: "This Month — Monthly Measurement"**
- [ ] Add a linked view of **Monthly Measurement**
- [ ] Filter: Month is within this month
- [ ] Show all properties

**Section 5: "Quarterly Reset — Current Quarter"**
- [ ] Add a linked view of **Quarterly Reset**
- [ ] Filter: Quarter Start Date is within last 3 months
- [ ] Show all properties

**Section 6: "Yearly Reinvention — Current Year"**
- [ ] Add a linked view of **Yearly Reinvention**
- [ ] Filter: Year is this year
- [ ] Show all properties

---

## Phase 3: Add Templates and Recurrence (15 minutes)

### Step 5 — Create Database Templates

**Nightly Reset Template:**
- [ ] Open the Nightly Reset database
- [ ] Click the dropdown arrow next to "New" → "New template"
- [ ] Name: "Nightly Reset"
- [ ] Pre-fill: Date = @today
- [ ] Add the following prompts as placeholder text in each field:
  - Needle Mover: "What moved the needle today?"
  - Energy Leak: "What drained your energy most?"
  - Must Happen Tomorrow: "One action — one sentence"
  - Self Instruction: "One instruction to tomorrow-you"
- [ ] Do NOT set this template to repeat (use the button instead — see Step 6)

**Weekly Calibration Template:**
- [ ] Create template named "Weekly Calibration"
- [ ] Pre-fill: Status = "In Progress"
- [ ] Add the Focusing Question as a prompt: "What's the ONE Thing I can do this week such that by doing it everything else will be easier or unnecessary?"
- [ ] Set to **repeat every Friday** (or your chosen review day)

**Monthly Measurement Template:**
- [ ] Create template named "Monthly Measurement"
- [ ] Pre-fill: Decision = "Stabilise" (default safe choice)
- [ ] Set to **repeat on the 1st of every month**

**Quarterly Reset Template:**
- [ ] Create template named "Quarterly Reset"
- [ ] Pre-fill with Good Strategy framework prompts:
  - Diagnosis: "What is the binding constraint right now?"
  - Guiding Policy: "What is the one policy that addresses it?"
  - Coherent Actions: "What are the 3 (max) actions that execute the policy?"
- [ ] Set to repeat every 3 months (or create manually each quarter)

**Yearly Reinvention Template:**
- [ ] Create template named "Yearly Reinvention"
- [ ] Create manually each year (no repeat needed)

---

## Phase 4: Add Capture Buttons (10 minutes)

### Step 6 — Dashboard Buttons

**"New Nightly Reset" Button:**
- [ ] On the Master Dashboard, add a Button block
- [ ] Name: "New Nightly Reset"
- [ ] Action: Add page to → Nightly Reset database
- [ ] Template: Nightly Reset template
- [ ] This is your one-click nightly capture — use it every evening

**"Close Week" Button (optional):**
- [ ] Add a Button block
- [ ] Name: "Close Week"
- [ ] Action 1: Edit pages in Weekly Calibration where Status = "In Progress" → set Status to "Done"
- [ ] Action 2: Add page to Weekly Calibration using the Weekly Calibration template
- [ ] This automates your Friday close-out

---

## Phase 5: Add Relations and Rollups for Alignment Score (15 minutes)

### Step 7 — Create Relations

- [ ] In **Weekly Calibration**, add a Relation property
- [ ] Name: "Nightly Entries"
- [ ] Relate to: Nightly Reset database
- [ ] Each week, link that week's 5-7 nightly entries to the weekly row

### Step 8 — Create Rollups

**Average Energy Rollup:**
- [ ] In Weekly Calibration, add a Rollup property
- [ ] Name: "Avg Energy"
- [ ] Relation: Nightly Entries
- [ ] Property: Energy (1-10)
- [ ] Calculate: Average

**Focus Integrity Rollup:**
- [ ] Add another Rollup property
- [ ] Name: "Focus Integrity (%)"
- [ ] Relation: Nightly Entries
- [ ] Property: ONE Thing Completed
- [ ] Calculate: Percent checked

### Step 9 — Create the Alignment Score Formula

- [ ] In Weekly Calibration, add a Formula property
- [ ] Name: "Alignment Score"
- [ ] Formula (Notion formula 2.0 syntax):

```
round(
  (prop("Avg Energy") / 10 * 40) +
  (prop("Focus Integrity (%)") * 40) +
  (if(prop("Status") == "Done", 20, if(prop("Status") == "In Progress", 10, 0)))
)
```

**Score breakdown:**
- Energy component: 0–40 points (Avg Energy / 10 × 40)
- Focus Integrity component: 0–40 points (% ONE Thing completed × 40)
- Completion component: 0–20 points (Done = 20, In Progress = 10, Planned = 0)
- Total: 0–100

**Interpretation guide:**
| Score Range | Meaning | Action |
|---|---|---|
| 80–100 | System is working — rhythm is holding | Maintain and look for expansion opportunities |
| 60–79 | Functional but slipping — one area needs attention | Identify which component dropped and address it |
| 40–59 | System under stress — operator overload likely | Reduce scope, protect blocks harder, batch more aggressively |
| Below 40 | System broken — reset required | Stop everything non-essential, re-establish the ONE Thing block |

---

## Phase 6: Import Data (10 minutes)

### Step 10 — Import CSVs

For each database:
1. Open the database in Notion
2. Click the **⋯** menu (top right of the database)
3. Select **Merge with CSV**
4. Upload the corresponding CSV file from the `csv/` folder:
   - `nightly-reset.csv` → Nightly Reset
   - `weekly-calibration.csv` → Weekly Calibration
   - `monthly-measurement.csv` → Monthly Measurement
   - `quarterly-reset.csv` → Quarterly Reset
   - `yearly-reinvention.csv` → Yearly Reinvention
5. Map columns to the properties you created
6. Verify the imported data looks correct

**Alternative:** If column mapping is problematic, copy-paste the data row by row. The CSVs contain sample data to get you started — replace with real data as you go.

---

## Phase 7: Import Calendar (5 minutes)

### Step 11 — Import ICS into Google Calendar

1. Open Google Calendar in your browser (calendar.google.com)
2. Click the **gear icon** (Settings) → **Settings**
3. In the left sidebar, click **Import & export**
4. Click **Select file from your computer**
5. Upload `jaye-os-schedule.ics` from the `calendar/` folder
6. Choose which calendar to add events to (or create a new "Jaye OS" calendar)
7. Click **Import**
8. Verify all recurring events appear correctly

**Events imported:**
- ONE Thing Block (Mon–Fri, 6:00–7:00 AM)
- Operator Window (Mon–Fri, 7:30 AM–12:30 PM)
- Close Loops (Mon–Fri, 4:30–5:00 PM)
- Architect Build Block #1 (Tue, 1:30–3:30 PM)
- Midweek Calibration (Wed, 12:15–12:45 PM)
- Architect Build Block #2 (Thu, 1:30–3:30 PM)
- Weekly Calibration (Fri, 2:30–3:30 PM)
- Friday Admin Batch (Fri, 3:30–4:30 PM)
- Weekly ONE Thing Selection (Sun, 7:00–7:15 PM)
- Nightly Reset (Daily, 9:30–9:40 PM)
- Monthly Measurement (1st of each month, 2:00–3:00 PM)
- Quarterly Reset (1st of Jan/Apr/Jul/Oct, 9:00–11:00 AM)

---

## Phase 8: Run the System (ongoing)

### Step 12 — First 14 Days

- [ ] Run the system for 14 days before making any structural changes
- [ ] Track your Alignment Score trend — look for the pattern, not perfection
- [ ] If a component feels broken, note it in your Nightly Reset but don't change the system yet
- [ ] After 14 days, review what's working and what needs adjustment
- [ ] Make one change at a time — never overhaul the whole system at once

### Operating Principles
1. **Live on the dashboard.** You should rarely need to open the raw databases.
2. **One button, one action.** The Nightly Reset button is your daily entry point.
3. **The Focusing Question governs everything.** "What's the ONE Thing I can do such that by doing it everything else will be easier or unnecessary?"
4. **If it takes more than 10 minutes, it's broken.** The Nightly Reset should be fast. If it's becoming journaling, strip it back.
5. **Protect the block, flex the rest.** The ONE Thing block is sacred. Everything else adapts.

---

## Quick Reference: File Locations

| File | Path | Purpose |
|---|---|---|
| Nightly Reset CSV | `csv/nightly-reset.csv` | Sample data for Nightly Reset database |
| Weekly Calibration CSV | `csv/weekly-calibration.csv` | Sample data for Weekly Calibration database |
| Monthly Measurement CSV | `csv/monthly-measurement.csv` | Sample data for Monthly Measurement database |
| Quarterly Reset CSV | `csv/quarterly-reset.csv` | Sample data for Quarterly Reset database |
| Yearly Reinvention CSV | `csv/yearly-reinvention.csv` | Sample data for Yearly Reinvention database |
| Calendar (ICS) | `calendar/jaye-os-schedule.ics` | Google Calendar import file |
| 90-Day Transition Plan | `docs/90_DAY_TRANSITION_PLAN.md` | Weekly milestones for Operator → Owner |
| Strategy Guardrails | `docs/STRATEGY_GUARDRAILS.md` | Good vs bad strategy + 10 effort cuts |
| This Checklist | `docs/NOTION_SETUP_CHECKLIST.md` | You are here |
