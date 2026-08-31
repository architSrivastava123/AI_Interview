---
source: "react-reconciliation-virtual-dom.md"
topic: "React"
difficulty: "hard"
role: "frontend,fullstack"
technology: "React"
title: "React Reconciliation, Virtual DOM, and Fiber Architecture"
---

# React Reconciliation, Virtual DOM, and Fiber Architecture

Reconciliation is the algorithm React uses to diff one tree of elements with another to determine which parts need to be changed in the actual DOM.

## Core Concepts

1. **Virtual DOM**: Lightweight in-memory representation of real DOM elements created by React element objects (`JSX` -> `React.createElement`).
2. **Diffing Heuristics**:
   - Two elements of different types produce different trees (old tree unmounted, new tree mounted).
   - Component state is preserved when elements share the same type across renders.
   - Keys: Stable, unique identifiers that allow React to match children across renders during list reordering.
3. **React Fiber Architecture**:
   - Introduced in React 16 to enable incremental rendering.
   - Divides rendering work into small units (Fibers) and yields back to the browser event loop.
   - Two phases:
     - **Render Phase (Asynchronous)**: Builds the work-in-progress fiber tree, can be paused/aborted. Pure, no side-effects.
     - **Commit Phase (Synchronous)**: Applies mutations to real DOM and runs layout/effect hooks.

## Key Interview Discussion Points
- Why index as key is dangerous when inserting or reordering items (causes state mismatch and unintended inputs state retention).
- `React.memo` and shallow prop comparison.
- Batching updates in React 18 (automatic batching across promises, timeouts, and native event handlers).
