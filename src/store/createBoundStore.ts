import { createStore as createZustandStore, useStore as useZustandStore } from 'zustand';
import type { StoreApi } from 'zustand';

export { shallow as useShallow } from 'zustand/react/shallow';

export type CreateStoreResult<T> = {
  store: StoreApi<T>;
  useStore: {
    (): T;
    <U>(selector: (state: T) => U): U;
  };
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
};

export function createBoundStore<T>(
  initializer: (set: any, get: any, api: any) => T
): CreateStoreResult<T> {
  const store = createZustandStore<T>(initializer);

  const useStore = (<U = T>(selector?: (state: T) => U) => {
    return useZustandStore(store, selector as any);
  }) as CreateStoreResult<T>['useStore'];

  return {
    store,
    useStore,
    getState: store.getState,
    setState: store.setState,
    subscribe: store.subscribe,
  };
}
