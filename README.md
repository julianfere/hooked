<a id="readme-top"></a>

<br />
<div align="center">
<h3 align="center">Hooked 🪝</h3>

  <p align="center">
    A type safe, functional, and easy to use utility library for React Hooks.
    <br />
    <a href="https://julianfere.github.io/hooked"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/julianfere/hooked/issues">Report Bug</a>
    ·
    <a href="https://github.com/julianfere/hooked/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<section id="table-of-content">
 <h2>Table of Contents</h2>
  <ul>
    <li><a href="#about-the-project">About The Project</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li>
      <a href="#hooks">Hooks</a>
      <ul>
        <li><a href="#useasync">useAsync</a></li>
        <li><a href="#usedebounce">useDebounce</a></li>
        <li><a href="#usethrottle">useThrottle</a></li>
        <li><a href="#uselocalstorage">useLocalStorage</a></li>
        <li><a href="#usedelay">useDelay</a></li>
        <li><a href="#usedocumenttitle">useDocumentTitle</a></li>
        <li><a href="#usequeryparams">useQueryParams</a></li>
      </ul>
    </li>
    <li>
      <a href="#hooks-with-context">Hooks with context</a>
      <ul>
        <li><a href="#eventcontext">EventContext</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
</section>

<!-- ABOUT THE PROJECT -->

## About The Project

This project is a collection of React Hooks that I have found useful in my own projects. I hope you find them useful as well! The idea is to build a library of hooks that are easy to use, type safe, and functional.

<!-- GETTING STARTED -->

## Getting Started

### Installation

```sh
npm i @julianfere/hooked
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- HOOKS -->

## useAsync

<h4>Overview</h4>
<p>Manages the full lifecycle of an async function — idle, pending, fulfilled, and rejected — with built-in abort handling and optional auto-execution.</p>
<br/>

<h4>Example</h4>

```typescript
import { useAsync } from "@julianfere/hooked";

const MyComponent = () => {
  const { data, status, loading, error, trigger, reset } = useAsync(
    (signal: AbortSignal) =>
      fetch("https://api.example.com/data", { signal }).then((r) => r.json())
  );

  return (
    <>
      {loading && <p>Loading...</p>}
      {status === "fulfilled" && <pre>{JSON.stringify(data, null, 2)}</pre>}
      {status === "rejected" && <p>Error!</p>}
      <button onClick={() => trigger()} disabled={loading}>Fetch</button>
      <button onClick={reset}>Reset</button>
    </>
  );
};

// Auto-execute on mount
const AutoExample = () => {
  const { data, loading } = useAsync(
    (signal: AbortSignal) =>
      fetch("https://api.example.com/data", { signal }).then((r) => r.json()),
    { immediate: true }
  );

  return loading ? <p>Loading...</p> : <pre>{JSON.stringify(data, null, 2)}</pre>;
};
```

<h4>API</h4>

```typescript
const { trigger, reset, status, data, error, loading } = useAsync(fn, options);
```

`fn`: The async function to run. Receives an `AbortSignal` as the last argument.

**Options**:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `immediate` | `boolean` | `false` | Run `fn` automatically on mount |
| `onSuccess` | `(data: T) => void` | — | Called when the promise resolves |
| `onError` | `(error: unknown) => void` | — | Called when the promise rejects |

**Returned Values**:

| Property | Type | Description |
|----------|------|-------------|
| `status` | `"idle" \| "pending" \| "fulfilled" \| "rejected"` | Current lifecycle state |
| `data` | `T \| undefined` | Resolved value |
| `error` | `unknown \| undefined` | Rejection reason |
| `loading` | `boolean` | `true` while `status === "pending"` |
| `trigger` | `(...args) => Promise<void>` | Manually fire the async function |
| `reset` | `() => void` | Reset state back to `idle` |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## useDebounce

<h4>Overview</h4>
<p>Returns a debounced copy of a value — the copy only updates after the specified delay has elapsed since the last change.</p>
<br/>

<h4>Example</h4>

```typescript
import { useState, useEffect } from "react";
import { useDebounce } from "@julianfere/hooked";

const BasicExample = () => {
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => { makeApiCall(debouncedValue); }, [debouncedValue]);

  return (
    <>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p>Debounced value: {debouncedValue}</p>
    </>
  );
};
```

<h4>API</h4>

```typescript
const debouncedValue = useDebounce(value, delay);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | `T` | — | The value to debounce |
| `delay` | `number` | `500` | Milliseconds to wait after the last change |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## useThrottle

<h4>Overview</h4>
<p>Returns a throttled copy of a value. The first change within an interval passes through immediately, and the last change within that window is emitted at the end of the interval.</p>
<br/>

<h4>Example</h4>

```typescript
import { useState, useEffect } from "react";
import { useThrottle } from "@julianfere/hooked";

const BasicExample = () => {
  const [value, setValue] = useState("");
  const throttledValue = useThrottle(value, 500);

  useEffect(() => { makeApiCall(throttledValue); }, [throttledValue]);

  return (
    <>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p>Throttled value: {throttledValue}</p>
    </>
  );
};
```

<h4>API</h4>

```typescript
const throttledValue = useThrottle(value, interval);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | `T` | — | The value to throttle |
| `interval` | `number` | `500` | Window size in milliseconds |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## useLocalStorage

<h4>Overview</h4>
<p>Provides fully typed access to <code>localStorage</code> with automatic JSON serialisation and deserialisation.</p>
<br/>

<h4>Example</h4>

```typescript
import { useLocalStorage } from "@julianfere/hooked";

interface MyStorage {
  name: string;
  age: number;
}

