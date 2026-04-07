import { useEffect, useRef, useState } from "react";

const useThrottle = <T,>(value: T, interval = 500): T => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdated = useRef<number | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip initial mount — initial value is already set via useState
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const now = Date.now();
    const elapsed = lastUpdated.current !== null ? now - lastUpdated.current : Infinity;

    if (elapsed >= interval) {
      // Leading edge: first change in a new window passes through immediately
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      // Trailing: schedule the last value for the remaining time in the window
      const remaining = interval - elapsed;
      const id = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, remaining);

      return () => clearTimeout(id);
    }
  }, [value, interval]);

  return throttledValue;
};

export default useThrottle;
