import { afterAll, beforeAll, describe, it, expect, vi, type MockInstance } from "vitest";
import { renderHook } from "@testing-library/react";

import useDocumentTitle from ".";

describe("useDocumenTitle", () => {
  let warn: MockInstance<typeof console.warn>;

  beforeAll(() => {
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
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

  it("should warn about the deprecation only once", async () => {
    // Fresh module graph so the module-level "warned" flag starts unset
    vi.resetModules();
    const { renderHook: freshRenderHook } = await import("@testing-library/react");
    const { default: freshUseDocumentTitle } = await import(".");

    freshRenderHook(() => freshUseDocumentTitle("First title"));
    freshRenderHook(() => freshUseDocumentTitle("Another title"));

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("useDocumentTitle is deprecated");
  });
});
