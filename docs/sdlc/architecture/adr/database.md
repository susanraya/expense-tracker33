<!-- sdlc:auto:start adr -->
# ADR-0003: Use PostgreSQL 16 for Database

Status: Accepted  
Date: 2026-11-18

## Context and Problem Statement

Which Database technology does the project use? Decided in architecture v1.

## Considered Options

- PostgreSQL 16
- MySQL
- SQLite

## Decision Outcome

Chosen option: PostgreSQL 16, because Approved stack. numeric(12,2) keeps amounts exact to the cent, and SQL grouping over a date range efficiently produces the over-time and by-category report figures per user; a unique (user_id, name) constraint enforces category uniqueness.

## Consequences

Needs a managed instance (RDS) rather than an embedded file, but gives backups, concurrency and room to grow.
<!-- sdlc:auto:end adr -->