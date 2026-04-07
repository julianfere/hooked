---
"@julianfere/hooked": minor
---

**`useAsync` overhaul** — richer API, proper state machine, no more stale closures.

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
if (status === "rejected")  console.log(error); // error: unknown
```

### Migration

```ts
// before
const { run, state } = useAsync(fn, { manual: true });
run(id);
if (state === "fulfilled") { /* no data available */ }

// after
const { trigger, status, data } = useAsync(fn);
trigger(id);
if (status === "fulfilled") { console.log(data); }
```
