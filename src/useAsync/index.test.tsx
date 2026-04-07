import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import useAsync from ".";

describe("useAsync", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("return runner and state", () => {
    const asyncFunction = (arg: string) => Promise.resolve(arg);

    const { result } = renderHook(() =>
      useAsync((arg: string) => asyncFunction(arg))
    );

    expect(result.current.run).toBeDefined();
    expect(result.current.state).toBeDefined();
  });

  it("should return idle when manual is true and the runner is not called", async () => {
    const asyncFunction = (arg: string) => Promise.resolve(arg);

    const { result } = renderHook(() =>
      useAsync((arg: string) => asyncFunction(arg), { manual: true })
    );

    expect(result.current.state).toBe("idle");
  });

  it("should trun the async function and return the correct status", async () => {
    const asyncFunction = (arg: string) =>
      new Promise<string>((resolve) => setTimeout(() => resolve(arg), 1000));

    const { result } = renderHook(() =>
      useAsync((arg: string) => asyncFunction(arg), { manual: true })
    );

    await act(async () => {
      result.current.run("test");
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.state).toBe("fulfilled");
  });

  it('should return "pending" when the async function is running', async () => {
    const asyncFunction = (arg: string) =>
      new Promise<string>((resolve) => setTimeout(() => resolve(arg), 1000));

    const { result } = renderHook(() =>
      useAsync((arg: string) => asyncFunction(arg), { manual: true })
    );
    await act(async () => {
      result.current.run("test");
    });
    expect(result.current.state).toBe("pending");
  });

  it("should throw an error when the runner is called and manual is false", () => {
    const asyncFunction = (arg: string) => Promise.resolve(arg);

    const { result } = renderHook(() =>
      useAsync((arg: string) => asyncFunction(arg))
    );

    expect(() => result.current.run("test")).toThrowError(
      "run() is only available when the manual option is set to true"
    );
  });

  it("should call the onSuccess handler when the async function resolves", async () => {
    const asyncFunction = () => Promise.resolve("Success");
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useAsync(() => asyncFunction(), {
        onSuccess: (data) => onSuccess(data),
        manual: true,
      })
    );

    await act(async () => {
      result.current.run();
      vi.advanceTimersByTime(1000);
    });

    expect(onSuccess).toBeCalledWith("Success");
    expect(result.current.state).toBe("fulfilled");
  });

  it("should call the latest onSuccess callback even after rerender", async () => {
    const onSuccessV1 = vi.fn();
    const onSuccessV2 = vi.fn();

    const { rerender, result } = renderHook(
      ({ cb }) =>
        useAsync(() => Promise.resolve("data"), { onSuccess: cb, manual: true }),
      { initialProps: { cb: onSuccessV1 } }
    );

    rerender({ cb: onSuccessV2 });

    await act(async () => {
      result.current.run();
      vi.advanceTimersByTime(1000);
    });

    expect(onSuccessV1).not.toHaveBeenCalled();
    expect(onSuccessV2).toHaveBeenCalledWith("data");
  });

  it("should not call onSuccess after unmount", async () => {
    const onSuccess = vi.fn();

    const { unmount } = renderHook(() =>
      useAsync(() => Promise.resolve("data"), { onSuccess, manual: true })
    );

    unmount();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("should call the onError handler when the async function rejects", async () => {
    const asyncFunction = () => Promise.reject("Error");
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useAsync(() => asyncFunction(), {
        onError: (error) => onError(error),
        manual: true,
      })
    );

    await act(async () => {
      result.current.run();
      vi.advanceTimersByTime(1000);
    });

    expect(onError).toBeCalledWith("Error");
    expect(result.current.state).toBe("rejected");
  });
});
