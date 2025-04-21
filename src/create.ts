import { createContext, createElement, useContext, useRef } from 'react';
import { createStore, useStore, type StateCreator, type StoreApi } from 'zustand';
import type {
  ContextOptions,
  Create,
  ProviderProps,
  StoreContextType,
  StoreOptions,
} from './types';
import { createLogPrefix, deepMerge, formatErrorMessage } from './utils';

const createImpl = <T>(initializer: StateCreator<T, [], []>, options: ContextOptions<T>) => {
  const {
    name,
    debug = false,
    defaultInstanceId = Symbol('default'),
    defaultState,
    onError,
    strict = true,
  } = options;

  const defaultStore = !strict && defaultState ? createStore(() => defaultState) : null;

  const StoreContext = createContext<StoreContextType<T> | null>(null);

  StoreContext.displayName = `${name}StoreContext`;

  const logPrefix = createLogPrefix(name, debug);

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

  function useContextStore<U>(selector: (state: T) => U, options?: StoreOptions): U;
  function useContextStore(): T;
  function useContextStore<U>(selector?: (state: T) => U, options?: StoreOptions) {
    const { from: instanceId } = options || {};
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

      return {} as U;
    }

    let store = contextValue.defaultStore;

    if (instanceId) {
      store = contextValue.stores.get(instanceId) || contextValue.defaultStore;

      if (!contextValue.stores.has(instanceId) && debug) {
        const warning = `Instance ${String(instanceId)} not found, using default instance instead`;
        console.warn(`${logPrefix}${warning}`);
      }
    }

    return selector ? useStore(store, selector) : useStore(store);
  }

  const Provider = ({
    instanceId = defaultInstanceId,
    initialState,
    children,
  }: ProviderProps<T>) => {
    const parentContext = useContext(StoreContext);

    const contextRef = useRef<StoreContextType<T> | null>(null);

    if (!contextRef.current) {
      const initialStores = new Map<symbol | string, StoreApi<T>>();

      const currentStore = createStore(initializer);

      if (debug) console.info(`${logPrefix}Created new store instance for ${String(instanceId)}`);

      if (initialState) {
        if (debug) console.info(`${logPrefix}Applying initialState to ${String(instanceId)}`);

        const currentState = currentStore.getState();

        const newState = deepMerge<any>(currentState, initialState) as T;
        currentStore.setState(newState, true);
      }

      if (parentContext) {
        if (debug) console.info(`${logPrefix}Inheriting parent context stores`);

        parentContext.stores.forEach((store, id) => {
          initialStores.set(id, store);
        });
      }

      initialStores.set(instanceId, currentStore);

      contextRef.current = {
        stores: initialStores,
        defaultStore: currentStore,
      };
    }

    return createElement(StoreContext.Provider, { value: contextRef.current }, children);
  };

  useContextStore.Provider = Provider;

  return useContextStore;
};

/**
 * Creates a context-aware Zustand store with options
 */
export const create = (<T>(
  initializer: StateCreator<T, [], []> | undefined,
  options: ContextOptions<T>,
) => (initializer ? createImpl(initializer, options) : createImpl)) as Create;
