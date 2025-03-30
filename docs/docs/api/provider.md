---
sidebar_position: 2
---

# Provider

The `Provider` component is automatically attached to the store hook created with `create()`. It provides the store to all child components and enables context-aware state management.

## Usage

```tsx
<useStore.Provider>
  <YourComponents />
</useStore.Provider>
```

## Props

The `Provider` component accepts the following props:

```ts
interface ProviderProps<T> {
  // Unique identifier for this context instance
  instanceId?: string | symbol;

  // Initial state to merge with the default state
  initialState?: DeepPartial<T>;

  // Strategy for merging initialState with default state
  mergeStrategy?: 'shallow' | 'deep' | 'replace';

  // Child components
  children: React.ReactNode;
}
```

### instanceId

Unique identifier for this context instance. Used to access this specific context with the `from` method.

```tsx
<useStore.Provider instanceId="user1">
  <UserProfile />
</useStore.Provider>
```

If not provided, the `defaultInstanceId` from the options is used (which defaults to a unique symbol).

### initialState

Initial state to merge with the default state. Can be a partial state object, with only the properties you want to override.

```tsx
<useCounterStore.Provider initialState={{ count: 10 }}>
  <Counter />
</useCounterStore.Provider>
```

### mergeStrategy

Strategy for merging `initialState` with the default state:

- **shallow** (default): Shallow merge only the top-level properties
- **deep**: Deep recursive merge of all nested properties
- **replace**: Completely replace the state with `initialState`

```tsx
<useSettingsStore.Provider initialState={{ theme: { mode: 'dark' } }} mergeStrategy="deep">
  <Settings />
</useSettingsStore.Provider>
```

## Behavior

### State Initialization

When a `Provider` is mounted:

1. A new store instance is created using the initializer function
2. If `initialState` is provided, it's merged with the default state using the specified `mergeStrategy`
3. The store is made available to all child components

### Provider Nesting

You can nest providers to create isolated instances of the store:

```tsx
<useTeamStore.Provider instanceId="team1" initialState={{ name: 'Team 1' }}>
  <TeamDashboard />

  <useTeamStore.Provider instanceId="team2" initialState={{ name: 'Team 2' }}>
    <TeamDashboard />
  </useTeamStore.Provider>
</useTeamStore.Provider>
```

Each nested provider:

1. Creates its own isolated store instance
2. Inherits access to all parent provider stores
3. Can override a parent store by using the same `instanceId`

### Context Inheritance

Child components can access all parent provider instances:

```tsx
function NestedComponent() {
  // Access "team1" store from parent provider
  const team1Name = useTeamStore.from('team1')((state) => state.name);

  // Access current provider's store (team2)
  const team2Name = useTeamStore((state) => state.name);

  return (
    <div>
      <p>Team 1: {team1Name}</p>
      <p>Team 2: {team2Name}</p>
    </div>
  );
}
```

This enables powerful composition patterns where nested components can interact with multiple context instances.

## Examples

### Basic Usage

```tsx
const useCounterStore = create<CounterState>(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  }),
  { name: 'Counter' },
);

function App() {
  return (
    <useCounterStore.Provider>
      <Counter />
    </useCounterStore.Provider>
  );
}
```

### Initial State

```tsx
function App() {
  return (
    <useCounterStore.Provider initialState={{ count: 10 }}>
      <Counter />
    </useCounterStore.Provider>
  );
}
```

### Deep Merge Strategy

```tsx
interface Settings {
  theme: {
    mode: 'light' | 'dark';
    colors: {
      primary: string;
      secondary: string;
    };
  };
  notifications: {
    email: boolean;
    push: boolean;
  };
}

const useSettingsStore = create<Settings>(
  () => ({
    theme: {
      mode: 'light',
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
      },
    },
    notifications: {
      email: true,
      push: true,
    },
  }),
  { name: 'Settings' },
);

function App() {
  return (
    <useSettingsStore.Provider
      initialState={{
        theme: {
          mode: 'dark',
          // colors will be inherited from the default state
        },
      }}
      mergeStrategy="deep">
      <Settings />
    </useSettingsStore.Provider>
  );
}
```

### Multiple Isolated Instances

```tsx
function TeamScoreboard() {
  return (
    <div>
      <useTeamStore.Provider instanceId="team1" initialState={{ name: 'Tigers', score: 0 }}>
        <TeamDisplay />

        <useTeamStore.Provider instanceId="team2" initialState={{ name: 'Eagles', score: 0 }}>
          <TeamDisplay />

          <ScoreOverview />
        </useTeamStore.Provider>
      </useTeamStore.Provider>
    </div>
  );
}

function ScoreOverview() {
  // Access both team instances
  const team1 = useTeamStore.from('team1')();
  const team2 = useTeamStore.from('team2')();

  return (
    <div>
      <h2>Score Overview</h2>
      <p>
        {team1.name}: {team1.score}
      </p>
      <p>
        {team2.name}: {team2.score}
      </p>
    </div>
  );
}
```

## Best Practices

1. **Keep providers close to consumers**: Place providers as close as possible to the components that need them to minimize unnecessary re-renders.

2. **Use meaningful instanceIds**: Use descriptive strings as instanceIds instead of symbols when you need to access them later with `from()`.

3. **Be consistent with mergeStrategy**: Choose a merge strategy that makes sense for your data structure and use it consistently.

4. **Initialize complex state**: For complex nested objects, use the `deep` merge strategy to avoid having to specify the entire object structure.

5. **Avoid provider hot paths**: Don't place providers inside components that render frequently, as creating new store instances can impact performance.
