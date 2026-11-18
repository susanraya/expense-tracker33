# Traceability Matrix

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start legend -->
Built from recorded links, not written by a model: requirement key → plan item (`source_stable_key`) → development ticket (`stable_key`) → the ticket's test steps → the last live deployment that started after the work finished. **AC tests** counts the story's acceptance criteria that have a test case, and those whose test cases all passed in the latest finished E2E run.
<!-- sdlc:auto:end legend -->

<!-- sdlc:auto:start matrix -->
| Requirement | Epic | Title | Plan items | Sprint | Design | Code | Commits | Ticket | Tests | AC tests | Deployed |
|---|---|---|---|---|---|---|---|---|---|---|---|
| US-001 | EPIC-001 | Register a new account | US-001 | 1 | POST /auth/register, api_backend, database, users | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-002 | EPIC-001 | Sign in to my account | US-002 | 1 | POST /auth/login, api_backend, database, sessions, users | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-003 | EPIC-001 | Sign out and session expiry | US-003 | 1 | GET /auth/me, POST /auth/logout, api_backend, database, sessions | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-004 | EPIC-001 | Keep my data private to my account | US-004 | 1 | GET /auth/me, api_backend, users | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-005 | EPIC-001 | Deactivate my account | US-005 | 1 | POST /account/deactivate, api_backend, database, sessions, users | — | — | not started | not run | 0/1 tested · 0/1 passing | — |
| US-006 | EPIC-002 | Add an expense | US-006 | 2 | POST /expenses, api_backend, categories, database, expenses, web_spa | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-007 | EPIC-002 | View my expenses | US-007 | 2 | GET /expenses, api_backend, expenses, web_spa | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-008 | EPIC-002 | Edit an expense | US-008 | 3 | PATCH /expenses/{id}, api_backend, database, expenses | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-009 | EPIC-002 | Delete an expense | US-009 | 3 | DELETE /expenses/{id}, api_backend, database, expenses | — | — | not started | not run | 0/1 tested · 0/1 passing | — |
| US-010 | EPIC-003 | Create a category | US-010 | 2 | POST /categories, api_backend, categories, database | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-011 | EPIC-003 | Edit a category | US-011 | 2 | PATCH /categories/{id}, api_backend, categories, database | — | — | not started | not run | 0/1 tested · 0/1 passing | — |
| US-012 | EPIC-003 | Delete a category | US-012 | 2 | DELETE /categories/{id}, api_backend, categories, database, expenses | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-013 | EPIC-004 | See a spending summary on sign-in | US-013 | 3 | GET /dashboard/summary, api_backend, categories, database, expenses, web_spa | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-014 | EPIC-004 | Quick access to key actions | US-014 | 5 | web_spa | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-015 | EPIC-005 | View spending over time | US-015 | 4 | GET /reports/over-time, api_backend, database, expenses, web_spa | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-016 | EPIC-005 | View spending by category | US-016 | 4 | GET /reports/by-category, api_backend, categories, database, expenses, web_spa | — | — | not started | not run | 0/1 tested · 0/1 passing | — |
| US-017 | EPIC-005 | Filter reports by date range | US-017 | 4 | GET /reports/by-category, GET /reports/over-time, api_backend, expenses, web_spa | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-018 | EPIC-005 | Export my data as CSV | US-018 | 4 | GET /expenses/export, api_backend, expenses, web_spa | — | — | not started | not run | 0/1 tested · 0/1 passing | — |
| US-019 | EPIC-006 | Use the app on desktop and mobile browsers | US-019 | 3 | web_spa | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-020 | EPIC-006 | Core data served over REST APIs backed by a database | US-020 | 1 | api_backend, categories, database, expenses, users | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-021 | EPIC-006 | Free to use with no payment processing | US-021 | 1 | — | — | — | not started | not run | 0/1 tested · 0/1 passing | — |
| US-022 | EPIC-006 | Basic documentation for setup and use | US-022 | 5 | — | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
<!-- sdlc:auto:end matrix -->
