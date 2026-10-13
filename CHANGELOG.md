# @julianfere/hooked

## 1.0.0

### Major Changes

- ceb0f12: **React 19 is now required.** `react` moved from `dependencies` to `peerDependencies` with range `^19.0.0`; React 18 is no longer supported.
  
  Previously `react` was declared as a regular dependency, which could install a second copy of React in consumer apps and cause "Invalid hook call" errors. Now the library always uses the host app's React.
  
  ```bash
  pnpm add react@^19 react-dom@^19
  ```
- ceb0f12: **`useAsync`: the `AbortSignal` is now the first argument of `fn`.**
  
  `trigger(...args)` forwards its arguments after the signal: `fn(signal, ...args)`.
  
  ```ts
  // Before (0.x)
  const { trigger } = useAsync((id: string, signal: AbortSignal) =>
    fetch(`/users/${id}`, { signal })
  );
  
  // After (1.0)
  const { trigger } = useAsync((signal, id: string) =>
    fetch(`/users/${id}`, { signal })
  );
  
  trigger("42");
  ```
  
  Why: appending the signal at the end broke in several ways:
  
  - If `fn` did not declare the signal, the type of `trigger` dropped its last real argument, so `useAsync((id: string) => ...)` produced a `trigger()` that rejected `trigger(id)`.
  - Optional parameters became required in `trigger`.
  - With optional parameters, calling `trigger` with fewer arguments placed the signal into the wrong parameter at runtime.
  
  With the signal first, `trigger` takes exactly the parameters declared after it, optional parameters stay optional, and the signal always lands in the same place. Functions that don't need cancellation can omit the parameter entirely: `useAsync(() => fetchConfig())`.
  
  The `AsyncFunction` and `TriggerArgs` types are exported for wrappers.

### Minor Changes

- ceb0f12: `useDocumentTitle` is deprecated and will be removed in 2.0. React 19 supports rendering `<title>` from any component and hoists it into `<head>`:
  
  ```tsx
  // Before
  useDocumentTitle(`Inbox (${count})`);
  
  // After
  return (
    <>
      <title>{`Inbox (${count})`}</title>
      ...
    </>
  );
  ```
  
  The hook keeps working and logs a one-time warning outside production.
- ceb0f12: EventContext:
  
  - The provider renders `<Context value>` (React 19) instead of `<Context.Provider>`.
  - Subscription ids use an incremental counter instead of `crypto.randomUUID()`, which is unavailable outside secure contexts (plain HTTP) and in older browsers.
  - Clearer error when the event hook is used outside its provider.
- ceb0f12: Public types are now exported: `AsyncState` and `UseAsyncOptions` from `@julianfere/hooked`, and `IEventContext`, `Publisher` and `SubscriptionHandler` from `@julianfere/hooked/events`.

### Patch Changes

- ceb0f12: Bug fixes:
  
  - `useDebounce`: a `delay` of `0` is now respected (it used to fall back to 500 ms).
  - `useDelay`: timers scheduled with the manual runner are cleared on unmount; the runner now always returns a cancel function and is stable between renders.
  - `useQueryParams`:
    - Rewritten on top of `useSyncExternalStore`; every mounted instance re-renders on `set`, `clear` and browser navigation (no more module-level listener array).
    - `build` skips `null`/`undefined` values instead of throwing, and serializes objects/arrays as JSON so they round-trip with `get`.
    - `set({})` removes the query string instead of doing nothing.
    - `set` and `clear` keep the URL hash.
    - `get` no longer casts whitespace, hex (`0x10`), exponent (`1e5`), leading-zero (`007`) or unsafe integer values to numbers.
  - `useLocalStorage`: `getItem` returns `null` for values that are not valid JSON instead of throwing, and `hasItem` reports items stored as an empty string as existing.

## 0.3.0

### Minor Changes

- a458ee8: Simplify EventContext factory API: remove `createEventContext` step

  The `factory()` function no longer returns `createEventContext`. The context is now created internally, so consumers only need two steps instead of three:

  ```ts
  // Before
  const { createEventContext, createEventProvider, createEventHook } =
    factory<AppEvents>();
  const ctx = createEventContext();
  const EventsProvider = createEventProvider(ctx);
  const useEvents = createEventHook(ctx);

  // After
  const { createEventProvider, createEventHook } = factory<AppEvents>();
  const EventsProvider = createEventProvider();
  const useEvents = createEventHook();
  ```

  Additional improvements: `subscribe` uses `push` (O(1)), `publish` and `subscribe` are stable via `useCallback`, and the context value is memoized with `useMemo`.

