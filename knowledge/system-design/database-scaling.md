---
source: "system-design-database-scaling.md"
topic: "System Design"
difficulty: "expert"
role: "backend,fullstack"
technology: "System Design"
title: "System Design: Database Scaling, Sharding, Replication, and CAP Theorem"
---

# System Design: Database Scaling, Sharding, Replication, and CAP Theorem

Scaling database layers for high read/write throughput requires architectural strategies across vertical scaling, read replication, and horizontal partitioning (sharding).

## Replication (Read Scaling)
- **Primary-Replica (Master-Slave)**: All writes route to the primary; replicas asynchronously replicate write-ahead logs (WAL) to serve read queries.
- **Replication Lag**: Writes on primary may not be immediately visible on replicas (eventual consistency). Handled by reading newly written records from primary for a brief window.

## Sharding (Horizontal Partitioning)
- Splitting data across multiple database instances based on a **Shard Key**.
- **Partitioning Strategies**:
  - **Range-based**: Data partitioned by value ranges (e.g., A-M, N-Z). Risk of hot spots if data distribution is skewed.
  - **Hash-based (Consistent Hashing)**: Hash of shard key modulo number of shards. Distributes load evenly; handles dynamic node addition with minimal key remapping.
  - **Directory-based**: Lookup service maps key ranges to specific shards.
- **Challenges**: Cross-shard joins are expensive and must be avoided; cross-shard distributed transactions require two-phase commit (2PC) or Sagas.

## CAP Theorem & PACELC
- **CAP**: In a network partition (**P**), a distributed system must choose between Consistency (**C**) and Availability (**A**).
- **PACELC**: If there is a Partition (**P**), how does the system choose between Availability (**A**) and Consistency (**C**); Else (**E**), how does it trade off Latency (**L**) and Consistency (**C**)?
