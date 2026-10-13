import { afterAll, beforeAll, describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import useDocumentTitle from ".";

describe("useDocumenTitle", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

  beforeAll(() => {
    warn.mockClear();
  });

  afterAll(() => {
    warn.mockRestore();
  });

  it("should set the document title", () => {
    const title = "Test Title";

    expect(document.title).not.toBe(title);

    renderHook(() => useDocumentTitle(title));

    expect(document.title).toBe(title);
  });

  it("should reset the document title on unmount", () => {
    const title = "Test Title";

    document.title = "DEFAULT";

    const { unmount } = renderHook(() => useDocumentTitle(title));

    expect(document.title).toBe(title);

    unmount();

    expect(document.title).not.toBe(title);
  });

  it("should not reset the document title on unmount", () => {
    const title = "Test Title";

    document.title = "DEFAULT";

    const { unmount } = renderHook(() => useDocumentTitle(title, true));

    expect(document.title).toBe(title);

    unmount();

    expect(document.title).toBe(title);
  });

  it("should warn about the deprecation only once", () => {
    renderHook(() => useDocumentTitle("Another title"));

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("useDocumentTitle is deprecated");
  });
});
