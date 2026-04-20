import { it, describe, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { buildWrapper } from "../../TestUtils";
import { MissingHandler } from "../../context/Errors";
import { useResetPassword } from "../../TestUtils";

const mockGetCurrentUser = vi.fn();
const mockHandleResetPassword = vi.fn();
const mockResetPasswordSuccessHandler = vi.fn();
const mockResetPasswordErrorHandler = vi.fn();

const wrapper = buildWrapper({
  getCurrentUser: mockGetCurrentUser,
  resetPasswordFailureHandler: mockResetPasswordErrorHandler,
  resetPasswordSuccessHandler: mockResetPasswordSuccessHandler,
  resetPasswordHandler: mockHandleResetPassword,
});

const emptyWrapper = buildWrapper({
  getCurrentUser: mockGetCurrentUser,
});

describe("useResetPassword", () => {
  it("should return resetPassword function", () => {
    const { result } = renderHook(() => useResetPassword(), { wrapper });

    expect(result.current).toEqual({
      resetPassword: expect.any(Function),
    });
  });

  it("should throw an error if handler is not provided", () => {
    const { result } = renderHook(() => useResetPassword(), {
      wrapper: emptyWrapper,
    });

    expect(() => result.current.resetPassword("test@test.com")).toThrow(
      new MissingHandler('"resetPassword"')
    );
  });

  it("should call resetPasswordHandler on resetPassword", () => {
    const { result } = renderHook(() => useResetPassword(), { wrapper });

    result.current.resetPassword("email@email.com");

    expect(mockHandleResetPassword).toHaveBeenCalled();
  });

  it("should call resetPasswordSuccessHandler on resetPassword success", () => {
    const { result } = renderHook(() => useResetPassword(), { wrapper });

    result.current.resetPassword("email@email.com");

    expect(mockResetPasswordSuccessHandler).toHaveBeenCalled();
  });

  it.skip("should call resetPasswordErrorHandler on resetPassword error", () => {
    const { result } = renderHook(() => useResetPassword(), { wrapper });

    mockHandleResetPassword.mockRejectedValueOnce(new Error("test error"));

    result.current.resetPassword("");

    expect(mockResetPasswordErrorHandler).toHaveBeenCalled();
  });
});
