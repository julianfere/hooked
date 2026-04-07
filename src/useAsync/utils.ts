import { UseAsyncOptions } from "./types";

export const defaultOptions = <T>(): UseAsyncOptions<T> => ({
  manual: false,
  onSuccess: (_data: T) => {},
  onError: (_error: any) => {},
  cancelable: true,
});

export const handleError = (error: unknown) => {
  if (!(error instanceof Error)) {
    throw error;
  }

  if (error.name === "AbortError") {
    return;
  }

  throw error;
};
