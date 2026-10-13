---
"@julianfere/hooked": patch
---

Bug fixes:

- `useDebounce`: a `delay` of `0` is now respected (it used to fall back to 500 ms).
- `useDelay`: timers scheduled with the manual runner are cleared on unmount; the runner now always returns a cancel function and is stable between renders.
- `useQueryParams`:
  - Rewritten on top of `useSyncExternalStore`; every mounted instance re-renders on `set`, `clear` and browser navigation (no more module-level listener array).
  - `build` skips `null`/`undefined` values instead of throwing, and serializes objects/arrays as JSON so they round-trip with `get`.
  - `set({})` removes the query string instead of doing nothing.
  - `set` and `clear` keep the URL hash.
  - `get` no longer casts whitespace, hex (`0x10`), exponent (`1e5`), leading-zero (`007`) or unsafe integer values to numbers.
- `useLocalStorage`: `getItem` returns `null` for values that are not valid JSON instead of throwing, and `hasItem` reports items stored as an empty string as existing.
