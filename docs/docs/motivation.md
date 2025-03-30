---
sidebar_position: 2
---

# Motivation

## The Problem

State management in React applications can be challenging, especially when you need to:

1. **Share state across components** that aren't directly related in the component tree
2. **Initialize state dynamically** based on props or external data
3. **Balance global vs. local state** needs
4. **Maintain type safety** throughout your application
5. **Support multiple instances** of the same component with isolated state

The React Context API solves some of these problems but can lead to performance issues due to re-renders. Zustand provides a great solution for global state management but doesn't have built-in support for context-aware, locally scoped state.

## Why zustand-context?

zustand-context bridges this gap by combining the best of both worlds:

### 🔄 Zustand's Simplicity and Performance

- **Minimal API** - Simple hooks-based API just like Zustand
- **Selective re-renders** - Only components that use the selected state are re-rendered
- **Middleware support** - Compatible with all Zustand middleware (persist, immer, devtools, etc.)

### 🌟 React Context's Flexibility

- **Component-scoped state** - Create isolated state for specific component trees
- **Dynamic initialization** - Initialize state based on props or external data
- **Provider nesting** - Support for nested providers with proper state isolation
- **Type safety** - Full TypeScript support throughout

## When to Use zustand-context

zustand-context is particularly useful when:

- You need **multiple instances** of the same component with isolated state
- You're building a **component library** with encapsulated state management
- You want to **initialize state dynamically** based on props or server data
- You need to **scope state to a specific part** of your application
- You're looking for a **Zustand-like API** with context support

## Benefits Over Alternatives

Compared to other solutions:

| Feature                | React Context                     | Zustand                      | zustand-context                            |
| ---------------------- | --------------------------------- | ---------------------------- | ------------------------------------------ |
| Performance            | ❌ Re-renders all consumers       | ✅ Selective re-renders      | ✅ Selective re-renders                    |
| API Simplicity         | ❌ Requires providers & consumers | ✅ Simple hooks API          | ✅ Simple hooks API                        |
| Multiple Instances     | ✅ Supported                      | ❌ Global by default         | ✅ Supported                               |
| Middleware             | ❌ Not supported                  | ✅ Rich middleware ecosystem | ✅ Compatible with Zustand middleware      |
| TypeScript Support     | ✅ Basic support                  | ✅ Good support              | ✅ Enhanced support with DeepPartial types |
| Dynamic Initialization | ✅ Supported                      | ❌ Limited                   | ✅ Rich initialization options             |

## Real-World Use Cases

zustand-context excels in scenarios like:

- **Multi-tenant applications** where each tenant needs isolated state
- **Form libraries** that need isolated state for each form instance
- **Data grids** with independent sorting, filtering, and pagination state
- **Wizard/multi-step components** with complex state transitions
- **Dashboard widgets** that need isolated yet shareable state

In the next sections, we'll dive into how to use zustand-context effectively in your applications.
