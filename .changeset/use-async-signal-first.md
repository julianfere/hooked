---
"@julianfere/hooked": major
---

**`useAsync`: the `AbortSignal` is now the first argument of `fn`.**

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
