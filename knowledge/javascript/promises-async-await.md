---
source: "javascript-promises-async-await.md"
topic: "JavaScript"
difficulty: "medium"
role: "frontend,backend,fullstack"
technology: "JavaScript"
title: "Asynchronous JavaScript: Promises, Async/Await, and Error Handling"
---

# Asynchronous JavaScript: Promises, Async/Await, and Error Handling

Promises and `async/await` syntax provide structured abstractions over callback-based asynchronous flows, avoiding callback hell and unifying error propagation.

## Promise States & Transitions
- `pending`: Initial state, neither fulfilled nor rejected.
- `fulfilled`: Completed successfully (`resolve(value)`). State is immutable.
- `rejected`: Operation failed (`reject(error)`). State is immutable.

## Promise Combinators
- `Promise.all([p1, p2])`: Fulfills when all succeed; rejects immediately upon the first rejection (fail-fast).
- `Promise.allSettled([p1, p2])`: Waits for all promises to settle regardless of outcome; returns `{status: 'fulfilled', value}` or `{status: 'rejected', reason}`.
- `Promise.race([p1, p2])`: Settles with the result of the fastest settled promise.
- `Promise.any([p1, p2])`: Fulfills with the first fulfilled promise; rejects with `AggregateError` only if all reject.

## Async/Await Mechanics
- `async` functions always return a Promise.
- `await` pauses execution of the `async` function until the promise settles, yielding control back to the event loop.
- Error handling uses synchronous `try/catch/finally` blocks around `await` expressions.
