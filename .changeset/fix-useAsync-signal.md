---
"@julianfere/hooked": patch
---

fix: pass AbortSignal directly instead of wrapped object in useAsync

The `trigger` function was passing `{ signal: controller.signal }` as the last argument to the async function, instead of the `AbortSignal` itself. This caused a `TypeError` when users passed the signal directly to `fetch` (e.g. `fetch(url, { signal })`).
