# Tests

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start summary -->
158 tests · Passed 152 · Failed 6 · Skipped 0 · Not run 0

Acceptance criteria covered: 23/40 · passing: 18/40
<!-- sdlc:auto:end summary -->

<!-- sdlc:auto:start tests -->
## Sprint 1

### US-001: Register a new account

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-001 | test_ac001_accepts_a_valid_email_and_password | Unit | Passed | `backend/tests/unit/test_auth_schemas.py` |
| AC-003 | test_ac003_rejects_invalid_email | Unit | Passed | `backend/tests/unit/test_auth_schemas.py` |
| AC-003 | test_ac003_rejects_password_too_short | Unit | Passed | `backend/tests/unit/test_auth_schemas.py` |
| AC-003 | test_ac003_rejects_password_without_a_digit | Unit | Passed | `backend/tests/unit/test_auth_schemas.py` |
| AC-003 | test_ac003_rejects_password_without_a_letter | Unit | Passed | `backend/tests/unit/test_auth_schemas.py` |
| — | test_seeding_nothing_when_env_vars_are_unset | Unit | Passed | `backend/tests/unit/test_seed.py` |
| — | test_seeding_twice_creates_one_user_per_pair | Unit | Passed | `backend/tests/unit/test_seed.py` |
| AC-007 | test_ac007_default_idle_timeout_is_30_minutes | Unit | Passed | `backend/tests/unit/test_session_expiry.py` |
| AC-007 | test_ac007_naive_expires_at_is_treated_as_utc | Unit | Passed | `backend/tests/unit/test_session_expiry.py` |
| AC-007 | test_ac007_session_past_idle_window_is_expired | Unit | Passed | `backend/tests/unit/test_session_expiry.py` |
| AC-007 | test_ac007_session_within_idle_window_is_not_expired | Unit | Passed | `backend/tests/unit/test_session_expiry.py` |
| AC-009 | App > [AC-009] redirects to /sign-in instead of the app shell when signed out | Unit | Passed | `frontend/src/App.test.tsx` |
| — | App > renders a screen inside the app shell and shows its menu when signed in | Unit | Passed | `frontend/src/App.test.tsx` |
| AC-001 | SignIn > [AC-001] register success signs the user in and lands on /dashboard | Unit | Passed | `frontend/src/screens/SignIn.test.tsx` |
| AC-002 | SignIn > [AC-002] a 409 on register shows the duplicate-email message and keeps the form | Unit | Passed | `frontend/src/screens/SignIn.test.tsx` |
| AC-003 | SignIn > [AC-003] a 422 on register explains what to fix and creates no account | Unit | Passed | `frontend/src/screens/SignIn.test.tsx` |
| AC-004 | SignIn > [AC-004] login success stores the token and lands on /dashboard | Unit | Passed | `frontend/src/screens/SignIn.test.tsx` |
| AC-005 | SignIn > [AC-005] a 401 on login shows exactly the generic message | Unit | Passed | `frontend/src/screens/SignIn.test.tsx` |
| AC-001 | test_ac001_register_creates_user_and_hashes_the_password | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-002 | test_ac002_register_duplicate_email_returns_409_and_creates_no_row | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-003 | test_ac003_register_invalid_email_returns_422_and_creates_no_user | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-003 | test_ac003_register_invalid_password_returns_422_and_creates_no_user | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-004 | test_ac004_login_returns_token_and_user | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-005 | test_ac005_login_unknown_email_and_wrong_password_return_identical_401 | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-006 | test_ac006_logout_revokes_the_session | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-007 | test_ac007_idle_session_past_the_configured_window_returns_401 | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-007 | test_ac007_last_active_at_updates_on_authenticated_requests | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-007 | test_ac007_me_returns_user_with_a_valid_token | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-007 | test_ac007_me_without_a_token_returns_401 | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-010 | test_ac010_deactivate_revokes_sessions_and_blocks_future_sign_in | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-010 | test_ac010_deactivate_without_a_token_returns_401 | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-010 | [AC-010] confirming deactivation in Settings ends the session and the same credentials can no longer sign in | E2E | Passed | `frontend/e2e/auth-deactivation.spec.ts` |
| AC-001 | [AC-001] a new visitor registers with a valid email and a conforming password and reaches the dashboard | E2E | Passed | `frontend/e2e/auth-registration.spec.ts` |
| AC-002 | [AC-002] registering with an already-registered email shows a clear rejection and no second account is created | E2E | Passed | `frontend/e2e/auth-registration.spec.ts` |
| AC-003 | [AC-003] a too-short password shows a validation message and creates no account | E2E | Passed | `frontend/e2e/auth-registration.spec.ts` |
| AC-003 | [AC-003] an invalid email shows a validation message and creates no account | E2E | Passed | `frontend/e2e/auth-registration.spec.ts` |
| AC-006 | [AC-006] after Sign out, navigating directly to /dashboard lands on the sign-in screen | E2E | Passed | `frontend/e2e/auth-session.spec.ts` |
| AC-007 | [AC-007] with the stored token cleared, the next protected action redirects to sign-in | E2E | Passed | `frontend/e2e/auth-session.spec.ts` |
| AC-007 | [AC-007] with the stored token revoked server-side, the next protected action redirects to sign-in | E2E | Failed | `frontend/e2e/auth-session.spec.ts` |
| AC-004 | [AC-004] signing in with the seeded smoke-test credentials reaches the dashboard | E2E | Failed | `frontend/e2e/auth-signin.spec.ts` |
| AC-005 | [AC-005] a wrong password for a real account shows the generic failure message | E2E | Failed | `frontend/e2e/auth-signin.spec.ts` |
| AC-005 | [AC-005] an unknown email shows the exact same generic failure message, never revealing whether the email exists | E2E | Failed | `frontend/e2e/auth-signin.spec.ts` |

