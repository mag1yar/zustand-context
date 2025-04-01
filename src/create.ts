import { createContext, createElement, useContext, useRef } from 'react';
import { createStore, type StoreApi, useStore } from 'zustand';
import type { ContextStore, Create, ProviderProps } from './types';
import { createLogPrefix, deepMerge, filterStateByLists, formatErrorMessage } from './utils';
import { createStoreImpl } from './vanilla';

const DEFAULT_OPTIONS = {
  strict: true,
  debug: false,
};

/**
 * Creates a context-aware Zustand store with options
 */
export const create: Create = (initializer, options) => {
  // Merge with default options
  const mergedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const {
    name,
    defaultInstanceId = Symbol('default'),
    strict,
    defaultState,
    equalityFn,
    onError,
    mergeOptions,
    debug,
  } = mergedOptions;

  // If not in strict mode and defaultState is defined, create a default store
  const defaultStore = !strict && defaultState ? createStoreImpl(() => defaultState) : null;

  // Create a context to hold all store instances
  const StoreContext = createContext<{
    stores: Map<string | symbol, StoreApi<any>>;
    defaultStore: StoreApi<any>;
  } | null>(null);

  // Set display name for React DevTools
  StoreContext.displayName = `${name}StoreContext`;

  // Create the log prefix for consistent logging
  const logPrefix = createLogPrefix(name, debug);

  // Helper to handle errors
  const handleError = (error: Error) => {
    if (onError) {
      onError(error);
    } else if (debug) {
      console.error(`${logPrefix}${error.message}`);
    }

    if (strict) {
      throw error;
    }
  };

  // Merge strategy implementation
  const mergeState = (oldState: any, newState: any): any => {
    if (!newState || Object.keys(newState).length === 0) {
      return oldState;
    }

    // Use custom merge if provided
    if (mergeOptions?.customMerge) {
      return mergeOptions.customMerge(oldState, newState);
    }

    // Filter by whitelist/blacklist
    const filteredState = filterStateByLists(
      newState,
      mergeOptions?.whitelist,
      mergeOptions?.blacklist,
    );

    // Shallow merge by default
    if (mergeOptions?.shallow === false) {
      // Deep merge
      return deepMerge(oldState, filteredState);
    }

    // Shallow merge (default)
    return { ...oldState, ...filteredState };
  };

  // Create the base hook function
  function useContextStore<U>(selector: (state: any) => U, eq?: (a: U, b: U) => boolean): U;
  function useContextStore(): any;
  function useContextStore<U>(selector?: (state: any) => U, eq?: (a: U, b: U) => boolean) {
    const contextValue = useContext(StoreContext);

    if (!contextValue) {
      if (defaultStore) {
        if (debug) console.info(`${logPrefix}Using default store`);

        return selector ? useStore(defaultStore, selector) : useStore(defaultStore);
      }

      const error = new Error(
        formatErrorMessage(
          'Provider not found. Make sure you have wrapped your components with the Provider.',
          name,
        ),
      );

      handleError(error);

      // When not in strict mode and no defaultState, return empty object
      // This should never execute in strict mode because handleError would throw
      return {} as any;
    }

    // Use the default store from the closest provider
    const store = contextValue.defaultStore;

    // NOTE: В zustand v4+ useStore принимает только 2 аргумента
    return selector ? useStore(store, selector) : useStore(store);
  }

  // Method to access a specific context instance
  useContextStore.from = (instanceId?: string | symbol) => {
    function useNamedContextStore<U>(selector: (state: any) => U, eq?: (a: U, b: U) => boolean): U;
    function useNamedContextStore(): any;
    function useNamedContextStore<U>(selector?: (state: any) => U, eq?: (a: U, b: U) => boolean) {
      const contextValue = useContext(StoreContext);

      if (!contextValue) {
        if (defaultStore) {
          if (debug) console.info(`${logPrefix}Using default store`);
          // NOTE: В zustand v4+ useStore принимает только 2 аргумента
          return selector ? useStore(defaultStore, selector) : useStore(defaultStore);
        }

        const error = new Error(
          formatErrorMessage(
            'Provider not found. Make sure you have wrapped your components with the Provider.',
            name,
          ),
        );

        handleError(error);

        // When not in strict mode and no defaultState, return empty object
        return {} as any;
      }

      // If no instanceId provided, use the default store
      const targetInstanceId = instanceId ?? defaultInstanceId;
      const store = instanceId
        ? contextValue.stores.get(targetInstanceId) ?? contextValue.defaultStore
        : contextValue.defaultStore;

      if (instanceId && !contextValue.stores.has(targetInstanceId)) {
        const warning = `Instance ${String(
          targetInstanceId,
        )} not found, using default instance instead`;
        if (debug) console.warn(`${logPrefix}${warning}`);
      }

      return selector ? useStore(store, selector) : useStore(store);
    }

    return useNamedContextStore;
  };

  // Create Provider component
  const Provider = <P extends ProviderProps<any>>({
    instanceId = defaultInstanceId,
    initialState,
    mergeStrategy,
    children,
  }: P) => {
    const parentContext = useContext(StoreContext);

    // Create a ref to hold our context value to avoid unnecessary re-renders
    const contextRef = useRef<{
      stores: Map<string | symbol, StoreApi<any>>;
      defaultStore: StoreApi<any>;
    } | null>(null);

    // Initialize the ref if it doesn't exist
    if (!contextRef.current) {
      const initialStores = new Map<string | symbol, StoreApi<any>>();

      // Create a new store instance for this provider
      const currentStore = createStore(initializer as any);

      if (debug) console.info(`${logPrefix}Created new store instance for ${String(instanceId)}`);

      // Apply initialState if provided
      if (initialState) {
        if (debug) console.info(`${logPrefix}Applying initialState to ${String(instanceId)}`);

        if (mergeStrategy === 'replace') {
          // Replace entire state
          currentStore.setState(initialState as any, true);
        } else if (mergeStrategy === 'deep') {
          // Use deep merge - проверка типа initialState
          const currentState = currentStore.getState();

          const newState = deepMerge(currentState as Record<string, any>, initialState);
          currentStore.setState(newState, true);
        } else {
          // Use configured merge strategy (shallow by default)
          const currentState = currentStore.getState();
          const newState = mergeState(currentState, initialState);
          currentStore.setState(newState, true);
        }
      }

      // If we have a parent context, copy all its stores
      if (parentContext) {
        if (debug) console.info(`${logPrefix}Inheriting parent context stores`);

        // Copy parent stores to maintain the hierarchy
        parentContext.stores.forEach((store, id) => {
          initialStores.set(id, store);
        });
      }

      // Add or update this instance's store
      initialStores.set(instanceId, currentStore);

      contextRef.current = {
        stores: initialStores,
        defaultStore: currentStore,
      };
    }

    return createElement(StoreContext.Provider, { value: contextRef.current }, children);
  };

  // Attach Provider to the hook
  useContextStore.Provider = Provider;

  // Allow checking if provider exists
  useContextStore.useProxySelector = (fallback: any) => {
    try {
      return useContextStore();
    } catch (e) {
      return fallback;
    }
  };

  // Expose the raw context for advanced usage
  useContextStore._context = StoreContext;

  // Debugging utility
  if (debug) {
    useContextStore._debug = {
      getOptions: () => mergedOptions,
    };
  }

  return useContextStore as ContextStore<any>;
};

// Backward compatibility method for optional contexts
create.optional = function optional(initializer, defaultValue) {
  return create(initializer, {
    name: 'optional', // Since name is required, provide a default
    strict: false,
    defaultState: defaultValue,
  });
};
