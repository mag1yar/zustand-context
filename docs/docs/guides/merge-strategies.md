---
sidebar_position: 2
---

# Merge Strategies

When providing initial state to a store through the Provider, you can control how that state is merged with the default state. zustand-context offers three merge strategies: `shallow`, `deep`, and `replace`.

## Understanding Merge Strategies

### Shallow Merge (Default)

A shallow merge will only combine the top-level properties of the objects. Nested objects will be completely replaced rather than merged.

```tsx
// Original state
const original = {
  count: 0,
  user: {
    name: 'John',
    settings: {
      theme: 'light',
      notifications: true,
    },
  },
};

// New state
const newState = {
  user: {
    name: 'Jane',
    // Notice 'settings' is missing
  },
};

// With shallow merge:
const result = {
  count: 0,
  user: {
    name: 'Jane',
    // 'settings' is gone because the entire 'user' object was replaced
  },
};
```

### Deep Merge

A deep merge recursively combines properties of both objects at all levels. Nested objects are merged rather than replaced.

```tsx
// Original state
const original = {
  count: 0,
  user: {
    name: 'John',
    settings: {
      theme: 'light',
      notifications: true,
    },
  },
};

// New state
const newState = {
  user: {
    name: 'Jane',
    // Notice 'settings' is missing
  },
};

// With deep merge:
const result = {
  count: 0,
  user: {
    name: 'Jane',
    settings: {
      theme: 'light',
      notifications: true,
      // 'settings' is preserved because of deep merging
    },
  },
};
```

### Replace

The replace strategy completely discards the original state and uses only the new state.

```tsx
// Original state
const original = {
  count: 0,
  user: {
    name: 'John',
    settings: {
      theme: 'light',
      notifications: true,
    },
  },
};

// New state
const newState = {
  user: {
    name: 'Jane',
    // Notice 'settings' is missing
  },
};

// With replace:
const result = {
  user: {
    name: 'Jane',
    // 'count' is gone because the entire state was replaced
  },
};
```

## Using Merge Strategies

You can specify a merge strategy in two ways:

### 1. In the Provider

Use the `mergeStrategy` prop on the Provider component:

```tsx
<useStore.Provider initialState={{ user: { name: 'Jane' } }} mergeStrategy="deep">
  <YourComponents />
</useStore.Provider>
```

### 2. In the Store Creation Options

Configure default merge behavior using the `mergeOptions` in the store creation:

```tsx
const useStore = create<MyState>(
  (set) => ({
    // Your state and actions
  }),
  {
    name: 'MyStore',
    mergeOptions: {
      shallow: false, // Set to false to use deep merge by default
      whitelist: ['user', 'settings'], // Only merge these keys
      blacklist: ['sensitive'], // Don't merge these keys
      customMerge: (oldState, newState) => {
        // Custom merge implementation
        return { ...oldState, ...newState };
      },
    },
  },
);
```

## Practical Examples

Let's look at some real-world examples to understand when to use each strategy.

### User Settings Example

```tsx
interface UserSettings {
  theme: {
    mode: 'light' | 'dark' | 'system';
    colors: {
      primary: string;
      secondary: string;
      background: string;
    };
  };
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
  };
  display: {
    fontSize: 'small' | 'medium' | 'large';
    sidebar: boolean;
  };
}

const useSettingsStore = create<UserSettings>(
  () => ({
    theme: {
      mode: 'light',
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        background: '#ffffff',
      },
    },
    notifications: {
      email: true,
      push: true,
      sound: true,
    },
    display: {
      fontSize: 'medium',
      sidebar: true,
    },
  }),
  {
    name: 'Settings',
    mergeOptions: {
      shallow: false, // Use deep merge by default
    },
  },
);

// Later in your component
function App() {
  return (
    <useSettingsStore.Provider
      initialState={{
        theme: {
          mode: 'dark',
          // With deep merge, colors will be preserved
        },
      }}
      mergeStrategy="deep">
      <Settings />
    </useSettingsStore.Provider>
  );
}
```

In this example, we only want to change the theme mode to 'dark' while preserving all other settings. The deep merge strategy makes this possible without having to specify all the nested properties.

### Form State Example

