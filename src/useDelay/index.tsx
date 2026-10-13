import { useCallback, useEffect, useRef } from "react";

const noop = () => {};

type UseDelayOptions = { delay?: number; manual?: boolean };

/**
 * Hook to delay the execution of a callback function
 * @param callback
 * @param delay
 * @param manual
 * @returns In manual mode, a runner that schedules the callback and returns a cancel function
 */
function useDelay(
  callback: () => void,
  options: UseDelayOptions & { manual: true }
): () => () => void;
function useDelay(
  callback: () => void,
  options?: UseDelayOptions & { manual?: false }
): () => void;
function useDelay(
  callback: () => void,
  options?: UseDelayOptions
): () => (() => void) | void;
function useDelay(callback: () => void, options: UseDelayOptions = {}) {
  const { delay = 250, manual = false } = options;
  const callbackRef = useRef(callback);
  useEffect(() => { callbackRef.current = callback; });

  // Timers scheduled by the manual runner, cleared on unmount
  const timersRef = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  useEffect(() => {
    if (manual) return;

    const timer = setTimeout(() => callbackRef.current(), delay);

    return () => clearTimeout(timer);
  }, [delay, manual]);

  const runner = useCallback(() => {
    const timers = timersRef.current;
    const id = setTimeout(() => {
      timers.delete(id);
      callbackRef.current();
    }, delay);
    timers.add(id);

    return () => {
      clearTimeout(id);
      timers.delete(id);
    };
  }, [delay]);

  return manual ? runner : noop;
}

export default useDelay;
