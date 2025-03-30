import { StoreApi } from 'zustand';
import { CreateStoreImpl } from './types';

export const createStoreImpl: CreateStoreImpl = (createState) => {
  type TState = ReturnType<typeof createState>;
  type Listener = (state: TState, prevState: TState) => void;
  let state: TState;
  const listeners: Set<Listener> = new Set();

  const setState: StoreApi<TState>['setState'] = (partial, replace) => {
    const nextState =
      typeof partial === 'function' ? (partial as (state: TState) => TState)(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state =
        replace ?? (typeof nextState !== 'object' || nextState === null)
          ? (nextState as TState)
          : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };

  const getState: StoreApi<TState>['getState'] = () => state;

  const getInitialState: StoreApi<TState>['getInitialState'] = () => initialState;

  const subscribe: StoreApi<TState>['subscribe'] = (listener) => {
    listeners.add(listener);

    return () => listeners.delete(listener);
  };

  const api = { setState, getState, getInitialState, subscribe };
  const initialState = (state = createState(setState, getState, api));
  return api as any;
};

export const createStore = createStoreImpl;
