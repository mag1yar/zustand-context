---
slug: /
sidebar_position: 1
---

# Introduction to zustand-context

**zustand-context** is a lightweight extension for [Zustand](https://github.com/pmndrs/zustand) that adds React Context capabilities while keeping Zustand's elegant API.

## What is zustand-context?

While Zustand excels at global state management, **zustand-context** enhances it with component-scoped state management. It allows you to:

- Create multiple instances of the same store in different component trees
- Access store data through familiar Zustand patterns
- Maintain contextual boundaries for your application state
- Build hierarchical state relationships with parent-child inheritance

## Core Features

### Multiple Store Instances

Unlike traditional Zustand stores that exist as global singletons, zustand-context stores can have multiple independent instances:

- Each instance has its own isolated state
- Instances are tied to specific parts of your component tree
- Changes in one instance don't affect others

### Hierarchical State

When you nest providers, they form a hierarchy:

- Child providers inherit state from their parents
- Child providers can override specific values
- Components can access parent providers when needed

### Named Instances

Every store instance can have an identifier:

- Reference specific instances from anywhere within the provider tree
- Create relationships between different parts of your application
- Explicitly control which instance you're working with

### Familiar Zustand API

If you know Zustand, you already know most of zustand-context:

- Same selector-based subscriptions for efficient renders
- Same immutable state updates with `set` and `get`
- Compatible with Zustand middleware (persist, immer, etc.)
