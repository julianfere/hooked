import { it, describe, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { ICurrentUser, buildWrapper } from "../../TestUtils";
import { useRegister } from "../../TestUtils";
import { MissingHandler } from "../../context/Errors";

const mockRegisterHandler = vi.fn();
const mockRegisterSuccessHandler = vi.fn();
const mockRegisterErrorHandler = vi.fn();

const wrapper = buildWrapper({
  getCurrentUser: vi.fn(),
  registerHandler: mockRegisterHandler,
  registerSuccessHandler: mockRegisterSuccessHandler,
  registerFailureHandler: mockRegisterErrorHandler,
});

const emptyWrapper = buildWrapper({
  getCurrentUser: vi.fn(),
});

const userPayload: ICurrentUser = {
  email: "email@example.com",
  name: "Test",
};

describe("useRegister", () => {
  it("should return register function", () => {
    const { result } = renderHook(() => useRegister(), { wrapper });

    expect(result.current).toEqual({
      register: expect.any(Function),
    });
  });

  it("should throw an error if handler is not provided", () => {
    const { result } = renderHook(() => useRegister(), {
      wrapper: emptyWrapper,
    });

    expect(() => result.current.register(userPayload)).toThrow(
      new MissingHandler('"register"')
    );
  });

  it("should call handler", () => {
    const { result } = renderHook(() => useRegister(), { wrapper });

    result.current.register(userPayload);

    expect(mockRegisterHandler).toBeCalled();
  });

  it("should call success handler", () => {
    const { result } = renderHook(() => useRegister(), { wrapper });

    result.current.register(userPayload);

    expect(mockRegisterSuccessHandler).toBeCalled();
  });

  it.skip("should call error handler", () => {
    const { result } = renderHook(() => useRegister(), { wrapper });

    mockRegisterHandler.mockRejectedValue(new Error("Test error"));

    result.current.register(userPayload);

    expect(mockRegisterSuccessHandler).not.toBeCalled();
    expect(mockRegisterErrorHandler).toBeCalled();
  });
});
