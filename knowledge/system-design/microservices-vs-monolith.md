---
source: "system-design-microservices-vs-monolith.md"
topic: "System Design"
difficulty: "hard"
role: "backend,fullstack"
technology: "System Design"
title: "System Design: Monoliths vs Microservices Architecture"
---

# System Design: Monoliths vs Microservices Architecture

Architectural choices between monolithic and distributed microservices involve trade-offs in development velocity, operational complexity, and organizational structure (Conway’s Law).

## Monolithic Architecture
- **Characteristics**: Single unified codebase, shared database, in-process function calls.
- **Strengths**: Simple local development, easy cross-entity transactions (ACID), zero network latency between components, straightforward deployment.
- **Weaknesses**: Difficult to scale independent modules, single point of failure (a crash in one module can take down entire service), high build/test times at scale.

## Microservices Architecture
- **Characteristics**: Small, autonomously deployable services bounded by business domain (Domain-Driven Design). Communicate over network protocols (HTTP/REST, gRPC, Kafka).
- **Strengths**: Independent scaling, polyglot technology choices per service, fault isolation, independent team ownership.
- **Weaknesses**: Network latency and partial network failures, distributed transaction complexity (Saga pattern, 2PC), distributed tracing/observability overhead (OpenTelemetry), eventual consistency challenges (CAP Theorem).

## Communication Styles
- **Synchronous**: REST over HTTP, gRPC over HTTP/2. Good for real-time query responses.
- **Asynchronous**: Message brokers (RabbitMQ, Apache Kafka). Decouples producer from consumer, offers buffer smoothing during spikes.
