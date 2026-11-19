# Testing

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### TEST-RUN-CHECKS · draft · source: testing:run_checks

Overall checks run failed: 7 of 8 checks passed.

run_checks (ticket=None): status=failed, detail=7/8 checks passed. Not tied to a specific ticket.

**Related:** DEV-US-FIX-1

### TEST-WRITE-7749 · approved · source: testing:7749bd98-8136-4b6a-ac81-fd56d4b92cc0

Test-writing task succeeded: 2 test files added.

write_tests (ticket=7749bd98-8136-4b6a-ac81-fd56d4b92cc0): status=succeeded, detail=2 test file(s).

### TEST-WRITE-27BF · approved · source: testing:27bfcedc-96d7-4a79-b168-2d43903ff27c

Pure-API Playwright suite added proving unauthenticated access is rejected and leaves data unchanged, covering AC-037/NFR-005.

Added frontend/e2e/api-contract-unauthenticated.spec.ts, a pure-API Playwright suite proving AC-037/NFR-005 against the real booted backend: every /categories and /expenses endpoint (GET/POST/PATCH/DELETE) returns 401 with no token, a garbage token, and a revoked token; dedicated tests confirm an unauthenticated create/rename/delete attempt on a real category and expense leaves both completely unchanged when read back through the owner's own valid session.

**Related:** NFR-005, US-004

### TEST-WRITE-5D48 · approved · source: testing:5d4839af-6cee-4316-a5a9-e9b310ef92d4

AC-038 (no-payment flow) coverage confirmed already in place end-to-end; a genuine locator bug found and fixed in the Playwright 'full journey' test.

AC-038 was already covered end-to-end by pre-existing tests (backend/tests/integration/test_no_payment_flow.py, frontend/src/screens/NoPayment.test.tsx, frontend/e2e/no-payment.spec.ts) spanning the API contract, the signed-in component tree and the full browser journey. Running the Playwright spec for real surfaced a genuine locator bug in its 'full journey' test (an unscoped getByLabel(/category/i) matched both the filter select and the add-expense dialog select, and the dialog wasn't given a date), which made that test fail outside the no-op 'list specs' check; it was fixed to scope every field selector (detail truncated in source input).

**Related:** US-021
<!-- sdlc:auto:end narrative -->
