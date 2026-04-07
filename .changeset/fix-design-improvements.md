---
"@julianfere/hooked": minor
---

Design improvements and behavior corrections:

- `useAsync`: `onSuccess`/`onError` callbacks now always use the latest reference — no more stale closures when callbacks change between renders. If you rely on callbacks being captured at mount time, wrap them in `useCallback`.
- `EventContext`: subscriptions moved from `useState` to `useRef` — the Provider no longer re-renders on every `subscribe`/`unsubscribe` call, eliminating unnecessary cascading renders.
- `useDelay`: `callback` is now stabilized internally via a ref — inline functions no longer cause the timer to reset on every render. The manual `runner` now returns a cancel function.
- `castValue` (`useQueryParams`): falsy JSON values (`0`, `false`, `null`) are now correctly parsed from query params instead of being skipped.
