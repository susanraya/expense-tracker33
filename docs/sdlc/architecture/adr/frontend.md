<!-- sdlc:auto:start adr -->
# ADR-0001: Use React 19 for Frontend

Status: Accepted  
Date: 2026-11-18

## Context and Problem Statement

Which Frontend technology does the project use? Decided in architecture v1.

## Considered Options

- React 19
- Vue
- Svelte

## Decision Outcome

Chosen option: React 19, because Approved stack. Built as a Vite SPA served from its own origin; it stores the opaque session token and renders interactive reports and charts that redraw live as the date-range filter changes, feeling instant on desktop and mobile.

## Consequences

A SPA needs a charting library and client-side routing added as packages; responsive layout work is on the team, but it keeps the dashboard redraws smooth without a native app.
<!-- sdlc:auto:end adr -->