---
sidebar_position: 3
---

# Multiple Contexts

One of the most powerful features of zustand-context is the ability to create multiple isolated instances of the same store type. This guide covers working with multiple context instances, nested providers, and common patterns.

## Understanding Multiple Contexts

With zustand-context, you can:

1. Create **multiple isolated instances** of the same store type
2. **Nest providers** to create hierarchical state structures
3. **Access specific instances** using the `from()` method
4. Create **component-specific state** that doesn't interfere with other instances

## Creating Multiple Instances

Each instance of a Provider creates a new, isolated state container. You identify instances using the `instanceId` prop:

```tsx
<useStore.Provider instanceId="instance1">
  {/* Components that access "instance1" */}
</useStore.Provider>

<useStore.Provider instanceId="instance2">
  {/* Components that access "instance2" */}
</useStore.Provider>
```

## Accessing Specific Instances

Use the `from()` method to access a specific instance:

```tsx
// Access "instance1"
const dataFromInstance1 = useStore.from('instance1')((state) => state.data);

// Access "instance2"
const dataFromInstance2 = useStore.from('instance2')((state) => state.data);
```

## Practical Example: Team Scoreboard

Let's create a practical example with multiple teams, each with its own isolated state:

```tsx
import { create } from 'zustand-context';

// Define team state
interface TeamState {
  name: string;
  score: number;
  incrementScore: () => void;
  decrementScore: () => void;
  setName: (name: string) => void;
}

// Create team store
const useTeamStore = create<TeamState>(
  (set) => ({
    name: 'Team',
    score: 0,
    incrementScore: () => set((state) => ({ score: state.score + 1 })),
    decrementScore: () => set((state) => ({ score: state.score - 1 })),
    setName: (name) => set({ name }),
  }),
  {
    name: 'TeamStore',
  },
);

// Component to display and control a team
function TeamDisplay({ teamId }: { teamId: string }) {
  // Get data for this specific team
  const name = useTeamStore.from(teamId)((state) => state.name);
  const score = useTeamStore.from(teamId)((state) => state.score);
  const incrementScore = useTeamStore.from(teamId)((state) => state.incrementScore);
  const decrementScore = useTeamStore.from(teamId)((state) => state.decrementScore);
  const setName = useTeamStore.from(teamId)((state) => state.setName);

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ fontWeight: 'bold' }}
        />
        <div style={{ fontSize: '1.5rem' }}>{score}</div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={incrementScore}>+1</button>
        <button onClick={decrementScore}>-1</button>
      </div>
    </div>
  );
}

// Component to show all scores
function ScoreOverview() {
  // Access all team instances
  const team1Score = useTeamStore.from('team1')((state) => state.score);
  const team1Name = useTeamStore.from('team1')((state) => state.name);

  const team2Score = useTeamStore.from('team2')((state) => state.score);
  const team2Name = useTeamStore.from('team2')((state) => state.name);

  const team3Score = useTeamStore.from('team3')((state) => state.score);
  const team3Name = useTeamStore.from('team3')((state) => state.name);

  return (
    <div style={{ background: '#f5f5f5', padding: '1rem', marginTop: '2rem' }}>
      <h2>Score Overview</h2>
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Team</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{team1Name}</td>
            <td>{team1Score}</td>
          </tr>
          <tr>
            <td>{team2Name}</td>
            <td>{team2Score}</td>
          </tr>
          <tr>
            <td>{team3Name}</td>
            <td>{team3Score}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// Main scoreboard component
function Scoreboard() {
  return (
    <div>
      <h1>Team Scoreboard</h1>

      {/* Create multiple team instances */}
      <useTeamStore.Provider instanceId="team1" initialState={{ name: 'Tigers' }}>
        <h2>Team 1</h2>
        <TeamDisplay teamId="team1" />

        <useTeamStore.Provider instanceId="team2" initialState={{ name: 'Eagles' }}>
          <h2>Team 2</h2>
          <TeamDisplay teamId="team2" />

          <useTeamStore.Provider instanceId="team3" initialState={{ name: 'Lions' }}>
            <h2>Team 3</h2>
            <TeamDisplay teamId="team3" />

            <ScoreOverview />
          </useTeamStore.Provider>
        </useTeamStore.Provider>
      </useTeamStore.Provider>
    </div>
  );
}

export default Scoreboard;
```