const BasicExample = () => {
  const { getItem, setItem, removeItem, hasItem, clear } = useLocalStorage<MyStorage>();

  return (
    <>
      <p>Has name: {String(hasItem("name"))}</p>
      <p>Name: {getItem("name") ?? "—"}</p>
      <button onClick={() => setItem("name", "Alice")}>Set name</button>
      <button onClick={() => removeItem("name")}>Remove name</button>
      <button onClick={clear}>Clear all</button>
    </>
  );
};
```

<h4>API</h4>

```typescript
const { getItem, setItem, removeItem, hasItem, clear } = useLocalStorage<T>();
```

`T`: Your storage schema as a generic for full type safety.

**Returned Values**:

| Method | Description |
|--------|-------------|
| `getItem(key)` | Returns the typed value or `null` if not set |
| `setItem(key, value)` | Serialises and stores the value |
| `removeItem(key)` | Removes the key from storage |
| `hasItem(key)` | Returns `true` if the key exists |
| `clear()` | Removes all keys from storage |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## useDelay

<h4>Overview</h4>
<p>Executes a callback after a configurable delay. Supports both automatic execution on mount and manual trigger mode.</p>
<br/>

<h4>Example</h4>

```typescript
import { useState } from "react";
import { useDelay } from "@julianfere/hooked";

const BasicExample = () => {
  const [message, setMessage] = useState("Waiting…");

  const trigger = useDelay(
    () => setMessage("Fired after 1 second!"),
    { delay: 1000, manual: true }
  );

  return (
    <>
      <p>{message}</p>
      <button onClick={() => { setMessage("Waiting…"); trigger?.(); }}>
        Run delay
      </button>
    </>
  );
};
```

<h4>API</h4>

```typescript
const trigger = useDelay(callback, options);
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `delay` | `number` | `250` | Milliseconds before the callback fires |
| `manual` | `boolean` | `false` | When `true`, returns a trigger function instead of auto-executing |

**Returned Value**: A trigger function when `manual: true`, otherwise a no-op.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## useDocumentTitle

<h4>Overview</h4>
<p>Sets <code>document.title</code> declaratively and restores the original title on unmount.</p>
<br/>

<h4>Example</h4>

```typescript
import { useDocumentTitle } from "@julianfere/hooked";

const BasicExample = () => {
  useDocumentTitle("My Page Title");

  return <p>Document title has been updated.</p>;
};
```

<h4>API</h4>

```typescript
useDocumentTitle(title, persistOnUnmount);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `title` | `string` | — | The new title for the document |
| `persistOnUnmount` | `boolean` | `false` | When `true`, the title is not restored on unmount |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## useQueryParams

<h4>Overview</h4>
<p>Read and write URL query parameters with full type safety. Automatically stays in sync with browser navigation.</p>
<br/>

<h4>Example</h4>

```typescript
import { useQueryParams } from "@julianfere/hooked";

interface SearchParams {
  q: string;
  page: number;
}

const SearchPage = () => {
  const { get, set, clear } = useQueryParams<SearchParams>();
  const { q = "", page = 1 } = get("q", "page");

  return (
    <div>
      <input value={q} onChange={(e) => set({ q: e.target.value, page: 1 })} />
      <button onClick={() => set({ page: page + 1 })}>Next page</button>
      <button onClick={clear}>Clear filters</button>
    </div>
  );
};
```

<h4>API</h4>

```typescript
const { get, set, build, clear, pathname, search } = useQueryParams<T>();
```

| Method / Property | Description |
|-------------------|-------------|
| `get(...keys)` | Returns an object with the requested params, auto-casting to `boolean`, `number`, or parsed JSON |
| `set(params, url?)` | Pushes updated params to the URL |
| `build(params)` | Returns a query string without navigating |
| `clear()` | Removes all query params from the URL |
| `pathname` | Current `location.pathname` |
| `search` | Current `location.search` |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- CONTEXT -->

## Hooks with context

## EventContext

<h4>Overview</h4>
<p>A factory function that creates a fully typed pub/sub event system backed by React Context. Import it from the dedicated entry point.</p>
<br/>

<h4>Example</h4>

```typescript
import { factory } from "@julianfere/hooked/events";

interface AppEvents {
  userLoggedIn: { id: string; name: string };
  userLoggedOut: never;
  cartUpdated: { itemCount: number };
}

const { createEventProvider, createEventHook } = factory<AppEvents>();

export const EventsProvider = createEventProvider();
export const useEvents = createEventHook();

// Wrap your app
const App = () => (
  <EventsProvider>
    <UserComponent />
    <NotificationComponent />
  </EventsProvider>
);

// Publish events
const UserComponent = () => {
  const { publish } = useEvents();

  return (
    <button onClick={() => publish("userLoggedIn", { id: "1", name: "Alice" })}>
      Log in
    </button>
  );
};

// Subscribe to events
const NotificationComponent = () => {
  const { subscribe } = useEvents();

  useEffect(() => {
    return subscribe("userLoggedIn", ({ name }) => {
      console.log(`Welcome, ${name}!`);
    });
  }, [subscribe]);

  return <nav>…</nav>;
};
```

<h4>API</h4>

```typescript
const { createEventProvider, createEventHook } = factory<AppEvents>();
```

| Function | Description |
|----------|-------------|
| `createEventProvider()` | Returns a provider component to wrap your tree |
| `createEventHook()` | Returns the hook for use in components |

**Hook API**:

```typescript
const { publish, subscribe } = useEvents();
```

| Method | Description |
|--------|-------------|
| `publish(event, payload)` | Emits an event to all current subscribers |
| `subscribe(event, callback)` | Registers a listener. Returns an unsubscribe function |

`useEvents()` throws if called outside of its `EventsProvider`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Project Link: [https://github.com/julianfere/hooked](https://github.com/julianfere/hooked)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
