---
"@julianfere/hooked": minor
---

`useDocumentTitle` is deprecated and will be removed in 2.0. React 19 supports rendering `<title>` from any component and hoists it into `<head>`:

```tsx
// Before
useDocumentTitle(`Inbox (${count})`);

// After
return (
  <>
    <title>{`Inbox (${count})`}</title>
    ...
  </>
);
```

The hook keeps working and logs a one-time warning outside production.
