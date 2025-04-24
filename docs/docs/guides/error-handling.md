---
sidebar_position: 5
---

# Error Handling and Strict Mode

zustand-context provides robust error handling capabilities through strict mode and custom error handlers. This guide explores how to effectively manage errors and control the behavior of your stores when providers are missing or other issues occur.

## Strict Mode

By default, zustand-context operates in "strict mode," which means it will throw errors when components try to access a store without a provider in the component tree.

```tsx
const useStore = create<State>(
  (set) => ({
    // Your state and actions
  }),
  {
    name: 'Store',
    strict: true, // This is the default
  },
);

// In a component without a provider
function ComponentWithoutProvider() {
  // This will throw an error in strict mode
  const state = useStore();

  return <div>{/* ... */}</div>;
}
```

The error message will be clear and descriptive:

```
Store context (Store) error: Provider not found. Make sure you have wrapped your components with the Provider.
```

### When to Use Strict Mode

Strict mode is recommended for most applications because it:

1. Enforces proper component hierarchies
2. Catches errors early in development
3. Makes the component's dependencies explicit
4. Prevents unexpected behavior from missing providers

## Non-Strict Mode

If you want more flexibility, you can disable strict mode and provide a default state to use when no provider is found:

```tsx
const useStore = create<State>(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  }),
  {
    name: 'Store',
    strict: false,
    defaultState: {
      count: 0,
      increment: () => console.warn('No provider found for Store'),
    },
  },
);

// In a component without a provider
function ComponentWithoutProvider() {
  // This will NOT throw an error, but use defaultState instead
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

When the `increment` function is called, it will log a warning but not update the count, since there's no actual store instance.

### When to Use Non-Strict Mode

Non-strict mode is useful when:

1. You want to gradually adopt zustand-context in a larger application
2. You're creating a library that should work with or without providers
3. You want to provide fallback behavior when a provider might not be available

## Custom Error Handling

For more control over error behavior, you can provide a custom error handler:

```tsx
const useStore = create<State>(
  (set) => ({
    // Your state and actions
  }),
  {
    name: 'Store',
    strict: true,
    onError: (error) => {
      // Custom error handling logic
      console.error('Store error:', error.message);

      // Report to error monitoring service
      reportErrorToService(error);

      // You could also throw a different error
      // throw new Error(`Custom error: ${error.message}`);
    },
  },
);
```

The `onError` handler will be called when:

- A component tries to access a store without a provider (in strict mode)
- Other internal errors occur in the store

### Error Handler with Different Behaviors

You can implement sophisticated error handling based on the error type:

```tsx
const useStore = create<State>(
  (set) => ({
    // Your state and actions
  }),
  {
    name: 'Store',
    strict: true,
    onError: (error) => {
      // Check if it's a missing provider error
      if (error.message.includes('Provider not found')) {
        console.warn('Provider not found, some functionality may not work');

        // Don't rethrow, just warn
        return;
      }

      // For other errors, log and rethrow
      console.error('Critical store error:', error);
      throw error;
    },
  },
);
```

This approach allows you to handle different error types differently while still maintaining strict mode for most errors.

## Debug Mode

Enabling debug mode adds helpful logging for troubleshooting:

```tsx
const useStore = create<State>(
  (set) => ({
    // Your state and actions
  }),
  {
    name: 'Store',
    debug: true, // Enable debug logging
  },
);
```

With debug mode enabled, you'll see console logs for:

- Store creation
- Provider creation
- Store state updates
- Error conditions
- Warnings about missing instances when using `from()`

Example debug output:

```
[zustand-context(Store)] Created new store instance for default
[zustand-context(Store)] Applying initialState to default
[zustand-context(Store)] Instance team2 not found, using default instance instead
```

## Safe Access with useProxySelector

For cases where you want to safely access a store without errors, even in strict mode, you can use the `useProxySelector` method:

```tsx
function SafeComponent() {
  // Safely access the store, falling back to the provided value if no provider exists
  const fallbackState = { count: 0, increment: () => {} };
  const state = useStore.useProxySelector(fallbackState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={state.increment}>Increment</button>
    </div>
  );
}
```

`useProxySelector` tries to access the store and returns the fallback value if an error occurs, without throwing.

## Error Boundaries

You can combine zustand-context with React error boundaries for robust error handling:

```tsx
import { Component, ErrorInfo, ReactNode } from 'react';

