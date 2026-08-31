---
source: "mongodb-indexing-query-optimization.md"
topic: "MongoDB"
difficulty: "hard"
role: "backend,fullstack"
technology: "MongoDB"
title: "MongoDB Indexing Strategies, Query Optimization, and Aggregation Pipeline"
---

# MongoDB Indexing Strategies, Query Optimization, and Aggregation Pipeline

MongoDB is a document-oriented distributed database. Performance at scale depends heavily on index design, memory working sets, and execution plans.

## Index Types
1. **Single Field Index**: e.g., `{ clerkUserId: 1 }` to accelerate filtering by authenticated user.
2. **Compound Index**: e.g., `{ clerkUserId: 1, createdAt: -1 }` for queries filtering by user and sorting by date.
   - **Equality, Sort, Range (ESR) Rule**: In compound indexes, place equality fields first, then sort fields, then range filter fields.
3. **Multikey Index**: Automatically created when indexing an array field.
4. **Text / Vector Search Index**: Specialized indexes for full-text search or vector similarity embeddings (kNN).
5. **TTL (Time To Live) Index**: Automatically purges documents after an expiration period (sessions, temporary logs).

## Query Optimization & `explain("executionStats")`
- **COLLSCAN**: Full collection scan (no index used). Causes high CPU and disk I/O.
- **IXSCAN**: Index scan. Ideal execution pattern.
- **Covered Query**: The index contains all projected fields, allowing MongoDB to return results without reading underlying documents (`totalDocsExamined: 0`).

## Aggregation Pipeline
- Pipeline stages: `$match`, `$project`, `$group`, `$sort`, `$limit`, `$lookup`, `$unwind`, `$facet`.
- Place `$match` and `$sort` stages at the very beginning of the pipeline so they can leverage index prefix scanning.
