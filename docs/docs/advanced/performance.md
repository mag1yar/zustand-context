---
sidebar_position: 2
---

# Performance Optimization

zustand-context is designed for performance, building on Zustand's efficient state management model. This guide covers best practices and techniques for optimizing performance when using zustand-context in your applications.

## Understanding Re-renders

Like Zustand, zustand-context uses a subscribe model that only re-renders components when the selected state changes. This gives it a significant performance advantage over the standard React Context API, which re-renders all consumers when any part of the context value changes.

The key performance principle is:

> Components only re-render when their selected state changes.

## Selectors for Performance

The most important performance optimization technique is to use selectors to extract only the state that a component needs:

```tsx
// Inefficient: subscribes to the entire state
function InefficientComponent() {
  const store = useStore();

  return <div>{store.user.name}</div>;
}

// Efficient: subscribes only to the user's name
function EfficientComponent() {
  const userName = useStore((state) => state.user.name);

  return <div>{userName}</div>;
}
```

When you select only what you need:

1. The component only re-renders when that specific data changes
2. The selector function creates a subscription to just that piece of state
3. Other state changes don't trigger unnecessary re-renders

## State Structure for Performance

How you structure your state can significantly impact performance:

### Flat State Structure

Flatten your state when possible to allow for more granular updates and selectors:

```tsx
// Less optimal: deeply nested state
const useDeepStore = create<DeepState>(
  (set) => ({
    user: {
      profile: {
        personal: {
          name: 'John',
          age: 30,
        },
        preferences: {
          theme: 'light',
          notifications: true,
        },
      },
      activity: {
        lastLogin: new Date(),
        recentItems: [],
      },
    },
    updateName: (name) =>
      set((state) => ({
        user: {
          ...state.user,
          profile: {
            ...state.user.profile,
            personal: {
              ...state.user.profile.personal,
              name,
            },
          },
        },
      })),
  }),
  { name: 'DeepStore' },
);

// More optimal: flatter state
const useFlatStore = create<FlatState>(
  (set) => ({
    userName: 'John',
    userAge: 30,
    theme: 'light',
    notifications: true,
    lastLogin: new Date(),
    recentItems: [],
    updateName: (name) => set({ userName: name }),
  }),
  { name: 'FlatStore' },
);
```

The flatter structure:

- Makes selectors simpler and more efficient
- Simplifies state updates
- Reduces the chance of unnecessary re-renders

### Normalized State

For collections of data, use a normalized state structure:

```tsx
// Less optimal: nested arrays
const useNestedStore = create<NestedState>(
  (set) => ({
    teams: [
      {
        id: 'team1',
        name: 'Team 1',
        members: [
          { id: 'user1', name: 'User 1' },
          { id: 'user2', name: 'User 2' },
        ],
      },
      {
        id: 'team2',
        name: 'Team 2',
        members: [
          { id: 'user3', name: 'User 3' },
          { id: 'user4', name: 'User 4' },
        ],
      },
    ],
    updateTeamName: (teamId, name) =>
      set((state) => ({
        teams: state.teams.map((team) => (team.id === teamId ? { ...team, name } : team)),
      })),
  }),
  { name: 'NestedStore' },
);

// More optimal: normalized state
const useNormalizedStore = create<NormalizedState>(
  (set) => ({
    teams: {
      team1: { id: 'team1', name: 'Team 1', memberIds: ['user1', 'user2'] },
      team2: { id: 'team2', name: 'Team 2', memberIds: ['user3', 'user4'] },
    },
    users: {
      user1: { id: 'user1', name: 'User 1' },
      user2: { id: 'user2', name: 'User 2' },
      user3: { id: 'user3', name: 'User 3' },
      user4: { id: 'user4', name: 'User 4' },
    },
    updateTeamName: (teamId, name) =>
      set((state) => ({
        teams: {
          ...state.teams,
          [teamId]: {
            ...state.teams[teamId],
            name,
          },
        },
      })),
  }),
  { name: 'NormalizedStore' },
);
```

