---
source: "javascript-event-loop.md"
topic: "JavaScript"
difficulty: "medium"
role: "frontend,backend,fullstack"
technology: "JavaScript"
title: "JavaScript Event Loop and Concurrency Model"
---

# JavaScript Event Loop and Concurrency Model

JavaScript is a single-threaded runtime with a non-blocking, asynchronous event-driven I/O model. It uses a call stack, event loop, callback queue (Macrotask queue), and microtask queue to coordinate execution.

## Key Components

1. **Call Stack**: LIFO execution stack where function frames are pushed when invoked and popped when returned.
2. **Web APIs / Node.js C++ APIs**: Background threads managing timer callbacks (`setTimeout`, `setInterval`), network requests (`fetch`, `http`), and file operations (`fs`).
3. **Microtask Queue**: High-priority queue for `Promise.then`, `catch`, `finally`, `queueMicrotask`, and `process.nextTick` (Node.js).
4. **Macrotask Queue (Task Queue)**: Lower-priority queue for timers (`setTimeout`, `setInterval`), I/O events, and `setImmediate` (Node.js).

## Execution Order
1. Execute synchronous code on Call Stack until empty.
2. Flush all tasks in the Microtask Queue until empty.
3. Fetch ONE task from the Macrotask Queue and execute it.
4. Render UI updates (browser only) if needed.
5. Repeat loop.

## Expected Concepts in Technical Interviews
- Difference between microtasks (`Promise`) and macrotasks (`setTimeout`).
- Starvation: Infinite microtask loop blocks macrotasks and UI rendering.
- `process.nextTick` vs `setImmediate` in Node.js lifecycle phases (timers, pending callbacks, idle/prepare, poll, check, close callbacks).