## 0.2.2

### Patch Changes

- f58b31a: fix: pass AbortSignal directly instead of wrapped object in useAsync

  The `trigger` function was passing `{ signal: controller.signal }` as the last argument to the async function, instead of the `AbortSignal` itself. This caused a `TypeError` when users passed the signal directly to `fetch` (e.g. `fetch(url, { signal })`).

## 0.2.1

### Patch Changes

- 28352f1: fix: pass AbortSignal directly instead of wrapped object in useAsync

  The `trigger` function was passing `{ signal: controller.signal }` as the last argument to the async function, instead of the `AbortSignal` itself. This caused a `TypeError` when users passed the signal directly to `fetch` (e.g. `fetch(url, { signal })`).

## 0.2.0

### Minor Changes

- d8b4430: **`useAsync` overhaul** — richer API, proper state machine, no more stale closures.

  ### Breaking changes

  - `run` renamed to `trigger`
  - `manual` option removed — the default behavior is now manual (call `trigger()` yourself). Use `immediate: true` to run on mount.
  - `cancelable` option removed — in-flight requests are always cancelled when `trigger` is called again or the component unmounts
  - `state` (string) replaced by `status` (same string values: `"idle" | "pending" | "fulfilled" | "rejected"`)
  - `AsyncStatus` enum no longer exported — use the string literals directly

  ### New return values

  - `data: T | undefined` — the resolved value, available when `status === "fulfilled"`
  - `error: unknown` — the thrown value, available when `status === "rejected"`
  - `loading: boolean` — shorthand for `status === "pending"`
  - `reset()` — resets back to `idle` and cancels any in-flight request

  ### State is now a discriminated union

  TypeScript narrows `data` and `error` correctly based on `status`:

  ```ts
  const { status, data, error } = useAsync(fetchUser);
  if (status === "fulfilled") console.log(data); // data: User
  if (status === "rejected") console.log(error); // error: unknown
  ```

  ### Migration

  ```ts
  // before
  const { run, state } = useAsync(fn, { manual: true });
  run(id);
  if (state === "fulfilled") {
    /* no data available */
  }

  // after
  const { trigger, status, data } = useAsync(fn);
  trigger(id);
  if (status === "fulfilled") {
    console.log(data);
  }
  ```

- 5954fbd: Design improvements and behavior corrections:

  - `useAsync`: `onSuccess`/`onError` callbacks now always use the latest reference — no more stale closures when callbacks change between renders. If you rely on callbacks being captured at mount time, wrap them in `useCallback`.
  - `EventContext`: subscriptions moved from `useState` to `useRef` — the Provider no longer re-renders on every `subscribe`/`unsubscribe` call, eliminating unnecessary cascading renders.
  - `useDelay`: `callback` is now stabilized internally via a ref — inline functions no longer cause the timer to reset on every render. The manual `runner` now returns a cancel function.
  - `castValue` (`useQueryParams`): falsy JSON values (`0`, `false`, `null`) are now correctly parsed from query params instead of being skipped.

- cfe3c1d: `useThrottle` now implements true leading-edge + trailing throttle semantics.

  Previously, every value change reset the delay timer (debounce-like behavior — all changes were always delayed). Now:

  - The **first** value change in a new throttle window passes through **immediately** (leading edge).
  - Subsequent rapid changes within the interval are held back and only the **last** value is applied after the remaining window time (trailing).

  **Migration:** If you relied on the previous behavior where the first change was always delayed, add an explicit `useDebounce` instead.

### Patch Changes

- 90a2dd7: Fix silent bugs across multiple hooks:

  - `useAsync`: fixed ref check (`!isMounted` → `!isMounted.current`) that caused `onSuccess`/`onError` to be called even after unmount; improved error message when `run()` is called without `manual: true`; removed unnecessary `getRunner` indirection
  - `useLocalStorage`: SSR guard is now synchronous (throws immediately instead of inside `useEffect`), making it catchable by React Error Boundaries
  - `EventContext`: replaced `Math.random()` with `crypto.randomUUID()` for collision-free subscription IDs

## 0.1.0

### Minor Changes

- 528c3f8: Adds EventContext