Normalized state:

- Allows for more efficient updates
- Prevents duplication of data
- Makes it easier to update a single item without affecting others
- Enables more precise selectors

## Memoized Selectors

For complex selectors that do calculations or transformations, use memoization to avoid unnecessary recalculations:

```tsx
import { useMemo } from 'react';
import { createSelector } from 'reselect';

// Create memoized selectors
const selectFilteredTodos = createSelector(
  [(state) => state.todos, (state) => state.filter],
  (todos, filter) => {
    console.log('Calculating filtered todos');
    return todos.filter((todo) => {
      if (filter === 'all') return true;
      if (filter === 'completed') return todo.completed;
      if (filter === 'active') return !todo.completed;
      return true;
    });
  },
);

function TodoList() {
  // Get raw state from store
  const todos = useStore((state) => state.todos);
  const filter = useStore((state) => state.filter);

  // Apply memoized selector
  const filteredTodos = useMemo(() => selectFilteredTodos({ todos, filter }), [todos, filter]);

  return (
    <ul>
      {filteredTodos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
```

You can also create custom hooks that encapsulate the memoization:

```tsx
function useFilteredTodos() {
  const todos = useStore((state) => state.todos);
  const filter = useStore((state) => state.filter);

  return useMemo(() => selectFilteredTodos({ todos, filter }), [todos, filter]);
}

function TodoList() {
  const filteredTodos = useFilteredTodos();

  return (
    <ul>
      {filteredTodos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
```

## Optimizing Provider Hierarchies

The placement of providers in your component tree can affect performance:

### Place Providers Close to Consumers

Place providers as close as possible to the components that use them to minimize the scope of re-renders:

```tsx
// Less optimal: high-level provider
function App() {
  return (
    <useStore.Provider>
      <Header />
      <Sidebar />
      <Main /> {/* Only this uses the store */}
      <Footer />
    </useStore.Provider>
  );
}

// More optimal: targeted provider
function App() {
  return (
    <>
      <Header />
      <Sidebar />
      <useStore.Provider>
        <Main /> {/* Only this uses the store */}
      </useStore.Provider>
      <Footer />
    </>
  );
}
```

### Avoid Provider Nesting When Unnecessary

While zustand-context supports nested providers, unnecessary nesting can add overhead:

```tsx
// Less optimal: unnecessary nesting
function App() {
  return (
    <useTeamStore.Provider instanceId="team1">
      <useUserStore.Provider>
        {' '}
        {/* Not needed at this level */}
        <TeamHeader />
        <TeamMembers /> {/* Only this uses userStore */}
      </useUserStore.Provider>
    </useTeamStore.Provider>
  );
}

// More optimal: scoped providers
function App() {
  return (
    <useTeamStore.Provider instanceId="team1">
      <TeamHeader />
      <useUserStore.Provider>
        <TeamMembers />
      </useUserStore.Provider>
    </useTeamStore.Provider>
  );
}
```

### Balance Instance Granularity

Creating too many store instances can impact memory usage and performance. Strike a balance:

```tsx
// Less optimal: too many instances
function UserList({ users }) {
  return (
    <div>
      {users.map((user) => (
        <useUserStore.Provider key={user.id} instanceId={user.id}>
          <UserItem user={user} />
        </useUserStore.Provider>
      ))}
    </div>
  );
}

// More optimal: batch related items
function UserList({ users }) {
  // Group users by team
  const usersByTeam = groupBy(users, 'teamId');

  return (
    <div>
      {Object.entries(usersByTeam).map(([teamId, teamUsers]) => (
        <useTeamStore.Provider key={teamId} instanceId={teamId}>
          <TeamSection>
            {teamUsers.map((user) => (
              <UserItem key={user.id} userId={user.id} />
            ))}
          </TeamSection>
        </useTeamStore.Provider>
      ))}
    </div>
  );
}
```

## React.memo for Pure Components

