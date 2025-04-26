# immer

The immer middleware allows you to use [Immer](https://immerjs.github.io/immer/) to update state with mutable syntax while maintaining immutability. Since the immer middleware doesn't require special configuration for multiple instances, zustand-context fully supports the original immer middleware from Zustand.

:::note
When using middleware with zustand-context, you must use the double function call pattern: `create()()`. This applies to both TypeScript and JavaScript and ensures proper type inference and middleware compatibility.
:::

## Installation

To use the immer middleware, you need to install both the `zustand` and `immer` packages:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="package-manager">
  <TabItem value="npm" label="npm" default>

```bash
npm install zustand immer
```

  </TabItem>
  <TabItem value="yarn" label="yarn">

```bash
yarn add zustand immer
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```bash
pnpm add zustand immer
```

  </TabItem>
</Tabs>

## Basic Usage

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
import { create } from '@mag1yar/zustand-context';
import { immer } from 'zustand/middleware/immer';

interface TodoState {
  todos: Array<{ id: string; text: string; completed: boolean }>;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
}

const useTodoStore = create<TodoState>()(
  immer((set) => ({
    todos: [],
    addTodo: (text) =>
      set((state) => {
        state.todos.push({
          id: crypto.randomUUID(),
          text,
          completed: false,
        });
      }),
    toggleTodo: (id) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id);
        if (todo) {
          todo.completed = !todo.completed;
        }
      }),
    removeTodo: (id) =>
      set((state) => {
        const index = state.todos.findIndex((t) => t.id === id);
        if (index !== -1) {
          state.todos.splice(index, 1);
        }
      }),
  })),
  {
    name: 'TodoContext',
  },
);
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
import { create } from '@mag1yar/zustand-context';
import { immer } from 'zustand/middleware/immer';

const useTodoStore = create()(
  immer((set) => ({
    todos: [],
    addTodo: (text) =>
      set((state) => {
        state.todos.push({
          id: crypto.randomUUID(),
          text,
          completed: false,
        });
      }),
    toggleTodo: (id) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id);
        if (todo) {
          todo.completed = !todo.completed;
        }
      }),
    removeTodo: (id) =>
      set((state) => {
        const index = state.todos.findIndex((t) => t.id === id);
        if (index !== -1) {
          state.todos.splice(index, 1);
        }
      }),
  })),
  {
    name: 'TodoContext',
  },
);
```

  </TabItem>
</Tabs>

## Working with Nested State

Immer excels at handling deeply nested state updates:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript" default>

```tsx
import { create } from '@mag1yar/zustand-context';
import { immer } from 'zustand/middleware/immer';

interface UserState {
  users: Record<
    string,
    {
      profile: {
        name: string;
        email: string;
        settings: {
          theme: 'light' | 'dark';
          notifications: boolean;
        };
      };
      posts: Array<{ id: string; content: string }>;
    }
  >;
  updateUserTheme: (userId: string, theme: 'light' | 'dark') => void;
  addPost: (userId: string, content: string) => void;
}

const useUserStore = create<UserState>()(
  immer((set) => ({
    users: {},
    updateUserTheme: (userId, theme) =>
      set((state) => {
        if (state.users[userId]) {
          state.users[userId].profile.settings.theme = theme;
        }
      }),
    addPost: (userId, content) =>
      set((state) => {
        if (state.users[userId]) {
          state.users[userId].posts.push({
            id: crypto.randomUUID(),
            content,
          });
        }
      }),
  })),
  {
    name: 'UserContext',
  },
);
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
import { create } from '@mag1yar/zustand-context';
import { immer } from 'zustand/middleware/immer';

const useUserStore = create()(
  immer((set) => ({
    users: {},
    updateUserTheme: (userId, theme) =>
      set((state) => {
        if (state.users[userId]) {
          state.users[userId].profile.settings.theme = theme;
        }
      }),
    addPost: (userId, content) =>
      set((state) => {
        if (state.users[userId]) {
          state.users[userId].posts.push({
            id: crypto.randomUUID(),
            content,
          });
        }
      }),
  })),
  {
    name: 'UserContext',
  },
);
```

  </TabItem>
</Tabs>
