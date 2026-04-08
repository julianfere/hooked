import { beforeAll, describe, expect, it, vi } from "vitest";

import { createFactories } from "./index";
import { act, renderHook } from "@testing-library/react";

interface ITestEvents {
  test: string;
  other: string;
}

describe("createFactories", () => {
  let factories: ReturnType<typeof createFactories<ITestEvents>>;

  beforeAll(() => {
    factories = createFactories<ITestEvents>();
  });

  it("should return an object with createEventProvider and createEventHook", () => {
    expect(factories).toMatchObject({
      createEventProvider: expect.any(Function),
      createEventHook: expect.any(Function),
    });
  });

  describe("createEventProvider", () => {
    let createEventProvider: ReturnType<typeof factories.createEventProvider>;

    beforeAll(() => {
      createEventProvider = factories.createEventProvider();
    });

    it("should return a provider", () => {
      expect(createEventProvider).toBeInstanceOf(Function);
    });
  });

  describe("createEventHook", () => {
    let createEventHook: ReturnType<typeof factories.createEventHook>;

    beforeAll(() => {
      createEventHook = factories.createEventHook();
    });

    it("should return a hook", () => {
      expect(createEventHook).toBeInstanceOf(Function);
    });
  });
});

describe("createEventProvider", () => {
  let factories: ReturnType<typeof createFactories<ITestEvents>>;
  let Provider: ReturnType<typeof factories.createEventProvider>;

  beforeAll(() => {
    factories = createFactories<ITestEvents>();
    Provider = factories.createEventProvider();
  });

  it("should return a provider", () => {
    expect(Provider).toBeInstanceOf(Function);
  });
});

describe("createEventHook", () => {
  let factories: ReturnType<typeof createFactories<ITestEvents>>;
  let useEvents: ReturnType<typeof factories.createEventHook>;
  let Provider: ReturnType<typeof factories.createEventProvider>;

  beforeAll(() => {
    factories = createFactories<ITestEvents>();
    useEvents = factories.createEventHook();
    Provider = factories.createEventProvider();
  });

  it("should return a hook", () => {
    expect(useEvents).toBeInstanceOf(Function);
  });

  describe("useEvents", () => {
    it("should throw an error if used outside of EventProvider", () => {
      expect(() => useEvents()).toThrowError();
    });

    it("should return the context value", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider>{children}</Provider>
      );

      const { result } = renderHook(() => useEvents(), { wrapper });

      expect(result.current).toMatchObject({
        subscribe: expect.any(Function),
        publish: expect.any(Function),
      });
    });

    it("should call the callback when an event is published", () => {
      const callback = vi.fn();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider>{children}</Provider>
      );

      let unsubscribe = null;

      const { result } = renderHook(() => useEvents(), { wrapper });

      act(() => (unsubscribe = result.current.subscribe("test", callback)));

      result.current.publish("test", "data");

      expect(callback).toHaveBeenCalledWith("data");
      expect(unsubscribe).toBeInstanceOf(Function);
    });

    it("should not call the callback when an event is published with a different name", () => {
      const callback = vi.fn();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider>{children}</Provider>
      );

      let unsubscribe = null;

      const { result } = renderHook(() => useEvents(), { wrapper });

      act(() => (unsubscribe = result.current.subscribe("test", callback)));

      result.current.publish("other", "data");

      expect(callback).not.toHaveBeenCalled();
      expect(unsubscribe).toBeInstanceOf(Function);
    });

    it("should not call the callback after unsubscribing", () => {
      const callback = vi.fn();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider>{children}</Provider>
      );

      let unsubscribe = () => {};

      const { result } = renderHook(() => useEvents(), { wrapper });

      act(() => (unsubscribe = result.current.subscribe("test", callback)));

      result.current.publish("test", "data");

      expect(callback).toHaveBeenCalledWith("data");

      act(() => unsubscribe());

      result.current.publish("test", "data");

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});

describe("EventContext edge cases", () => {
  let factories: ReturnType<typeof createFactories<ITestEvents>>;
  let Provider: ReturnType<typeof factories.createEventProvider>;
  let useEvents: ReturnType<typeof factories.createEventHook>;

  beforeAll(() => {
    factories = createFactories<ITestEvents>();
    Provider = factories.createEventProvider();
    useEvents = factories.createEventHook();
  });

  it("should call all callbacks when multiple subscribers exist for the same event", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider>{children}</Provider>
    );

    const { result } = renderHook(() => useEvents(), { wrapper });

    act(() => {
      result.current.subscribe("test", callback1);
      result.current.subscribe("test", callback2);
    });

    result.current.publish("test", "data");

    expect(callback1).toHaveBeenCalledWith("data");
    expect(callback2).toHaveBeenCalledWith("data");
  });

  it("should accept a new subscription after unsubscribing", () => {
    const callback = vi.fn();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider>{children}</Provider>
    );

    let unsubscribe = () => {};

    const { result } = renderHook(() => useEvents(), { wrapper });

    act(() => (unsubscribe = result.current.subscribe("test", callback)));
    act(() => unsubscribe());

    act(() => result.current.subscribe("test", callback));

    result.current.publish("test", "data");

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should not throw when publishing with no subscribers", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider>{children}</Provider>
    );

    const { result } = renderHook(() => useEvents(), { wrapper });

    expect(() => result.current.publish("test", "data")).not.toThrow();
  });
});