Combine zustand-context with `React.memo` for components that depend on props more than store state:

```tsx
// Optimize component with React.memo
const TodoItem = React.memo(({ todo }) => {
  const toggleTodo = useStore((state) => state.toggleTodo);

  return (
    <li>
      <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} />
      <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>{todo.text}</span>
    </li>
  );
});
```

## Actions vs. Selectors

Choose the right approach for accessing state and actions:

```tsx
// Less optimal: selecting the whole store in a component that only uses actions
function TodoActions() {
  const store = useStore();

  return (
    <div>
      <button onClick={() => store.addTodo('New Todo')}>Add Todo</button>
      <button onClick={store.clearCompleted}>Clear Completed</button>
    </div>
  );
}

// More optimal: select only what you need
function TodoActions() {
  const addTodo = useStore((state) => state.addTodo);
  const clearCompleted = useStore((state) => state.clearCompleted);

  return (
    <div>
      <button onClick={() => addTodo('New Todo')}>Add Todo</button>
      <button onClick={clearCompleted}>Clear Completed</button>
    </div>
  );
}
```

## Batch Updates

Batch related state updates to minimize re-renders:

```tsx
// Less optimal: multiple separate updates
function resetForm() {
  useFormStore.getState().setName('');
  useFormStore.getState().setEmail('');
  useFormStore.getState().setPhone('');
  useFormStore.getState().setAddress('');
}

// More optimal: single batch update
function resetForm() {
  useFormStore.setState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
}

// Even better: action defined in the store
const useFormStore = create<FormState>(
  (set) => ({
    // Fields...
    resetForm: () =>
      set({
        name: '',
        email: '',
        phone: '',
        address: '',
      }),
  }),
  { name: 'FormStore' },
);
```

## Equality Functions

Provide custom equality functions for selectors that return objects or arrays:

```tsx
import { shallow } from 'zustand/shallow';

function UserProfile() {
  // Uses shallow equality to prevent unnecessary re-renders
  const { firstName, lastName } = useStore(
    (state) => ({
      firstName: state.user.firstName,
      lastName: state.user.lastName,
    }),
    shallow,
  );

  return (
    <div>
      {firstName} {lastName}
    </div>
  );
}
```

You can also create custom equality functions for specific scenarios:

```tsx
// Custom equality function for arrays
const arrayEqual = (a, b) =>
  Array.isArray(a) &&
  Array.isArray(b) &&
  a.length === b.length &&
  a.every((item, index) => item === b[index]);

function TodoList() {
  // Only re-renders when the array elements actually change
  const todoIds = useStore((state) => state.todos.map((todo) => todo.id), arrayEqual);

  return (
    <ul>
      {todoIds.map((id) => (
        <TodoItem key={id} id={id} />
      ))}
    </ul>
  );
}
```

## Debugging Performance

Use React DevTools Profiler to identify unnecessary re-renders:

1. Run your app with React DevTools installed
2. Open the Profiler tab
3. Record interactions
4. Look for components that re-render unexpectedly
5. Check those components' selectors and dependencies

You can also add debug logs to track re-renders:

```tsx
function TrackedComponent() {
  const data = useStore((state) => state.data);

  // Log when component renders
  console.log('TrackedComponent rendered with data:', data);

  useEffect(() => {
    console.log('TrackedComponent data changed:', data);
  }, [data]);

  return <div>{/* ... */}</div>;
}
```

## Memory Considerations

### Cleaning Up Store Instances

For dynamic instances that are no longer needed, consider a cleanup mechanism:

```tsx
const useTemporaryStore = create<TemporaryState>(
  (set, get) => ({
    // State and actions...
    cleanup: () => {
      // Custom cleanup logic
      console.log('Cleaning up temporary store');
    },
  }),
  { name: 'TemporaryStore' },
);

function TemporaryComponent({ id }) {
  const cleanup = useTemporaryStore.from(id)((state) => state.cleanup);

  useEffect(() => {
    // Cleanup when component unmounts
    return () => {
      cleanup();
      // Note: This doesn't actually remove the store instance
      // It just performs custom cleanup logic
    };
  }, [cleanup, id]);

  return <div>{/* ... */}</div>;
}
```

