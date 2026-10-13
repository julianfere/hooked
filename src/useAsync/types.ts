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

/**
 * An async function that receives an AbortSignal first, followed by its own arguments.
 */
export type AsyncFunction = (signal: AbortSignal, ...args: any[]) => Promise<any>;

/**
 * Arguments accepted by `trigger`: every parameter of `fn` except the leading AbortSignal.
 */
export type TriggerArgs<F extends AsyncFunction> = Parameters<F> extends []
  ? []
  : Parameters<F> extends [any?, ...infer Rest]
  ? Rest
  : [];