### US-004: Keep my data private to my account

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-008 | Settings > [AC-008] renders the email and created date returned by GET /auth/me, not a hardcoded account | Unit | Passed | `frontend/src/screens/Settings.test.tsx` |
| AC-009 | Settings > [AC-009] a 401 from /auth/me clears the stored token and redirects to sign-in | Unit | Passed | `frontend/src/screens/Settings.test.tsx` |
| AC-009 | Settings > [AC-009] shows a loading state while /auth/me is pending | Unit | Passed | `frontend/src/screens/Settings.test.tsx` |
| AC-036 | test_ac036_create_update_delete_persist_to_postgresql_and_are_visible_later | Integration | Passed | `backend/tests/integration/test_postgres_persistence.py` |

### US-020: Core data served over REST APIs backed by a database

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-009 | Categories > [AC-009] a 401 clears the stored token and redirects to sign-in | Unit | Passed | `frontend/src/screens/Categories.test.tsx` |
| AC-036 | Categories > [AC-036] a 409 on create shows a duplicate-name message | Unit | Passed | `frontend/src/screens/Categories.test.tsx` |
| AC-036 | Categories > [AC-036] creating a category calls POST /categories and adds it to the list | Unit | Passed | `frontend/src/screens/Categories.test.tsx` |
| AC-036 | Categories > [AC-036] renders the signed-in user's categories from GET /categories | Unit | Passed | `frontend/src/screens/Categories.test.tsx` |
| AC-036 | Categories > [AC-036] shows an error state when the list cannot be loaded | Unit | Passed | `frontend/src/screens/Categories.test.tsx` |
| AC-036 | Categories > [AC-036] shows the empty state when there are no categories | Unit | Passed | `frontend/src/screens/Categories.test.tsx` |
| AC-009 | Expenses > [AC-009] a 401 clears the stored token and redirects to sign-in | Unit | Passed | `frontend/src/screens/Expenses.test.tsx` |
| AC-036 | Expenses > [AC-036] deleting an expense calls DELETE /expenses/{id} and the list refreshes | Unit | Passed | `frontend/src/screens/Expenses.test.tsx` |
| AC-036 | Expenses > [AC-036] shows an error state when the list cannot be loaded | Unit | Passed | `frontend/src/screens/Expenses.test.tsx` |
| AC-008 | test_ac008_delete_another_users_id_returns_404 | Integration | Passed | `backend/tests/integration/test_categories.py` |
| AC-008 | test_ac008_delete_deletes_only_the_callers_own_category | Integration | Passed | `backend/tests/integration/test_categories.py` |
| AC-008 | test_ac008_patch_another_users_id_returns_404_and_changes_nothing | Integration | Passed | `backend/tests/integration/test_categories.py` |
| AC-008 | test_ac008_patch_updates_only_the_callers_own_category | Integration | Passed | `backend/tests/integration/test_categories.py` |
| AC-036, AC-008 | test_ac036_ac008_list_returns_only_the_callers_categories_ordered_by_name | Integration | Passed | `backend/tests/integration/test_categories.py` |
| AC-036 | test_ac036_create_returns_201_with_the_created_category | Integration | Passed | `backend/tests/integration/test_categories.py` |
| AC-036 | test_ac036_duplicate_name_for_the_same_user_returns_409 | Integration | Passed | `backend/tests/integration/test_categories.py` |
| AC-036 | test_ac036_same_name_for_a_different_user_succeeds | Integration | Passed | `backend/tests/integration/test_categories.py` |
| AC-037 | test_ac037_create_without_a_token_returns_401_and_creates_no_row | Integration | Passed | `backend/tests/integration/test_categories.py` |
| AC-037 | test_ac037_delete_without_a_token_returns_401 | Integration | Passed | `backend/tests/integration/test_categories.py` |
| AC-037 | test_ac037_list_without_a_token_returns_401_and_no_data | Integration | Passed | `backend/tests/integration/test_categories.py` |
| AC-037 | test_ac037_patch_without_a_token_returns_401 | Integration | Passed | `backend/tests/integration/test_categories.py` |
| — | test_create_invalid_payload_returns_422 | Integration | Passed | `backend/tests/integration/test_categories.py` |
| — | test_patch_duplicate_name_returns_409 | Integration | Passed | `backend/tests/integration/test_categories.py` |
| AC-008 | test_ac008_delete_another_users_id_returns_404 | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-008 | test_ac008_delete_deletes_only_the_callers_own_expense | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-008 | test_ac008_patch_another_users_id_returns_404_and_changes_nothing | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-008 | test_ac008_patch_updates_only_the_callers_own_expense | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-036, AC-008 | test_ac036_ac008_list_returns_only_the_callers_expenses_newest_first | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-036 | test_ac036_create_returns_201_with_the_created_expense | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-036 | test_ac036_create_with_another_users_category_id_returns_404_and_creates_nothing | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-036 | test_ac036_create_with_unknown_category_id_returns_404_and_creates_nothing | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-036 | test_ac036_list_filters_by_category_id | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-036 | test_ac036_list_filters_by_start_and_end | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-036 | test_ac036_list_respects_limit_and_offset | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-037 | test_ac037_create_without_a_token_returns_401_and_creates_no_row | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-037 | test_ac037_delete_without_a_token_returns_401 | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-037 | test_ac037_list_without_a_token_returns_401_and_no_data | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-037 | test_ac037_patch_without_a_token_returns_401 | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| — | test_amounts_are_stored_at_fixed_precision_without_float_drift | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| — | test_list_with_start_after_end_returns_422_with_a_clear_message | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| — | test_patch_with_unknown_category_id_returns_404_and_changes_nothing | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-036 | test_ac036_category_and_expense_created_through_post_survive_a_later_request | Integration | Passed | `backend/tests/integration/test_token_validity_and_persistence.py` |
| AC-037 | test_ac037_garbage_token_returns_401_and_changes_no_row_on_every_endpoint | Integration | Passed | `backend/tests/integration/test_token_validity_and_persistence.py` |
| AC-037 | test_ac037_idle_expired_token_returns_401_and_changes_no_row_on_every_endpoint | Integration | Passed | `backend/tests/integration/test_token_validity_and_persistence.py` |
| AC-037 | test_ac037_logged_out_token_returns_401_and_changes_no_row_on_every_endpoint | Integration | Passed | `backend/tests/integration/test_token_validity_and_persistence.py` |
| AC-037 | test_ac037_no_token_returns_401_and_changes_no_row_on_every_endpoint | Integration | Passed | `backend/tests/integration/test_token_validity_and_persistence.py` |
| AC-009 | [AC-009] navigating directly to /categories with no session lands on sign-in and shows no data | E2E | Passed | `frontend/e2e/expenses-categories.spec.ts` |
| AC-009 | [AC-009] navigating directly to /expenses with no session lands on sign-in and shows no data | E2E | Passed | `frontend/e2e/expenses-categories.spec.ts` |
| AC-036 | [AC-036] a signed-in user creates, lists, edits and deletes a category and an expense, surviving a page reload | E2E | Failed | `frontend/e2e/expenses-categories.spec.ts` |