### Large Data Sets

For stores with large data sets, consider:

1. Pagination or virtualization to limit rendered items
2. Storing raw data outside the component state
3. Using memoization for expensive calculations
4. Lazy loading data when needed

```tsx
const useLargeDataStore = create<LargeDataState>(
  (set, get) => ({
    allItems: [],
    visibleItems: [],
    startIndex: 0,
    endIndex: 50,

    loadData: async () => {
      const response = await fetchLargeData();
      set({ allItems: response.data });
      get().updateVisibleItems();
    },

    updateVisibleItems: () => {
      const { allItems, startIndex, endIndex } = get();
      set({
        visibleItems: allItems.slice(startIndex, endIndex),
      });
    },

    setPage: (page, pageSize = 50) => {
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      set({ startIndex, endIndex });
      get().updateVisibleItems();
    },
  }),
  { name: 'LargeDataStore' },
);
```

## Advanced Performance Patterns

### State Splitting

Split large stores into smaller, focused stores when appropriate:

```tsx
// Instead of one large store:
const useAppStore = create<AppState>();
// Everything in one store...

// Split into domain-specific stores:
const useUserStore = create<UserState>(/* ... */);
const useProductStore = create<ProductState>(/* ... */);
const useCartStore = create<CartState>(/* ... */);
const useUIStore = create<UIState>(/* ... */);
```

This approach:

- Reduces the impact of state changes
- Makes selectors more efficient
- Improves code organization
- Allows more targeted provider placement

### Component Isolation

Isolate complex components with their own state:

```tsx
function ComplexDashboard() {
  return (
    <div>
      <useDashboardStore.Provider>
        <DashboardHeader />
        <DashboardContent />
        <DashboardFooter />
      </useDashboardStore.Provider>
    </div>
  );
}

// Used elsewhere in the app without affecting the main app state
function App() {
  return (
    <div>
      <AppHeader />
      <MainNavigation />
      <ComplexDashboard />
      <AppFooter />
    </div>
  );
}
```

### Lazy Initialization

Use lazy initialization for expensive initial state:

```tsx
const useExpensiveStore = create<ExpensiveState>(
  (set) => ({
    data: null,
    initialized: false,
    initialize: () => {
      // Only run this once
      set((state) => {
        if (state.initialized) return state;

        console.log('Running expensive initialization');
        const expensiveData = calculateExpensiveInitialState();

        return {
          data: expensiveData,
          initialized: true,
        };
      });
    },
  }),
  { name: 'ExpensiveStore' },
);

function ExpensiveComponent() {
  const initialize = useExpensiveStore((state) => state.initialize);
  const data = useExpensiveStore((state) => state.data);

  // Initialize on first render
  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!data) return <div>Loading...</div>;

  return <div>{/* Render with data */}</div>;
}
```

## Best Practices Summary

1. **Use granular selectors** - Select only the state that a component needs.

2. **Structure state for performance** - Prefer flatter and normalized state structures.

3. **Memoize complex selectors** - Use `useMemo` or libraries like Reselect for expensive calculations.

4. **Place providers strategically** - Keep providers close to the components that use them.

5. **Batch updates** - Combine related state changes into a single update.

6. **Use custom equality functions** - Prevent unnecessary re-renders when selecting objects or arrays.

7. **Split large stores** - Break monolithic stores into domain-specific stores.

8. **Profile your application** - Identify and fix performance bottlenecks.

9. **Optimize data loading** - Use pagination, virtualization, and lazy loading for large data sets.

10. **Balance instance granularity** - Create just enough instances to isolate state without fragmenting too much.

By following these performance optimization techniques, you can create highly responsive applications with zustand-context, even as they scale in complexity.
