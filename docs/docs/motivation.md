---
sidebar_position: 3
---

# 💡 Why zustand-context?

## The Problem: Global vs. Local State

When building React applications, you often face this challenging question:

> **"Should I use global state management or React Context for this component?"**

This is especially relevant when you need multiple instances of the same component type, each with their own isolated state.

## Current Solutions and Their Limitations

### 🌍 Global State (Zustand)

Zustand offers an elegant and powerful global state management solution:

- ✅ Simple, hook-based API
- ✅ Efficient updates with selectors
- ✅ Rich middleware ecosystem
- ❌ **Only one global instance per store**
- ❌ No component-scoped isolation

### 🔄 React Context

React's Context API provides component-scoped state:

- ✅ Component-scoped state
- ✅ Multiple instances possible
- ✅ Hierarchical state passing
- ❌ No built-in state management features
- ❌ Often causes unnecessary re-renders
- ❌ Verbose boilerplate code

## The Solution: zustand-context

**@mag1yar/zustand-context** bridges this gap by combining the best of both worlds:

```
Zustand's elegant API + React Context's component boundaries = 💪 zustand-context
```

## Key Benefits

### 1. 🧩 Component-Scoped State with Zustand's API

Define your state once and create as many independent instances as needed:

- Isolated state for each component tree
- Familiar Zustand patterns and selectors
- No global state conflicts

### 2. 🔗 Access to Specific Instances

The `from()` method provides a clean way to access specific store instances:

- Reference any named instance in the provider hierarchy
- Create relationships between different context instances
- Maintain isolation with explicit access patterns

### 3. 🌲 Hierarchical State Management

Nested providers can inherit and override parent state:

- Progressive refinement of state down the component tree
- Parent-child state relationships
- Hierarchical defaults with specific overrides

### 4. 🚀 Optional Provider Mode

For maximum flexibility, stores can work with or without a Provider:

- Use `strict: false` and `defaultState` for provider-optional components
- Graceful fallbacks when a provider doesn't exist
- Ideal for component libraries and optional features

## Comparison at a Glance

| Feature                      | React Context | Zustand | zustand-context |
| ---------------------------- | ------------- | ------- | --------------- |
| Component-scoped state       | ✅            | ❌      | ✅              |
| Efficient re-renders         | ❌            | ✅      | ✅              |
| Multiple instances           | ✅            | ❌      | ✅              |
| Selector-based subscriptions | ❌            | ✅      | ✅              |
| Access to specific instances | ❌            | N/A     | ✅              |
| Middleware support           | ❌            | ✅      | ✅              |
| Provider-optional mode       | ❌            | N/A     | ✅              |

## Perfect Use Cases

- **UI Component Libraries** - Create compound component systems with shared state
- **Multiple Instances** - Data grids, forms, modals, or other components that appear multiple times
- **Hierarchical Applications** - Apps with nested state requirements
- **Optional Features** - Components that can work with or without context providers

## Next Steps

Ready to see zustand-context in action? Continue to:

- [Store with Context](../docs/core-concepts/store-with-context) - Understand the core concept
<!-- - [Basic Usage Patterns](../docs/guides/basic-usage) - Practical examples -->
<!-- - [Provider Configuration](../docs/guides/provider-configuration) - Learn about provider options -->
