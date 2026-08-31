---
source: "react-hooks-and-lifecycle.md"
topic: "React"
difficulty: "medium"
role: "frontend,fullstack"
technology: "React"
title: "React Hooks, Component Lifecycle, and Rules of Hooks"
---

# React Hooks, Component Lifecycle, and Rules of Hooks

React Hooks enable functional components to maintain local state, run side effects, and access React contexts without writing class components.

## Core Hooks

1. **`useState`**: Declares state variable with setter function. State updates trigger re-rendering and are batched.
2. **`useEffect`**: Synchronizes component with external systems.
   - No dependency array: runs on every render.
   - Empty array `[]`: runs once after initial mount.
   - Array `[dep1, dep2]`: runs when specified dependencies change.
   - Cleanup function: executes before component unmounts or before re-running effect on dependency change.
3. **`useCallback`**: Memoizes function definitions between re-renders to prevent unnecessary child re-renders.
4. **`useMemo`**: Memoizes the result of an expensive calculation.
5. **`useRef`**: Holds mutable values across renders without triggering a re-render; also used for direct DOM access.

## Rules of Hooks
1. Only call hooks at the **top level** (never inside loops, conditions, or nested functions).
2. Only call hooks from **React functional components** or **custom hooks**.

## Key Concepts for Interviews
- Hook call order and how React uses linked lists internally to associate state with fiber nodes.
- Stale closures in `useEffect` and `useCallback` when dependencies are omitted.
- Avoiding excessive memoization (`useMemo`/`useCallback` have overhead).
