import { useCallback, useEffect, useReducer, useRef } from "react";
import { asyncReducer, getInitialState } from "./utils";
import { UseAsyncOptions } from "./types";

/**
 * useAsync manages the full lifecycle of an async function: idle → pending → fulfilled | rejected.
 *
 * @param fn - The async function to run. Receives an AbortSignal as the last argument.
 * @param options - Optional configuration.
 * @returns `{ trigger, reset, status, data, error, loading }`
 *
 * @example
 * const { trigger, data, error, loading } = useAsync(fetchUser);
 * // trigger(userId) to run manually
 *
 * @example
 * // Run on mount (fn must take no required arguments)
 * const { data, loading } = useAsync(fetchConfig, { immediate: true });
 */
const useAsync = <
  F extends (...args: any[]) => Promise<any>,
  T = Awaited<ReturnType<F>>
>(
  fn: F,
  options: UseAsyncOptions<T> = {}
) => {
  const [state, dispatch] = useReducer(asyncReducer<T>, getInitialState<T>());
  const controllerRef = useRef<AbortController | null>(null);

  const fnRef = useRef(fn);
  useEffect(() => { fnRef.current = fn; });

  const optionsRef = useRef(options);
  useEffect(() => { optionsRef.current = options; });

  const trigger = useCallback(async (...args: Parameters<F>) => {
    // Cancel any in-flight request before starting a new one
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    dispatch({ type: "pending" });

    try {
      const result = await fnRef.current(...args, controller.signal);

      if (controller.signal.aborted) return;

      dispatch({ type: "fulfilled", payload: result });
      optionsRef.current.onSuccess?.(result);
    } catch (error) {
      if (controller.signal.aborted) return;
      dispatch({ type: "rejected", payload: error });
      optionsRef.current.onError?.(error);
    }
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    dispatch({ type: "reset" });
  }, []);

  useEffect(() => {
    if (options.immediate) {
      trigger(...([] as unknown as Parameters<F>));
    }

    return () => {
      controllerRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    trigger,
    reset,
    status: state.status,
    data: state.data,
    error: state.error,
    loading: state.status === "pending",
  };
};

export default useAsync;
