<!-- sdlc:auto:start adr -->
# ADR-0002: Use FastAPI 0.115 for Backend

Status: Accepted  
Date: 2026-11-18

## Context and Problem Statement

Which Backend technology does the project use? Decided in architecture v1.

## Considered Options

- FastAPI 0.115
- Django REST Framework
- Flask

## Decision Outcome

Chosen option: FastAPI 0.115, because Approved stack. Its Pydantic request validation keeps amounts, dates and categories clean for financial figures, and dependency-injected session checks make per-user scoping and bearer-token auth straightforward.

## Consequences

Minimal batteries-included tooling means auth/session logic is hand-written, but that keeps the service lean for a small, clear API.
<!-- sdlc:auto:end adr -->