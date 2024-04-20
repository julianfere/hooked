import { it, describe, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { buildWrapper, useCurrentUser } from "../../TestUtils";

const mockGetCurrentUser = vi.fn().mockImplementation((..._args: any[]) => ({
  email: "example@test.com",
  name: "Test Subject",
}));

const wrapper = buildWrapper({
  getCurrentUser: mockGetCurrentUser,
});

describe("useCurrentUser", () => {
  it("should return the current user", () => {
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper,
    });

    expect(result.current).toEqual({
      email: "example@test.com",
      name: "Test Subject",
    });
  });

  it("should return null if is rendered outside provider", () => {
    const { result } = renderHook(() => useCurrentUser());

    expect(result.current).toBeNull();
  });
});
