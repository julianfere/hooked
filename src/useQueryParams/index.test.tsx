import { beforeEach, describe, expect, it, expectTypeOf } from "vitest";
import { act, renderHook } from "@testing-library/react";

import useQueryParams from ".";
import { castValue } from "./utils";

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

const navigate = (url: string) => window.history.replaceState(null, "", url);

const currentUrl = () =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`;

describe("useQueryParams", () => {
  beforeEach(() => {
    navigate("/");
  });

  describe("get", () => {
    it("should return the correct query params", () => {
      navigate("/?foo=hello&baz=test");

      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      expect(result.current.get("foo", "baz")).toEqual({
        foo: "hello",
        baz: "test",
      });
    });

    it("should return query params with correspondig type", () => {
      navigate("/?foo=hello&bar=1&baz=test");

      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      const params = result.current.get("foo", "bar", "baz");

      expect(params).toEqual({ foo: "hello", bar: 1, baz: "test" });
      expectTypeOf(params).toEqualTypeOf<Partial<TestQueryParams>>();
    });

    it("should return empty object if no query params are found", () => {
      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      expect(result.current.get("foo", "bar", "baz")).toEqual({});
    });

    it("should return the correct query params when the value is an object", () => {
      navigate(`/?foo=${encodeURIComponent('{"bar":"test","baz":1}')}`);

      const { result } = renderHook(() =>
        useQueryParams<TestQueryParamsWithObject>()
      );

      const params = result.current.get("foo");

      expect(params).toEqual({ foo: { bar: "test", baz: 1 } });
      expectTypeOf(params).toEqualTypeOf<Partial<TestQueryParamsWithObject>>();
    });

    it("should return the correct query params when the value is an array", () => {
      navigate("/?foo=[1,2,3]");

      const { result } = renderHook(() =>
        useQueryParams<TestQueryParamsWithArray>()
      );

      const params = result.current.get("foo");

      expect(params).toEqual({ foo: [1, 2, 3] });
      expectTypeOf(params).toEqualTypeOf<Partial<TestQueryParamsWithArray>>();
    });

    it("should correctly parse falsy JSON values (0, false, null)", () => {
      interface FalsyParams {
        zero: number;
        flag: boolean;
        empty: null;
      }

      navigate("/?zero=0&flag=false&empty=null");

      const { result } = renderHook(() => useQueryParams<FalsyParams>());

      const params = result.current.get("zero", "flag", "empty");

      expect(params.zero).toBe(0);
      expect(params.flag).toBe(false);
      expect(params.empty).toBe(null);
    });
  });

  describe("set", () => {
    it("should set the correct query params", () => {
      navigate("/page");

      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      act(() => {
        result.current.set({ foo: "hello", bar: 1, baz: "test" });
      });

      expect(currentUrl()).toBe("/page?foo=hello&bar=1&baz=test");
    });

    it("should set the correct query params when the url is provided", () => {
      navigate("/page");

      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      act(() => {
        result.current.set({ foo: "hello", bar: 1, baz: "test" }, "/other");
      });

      expect(currentUrl()).toBe("/other?foo=hello&bar=1&baz=test");
    });

    it("should replace existing query params", () => {
      navigate("/page?foo=hello");

      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      act(() => {
        result.current.set({ foo: "bye", bar: 1 });
      });

      expect(currentUrl()).toBe("/page?foo=bye&bar=1");
    });

    it("should keep the hash", () => {
      navigate("/page?foo=hello#section");

      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      act(() => {
        result.current.set({ bar: 2 });
      });

      expect(currentUrl()).toBe("/page?bar=2#section");
    });

    it("should remove the query string when called with no params", () => {
      navigate("/page?foo=hello");

      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      act(() => {
        result.current.set({});
      });

      expect(currentUrl()).toBe("/page");
    });

    it("should re-render with the new search", () => {
      navigate("/page");

      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      act(() => {
        result.current.set({ foo: "hello" });
      });

      expect(result.current.search).toBe("?foo=hello");
      expect(result.current.get("foo")).toEqual({ foo: "hello" });
    });

    it("should notify every mounted instance", () => {
      navigate("/page");

      const first = renderHook(() => useQueryParams<TestQueryParams>());
      const second = renderHook(() => useQueryParams<TestQueryParams>());

      act(() => {
        first.result.current.set({ bar: 3 });
      });

      expect(second.result.current.search).toBe("?bar=3");
    });

    it("should be typed correctly", () => {
      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      expectTypeOf(result.current.set)
        .parameter(0)
        .toEqualTypeOf<Partial<TestQueryParams>>();
    });
  });

  describe("build", () => {
    it("should build the correct query params", () => {
      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      const params = result.current.build({ foo: "hello", bar: 1, baz: "test" });

      expect(params).toEqual("foo=hello&bar=1&baz=test");
      expectTypeOf(params).toEqualTypeOf<string>();
    });

    it("should skip null and undefined values", () => {
      const { result } = renderHook(() =>
        useQueryParams<{ foo?: string | null; bar?: number }>()
      );

      expect(result.current.build({ foo: null, bar: undefined })).toBe("");
      expect(result.current.build({ foo: null, bar: 2 })).toBe("bar=2");
    });

    it("should serialize objects and arrays as JSON", () => {
      const { result } = renderHook(() =>
        useQueryParams<TestQueryParamsWithArray>()
      );

      const query = result.current.build({ foo: [1, 2, 3] });

      expect(new URLSearchParams(query).get("foo")).toBe("[1,2,3]");
    });
  });

  describe("clear", () => {
    it("should clear the query params", () => {
      navigate("/page?foo=hello");

      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      act(() => {
        result.current.clear();
      });

      expect(currentUrl()).toBe("/page");
      expect(result.current.search).toBe("");
    });

    it("should keep the hash", () => {
      navigate("/page?foo=hello#section");

      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      act(() => {
        result.current.clear();
      });

      expect(currentUrl()).toBe("/page#section");
    });
  });

  describe("popstate", () => {
    it("should update when the browser navigates", () => {
      const { result } = renderHook(() => useQueryParams<TestQueryParams>());

      act(() => {
        navigate("/back?foo=hello");
        window.dispatchEvent(new PopStateEvent("popstate"));
      });

      expect(result.current.pathname).toBe("/back");
      expect(result.current.search).toBe("?foo=hello");
    });
  });
});

describe("castValue", () => {
  it("should keep whitespace-only strings as strings", () => {
    expect(castValue(" ")).toBe(" ");
  });

  it("should keep hex, exponent and leading-zero values as strings", () => {
    expect(castValue("0x10")).toBe("0x10");
    expect(castValue("1e5")).toBe("1e5");
    expect(castValue("007")).toBe("007");
  });

  it("should keep unsafe integers as strings", () => {
    expect(castValue("12345678901234567890")).toBe("12345678901234567890");
  });

  it("should parse regular numbers", () => {
    expect(castValue("42")).toBe(42);
    expect(castValue("-1.5")).toBe(-1.5);
  });
});
