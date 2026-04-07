---
"@julianfere/hooked": patch
---

Fix silent bugs across multiple hooks:

- `useAsync`: fixed ref check (`!isMounted` → `!isMounted.current`) that caused `onSuccess`/`onError` to be called even after unmount; improved error message when `run()` is called without `manual: true`; removed unnecessary `getRunner` indirection
- `useLocalStorage`: SSR guard is now synchronous (throws immediately instead of inside `useEffect`), making it catchable by React Error Boundaries
- `EventContext`: replaced `Math.random()` with `crypto.randomUUID()` for collision-free subscription IDs
