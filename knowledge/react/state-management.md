---
source: "react-state-management.md"
topic: "React"
difficulty: "hard"
role: "frontend,fullstack"
technology: "React"
title: "React State Management: Local, Context, and Global Patterns"
---

# React State Management: Local, Context, and Global Patterns

State management in React revolves around choosing the appropriate scope for application data: local component state, lifted state, context-based state, or global state.

## State Taxonomy
1. **Local State**: State used exclusively by a single component (managed with `useState` or `useReducer`).
2. **Lifted State**: Shared state between sibling components, lifted to their closest common ancestor.
3. **Context State**: Avoids prop drilling across deeply nested trees using `createContext` and `useContext`. Note: Context changes trigger re-renders for all subscribing consumers.
4. **Server Cache State**: Remote data synchronization, caching, deduping, and background invalidation (TanStack Query / SWR).
5. **Global Client State**: Complex client-side state across distant components (Zustand, Redux Toolkit).

## Context Performance Optimization
- Split contexts by domain (e.g., separate `UserAuthContext` and `ThemeContext`).
- Separate state values from updater functions into distinct contexts.
- Memoize context provider values with `useMemo`.

## Trade-offs
- Overusing global state for local form inputs causes unnecessary re-renders.
- Overusing Context for high-frequency updates (e.g., animations or mouse coordinates) degrades rendering performance.
