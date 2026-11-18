# Sprint Plan

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start sprints -->
## Sprint 1: Sprint 1

Secure registration, login, session/logout, account deactivation, per-user data isolation, and core REST/DB scaffolding in place.

Capacity: 20 points · Committed: 20

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-001 | Story | Register a new account | 5 | security-agent | — |
| US-002 | Story | Sign in to my account | 3 | backend-agent | US-001 |
| US-003 | Story | Sign out and session expiry | 3 | security-agent | US-002 |
| US-004 | Story | Keep my data private to my account | 3 | security-agent | US-002 |
| US-005 | Story | Deactivate my account | 2 | security-agent | US-002 |
| US-020 | Story | Core data served over REST APIs backed by a database | 3 | backend-agent | US-001 |
| US-021 | Story | Free to use with no payment processing | 1 | qa-agent | — |

## Sprint 2: Sprint 2

Users can manage their own categories and start logging and viewing expenses.

Capacity: 20 points · Committed: 16

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-006 | Story | Add an expense | 5 | backend-agent | US-010 |
| US-007 | Story | View my expenses | 3 | frontend-agent | US-006 |
| US-010 | Story | Create a category | 3 | backend-agent | US-004 |
| US-011 | Story | Edit a category | 2 | backend-agent | US-010 |
| US-012 | Story | Delete a category | 3 | backend-agent | US-010 |

## Sprint 3: Sprint 3

Expense editing/deletion complete; dashboard summary and responsive layout foundation delivered.

Capacity: 20 points · Committed: 13

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-008 | Story | Edit an expense | 3 | backend-agent | US-006 |
| US-009 | Story | Delete an expense | 2 | backend-agent | US-006 |
| US-013 | Story | See a spending summary on sign-in | 5 | backend-agent | US-007 |
| US-019 | Story | Use the app on desktop and mobile browsers | 3 | frontend-agent | US-007 |

## Sprint 4: Sprint 4

Spending-over-time and by-category reports, date-range filtering, and CSV export delivered.

Capacity: 20 points · Committed: 18

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-015 | Story | View spending over time | 5 | backend-agent | US-006, US-007 |
| US-016 | Story | View spending by category | 5 | backend-agent | US-006, US-007 |
| US-017 | Story | Filter reports by date range | 3 | backend-agent | US-015, US-016 |
| US-018 | Story | Export my data as CSV | 5 | backend-agent | US-006, US-007 |

## Sprint 5: Sprint 5

Dashboard shortcuts wired up and setup/usage documentation published.

Capacity: 20 points · Committed: 4

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-014 | Story | Quick access to key actions | 2 | frontend-agent | US-013, US-015, US-016 |
| US-022 | Story | Basic documentation for setup and use | 2 | devops-agent | — |

## Unscheduled

_Nothing unscheduled._
<!-- sdlc:auto:end sprints -->