// Simple error boundary component
class StoreErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Store error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <StoreErrorBoundary fallback={<div>Something went wrong with the store</div>}>
      <ComponentThatUsesStore />
    </StoreErrorBoundary>
  );
}
```

## Testing Error Conditions

When writing tests, you might want to verify that your components handle missing providers correctly:

```tsx
// Example test with React Testing Library
import { render, screen } from '@testing-library/react';

test('component shows fallback UI when store provider is missing', () => {
  // Render component without wrapping it in a provider
  render(<ComponentWithErrorHandling />);

  // Check that fallback UI is shown
  expect(screen.getByText('Store not available')).toBeInTheDocument();
});

test('component shows normal UI when store provider is present', () => {
  // Render component with provider
  render(
    <useStore.Provider>
      <ComponentWithErrorHandling />
    </useStore.Provider>,
  );

  // Check that normal UI is shown
  expect(screen.getByText('Store data:')).toBeInTheDocument();
});
```

## Advanced Error Handling Patterns

### Instance Guard

Create a higher-order component to ensure a specific instance exists:

```tsx
function withStoreInstance<P extends object>(
  Component: React.ComponentType<P>,
  storeHook: any,
  instanceId: string,
  fallback: React.ReactNode,
): React.FC<P> {
  return (props) => {
    // Check if the instance exists
    try {
      // Try to access the instance
      storeHook.from(instanceId)();

      // If no error was thrown, render the component
      return <Component {...props} />;
    } catch (error) {
      // Render fallback if instance doesn't exist
      return <>{fallback}</>;
    }
  };
}

// Usage
const ProtectedComponent = withStoreInstance(
  UserDashboard,
  useUserStore,
  'user-123',
  <div>User data not available</div>,
);
```

### Conditional Provider

Create a component that only renders children if a store instance is available:

```tsx
function StoreInstanceGuard({
  storeHook,
  instanceId,
  children,
  fallback,
}: {
  storeHook: any;
  instanceId: string;
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  try {
    // Try to access the instance
    storeHook.from(instanceId)();

    // If successful, render children
    return <>{children}</>;
  } catch (error) {
    // Otherwise, render fallback
    return <>{fallback}</>;
  }
}

// Usage
function App() {
  return (
    <StoreInstanceGuard
      storeHook={useUserStore}
      instanceId="user-123"
      fallback={<div>Please log in first</div>}>
      <UserDashboard />
    </StoreInstanceGuard>
  );
}
```

### Defensive Component Design

Design components that handle missing stores gracefully:

```tsx
function UserProfile({ userId }: { userId: string }) {
  // Get default state for when store is missing
  const defaultState = {
    profile: { name: 'Guest', email: '' },
    isLoading: false,
    error: null,
  };

  // Try to get user data, with a fallback
  let userData;
  try {
    userData = useUserStore.from(userId)();
  } catch (error) {
    userData = defaultState;
  }

  const { profile, isLoading, error } = userData;

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>{profile.name || 'Guest'}</h2>
      {profile.email && <p>Email: {profile.email}</p>}
    </div>
  );
}
```

## Best Practices

1. **Use strict mode during development** - It helps catch errors early.

2. **Provide meaningful store names** - Clear names make error messages more helpful.

3. **Set up error boundaries** - They prevent the whole app from crashing due to store errors.

4. **Use debug mode during development** - It provides helpful context for troubleshooting.

5. **Consider non-strict mode for libraries** - It makes your library more flexible for consumers.

6. **Test error conditions** - Verify that your app handles missing providers gracefully.

7. **Use defensive coding patterns** - Always handle potential errors when accessing stores.

8. **Document error handling behavior** - Make it clear to other developers how your stores behave when errors occur.

By implementing robust error handling with zustand-context, you can create a more resilient application that degrades gracefully when issues occur and provides clear feedback to developers during development.
