---
source: "mongodb-schema-design-relations.md"
topic: "MongoDB"
difficulty: "medium"
role: "backend,fullstack"
technology: "MongoDB"
title: "MongoDB Document Schema Design: Embedding vs Referencing"
---

# MongoDB Document Schema Design: Embedding vs Referencing

Data in MongoDB has a flexible schema, but modeling relationships correctly determines application performance, concurrency, and document size limits (16MB BSON limit).

## Embedding (Denormalization)
- **When to Embed**:
  - "Contains" relationships (e.g., question parts, small sub-documents).
  - One-to-Few relationships where child items do not grow unbounded (e.g., 5 answers per interview).
  - Data that is queried and updated together atomically.
- **Pros**: Single-query reads without `$lookup` joins, atomic document updates.
- **Cons**: Document growth overhead, data duplication across collections.

## Referencing (Normalization)
- **When to Reference**:
  - One-to-Many or One-to-Squillions relationships (e.g., millions of log entries or user submissions).
  - Many-to-Many relationships.
  - Entities that are updated independently and queried in different application contexts.
- **Pros**: Small document sizes, decoupled schema updates, no duplicate data anomalies.
- **Cons**: Requires multiple round-trip queries or `$lookup` aggregation joins.

## Modeling Patterns for Interview Platforms
- `Interview` model references `User` via `clerkUserId`.
- `Question` and `Answer` can be embedded or referenced based on reporting requirements.
- `Report` aggregates session outcomes into a single read-optimized document for fast dashboard loading.
