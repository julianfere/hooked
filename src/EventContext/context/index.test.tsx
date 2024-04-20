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

  it("should return an object with createEventContext, createEventProvider and createEventHook", () => {
    expect(factories).toMatchObject({
      createEventContext: expect.any(Function),
      createEventProvider: expect.any(Function),
      createEventHook: expect.any(Function),
    });
  });

  describe("createEventContext", () => {
    let context: ReturnType<typeof factories.createEventContext>;

    beforeAll(() => {
      context = factories.createEventContext();
    });

    it("should return a context", () => {
      expect(context).toBeDefined();
    });
  });

  describe("createEventProvider", () => {
    let context: ReturnType<typeof factories.createEventContext>;
    let createEventProvider: ReturnType<typeof factories.createEventProvider>;

    beforeAll(() => {
      context = factories.createEventContext();
      createEventProvider = factories.createEventProvider(context);
    });

    it("should return a provider", () => {
      expect(createEventProvider).toBeInstanceOf(Function);
    });
  });

  describe("createEventHook", () => {
    let context: ReturnType<typeof factories.createEventContext>;
    let createEventHook: ReturnType<typeof factories.createEventHook>;

    beforeAll(() => {
      context = factories.createEventContext();
      createEventHook = factories.createEventHook(context);
    });

    it("should return a hook", () => {
      expect(createEventHook).toBeInstanceOf(Function);
    });
  });
});

describe("createEventProvider", () => {
  let factories: ReturnType<typeof createFactories<ITestEvents>>;
  let context: ReturnType<typeof factories.createEventContext>;
  let Provider: ReturnType<typeof factories.createEventProvider>;

  beforeAll(() => {
    factories = createFactories<ITestEvents>();
    context = factories.createEventContext();
    Provider = factories.createEventProvider(context);
  });

  it("should return a provider", () => {
    expect(Provider).toBeInstanceOf(Function);
  });
});

describe("createEventHook", () => {
  let factories: ReturnType<typeof createFactories<ITestEvents>>;
  let context: ReturnType<typeof factories.createEventContext>;
  let useEvents: ReturnType<typeof factories.createEventHook>;
  let Provider: ReturnType<typeof factories.createEventProvider>;

  beforeAll(() => {
    factories = createFactories<ITestEvents>();
    context = factories.createEventContext();
    useEvents = factories.createEventHook(context);
    Provider = factories.createEventProvider(context);
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