In this example:

- Each team has its own isolated state
- Nested providers create a hierarchy of team instances
- The `ScoreOverview` component can access all team instances

## Nested Providers

When you nest providers, child components can access both their own provider's state and all parent providers' states:

```tsx
<useStore.Provider instanceId="parent">
  {/* These components can access "parent" */}

  <useStore.Provider instanceId="child">
    {/* These components can access both "child" and "parent" */}

    <useStore.Provider instanceId="grandchild">
      {/* These components can access "grandchild", "child", and "parent" */}
    </useStore.Provider>
  </useStore.Provider>
</useStore.Provider>
```

This creates a hierarchical structure where state is inherited from parent to child.

## Advanced Use Cases

### Dynamic Instance IDs

You can dynamically create instances based on your data:

```tsx
function UserProfiles({ users }) {
  return (
    <div>
      {users.map((user) => (
        <useUserStore.Provider
          key={user.id}
          instanceId={`user-${user.id}`}
          initialState={{ profile: user }}>
          <UserProfile userId={user.id} />
        </useUserStore.Provider>
      ))}
    </div>
  );
}

function UserProfile({ userId }) {
  // Access this specific user's store
  const profile = useUserStore.from(`user-${userId}`)((state) => state.profile);

  return (
    <div>
      <h2>{profile.name}</h2>
      <p>{profile.email}</p>
    </div>
  );
}
```

### Complex Forms

Multiple contexts are perfect for complex forms:

```tsx
function MultiStepForm() {
  return (
    <div>
      <useFormStore.Provider instanceId="personalDetails">
        <PersonalDetailsStep />
      </useFormStore.Provider>

      <useFormStore.Provider instanceId="contactInfo">
        <ContactInfoStep />
      </useFormStore.Provider>

      <useFormStore.Provider instanceId="accountSettings">
        <AccountSettingsStep />
      </useFormStore.Provider>

      <FormSummary />
    </div>
  );
}

function FormSummary() {
  // Access all form sections
  const personalDetails = useFormStore.from('personalDetails')((state) => state.values);
  const contactInfo = useFormStore.from('contactInfo')((state) => state.values);
  const accountSettings = useFormStore.from('accountSettings')((state) => state.values);

  const handleSubmit = () => {
    // Combine all form data
    const formData = {
      ...personalDetails,
      ...contactInfo,
      ...accountSettings,
    };

    // Submit the combined data
    submitFormData(formData);
  };

  return (
    <div>
      <h2>Form Summary</h2>
      {/* Display summary */}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

### Dashboard Widgets

For dashboard applications with multiple widgets:

```tsx
function Dashboard() {
  return (
    <div className="dashboard">
      <useWidgetStore.Provider instanceId="widget1" initialState={{ type: 'chart' }}>
        <Widget id="widget1" />
      </useWidgetStore.Provider>

      <useWidgetStore.Provider instanceId="widget2" initialState={{ type: 'table' }}>
        <Widget id="widget2" />
      </useWidgetStore.Provider>

      <useWidgetStore.Provider instanceId="widget3" initialState={{ type: 'metrics' }}>
        <Widget id="widget3" />
      </useWidgetStore.Provider>

      <DashboardControls />
    </div>
  );
}

