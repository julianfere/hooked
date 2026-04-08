---
"@julianfere/hooked": minor
---

Simplify EventContext factory API: remove `createEventContext` step

The `factory()` function no longer returns `createEventContext`. The context is now created internally, so consumers only need two steps instead of three:

```ts
// Before
const { createEventContext, createEventProvider, createEventHook } = factory<AppEvents>();
const ctx = createEventContext();
const EventsProvider = createEventProvider(ctx);
const useEvents = createEventHook(ctx);

// After
const { createEventProvider, createEventHook } = factory<AppEvents>();
const EventsProvider = createEventProvider();
const useEvents = createEventHook();
```

Additional improvements: `subscribe` uses `push` (O(1)), `publish` and `subscribe` are stable via `useCallback`, and the context value is memoized with `useMemo`.
