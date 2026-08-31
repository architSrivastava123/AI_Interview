---
source: "system-design-caching-and-cdn.md"
topic: "System Design"
difficulty: "hard"
role: "backend,fullstack"
technology: "System Design"
title: "System Design: Caching Strategies, Invalidation, and CDNs"
---

# System Design: Caching Strategies, Invalidation, and CDNs

Caching reduces latency and offloads database queries by storing frequently accessed data in fast, in-memory key-value stores (e.g., Redis, Memcached).

## Caching Patterns
1. **Cache-Aside (Lazy Loading)**:
   - Application first checks cache. If cache hit, return data.
   - If cache miss, fetch from DB, write to cache with TTL, and return.
   - Resilient against cache failure, but initial requests experience higher latency.
2. **Write-Through**:
   - Application writes to cache, and cache immediately writes synchronously to database.
   - Consistent data, but higher write latency.
3. **Write-Back (Write-Behind)**:
   - Application writes to cache, which acknowledges immediately and asynchronously flushes batches to DB.
   - High write throughput, risk of data loss if cache crashes before flushing.

## Cache Invalidation & Eviction Policies
- "There are only two hard things in Computer Science: cache invalidation and naming things." — Phil Karlton
- **Eviction Policies**:
  - **LRU (Least Recently Used)**: Discards the least recently accessed item.
  - **LFU (Least Frequently Used)**: Discards items with lowest access count.
  - **FIFO (First In First Out)**: Evicts oldest item.
- **Cache Stampede (Thundering Herd)**: When a popular key expires, thousands of concurrent requests hit the DB simultaneously. Mitigated using mutual exclusion locks (mutex) or probabilistic early expiration (XFetch algorithm).

## Content Delivery Networks (CDNs)
- Geographically distributed edge servers caching static and dynamic content closer to end-users (Cloudflare, AWS CloudFront).
- Reduces TTFB (Time to First Byte) and protects origin servers from traffic surges.
