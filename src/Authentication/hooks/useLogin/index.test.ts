import { it, describe, expect, vi, beforeAll } from "vitest";
import { renderHook } from "@testing-library/react";
import { buildWrapper } from "../../TestUtils";
import { useLogin } from "../../TestUtils";
import { MissingHandler } from "../../context/Errors";

const mockLoginHandler = vi.fn().mockImplementation((..._args: any[]) => ({
  email: "example@test.com",
  name: "Test Subject",
}));

const mockLoginSuccessHandler = vi.fn();
const mockLoginFailureHandler = vi.fn();
const mockLogoutHandler = vi.fn();

const wrapper = buildWrapper({
  getCurrentUser: vi.fn(),
  loginHandler: mockLoginHandler,
  loginSuccessHandler: mockLoginSuccessHandler,
  loginFailureHandler: mockLoginFailureHandler,
  logoutHandler: mockLogoutHandler,
});

const emptyWrapper = buildWrapper({
  getCurrentUser: vi.fn(),
});

describe("useLogin", () => {
  beforeAll(() => {
    vi.resetAllMocks();
  });

  it("should return the login and logout functions", () => {
    const { result } = renderHook(() => useLogin(), { wrapper });

    expect(result.current).toEqual({
      login: expect.any(Function),
      logout: expect.any(Function),
    });
  });

  it("should throw an error if loginHandler is not provided", () => {
    const { result } = renderHook(() => useLogin(), { wrapper: emptyWrapper });

    expect(() => result.current.login("email", "password")).toThrow(
      new MissingHandler('"login"')
    );
  });

  it("should call loginHandler on login", () => {
    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.login("email", "password");

    expect(mockLoginHandler).toHaveBeenCalled();
  });

  it("should call loginSuccessHandler on login success", () => {
    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.login("email", "password");

    expect(mockLoginSuccessHandler).toHaveBeenCalled();
  });

  it.skip("should call loginFailureHandler on login failure", () => {
    const { result } = renderHook(() => useLogin(), { wrapper });

    mockLoginHandler.mockRejectedValueOnce(new Error("Login failed"));
    result.current.login("email", "password");

    expect(mockLoginFailureHandler).toHaveBeenCalled();
  });

  it("should call logoutHandler on logout", () => {
    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.logout();

    expect(mockLogoutHandler).toHaveBeenCalled();
  });

  it("shoudl execute logout without logoutHandler", () => {
    const { result } = renderHook(() => useLogin(), { wrapper: emptyWrapper });

    expect(() => result.current.logout()).not.toThrow();
  });
});
