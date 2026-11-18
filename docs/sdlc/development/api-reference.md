# API Reference

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start endpoints -->
| Method | Path | Handler | Source | Summary |
|---|---|---|---|---|
| POST | /account/deactivate | deactivate | `backend/app/routers/account.py:13` | AC-010/NFR-004: marks the account inactive and revokes every session |
| POST | /auth/login | login | `backend/app/routers/auth.py:47` | AC-004/AC-005/NFR-002: identical generic 401 for an unknown email, a |
| POST | /auth/logout | logout | `backend/app/routers/auth.py:68` | — |
| GET | /auth/me | me | `backend/app/routers/auth.py:76` | — |
| POST | /auth/register | register | `backend/app/routers/auth.py:23` | AC-001/AC-002: creates the user or 409s on a duplicate email; the |
| GET | /categories | list_categories | `backend/app/routers/categories.py:50` | — |
| POST | /categories | create_category | `backend/app/routers/categories.py:63` | — |
| DELETE | /categories/{category_id} | delete_category | `backend/app/routers/categories.py:107` | — |
| PATCH | /categories/{category_id} | update_category | `backend/app/routers/categories.py:82` | — |
| GET | /expenses | list_expenses | `backend/app/routers/expenses.py:71` | — |
| POST | /expenses | create_expense | `backend/app/routers/expenses.py:119` | — |
| DELETE | /expenses/{expense_id} | delete_expense | `backend/app/routers/expenses.py:177` | — |
| PATCH | /expenses/{expense_id} | update_expense | `backend/app/routers/expenses.py:143` | — |
| GET | /health | health | `backend/app/main.py:119` | Liveness probe, and the only route here that is not a stub. |
<!-- sdlc:auto:end endpoints -->

<!-- sdlc:auto:start drift -->
**Designed but missing:**

- DELETE /categories/{id}
- DELETE /expenses/{id}
- GET /dashboard/summary
- GET /expenses/export
- GET /reports/by-category
- GET /reports/over-time
- PATCH /categories/{id}
- PATCH /expenses/{id}

**Code only:**

- DELETE /categories/{category_id}
- DELETE /expenses/{expense_id}
- PATCH /categories/{category_id}
- PATCH /expenses/{expense_id}
<!-- sdlc:auto:end drift -->

<!-- sdlc:auto:start source -->
Generated from commit `34bd221`
<!-- sdlc:auto:end source -->