### US-021: Free to use with no payment processing

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-038 | [AC-038] no billing or payment flow > account settings has no billing section and states the app is free to use | Unit | Passed | `frontend/src/screens/NoPayment.test.tsx` |
| AC-038 | [AC-038] no billing or payment flow > logging expenses never asks for payment details | Unit | Passed | `frontend/src/screens/NoPayment.test.tsx` |
| AC-038 | [AC-038] no billing or payment flow > the dashboard a signed-in user lands on never asks for payment details | Unit | Passed | `frontend/src/screens/NoPayment.test.tsx` |
| AC-038 | [AC-038] no billing or payment flow > the sign-in / create-account screen never asks for payment details and states the app is free | Unit | Passed | `frontend/src/screens/NoPayment.test.tsx` |
| AC-038 | [AC-038] no billing or payment flow > viewing reports never asks for payment details | Unit | Passed | `frontend/src/screens/NoPayment.test.tsx` |
| AC-038 | test_ac038_no_candidate_billing_or_payment_route_is_served | Integration | Passed | `backend/tests/integration/test_no_payment_flow.py` |
| AC-038 | test_ac038_openapi_document_names_no_billing_or_payment_path | Integration | Passed | `backend/tests/integration/test_no_payment_flow.py` |
| AC-038 | test_ac038_register_ignores_a_stray_payment_field_rather_than_demanding_one | Integration | Passed | `backend/tests/integration/test_no_payment_flow.py` |
| AC-038 | test_ac038_register_succeeds_with_only_email_and_password_no_payment_field_required | Integration | Passed | `backend/tests/integration/test_no_payment_flow.py` |
| AC-038 | [AC-038] Account settings states the app is free to use and has no billing section | E2E | Passed | `frontend/e2e/no-payment.spec.ts` |
| AC-038 | [AC-038] a full journey -- register, create an expense, open the dashboard and reports -- never shows a payment, billing or subscription field or link | E2E | Failed | `frontend/e2e/no-payment.spec.ts` |
| AC-038 | [AC-038] no billing, payment or subscription endpoint is served by the API | E2E | Passed | `frontend/e2e/no-payment.spec.ts` |
| AC-038 | [AC-038] registering a new account asks only for email and password, never a payment detail | E2E | Passed | `frontend/e2e/no-payment.spec.ts` |
| AC-038 | [AC-038] registering through the API succeeds from email and password alone, with no payment field required or echoed back | E2E | Passed | `frontend/e2e/no-payment.spec.ts` |
| AC-038 | [AC-038] the Expenses screen, where expenses are logged, never asks for payment details | E2E | Passed | `frontend/e2e/no-payment.spec.ts` |
| AC-038 | [AC-038] the Reports screen never asks for payment details | E2E | Passed | `frontend/e2e/no-payment.spec.ts` |

