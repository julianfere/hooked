import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import useThrottle from "./index";

type UseThrottleProps = Partial<{ value: number; delay: number }>;

describe("useThrottle", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("should return the initial value immediately", () => {
    const { result } = renderHook(
      (props: UseThrottleProps) => useThrottle(props.value),
      {
        initialProps: { value: 0 },
      }
    );

    expect(result.current).toBe(0);
  });

  it("should pass the first value change through immediately (leading edge)", () => {
    const { result, rerender } = renderHook(
      (props: UseThrottleProps) => useThrottle(props.value, props.delay),
      {
        initialProps: { value: 0, delay: 1000 },
      }
    );

    expect(result.current).toBe(0);

    rerender({ value: 1, delay: 1000 });

    // Leading edge: first change should pass immediately without waiting
    expect(result.current).toBe(1);
  });

  it("should throttle rapid updates and apply the last value after the interval", () => {
    const { result, rerender } = renderHook(
      (props: UseThrottleProps) => useThrottle(props.value, props.delay),
      {
        initialProps: { value: 0, delay: 1000 },
      }
    );

    // Leading edge: first change passes immediately
    rerender({ value: 1, delay: 1000 });
    expect(result.current).toBe(1);

    // Subsequent rapid changes within the interval are throttled
    rerender({ value: 2, delay: 1000 });
    rerender({ value: 3, delay: 1000 });

    // Still 1 — changes 2 and 3 are held back
    expect(result.current).toBe(1);

    // After the interval, last value (3) is applied
    act(() => vi.advanceTimersByTime(1000));

    expect(result.current).toBe(3);
  });

  it("should use the default interval", () => {
    const { result, rerender } = renderHook(
      (props: UseThrottleProps) => useThrottle(props.value, props.delay),
      {
        initialProps: { value: 0 },
      }
    );

    expect(result.current).toBe(0);

    // Leading edge: first change passes immediately
    rerender({ value: 1 });
    expect(result.current).toBe(1);

    // Rapid updates within default 500ms interval are throttled
    rerender({ value: 2 });
    rerender({ value: 3 });

    act(() => vi.advanceTimersByTime(500));

    expect(result.current).toBe(3);
  });
});
