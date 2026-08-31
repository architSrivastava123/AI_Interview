---
source: "node-event-driven-architecture.md"
topic: "Node.js"
difficulty: "medium"
role: "backend,fullstack"
technology: "Node.js"
title: "Node.js Event-Driven Architecture and EventEmitter"
---

# Node.js Event-Driven Architecture and EventEmitter

Node.js is built around the Observer pattern and the `EventEmitter` class, providing a foundation for asynchronous streaming, network sockets, and HTTP servers.

## Core Mechanics
- The `events` module exports `EventEmitter`.
- Objects that emit events are instances of `EventEmitter` (e.g., `http.Server`, `fs.ReadStream`, `net.Socket`).
- Methods: `on(event, listener)`, `once(event, listener)`, `emit(event, ...args)`, `removeListener(event, listener)`.

## Error Handling Pattern
- Emitting an `'error'` event with no registered listeners throws an unhandled exception and crashes the Node.js process.
- Best practice: Always register an `.on('error', errHandler)` listener on event emitters.

## Memory Leak Prevention
- `EventEmitter` defaults to a max listener warning limit of 10 (`setMaxListeners(n)`).
- Dangling listeners prevent objects from being garbage collected. Always clean up listeners on connection close or teardown.
