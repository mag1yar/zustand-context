---
sidebar_position: 1
---

# 🧠 Store with Context

## The Core Concept

At the heart of zustand-context is a simple but powerful idea: **a store that's aware of its context**.

While a traditional Zustand store exists as a single global instance, a zustand-context store can exist as multiple instances, each tied to a specific React component tree through Context.

## How It Works

A zustand-context store has two key components:

1. **The Store Definition** - Similar to Zustand, defines state and actions
2. **The Context Provider** - Creates isolated instances of the store

When you create a store with zustand-context:

```tsx
const useCounterStore = create(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  }),
  { name: 'Counter' },
);
```

You get back a hook function that:

- Works like a normal Zustand hook when used directly
- Has a `.Provider` component for creating context boundaries
- Contains a `.from()` method for accessing specific instances

## The Context Boundary

When you wrap components with the Provider:

```tsx
<useCounterStore.Provider initialState={{ count: 10 }}>
  <ChildComponents />
</useCounterStore.Provider>
```

You establish a "context boundary" where:

1. All components inside this boundary access the same store instance
2. This instance is isolated from other instances of the same store
3. Components can use `useCounterStore()` to access this specific instance

## Instance Identification

Each store instance can have an optional identifier:

```tsx
<useCounterStore.Provider instanceId="section1" initialState={{ count: 5 }}>
  <ChildComponents />
</useCounterStore.Provider>
```

This identifier allows:

- Referring to specific instances using `useCounterStore.from('section1')`
- Creating relationships between different parts of your component tree
- Explicitly managing which instance you're interacting with

## Store Hierarchy

When you nest Providers:

```tsx
<useCounterStore.Provider instanceId="parent" initialState={{ count: 10 }}>
  <ParentComponents />

  <useCounterStore.Provider instanceId="child" initialState={{ count: 5 }}>
    <ChildComponents />
  </useCounterStore.Provider>
</useCounterStore.Provider>
```

The nested instances form a hierarchy where:

1. Child providers inherit all parent state by default
2. Child providers can override specific state values
3. Components inside the child boundary get the child instance
4. Components can still access parent instances using `from()`

## Provider-Optional Mode

If configured with `strict: false` and a `defaultState`, a store can function without a Provider:

```tsx
const useOptionalStore = create((set) => ({ value: '', setValue: (value) => set({ value }) }), {
  name: 'OptionalStore',
  strict: false,
  defaultState: { value: 'default' },
});

// Works even without a Provider
function Component() {
  const value = useOptionalStore((state) => state.value);
  // value will be 'default'
}
```

This is useful for:

- Creating libraries where Provider usage is optional
- Providing reasonable defaults for state
- Graceful degradation when a Provider is missing

## Mental Model: Thinking in Context Boundaries

When using zustand-context, it helps to think in terms of "context boundaries" where:

1. **Define Once, Use Many** - Define your store structure once, instantiate it multiple times
2. **Isolation by Default** - Each Provider creates an isolated state container
3. **Explicit References** - Use `from()` to explicitly access other instances
4. **Hierarchical State** - Nested Providers inherit and can override parent state

This mental model helps you design component trees with clear state boundaries while maintaining the ability to communicate between different parts of your application.

## Next Steps

With this foundation, let's explore:

- [Provider/Consumer Pattern](./provider-consumer-pattern) - How data flows through components
- [Store Instances](./store-instances) - Understanding instance isolation and IDs
<!-- - [Basic Usage](../guides/basic-usage) - Practical examples and patterns -->
