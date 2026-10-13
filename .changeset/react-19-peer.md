---
"@julianfere/hooked": major
---

**React 19 is now required.** `react` moved from `dependencies` to `peerDependencies` with range `^19.0.0`; React 18 is no longer supported.

Previously `react` was declared as a regular dependency, which could install a second copy of React in consumer apps and cause "Invalid hook call" errors. Now the library always uses the host app's React.

```bash
pnpm add react@^19 react-dom@^19
```
