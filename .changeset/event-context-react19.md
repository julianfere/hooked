---
"@julianfere/hooked": minor
---

EventContext:

- The provider renders `<Context value>` (React 19) instead of `<Context.Provider>`.
- Subscription ids use an incremental counter instead of `crypto.randomUUID()`, which is unavailable outside secure contexts (plain HTTP) and in older browsers.
- Clearer error when the event hook is used outside its provider.
