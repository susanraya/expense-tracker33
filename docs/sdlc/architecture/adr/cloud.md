<!-- sdlc:auto:start adr -->
# ADR-0004: Use AWS for Cloud

Status: Accepted  
Date: 2026-11-18

## Context and Problem Statement

Which Cloud technology does the project use? Decided in architecture v1.

## Considered Options

- AWS
- Google Cloud
- Azure

## Decision Outcome

Chosen option: AWS, because Approved stack. RDS for PostgreSQL gives managed backups and encryption for private finance data, and the API runs as a container alongside an S3/CloudFront-hosted SPA on a separate origin.

## Consequences

More setup than a single PaaS, but keeps a free personal-finance app cheap to run and scalable without re-platforming.
<!-- sdlc:auto:end adr -->