## Sprint 2

### US-006: Add an expense

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-011 | Expenses > [AC-011] submitting with no category selected shows a validation message and sends no POST | Unit | Passed | `frontend/src/screens/Expenses.test.tsx` |
| AC-011, AC-012 | Expenses > [AC-011][AC-012] a valid save posts to POST /expenses, closes the dialog and refreshes the list | Unit | Passed | `frontend/src/screens/Expenses.test.tsx` |
| AC-012 | Expenses > [AC-012] a 422 from the API maps its detail to the matching field's message | Unit | Passed | `frontend/src/screens/Expenses.test.tsx` |
| AC-012 | Expenses > [AC-012] empty, non-numeric and non-positive amount, and empty date, each show a field message and block submission | Unit | Passed | `frontend/src/screens/Expenses.test.tsx` |
| AC-013 | Expenses > [AC-013] the form has no recurring, receipt or currency field | Unit | Passed | `frontend/src/screens/Expenses.test.tsx` |
| AC-014 | Expenses > [AC-014] renders amount, date, category and note from GET /expenses newest first | Unit | Passed | `frontend/src/screens/Expenses.test.tsx` |
| AC-015 | Expenses > [AC-015] shows the empty state inviting the user to add their first expense | Unit | Passed | `frontend/src/screens/Expenses.test.tsx` |
| AC-011 | test_ac011_create_with_missing_category_id_returns_422_naming_category_and_creates_nothing | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-011 | test_ac011_create_with_null_category_id_returns_422_naming_category_and_creates_nothing | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-011 | test_ac011_patch_rejects_setting_category_id_to_null_and_changes_nothing | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-012 | test_ac012_create_with_invalid_date_returns_422_naming_date | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-012 | test_ac012_create_with_missing_date_returns_422_naming_date | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-012 | test_ac012_create_with_non_numeric_amount_returns_422_naming_amount | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-012 | test_ac012_create_with_non_positive_amount_returns_422_naming_amount | Integration | Passed | `backend/tests/integration/test_expenses.py` |
| AC-011 | [AC-011] a signed-in user adds an expense with amount, date, an existing category and a note, and it appears at the top of the list with those values | E2E | Passed | `frontend/e2e/expenses-recording.spec.ts` |
| AC-012 | [AC-012] a non-positive amount shows a validation message and creates no expense | E2E | Passed | `frontend/e2e/expenses-recording.spec.ts` |
| AC-012 | [AC-012] an empty amount shows a validation message and creates no expense | E2E | Passed | `frontend/e2e/expenses-recording.spec.ts` |
| AC-012 | [AC-012] an empty date shows a validation message and creates no expense | E2E | Passed | `frontend/e2e/expenses-recording.spec.ts` |
| AC-012 | [AC-012] no category selected shows a validation message and creates no expense | E2E | Passed | `frontend/e2e/expenses-recording.spec.ts` |
| AC-013 | [AC-013] the add-expense dialog has no recurring-schedule, receipt-attachment or currency control | E2E | Passed | `frontend/e2e/expenses-recording.spec.ts` |
| AC-014 | [AC-014] a freshly signed-in user with no expenses sees the empty-state prompt to add a first expense, with no broken or empty widget | E2E | Passed | `frontend/e2e/expenses-recording.spec.ts` |
| AC-015 | [AC-015] expenses created by one user are not visible to a second signed-in user | E2E | Passed | `frontend/e2e/expenses-recording.spec.ts` |

