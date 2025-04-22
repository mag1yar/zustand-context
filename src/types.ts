import type { FC, ReactNode } from 'react';
import type { StoreApi, ExtractState } from 'zustand';
import type { Mutate, StateCreator, StoreMutatorIdentifier } from 'zustand/vanilla';

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type ContextOptions = {
  name: string;
  defaultInstanceId?: string | symbol;
  strict?: boolean;
  onError?: (error: Error) => void;
  debug?: boolean;
};

export type ProviderProps<T> = {
  instanceId?: string | symbol;
  initialState?: DeepPartial<T>;
  children: ReactNode;
};

export type StoreOptions = {
  from?: string | symbol;
};

export type StoreContextType<T> = {
  stores: Map<string | symbol, StoreApi<T>>;
  defaultStore: StoreApi<T>;
};

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, 'getState' | 'getInitialState' | 'subscribe'>;

export type UseContextBoundStore<T, S extends ReadonlyStoreApi<unknown>> = {
  (): ExtractState<S>;
  <U>(selector: (state: ExtractState<S>) => U, options?: StoreOptions): U;
  <U>(selector?: (state: ExtractState<S>) => U, options?: StoreOptions): U;

  Provider: FC<ProviderProps<T>>;
} & S;

export type Create = {
  <T, Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    initializer: StateCreator<T, [], Mos>,
    options: ContextOptions,
  ): UseContextBoundStore<T, Mutate<StoreApi<T>, Mos>>;
  <T>(): <Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    initializer: StateCreator<T, [], Mos>,
    options: ContextOptions,
  ) => UseContextBoundStore<T, Mutate<StoreApi<T>, Mos>>;
};
