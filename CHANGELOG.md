# @julianfere/hooked

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