### US-012: Delete a category

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-036 | Categories > [AC-036] a 409 on confirmed delete warns that the category still has expenses and keeps it in the list | Unit | Passed | `frontend/src/screens/Categories.test.tsx` |
| AC-036 | Categories > [AC-036] cancelling a delete sends no request and keeps the category | Unit | Passed | `frontend/src/screens/Categories.test.tsx` |
| AC-036 | Categories > [AC-036] confirming delete calls DELETE /categories/{id}, removes it from the list and shows success | Unit | Passed | `frontend/src/screens/Categories.test.tsx` |
| AC-019 | test_ac019_delete_with_no_expenses_assigned_returns_204_and_removes_the_row | Integration | Passed | `backend/tests/integration/test_categories.py` |
| AC-020 | test_ac020_delete_with_expenses_assigned_returns_409_and_changes_nothing | Integration | Passed | `backend/tests/integration/test_categories.py` |
| AC-021 | test_ac021_delete_with_multiple_expenses_names_the_count | Integration | Passed | `backend/tests/integration/test_categories.py` |
| AC-022 | test_ac022_blocked_delete_never_sets_expense_category_id_to_null | Integration | Passed | `backend/tests/integration/test_categories.py` |
| AC-023 | test_ac023_patch_rename_reflects_in_expense_category_name | Integration | Passed | `backend/tests/integration/test_categories.py` |
| AC-019 | [AC-019] a blank category name shows a validation message and creates nothing | E2E | Passed | `frontend/e2e/categories-guarded-delete.spec.ts` |
| AC-019 | [AC-019] a duplicate category name shows a validation message and creates a second nothing | E2E | Passed | `frontend/e2e/categories-guarded-delete.spec.ts` |
| AC-019 | [AC-019] creating a category with a unique non-blank name shows it in the list and in the expense form's category select | E2E | Passed | `frontend/e2e/categories-guarded-delete.spec.ts` |
| AC-019 | [AC-019] deleting a category with no expenses, after confirming, removes it from the list | E2E | Passed | `frontend/e2e/categories-guarded-delete.spec.ts` |
| AC-019 | [AC-019] one user's categories are never visible to a second signed-in user | E2E | Passed | `frontend/e2e/categories-guarded-delete.spec.ts` |
| AC-020 | [AC-020] deleting a category that has an expense assigned shows the warning explaining how to proceed, and the category and the expense both remain | E2E | Passed | `frontend/e2e/categories-guarded-delete.spec.ts` |
| AC-023 | [AC-023] renaming a category to a valid unique name updates the list and the category name shown on an assigned expense | E2E | Passed | `frontend/e2e/categories-guarded-delete.spec.ts` |

## Project setup

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| — | test_ac_migration_race_already_exists_falls_back_to_stamp | Unit | Passed | `backend/tests/unit/test_migration_race.py` |
| — | test_ac_migration_race_other_operational_error_still_raises | Unit | Passed | `backend/tests/unit/test_migration_race.py` |
| — | test_hash_password_is_not_the_plaintext | Unit | Passed | `backend/tests/unit/test_security.py` |
| — | test_verify_password_round_trips | Unit | Passed | `backend/tests/unit/test_security.py` |
| — | test_category_is_scoped_to_its_user | Unit | Passed | `backend/tests/unit/test_zzz_diag.py` |
| — | test_category_name_is_unique_per_user | Unit | Passed | `backend/tests/unit/test_zzz_diag.py` |
| — | test_expense_links_user_and_category_with_exact_amount | Unit | Passed | `backend/tests/unit/test_zzz_diag.py` |
| — | test_health_reports_ok | Integration | Passed | `backend/tests/integration/test_health.py` |
| — | test_the_openapi_document_builds | Integration | Passed | `backend/tests/integration/test_health.py` |
| — | the app loads | E2E | Passed | `frontend/e2e/example.spec.ts` |
<!-- sdlc:auto:end tests -->
