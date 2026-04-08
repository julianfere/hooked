import { useState, useEffect } from "react";
import {
  useAsync,
  useDebounce,
  useThrottle,
  useDelay,
  useDocumentTitle,
  useLocalStorage,
  useQueryParams,
} from "@julianfere/hooked";
import { factory } from "@julianfere/hooked/events";

// ─── EventContext setup ────────────────────────────────────────────────────────
interface AppEvents {
  ping: { msg: string };
}
const { createEventContext, createEventProvider, createEventHook } =
  factory<AppEvents>();
const EventCtx = createEventContext();
const EventsProvider = createEventProvider(EventCtx);
const useEvents = createEventHook(EventCtx);

// ─── useAsync ─────────────────────────────────────────────────────────────────
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

function UseAsyncDemo() {
  const { data, status, loading, error, trigger, reset } = useAsync(
    (id: number, signal: AbortSignal) =>
      fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        signal,
      }).then((r) => r.json() as Promise<Todo>)
  );

  return (
    <section>
      <h2>useAsync</h2>
      <p>Status: <strong>{status}</strong></p>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "red" }}>Error: {String(error)}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <button onClick={() => trigger(1)} disabled={loading}>Fetch todo #1</button>{" "}
      <button onClick={() => trigger(2)} disabled={loading}>Fetch todo #2</button>{" "}
      <button onClick={reset}>Reset</button>
    </section>
  );
}

// ─── useAsync (immediate) ──────────────────────────────────────────────────────
function UseAsyncImmediateDemo() {
  const { data, status, loading } = useAsync(
    (signal: AbortSignal) =>
      fetch("https://jsonplaceholder.typicode.com/todos/3", { signal }).then(
        (r) => r.json() as Promise<Todo>
      ),
    { immediate: true }
  );

  return (
    <section>
      <h2>useAsync (immediate)</h2>
      <p>Status: <strong>{status}</strong></p>
      {loading && <p>Loading…</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </section>
  );
}

// ─── useDebounce ───────────────────────────────────────────────────────────────
function UseDebounceDemo() {
  const [input, setInput] = useState("");
  const debounced = useDebounce(input, 600);

  return (
    <section>
      <h2>useDebounce</h2>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type something…"
      />
      <p>Live: <strong>{input}</strong></p>
      <p>Debounced (600ms): <strong>{debounced}</strong></p>
    </section>
  );
}

// ─── useThrottle ───────────────────────────────────────────────────────────────
function UseThrottleDemo() {
  const [input, setInput] = useState("");
  const throttled = useThrottle(input, 800);

  return (
    <section>
      <h2>useThrottle</h2>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type fast…"
      />
      <p>Live: <strong>{input}</strong></p>
      <p>Throttled (800ms): <strong>{throttled}</strong></p>
    </section>
  );
}

// ─── useDelay ──────────────────────────────────────────────────────────────────
function UseDelayDemo() {
  const [msg, setMsg] = useState("Waiting…");

  const trigger = useDelay(() => setMsg("Fired after 1s!"), {
    delay: 1000,
    manual: true,
  });

  return (
    <section>
      <h2>useDelay</h2>
      <p>{msg}</p>
      <button onClick={() => { setMsg("Waiting…"); trigger?.(); }}>
        Trigger (1s delay)
      </button>
    </section>
  );
}

// ─── useDocumentTitle ──────────────────────────────────────────────────────────
function UseDocumentTitleDemo() {
  const [title, setTitle] = useState("Playground");
  useDocumentTitle(title);

  return (
    <section>
      <h2>useDocumentTitle</h2>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <p>Check the browser tab.</p>
    </section>
  );
}

// ─── useLocalStorage ───────────────────────────────────────────────────────────
interface Store {
  username: string;
  count: number;
}

function UseLocalStorageDemo() {
  const { getItem, setItem, removeItem, hasItem } = useLocalStorage<Store>();
  const [, rerender] = useState(0);
  const refresh = () => rerender((n) => n + 1);

  return (
    <section>
      <h2>useLocalStorage</h2>
      <p>Has "username": <strong>{String(hasItem("username"))}</strong></p>
      <p>username: <strong>{getItem("username") ?? "—"}</strong></p>
      <p>count: <strong>{getItem("count") ?? "—"}</strong></p>
      <button onClick={() => { setItem("username", "Alice"); refresh(); }}>Set username</button>{" "}
      <button onClick={() => { setItem("count", (getItem("count") ?? 0) + 1); refresh(); }}>
        Increment count
      </button>{" "}
      <button onClick={() => { removeItem("username"); refresh(); }}>Remove username</button>
    </section>
  );
}

// ─── useQueryParams ────────────────────────────────────────────────────────────
interface Params {
  q: string;
  page: number;
}

function UseQueryParamsDemo() {
  const { get, set, clear } = useQueryParams<Params>();
  const { q = "", page = 1 } = get("q", "page");

  return (
    <section>
      <h2>useQueryParams</h2>
      <input
        value={q}
        onChange={(e) => set({ q: e.target.value, page: 1 })}
        placeholder="Search…"
      />
      <p>q: <strong>{q || "—"}</strong> | page: <strong>{page}</strong></p>
      <button onClick={() => set({ page: Number(page) + 1 })}>Next page</button>{" "}
      <button onClick={clear}>Clear</button>
    </section>
  );
}

// ─── EventContext ──────────────────────────────────────────────────────────────
function Publisher() {
  const { publish } = useEvents();
  return (
    <button onClick={() => publish("ping", { msg: `Ping at ${new Date().toLocaleTimeString()}` })}>
      Publish ping
    </button>
  );
}

function Subscriber() {
  const { subscribe } = useEvents();
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    return subscribe("ping", ({ msg }) => setLog((prev) => [...prev, msg]));
  }, [subscribe]);

  return (
    <ul style={{ minHeight: 60 }}>
      {log.length === 0 && <li style={{ color: "#999" }}>No events yet</li>}
      {log.map((m, i) => <li key={i}>{m}</li>)}
    </ul>
  );
}

function EventContextDemo() {
  return (
    <section>
      <h2>EventContext</h2>
      <Publisher />
      <Subscriber />
    </section>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <EventsProvider>
      <div style={{ fontFamily: "sans-serif", maxWidth: 640, margin: "0 auto", padding: 24 }}>
        <h1>@julianfere/hooked — Playground</h1>
        <hr />
        <UseAsyncDemo />
        <hr />
        <UseAsyncImmediateDemo />
        <hr />
        <UseDebounceDemo />
        <hr />
        <UseThrottleDemo />
        <hr />
        <UseDelayDemo />
        <hr />
        <UseDocumentTitleDemo />
        <hr />
        <UseLocalStorageDemo />
        <hr />
        <UseQueryParamsDemo />
        <hr />
        <EventContextDemo />
      </div>
    </EventsProvider>
  );
}
