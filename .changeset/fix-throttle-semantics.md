---
"@julianfere/hooked": minor
---

`useThrottle` now implements true leading-edge + trailing throttle semantics.

Previously, every value change reset the delay timer (debounce-like behavior — all changes were always delayed). Now:
- The **first** value change in a new throttle window passes through **immediately** (leading edge).
- Subsequent rapid changes within the interval are held back and only the **last** value is applied after the remaining window time (trailing).

**Migration:** If you relied on the previous behavior where the first change was always delayed, add an explicit `useDebounce` instead.
