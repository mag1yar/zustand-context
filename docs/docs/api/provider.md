# Provider Component

The `.Provider` component is attached to every store created with `zustand-context`. It creates a boundary for your store instance and makes it available to all child components.

## Basic Usage

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
<useCounterStore.Provider>
  <Counter />
</useCounterStore.Provider>
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
<useCounterStore.Provider>
  <Counter />
</useCounterStore.Provider>
```

  </TabItem>
</Tabs>

## API Reference

### Props

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
interface ProviderProps<T> {
  /** Optional ID for this instance */
  instanceId?: string;

  /** Optional initial state (partial) */
  initialState?: DeepPartial<T>;

  /** React children */
  children: React.ReactNode;
}
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
{
  // Optional ID for this instance
  instanceId?: string,

  // Optional initial state (partial)
  initialState?: object,

  // React children
  children: React.ReactNode
}
```

  </TabItem>
</Tabs>

### instanceId (optional)

A unique identifier for this instance of the store. Used to:

- Reference this specific instance using the `from` option
- Distinguish between multiple instances of the same store
- Provide meaningful names in debugging and error messages

If not provided or set to an empty string, a default internal identifier will be used.

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
<useCounterStore.Provider instanceId="header">
  <HeaderCounter />
</useCounterStore.Provider>

<useCounterStore.Provider instanceId="sidebar">
  <SidebarCounter />
</useCounterStore.Provider>
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
<useCounterStore.Provider instanceId="header">
  <HeaderCounter />
</useCounterStore.Provider>

<useCounterStore.Provider instanceId="sidebar">
  <SidebarCounter />
</useCounterStore.Provider>
```

  </TabItem>
</Tabs>

### initialState (optional)

A partial state object that overrides the default state values for this instance. Only the properties you include will be overridden.

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
<useCounterStore.Provider initialState={{ count: 5 }}>
  <Counter />
</useCounterStore.Provider>
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
<useCounterStore.Provider initialState={{ count: 5 }}>
  <Counter />
</useCounterStore.Provider>
```

  </TabItem>
</Tabs>

For nested state, you only need to include the properties you want to override:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
<useUserStore.Provider
  initialState={{
    profile: {
      // Only override firstName, other profile properties remain unchanged
      firstName: 'Jane',
    },
  }}>
  <UserProfile />
</useUserStore.Provider>
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
<useUserStore.Provider
  initialState={{
    profile: {
      // Only override firstName, other profile properties remain unchanged
      firstName: 'Jane',
    },
  }}>
  <UserProfile />
</useUserStore.Provider>
```

  </TabItem>
</Tabs>

## Provider Behaviors

### Instance Creation

When a Provider is mounted, it:

1. Creates a new store instance
2. Initializes it with the store's default state (from the initializer function in `create`)
3. Applies any `initialState` values if provided
4. Makes the instance accessible to all child components

### Provider Isolation

Each Provider creates an isolated instance:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
<useCounterStore.Provider initialState={{ count: 5 }}>
  {/* This counter starts at 5 */}
  <Counter />
</useCounterStore.Provider>

<useCounterStore.Provider initialState={{ count: 10 }}>
  {/* This counter starts at 10 and is completely independent */}
  <Counter />
</useCounterStore.Provider>
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
<useCounterStore.Provider initialState={{ count: 5 }}>
  {/* This counter starts at 5 */}
  <Counter />
</useCounterStore.Provider>

<useCounterStore.Provider initialState={{ count: 10 }}>
  {/* This counter starts at 10 and is completely independent */}
  <Counter />
</useCounterStore.Provider>
```

  </TabItem>
</Tabs>

### Multiple Providers

