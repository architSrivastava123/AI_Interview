---
source: "javascript-closures-and-scope.md"
topic: "JavaScript"
difficulty: "medium"
role: "frontend,backend,fullstack"
technology: "JavaScript"
title: "JavaScript Closures, Lexical Scope, and Memory Management"
---

# JavaScript Closures, Lexical Scope, and Memory Management

A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment). In JavaScript, closures give an inner function access to an outer function's scope even after the outer function has executed and returned.

## Core Concepts

1. **Lexical Scope**: Scope resolution is determined by where variables and blocks of scope are authored at write-time, not where they are invoked at run-time.
2. **Execution Context**: When a function executes, an execution context is created containing the Variable Environment and Lexical Environment reference to its outer parent context.
3. **Closure Mechanics**: The function retains an internal `[[Scopes]]` reference to parent variables that remain in memory as long as the closure is reachable.

## Common Use Cases
- **Data Encapsulation / Private State**: Emulating private variables before ES private class fields (`#privateField`).
- **Function Factories**: Creating customized specialized functions (e.g., currying, custom loggers).
- **Event Handlers and Callbacks**: Preserving state across asynchronous invocation.
- **Memoization / Caching**: Storing computed results in a private dictionary.

## Interview Traps & Pitfalls
- Closures in loops (classic `var` in `for` loop vs `let` block scoping).
- Memory Leaks: Retaining large unused objects in parent scopes that cannot be garbage collected.
