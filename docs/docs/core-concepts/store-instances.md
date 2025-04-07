---
sidebar_position: 3
---

# 🧩 Store Instances

## Understanding Store Instances

In zustand-context, a **store instance** is a unique copy of your store tied to a specific Provider in your component tree.

Unlike traditional Zustand where one store definition creates one global instance, zustand-context allows:

```
1 Store Definition → Multiple Store Instances
```

## Instance Creation

A store instance is created whenever you use a Provider component:

```tsx
<useStore.Provider>
  {/* Creates a new store instance */}
</useStore.Provider>

<useStore.Provider>
  {/* Creates another independent instance */}
</useStore.Provider>
```

Each instance:

- Has its own isolated state
- Manages its own subscriptions
- Updates independently of other instances

## Instance Identity

For better organization and explicit access, instances can have identifiers:

```tsx
<useStore.Provider instanceId="header">
  {/* Named instance: "header" */}
</useStore.Provider>

<useStore.Provider instanceId="sidebar">
  {/* Named instance: "sidebar" */}
</useStore.Provider>
```

There are two types of identifiers:

1. **String IDs** - Human-readable names like `"header"` or `"user-form"`
2. **Symbol IDs** - Unique JavaScript Symbols for guaranteed uniqueness

If no `instanceId` is provided, a default ID is used (configurable in store options).

## Default Instance

Every store has a concept of a "default instance":

```tsx
const useStore = create(
  (set) => ({
    /* state and actions */
  }),
  {
    name: 'MyStore',
    defaultInstanceId: 'main-instance', // Custom default ID
  },
);
```

The default instance is:

- The instance that direct hook calls connect to (without using `from()`)
- Identified by `defaultInstanceId` if specified
- Identified by an internal Symbol if not specified

## Instance Isolation

The primary benefit of store instances is isolation:

```tsx
<useCounterStore.Provider initialState={{ count: 1 }}>
  <CounterA /> {/* count is 1 */}
</useCounterStore.Provider>

<useCounterStore.Provider initialState={{ count: 100 }}>
  <CounterB /> {/* count is 100 */}
</useCounterStore.Provider>
```

Changes to one instance don't affect others, which enables:

- Multiple copies of the same component with separate state
- Isolated feature areas that don't interfere with each other
- Testing components with specific state configurations

## Accessing Store Instances

There are two main ways to access store instances:

### 1. Implicit Access (Nearest Provider)

```tsx
function Counter() {
  // Automatically connects to nearest Provider up the tree
  const count = useCounterStore((state) => state.count);
  return <div>{count}</div>;
}
```

This follows React's standard Context behavior - connecting to the nearest Provider up the component tree.

### 2. Explicit Access (with `from()`)

```tsx
function CounterDisplay() {
  // Explicitly connects to a specific named instance
  const headerCount = useCounterStore.from('header')((state) => state.count);
  const sidebarCount = useCounterStore.from('sidebar')((state) => state.count);

  return (
    <div>
      <p>Header: {headerCount}</p>
      <p>Sidebar: {sidebarCount}</p>
    </div>
  );
}
```

The `from()` method allows accessing any named instance available in the component's Provider hierarchy.

## Instance Hierarchy

When Providers are nested, they form a hierarchy:

```tsx
<useStore.Provider instanceId="app">
  {/* app-level state */}

  <useStore.Provider instanceId="section">
    {/* section-level state, inherits from app */}
  </useStore.Provider>
</useStore.Provider>
```

In this hierarchy:

1. Child instances inherit state from parent instances
2. Child instances can override specific values from parent
3. Changes in child instances don't affect parent instances
4. Components in child Provider can access parent with `from('app')`

## Provider-Optional Instances

When a store is configured as provider-optional:

```tsx
const useStore = create(
  (set) => ({
    /* state and actions */
  }),
  {
    name: 'OptionalStore',
    strict: false,
    defaultState: {
      /* initial values */
    },
  },
);
```

It creates a special case:

1. A default instance exists even without a Provider
2. This instance uses the `defaultState` values
3. Components can use the store without being wrapped in a Provider

This is particularly useful for:

- Component libraries that need to work with or without context
- Graceful degradation when a Provider is missing
- Testing components in isolation

## Practical Instance Management

For effective instance management:

1. **Use Descriptive IDs** - Choose meaningful instanceId values
2. **Document Instance Relationships** - Make it clear which instances depend on others
3. **Prefer Nearest Provider** - Use direct access by default and `from()` only when needed
4. **Consider Instance Scope** - Match instance lifetime to state lifetime
5. **Use Provider-Optional** - For components that should work in multiple contexts

<!-- ## Next Steps -->

<!-- Now that you understand store instances, explore practical application in: -->

<!-- - [Basic Usage](../guides/basic-usage) - Fundamental patterns -->
<!-- - [Multiple Contexts](../guides/multiple-contexts) - Working with multiple instances -->
<!-- - [Provider Configuration](../guides/provider-configuration) - Advanced Provider options -->
