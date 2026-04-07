import { AsyncState, AsyncAction } from "./types";

export const asyncReducer = <T>(
  _state: AsyncState<T>,
  action: AsyncAction<T>
): AsyncState<T> => {
  switch (action.type) {
    case "pending":
      return { status: "pending", data: undefined, error: undefined };
    case "fulfilled":
      return { status: "fulfilled", data: action.payload, error: undefined };
    case "rejected":
      return { status: "rejected", data: undefined, error: action.payload };
    case "reset":
      return { status: "idle", data: undefined, error: undefined };
  }
};

export const getInitialState = <T>(): AsyncState<T> => ({
  status: "idle",
  data: undefined,
  error: undefined,
});
