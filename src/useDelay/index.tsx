import { useEffect, useRef } from "react";

/**
 * Hook to delay the execution of a callback function
 * @param callback
 * @param delay
 * @param manual
 * @returns
 */
const useDelay = (
  callback: () => void,
  options: { delay?: number; manual?: boolean } = { delay: 250, manual: false }
) => {
  const { delay = 250, manual = false } = options;
  const mountedRef = useRef(false);
  const callbackRef = useRef(callback);
  useEffect(() => { callbackRef.current = callback; });

  const runner = () => {
    if (mountedRef.current) {
      const id = setTimeout(() => callbackRef.current(), delay);
      return () => clearTimeout(id);
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    if (manual) return;

    const timer = setTimeout(() => callbackRef.current(), delay);

    return () => {
      clearTimeout(timer);
      mountedRef.current = false;
    };
  }, [delay, manual]);

  return manual ? runner : () => {};
};

export default useDelay;