function DashboardControls() {
  // Access all widgets to implement dashboard-level controls
  const widgets = [
    useWidgetStore.from('widget1')(),
    useWidgetStore.from('widget2')(),
    useWidgetStore.from('widget3')(),
  ];

  const resetAllWidgets = () => {
    widgets.forEach((widget) => widget.reset());
  };

  return (
    <div className="dashboard-controls">
      <button onClick={resetAllWidgets}>Reset All Widgets</button>
    </div>
  );
}
```

## Handling Missing Instances

When you try to access an instance that doesn't exist, zustand-context will fall back to the default instance:

```tsx
// If "nonExistent" doesn't exist, this falls back to the default instance
const data = useStore.from('nonExistent')((state) => state.data);
```

If debug mode is enabled, you'll see a warning:

```
[zustand-context(StoreName)] Instance nonExistent not found, using default instance instead
```

To handle missing instances gracefully:

```tsx
function SafeComponent({ instanceId }) {
  try {
    // Try to access the instance
    const data = useStore.from(instanceId)((state) => state.data);
    return <div>{data}</div>;
  } catch (error) {
    // Handle the error
    return <div>Instance not found</div>;
  }
}
```

Alternatively, use the `useProxySelector` method:

```tsx
function SafeComponent({ instanceId }) {
  // Access the instance with a fallback
  const data = useStore.from(instanceId).useProxySelector({ data: 'Default data' }).data;
  return <div>{data}</div>;
}
```

If you don't provide an `instanceId` to the Provider, it will use this default ID:

```tsx
// These are equivalent:
<useStore.Provider>
  <Component />
</useStore.Provider>

<useStore.Provider instanceId="main">
  <Component />
</useStore.Provider>
```

## Common Patterns

### Shared vs. Instance-Specific State

You might want to have some shared state and some instance-specific state:

```tsx
// Shared state (regular Zustand store)
const useSharedStore = create((set) => ({
  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));

// Instance-specific state (zustand-context)
const useInstanceStore = create<InstanceState>(
  (set) => ({
    data: [],
    loadData: async () => {
      /* ... */
    },
  }),
  { name: 'InstanceStore' },
);

function Component({ instanceId }) {
  // Shared state (same for all components)
  const theme = useSharedStore((state) => state.theme);

  // Instance-specific state
  const data = useInstanceStore.from(instanceId)((state) => state.data);

  return <div className={theme}>{/* Render with theme and instance data */}</div>;
}
```

### Parent-Child Communication

Multiple contexts enable parent-child communication patterns:

```tsx
function Parent() {
  // Access parent state
  const parentState = useStore((state) => state);

  return (
    <useStore.Provider instanceId="parent">
      <div>
        <h2>Parent</h2>
        <button onClick={parentState.someAction}>Parent Action</button>

        <useStore.Provider instanceId="child">
          <Child />
        </useStore.Provider>
      </div>
    </useStore.Provider>
  );
}

function Child() {
  // Access child state
  const childState = useStore((state) => state);

  // Access parent state
  const parentState = useStore.from('parent')((state) => state);

  // Child can trigger parent actions
  const handleChildAction = () => {
    // Do something in child state
    childState.someChildAction();

    // Then trigger parent action
    parentState.someAction();
  };

  return (
    <div>
      <h3>Child</h3>
      <button onClick={handleChildAction}>Child Action</button>
    </div>
  );
}
```

## Best Practices

1. **Use meaningful instance IDs** - Choose descriptive names that reflect the purpose of each instance.

2. **Organize providers by component boundaries** - Place providers at component boundaries where state isolation makes sense.

3. **Access parent state sparingly** - While possible, accessing parent state too frequently might indicate a poor component structure.

4. **Document instance relationships** - When using complex nested providers, document the relationships for other developers.

5. **Consider performance** - Creating too many instances can impact performance. Monitor and optimize as needed.

6. **Error handling** - Implement proper error handling for cases where an instance might not exist.

7. **Test isolation** - Write tests to ensure that instances are properly isolated and don't interfere with each other.

By effectively using multiple contexts, you can create powerful, reusable components with isolated state that can still communicate when needed.
