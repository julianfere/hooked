export type AsyncState<T> =
  | { status: "idle";      data: undefined; error: undefined }
  | { status: "pending";   data: undefined; error: undefined }
  | { status: "fulfilled"; data: T;         error: undefined }
  | { status: "rejected";  data: undefined; error: unknown   }

export type AsyncAction<T> =
  | { type: "pending" }
  | { type: "fulfilled"; payload: T }
  | { type: "rejected";  payload: unknown }
  | { type: "reset" }

export type UseAsyncOptions<T> = Partial<{
  /**
   * If true, the async function runs automatically on mount.
   * Only use this for functions that require no arguments.
   * Default: false
   */
  immediate: boolean;
  onSuccess: (data: T) => void;
  onError: (error: unknown) => void;
}>