You can have multiple providers with different IDs to create separate instances:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
function App() {
  return (
    <div>
      {/* First counter instance */}
      <useCounterStore.Provider instanceId="counter1" initialState={{ count: 5 }}>
        <div>
          <h3>Counter 1</h3>
          <Counter />
        </div>
      </useCounterStore.Provider>

      {/* Second counter instance */}
      <useCounterStore.Provider instanceId="counter2" initialState={{ count: 10 }}>
        <div>
          <h3>Counter 2</h3>
          <Counter />
        </div>
      </useCounterStore.Provider>
    </div>
  );
}
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
function App() {
  return (
    <div>
      {/* First counter instance */}
      <useCounterStore.Provider instanceId="counter1" initialState={{ count: 5 }}>
        <div>
          <h3>Counter 1</h3>
          <Counter />
        </div>
      </useCounterStore.Provider>

      {/* Second counter instance */}
      <useCounterStore.Provider instanceId="counter2" initialState={{ count: 10 }}>
        <div>
          <h3>Counter 2</h3>
          <Counter />
        </div>
      </useCounterStore.Provider>
    </div>
  );
}
```

  </TabItem>
</Tabs>

## Common Use Patterns

### Feature-Specific Providers

Wrap different features with their own providers:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
function App() {
  return (
    <div>
      <useAuthStore.Provider>
        <Header />
        <Sidebar />
      </useAuthStore.Provider>

      <useCartStore.Provider>
        <ShoppingCart />
      </useCartStore.Provider>
    </div>
  );
}
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
function App() {
  return (
    <div>
      <useAuthStore.Provider>
        <Header />
        <Sidebar />
      </useAuthStore.Provider>

      <useCartStore.Provider>
        <ShoppingCart />
      </useCartStore.Provider>
    </div>
  );
}
```

  </TabItem>
</Tabs>

### Reusable Components with Local State

Create reusable components with their own isolated state:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
function DataTable({ data, columns }) {
  return (
    <useTableStore.Provider
      initialState={{
        rows: data,
        columns,
        sortBy: columns[0].id,
        sortDirection: 'asc',
      }}>
      <TableHeader />
      <TableBody />
      <TableFooter />
    </useTableStore.Provider>
  );
}

// Usage
function ReportsPage() {
  return (
    <div>
      <DataTable data={usersData} columns={userColumns} />

      <DataTable data={ordersData} columns={orderColumns} />
    </div>
  );
}
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
function DataTable({ data, columns }) {
  return (
    <useTableStore.Provider
      initialState={{
        rows: data,
        columns,
        sortBy: columns[0].id,
        sortDirection: 'asc',
      }}>
      <TableHeader />
      <TableBody />
      <TableFooter />
    </useTableStore.Provider>
  );
}

// Usage
function ReportsPage() {
  return (
    <div>
      <DataTable data={usersData} columns={userColumns} />

      <DataTable data={ordersData} columns={orderColumns} />
    </div>
  );
}
```

  </TabItem>
</Tabs>

### Accessing Multiple Providers

To access multiple providers, you must structure your components so they're within the Provider hierarchy:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
function App() {
  return (
    <div>
      {/* Root provider with common parent */}
      <useCounterStore.Provider instanceId="root">
        {/* First counter provider */}
        <useCounterStore.Provider instanceId="counter1" initialState={{ count: 5 }}>
          <Counter label="Counter 1" />

          {/* Second counter provider nested inside first */}
          <useCounterStore.Provider instanceId="counter2" initialState={{ count: 10 }}>
            <Counter label="Counter 2" />

            {/* This component can access both counters */}
            <CountersTotal />
          </useCounterStore.Provider>
        </useCounterStore.Provider>
      </useCounterStore.Provider>
    </div>
  );
}

function CountersTotal() {
  // Access specific instances by ID
  const counter1Value = useCounterStore((s) => s.count, { from: 'counter1' });

  const counter2Value = useCounterStore((s) => s.count, { from: 'counter2' });

  return <p>Total: {counter1Value + counter2Value}</p>;
}
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
function App() {
  return (
    <div>
      {/* Root provider with common parent */}
      <useCounterStore.Provider instanceId="root">
        {/* First counter provider */}
        <useCounterStore.Provider instanceId="counter1" initialState={{ count: 5 }}>
          <Counter label="Counter 1" />

          {/* Second counter provider nested inside first */}
          <useCounterStore.Provider instanceId="counter2" initialState={{ count: 10 }}>
            <Counter label="Counter 2" />

            {/* This component can access both counters */}
            <CountersTotal />
          </useCounterStore.Provider>
        </useCounterStore.Provider>
      </useCounterStore.Provider>
    </div>
  );
}

function CountersTotal() {
  // Access specific instances by ID
  const counter1Value = useCounterStore((s) => s.count, { from: 'counter1' });

  const counter2Value = useCounterStore((s) => s.count, { from: 'counter2' });

  return <p>Total: {counter1Value + counter2Value}</p>;
}
```

  </TabItem>
</Tabs>
