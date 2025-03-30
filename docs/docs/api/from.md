---
sidebar_position: 3
---

# from

The `from` method allows you to access a specific context instance by its ID. This is particularly useful when working with multiple nested providers.

## Signature

```ts
function from<T>(instanceId?: string | symbol): {
  (): T;
  <U>(selector: (state: T) => U, equalityFn?: (a: U, b: U) => boolean): U;
};
```

## Parameters

- **instanceId**: The ID of the context instance to access.

## Returns

A hook function that behaves like the main store hook, but always accesses the specified context instance.

## Usage

```tsx
// Access the "team1" instance
const team1Name = useTeamStore.from('team1')((state) => state.name);

// Access the entire state of "team2" instance
const team2 = useTeamStore.from('team2')();
```

## Behavior

### Instance Resolution

The `from` method resolves the context instance in the following order:

1. If an `instanceId` is provided, it looks for a context with that ID in the current and parent providers
2. If not found, it uses the default store from the closest provider
3. If no provider exists:
   - If the store is in non-strict mode (`strict: false`) and has a `defaultState`, it returns that
   - Otherwise, it throws an error (in strict mode) or returns an empty object

### Warning for Missing Instances

If the specified instance is not found and `debug` is enabled, a warning is logged to the console:

```
[zustand-context(TeamStore)] Instance team3 not found, using default instance instead
```

## Examples

### Multiple Team Scores

```tsx
// Create a store for team state
const useTeamStore = create<TeamState>(
  (set) => ({
    name: 'Team',
    score: 0,
    incrementScore: () => set((state) => ({ score: state.score + 1 })),
    decrementScore: () => set((state) => ({ score: state.score - 1 })),
    setName: (name: string) => set({ name }),
  }),
  { name: 'TeamStore' },
);

// Component to display a team
function TeamDisplay({ teamId }: { teamId: string }) {
  // Use the "from" method to access the specific team instance
  const name = useTeamStore.from(teamId)((state) => state.name);
  const score = useTeamStore.from(teamId)((state) => state.score);
  const incrementScore = useTeamStore.from(teamId)((state) => state.incrementScore);

  return (
    <div>
      <h2>{name}</h2>
      <p>Score: {score}</p>
      <button onClick={incrementScore}>+1</button>
    </div>
  );
}

// Scoreboard showing all teams
function Scoreboard() {
  // Access all team instances
  const team1Score = useTeamStore.from('team1')((state) => state.score);
  const team2Score = useTeamStore.from('team2')((state) => state.score);

  return (
    <div>
      <h2>Scoreboard</h2>
      <p>Team 1: {team1Score}</p>
      <p>Team 2: {team2Score}</p>
    </div>
  );
}

// Main component with providers
function Game() {
  return (
    <div>
      <useTeamStore.Provider instanceId="team1" initialState={{ name: 'Tigers' }}>
        <TeamDisplay teamId="team1" />

        <useTeamStore.Provider instanceId="team2" initialState={{ name: 'Eagles' }}>
          <TeamDisplay teamId="team2" />

          <Scoreboard />
        </useTeamStore.Provider>
      </useTeamStore.Provider>
    </div>
  );
}
```

### Accessing Default Instance

If you don't provide an `instanceId` to `from`, it accesses the default instance (same as using the hook directly):

```tsx
// These are equivalent:
const count1 = useCounterStore((state) => state.count);
const count2 = useCounterStore.from()((state) => state.count);
```

### Fallback to Default Instance

If an instance isn't found, it falls back to the default instance:

```tsx
function Component() {
  // If "nonExistent" doesn't exist, this falls back to the default instance
  const count = useCounterStore.from('nonExistent')((state) => state.count);

  return <div>{count}</div>;
}
```

## Advanced Usage

### Dynamic Instance IDs

You can dynamically determine which instance to access:

```tsx
function DynamicTeamDisplay({ selectedTeamId }: { selectedTeamId: string }) {
  // Dynamically access the selected team
  const teamName = useTeamStore.from(selectedTeamId)((state) => state.name);

  return <div>{teamName}</div>;
}
```

### Combining with Middleware

The `from` method works with all Zustand middleware:

```tsx
import { create } from 'zustand-context';
import { persist } from 'zustand/middleware';

const usePersistedStore = create<SettingsState>(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'settings' },
  ),
  { name: 'Settings' },
);

function UserSettings({ userId }: { userId: string }) {
  // Access user-specific persisted settings
  const theme = usePersistedStore.from(userId)((state) => state.theme);
  const setTheme = usePersistedStore.from(userId)((state) => state.setTheme);

  return (
    <div>
      <h2>User {userId} Settings</h2>
      <p>Theme: {theme}</p>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>Toggle Theme</button>
    </div>
  );
}
```

## Best Practices

1. **Use consistent instance IDs**: Use the same ID pattern throughout your application to avoid confusion.

2. **Check for existence**: When accessing potentially missing instances, handle the case when they might not exist.

3. **Prefer local instance when possible**: If you're already within a provider's scope, prefer using the direct hook over `from()` with the same ID.

4. **Be careful with type safety**: The `from()` method preserves type safety, but TypeScript won't catch cases where you access a non-existent instance.

5. **Consider caching selectors**: When using `from()` with selectors in frequently re-rendering components, consider memoizing the selector or result to avoid unnecessary re-renders.