```tsx
interface FormState {
  values: {
    name: string;
    email: string;
    address: {
      street: string;
      city: string;
      zipCode: string;
    };
  };
  touched: {
    name: boolean;
    email: boolean;
    address: {
      street: boolean;
      city: boolean;
      zipCode: boolean;
    };
  };
  errors: {
    name?: string;
    email?: string;
    address?: {
      street?: string;
      city?: string;
      zipCode?: string;
    };
  };
  resetForm: () => void;
  setField: (field: string, value: any) => void;
}

const useFormStore = create<FormState>(
  (set) => ({
    values: {
      name: '',
      email: '',
      address: {
        street: '',
        city: '',
        zipCode: '',
      },
    },
    touched: {
      name: false,
      email: false,
      address: {
        street: false,
        city: false,
        zipCode: false,
      },
    },
    errors: {},
    resetForm: () =>
      set((state) => ({
        values: {
          name: '',
          email: '',
          address: {
            street: '',
            city: '',
            zipCode: '',
          },
        },
        touched: {
          name: false,
          email: false,
          address: {
            street: false,
            city: false,
            zipCode: false,
          },
        },
        errors: {},
      })),
    setField: (field, value) => {
      // Complex nested field logic...
    },
  }),
  {
    name: 'FormStore',
  },
);

// When pre-filling a form with initial values
function EditUserForm({ user }) {
  return (
    <useFormStore.Provider
      initialState={{
        values: user,
        // We only want to replace the 'values', not 'touched' or 'errors'
      }}
      mergeStrategy="shallow">
      <Form />
    </useFormStore.Provider>
  );
}
```

In this form example, we use shallow merge to replace just the form values while keeping the touched and errors states untouched.

### Complete Reset Example

```tsx
interface GameState {
  player: {
    health: number;
    position: { x: number; y: number };
    inventory: string[];
  };
  world: {
    level: number;
    enemies: { id: string; type: string; health: number }[];
    items: { id: string; type: string; position: { x: number; y: number } }[];
  };
  startGame: () => void;
  endGame: () => void;
}

const useGameStore = create<GameState>(
  (set) => ({
    player: {
      health: 100,
      position: { x: 0, y: 0 },
      inventory: [],
    },
    world: {
      level: 1,
      enemies: [],
      items: [],
    },
    startGame: () => {
      /* ... */
    },
    endGame: () => {
      /* ... */
    },
  }),
  {
    name: 'GameStore',
  },
);

// When starting a new game with predefined state
function NewGame() {
  return (
    <useGameStore.Provider
      initialState={{
        player: {
          health: 100,
          position: { x: 50, y: 50 },
          inventory: ['map', 'compass'],
        },
        world: {
          level: 3,
          enemies: [
            { id: 'e1', type: 'goblin', health: 50 },
            { id: 'e2', type: 'orc', health: 100 },
          ],
          items: [{ id: 'i1', type: 'potion', position: { x: 100, y: 200 } }],
        },
      }}
      mergeStrategy="replace">
      <GameScreen />
    </useGameStore.Provider>
  );
}
```

In this game example, we use the replace strategy to completely reset the game state to a new initial state for a new game.

## Customizing Merge Behavior

For more fine-grained control, you can use the `mergeOptions` in the store creation:

### Whitelist and Blacklist

```tsx
const useUserStore = create<UserState>(
  (set) => ({
    profile: {
      name: '',
      email: '',
      avatar: '',
      privateData: {
        phoneNumber: '',
        address: '',
      },
    },
    preferences: {
      theme: 'light',
      language: 'en',
    },
    // ...actions
  }),
  {
    name: 'UserStore',
    mergeOptions: {
      // Only merge these keys
      whitelist: ['preferences'],

      // Or alternatively, don't merge these keys
      // blacklist: ['profile'],
    },
  },
);
```

This configuration ensures that only the `preferences` object can be merged from `initialState`, protecting the `profile` information.

### Custom Merge Function

For complete control, you can provide a custom merge function:

```tsx
const useComplexStore = create<ComplexState>(
  (set) => ({
    // State and actions
  }),
  {
    name: 'ComplexStore',
    mergeOptions: {
      customMerge: (oldState, newState) => {
        // Custom logic for merging arrays
        const mergedArrays = {
          items: [...oldState.items, ...(newState.items || [])],
        };

        // Special handling for user data
        const userData = newState.user
          ? {
              user: {
                ...oldState.user,
                ...newState.user,
                // Keep permissions from old state regardless of newState
                permissions: oldState.user.permissions,
              },
            }
          : { user: oldState.user };

        return {
          ...oldState,
          ...newState,
          ...mergedArrays,
          ...userData,
        };
      },
    },
  },
);
```

## Best Practices

1. **Choose the right default strategy** - For nested objects, `deep` merge is often safer but has a performance cost.

2. **Use shallow for performance** - When you know you're replacing entire objects, use `shallow` for better performance.

3. **Use replace sparingly** - Only use `replace` when you actually want to discard the entire state.

4. **Consider whitelisting sensitive data** - Use `whitelist` to control which parts of state can be overridden through `initialState`.

5. **Debug merging issues** - Enable `debug: true` to help troubleshoot when state is not merging as expected.

By understanding and properly using merge strategies, you can efficiently manage how state is initialized in different parts of your application.
