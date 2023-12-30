import { describe, expect, it, expectTypeOf, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import useQueryParams from ".";

interface TestQueryParams {
  foo: string;
  bar: number;
  baz: string;
}

interface TestQueryParamsWithObject {
  foo: {
    bar: string;
    baz: number;
  };
}

interface TestQueryParamsWithArray {
  foo: number[];
}

const originalLocation = window;

describe("useQueryParams", () => {
  afterEach(() => {
    Object.defineProperty(globalThis, "window", {
      value: originalLocation,
    });
  });

  describe("get", () => {
    it("should return the correct query params", () => {
      Object.defineProperty(window, "location", {
        value: { search: "?foo=hello&baz=test" },
      });

      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      const params = result.current.get("foo", "baz");

      expect(params).toEqual({
        foo: "hello",
        baz: "test",
      });
    });

    it("should return query params with correspondig type", () => {
      Object.defineProperty(window, "location", {
        value: { search: "?foo=hello&bar=1&baz=test" },
      });

      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      const params = result.current.get("foo", "bar", "baz");

      expect(params).toEqual({
        foo: "hello",
        bar: 1,
        baz: "test",
      });

      expectTypeOf(params).toEqualTypeOf<Partial<TestQueryParams>>();
    });

    it("should return empty object if no query params are found", () => {
      Object.defineProperty(window, "location", {
        value: { search: "" },
      });

      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      const params = result.current.get("foo", "bar", "baz");

      expect(params).toEqual({});
    });

    it("should return the correct query params when the value is an object", () => {
      Object.defineProperty(window, "location", {
        value: { search: '?foo={"bar":"test","baz":1}' },
      });

      const { result } = renderHook(() =>
        useQueryParams<TestQueryParamsWithObject>()
      );

      const params = result.current.get("foo");

      expect(params).toEqual({
        foo: {
          bar: "test",
          baz: 1,
        },
      });

      expectTypeOf(params).toEqualTypeOf<Partial<TestQueryParamsWithObject>>();
    });

    it("should return the correct query params when the value is an array", () => {
      Object.defineProperty(window, "location", {
        value: { search: "?foo=[1,2,3]" },
      });

      const { result } = renderHook(() =>
        useQueryParams<TestQueryParamsWithArray>()
      );

      const params = result.current.get("foo");

      expect(params).toEqual({
        foo: [1, 2, 3],
      });

      expectTypeOf(params).toEqualTypeOf<Partial<TestQueryParamsWithArray>>();
    });
  });

  describe("set", () => {
    it("should set the correct query params", () => {
      const mockpushState = vi.fn();

      Object.defineProperties(window, {
        location: {
          value: { href: "http://test.com" },
        },
        history: {
          value: {
            pushState: mockpushState,
          },
        },
      });

      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      result.current.set({
        foo: "hello",
        bar: 1,
        baz: "test",
      });

      expect(mockpushState).toHaveBeenCalledWith(
        {},
        "",
        "http://test.com?foo=hello&bar=1&baz=test"
      );
    });

    it("should set the correct query params when the url is provided", () => {
      const mockpushState = vi.fn();

      Object.defineProperties(window, {
        location: {
          value: { href: "http://test.com" },
        },
        history: {
          value: {
            pushState: mockpushState,
          },
        },
      });

      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      result.current.set(
        {
          foo: "hello",
          bar: 1,
          baz: "test",
        },
        "http://anothertest.com"
      );

      expect(mockpushState).toHaveBeenCalledWith(
        {},
        "",
        "http://anothertest.com?foo=hello&bar=1&baz=test"
      );
    });

    it("should set the correct query params when the url has existing query params", () => {
      const mockpushState = vi.fn();

      Object.defineProperties(window, {
        location: {
          value: { href: "http://test.com?foo=hello" },
        },
        history: {
          value: {
            pushState: mockpushState,
          },
        },
      });

      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      result.current.set({
        foo: "hello",
        bar: 1,
        baz: "test",
      });

      expect(mockpushState).toHaveBeenCalledWith(
        {},
        "",
        "http://test.com?foo=hello&bar=1&baz=test"
      );
    });

    it("should set the correct query params when the url has existing query params and the url is provided", () => {
      const mockpushState = vi.fn();

      Object.defineProperties(window, {
        location: {
          value: { href: "http://test.com?foo=hello" },
        },
        history: {
          value: {
            pushState: mockpushState,
          },
        },
      });

      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      result.current.set(
        {
          foo: "hello",
          bar: 1,
          baz: "test",
        },
        "http://anothertest.com"
      );

      expect(mockpushState).toHaveBeenCalledWith(
        {},
        "",
        "http://anothertest.com?foo=hello&bar=1&baz=test"
      );
    });

    it("should be typed correctly", () => {
      const mockpushState = vi.fn();

      Object.defineProperties(window, {
        location: {
          value: { href: "http://test.com?foo=hello" },
        },
        history: {
          value: {
            pushState: mockpushState,
          },
        },
      });

      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      result.current.set({
        foo: "hello",
        bar: 1,
        baz: "test",
      });

      expectTypeOf(result.current.set)
        .parameter(0)
        .toEqualTypeOf<Partial<TestQueryParams>>();
    });
  });

  describe("build", () => {
    it("should build the correct query params", () => {
      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      const params = result.current.build({
        foo: "hello",
        bar: 1,
        baz: "test",
      });

      expect(params).toEqual("foo=hello&bar=1&baz=test");
    });

    it("should be typed correctly", () => {
      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      const params = result.current.build({
        foo: "hello",
        bar: 1,
        baz: "test",
      });

      expectTypeOf(params).toEqualTypeOf<string>();
    });
  });
});
