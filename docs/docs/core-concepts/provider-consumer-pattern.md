---
sidebar_position: 2
---

# 🔄 Provider/Consumer Pattern

## Understanding the Pattern

The Provider/Consumer pattern is a fundamental concept in zustand-context that controls how state flows through your application.

In this pattern:

1. **Provider** - Creates and supplies a store instance to its children
2. **Consumers** - Components that use the store via the hook

## The Provider

The Provider component in zustand-context has several responsibilities:

1. **Creating a Store Instance** - Instantiates a new store based on your definition
2. **Establishing a Context Boundary** - Defines which components can access this instance
3. **Setting Initial State** - Configures the starting state for this instance
4. **Managing Instance Identity** - Assigns an optional ID for reference

Basic Provider usage:

```tsx
<useStore.Provider
  initialState={
    {
      /* initial values */
    }
  }
  instanceId="unique-id" // optional
  mergeStrategy="shallow" // optional
>
  {/* components that will consume this store */}
</useStore.Provider>
```

## The Consumer

Consumers are components that use the store through the hook:

```tsx
function Counter() {
  // This is a consumer
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

The important characteristic of consumers:

- They automatically connect to the nearest Provider in the component tree
- They re-render only when their selected state changes
- They can use selectors for efficient state access

## Provider/Consumer Relationship

The relationship between Providers and Consumers follows these rules:

1. **Nearest Provider Rule** - A consumer connects to the closest Provider up the component tree
2. **Isolation Principle** - Different Provider instances maintain separate state
3. **Hierarchical Access** - Consumers can access parent Providers with `from()`

## Data Flow

Data flow in the Provider/Consumer pattern is:

1. **Unidirectional** - Data flows from the store to components
2. **Selective** - Components only receive the data they select
3. **Efficient** - Re-renders happen only when selected data changes

This creates a predictable and performant state management pattern:

```
State Update → Store → Selective Component Re-render
```

## Multiple Providers

One of the most powerful aspects of this pattern is the ability to have multiple Providers:

```tsx
<useStore.Provider instanceId="instance1">
  <ComponentA /> {/* uses instance1 */}
</useStore.Provider>

<useStore.Provider instanceId="instance2">
  <ComponentB /> {/* uses instance2 */}
</useStore.Provider>
```

Each Provider/Consumer group forms an isolated "island" of state, preventing state changes in one island from affecting others.

## Nested Providers

When Providers are nested:

```tsx
<useStore.Provider instanceId="parent">
  <ComponentA /> {/* uses parent */}
  <useStore.Provider instanceId="child">
    <ComponentB /> {/* uses child */}
  </useStore.Provider>
</useStore.Provider>
```

The relationship follows these principles:

1. **State Inheritance** - Child Providers start with parent's state
2. **Override Capability** - Child Providers can override specific values
3. **Isolation** - Changes in child state don't affect parent state
4. **Access Control** - Child components can access parent state with `from()`

## Provider-Optional Pattern

When a store is configured with `strict: false` and `defaultState`:

```tsx
const useStore = create(
  (set) => ({
    /*...*/
  }),
  {
    name: 'OptionalStore',
    strict: false,
    defaultState: {
      /*...*/
    },
  },
);
```

This creates a variation of the pattern:

1. **Optional Provider** - The Provider becomes optional
2. **Default State Fallback** - Consumers use defaultState when no Provider exists
3. **Graceful Degradation** - Components work even without a Provider

This is particularly useful for component libraries and optional features.

## Best Practices

For effective use of the Provider/Consumer pattern:

1. **Define Clear Boundaries** - Use Providers to create logical state boundaries
2. **Keep State Close** - Place Providers as close as possible to their consumers
3. **Use Selectors** - Select only the data you need to minimize re-renders
4. **Explicit Instance Access** - Use `.from()` when accessing non-local instances
5. **Document Relationships** - Make Provider/Consumer relationships clear in your code

## Next Steps

Now that you understand the Provider/Consumer pattern, let's explore:

- [Store Instances](./store-instances) - Deeper understanding of instance management
<!-- - [Basic Usage](../guides/basic-usage) - Practical examples and patterns -->
<!-- - [Provider Configuration](../guides/provider-configuration) - Advanced Provider options -->
