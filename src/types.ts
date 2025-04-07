import { StoreApi } from 'zustand';
import { Mutate, StateCreator, StoreMutatorIdentifier } from 'zustand/vanilla';
import React from 'react';

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type ContextMap<T> = Map<string | symbol, StoreApi<T>>;

// Options for context configuration
export interface ContextOptions<T> {
  // Display name for debugging and errors
  name: string;

  // ID for default context instance
  defaultInstanceId?: string | symbol;

  // Throw errors when Provider is missing
  strict?: boolean;

  // Default state when no Provider is available (requires strict: false)
  defaultState?: T;

  // Equality function for selectors
  equalityFn?: <S>(a: S, b: S) => boolean;

  // Error handling
  onError?: (error: Error) => void;

  // Merge strategy options for initialState
  mergeOptions?: {
    shallow?: boolean;
    whitelist?: (keyof T)[];
    blacklist?: (keyof T)[];
    customMerge?: (oldState: T, newState: DeepPartial<T>) => T;
  };

  // Enable debug mode
  debug?: boolean;
}

export interface ProviderProps<T> {
  instanceId?: string | symbol;
  initialState?: DeepPartial<T>;
  mergeStrategy?: 'shallow' | 'deep' | 'replace';
  children: React.ReactNode;
}

// Type for the hook returned by create()
export interface ContextStore<T> {
  // Base hook function
  (): T;
  <U>(selector: (state: T) => U, equalityFn?: (a: U, b: U) => boolean): U;

  // Access specific context instance
  from: (instanceId?: string | symbol) => {
    (): T;
    <U>(selector: (state: T) => U, equalityFn?: (a: U, b: U) => boolean): U;
  };

  // Provider component
  Provider: React.FC<ProviderProps<T>>;

  // Check if provider exists (without throwing)
  useProxySelector: (fallback: T) => T;

  // Raw context for advanced usage
  _context: React.Context<{
    stores: ContextMap<T>;
    defaultStore: StoreApi<T>;
  } | null>;

  // Optional debug utilities
  _debug?: {
    getOptions: () => ContextOptions<T>;
  };
}

export type Create = <T>(
  initializer: StateCreator<T, any, any>,
  options: ContextOptions<T>,
) => ContextStore<T>;

export type CreateStoreImpl = <T, Mos extends [StoreMutatorIdentifier, unknown][] = []>(
  initializer: StateCreator<T, [], Mos>,
) => Mutate<StoreApi<T>, Mos>;
