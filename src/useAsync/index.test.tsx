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

  it("returns trigger, reset, status, data, error and loading", () => {
    const { result } = renderHook(() =>
      useAsync((arg: string) => Promise.resolve(arg))
    );

    expect(result.current.trigger).toBeInstanceOf(Function);
    expect(result.current.reset).toBeInstanceOf(Function);
    expect(result.current.status).toBe("idle");
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(result.current.loading).toBe(false);
  });

  it("starts in idle state", () => {
    const { result } = renderHook(() =>
      useAsync((arg: string) => Promise.resolve(arg))
    );

    expect(result.current.status).toBe("idle");
  });

  it("transitions to pending while running", async () => {
    const asyncFunction = (arg: string) =>
      new Promise<string>((resolve) => setTimeout(() => resolve(arg), 1000));

    const { result } = renderHook(() => useAsync(asyncFunction));

    await act(async () => {
      result.current.trigger("test");
    });

    expect(result.current.status).toBe("pending");
    expect(result.current.loading).toBe(true);
  });

  it("transitions to fulfilled and exposes data", async () => {
    const asyncFunction = (arg: string) =>
      new Promise<string>((resolve) => setTimeout(() => resolve(arg), 1000));

    const { result } = renderHook(() => useAsync(asyncFunction));

    await act(async () => {
      result.current.trigger("hello");
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.status).toBe("fulfilled");
    expect(result.current.data).toBe("hello");
    expect(result.current.error).toBeUndefined();
    expect(result.current.loading).toBe(false);
  });

  it("transitions to rejected and exposes error", async () => {
    const asyncFunction = () => Promise.reject(new Error("boom"));

    const { result } = renderHook(() => useAsync(asyncFunction));

    await act(async () => {
      result.current.trigger();
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.status).toBe("rejected");
    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe("boom");
    expect(result.current.data).toBeUndefined();
    expect(result.current.loading).toBe(false);
  });

  it("resets back to idle state", async () => {
    const asyncFunction = () => Promise.resolve("data");

    const { result } = renderHook(() => useAsync(asyncFunction));

    await act(async () => {
      result.current.trigger();
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.status).toBe("fulfilled");

    act(() => result.current.reset());

    expect(result.current.status).toBe("idle");
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it("cancels a previous in-flight request when trigger is called again", async () => {
    let callCount = 0;
    const asyncFunction = () =>
      new Promise<number>((resolve) =>
        setTimeout(() => resolve(++callCount), 1000)
      );

    const { result } = renderHook(() => useAsync(asyncFunction));

    await act(async () => {
      result.current.trigger(); // first call
    });

    await act(async () => {
      result.current.trigger(); // cancels first, starts second
      vi.advanceTimersByTime(1000);
    });

    // Only the second result should land
    expect(result.current.status).toBe("fulfilled");
    expect(result.current.data).toBe(2);
  });

  it("runs automatically on mount when immediate is true", async () => {
    const asyncFunction = () => Promise.resolve("auto");

    const { result } = renderHook(() =>
      useAsync(asyncFunction, { immediate: true })
    );

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.status).toBe("fulfilled");
    expect(result.current.data).toBe("auto");
  });

  it("calls onSuccess with the result", async () => {
    const onSuccess = vi.fn();
    const asyncFunction = () => Promise.resolve("value");

    const { result } = renderHook(() =>
      useAsync(asyncFunction, { onSuccess })
    );

    await act(async () => {
      result.current.trigger();
      vi.advanceTimersByTime(1000);
    });

    expect(onSuccess).toHaveBeenCalledWith("value");
  });

  it("calls onError with the thrown error", async () => {
    const onError = vi.fn();
    const asyncFunction = () => Promise.reject("oops");

    const { result } = renderHook(() =>
      useAsync(asyncFunction, { onError })
    );

    await act(async () => {
      result.current.trigger();
      vi.advanceTimersByTime(1000);
    });

    expect(onError).toHaveBeenCalledWith("oops");
  });

  it("calls the latest onSuccess callback after a rerender", async () => {
    const onSuccessV1 = vi.fn();
    const onSuccessV2 = vi.fn();

    const { result, rerender } = renderHook(
      ({ cb }) => useAsync(() => Promise.resolve("data"), { onSuccess: cb }),
      { initialProps: { cb: onSuccessV1 } }
    );

    rerender({ cb: onSuccessV2 });

    await act(async () => {
      result.current.trigger();
      vi.advanceTimersByTime(1000);
    });

    expect(onSuccessV1).not.toHaveBeenCalled();
    expect(onSuccessV2).toHaveBeenCalledWith("data");
  });

  it("does not call onSuccess after unmount", async () => {
    const onSuccess = vi.fn();

    const { unmount } = renderHook(() =>
      useAsync(() => Promise.resolve("data"), { onSuccess })
    );

    unmount();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
