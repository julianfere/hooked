import { test, expect, Page } from "@playwright/test";

const BASE = "http://localhost:5173";

// Helper to collect console errors
async function withConsoleErrors(page: Page, fn: () => Promise<void>) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  await fn();
  return errors;
}

test.describe("useAsync", () => {
  test("starts idle, fetches todo #1, shows data", async ({ page }) => {
    const errors = await withConsoleErrors(page, async () => {
      await page.goto(BASE);
      const section = page.locator("section").filter({ hasText: "useAsync" }).first();

      await expect(section.getByText("Status:")).toContainText("idle");

      await section.getByRole("button", { name: "Fetch todo #1" }).click();
      await expect(section.getByText("Status:")).toContainText("pending", { timeout: 2000 });
      await expect(section.getByText("Status:")).toContainText("fulfilled", { timeout: 10000 });
      await expect(section.locator("pre")).toContainText('"id": 1');
    });
    expect(errors).toHaveLength(0);
  });

  test("re-trigger mid-flight cancels previous request (rapid clicks)", async ({ page }) => {
    const errors = await withConsoleErrors(page, async () => {
      await page.goto(BASE);
      const section = page.locator("section").filter({ hasText: "useAsync" }).first();

      // Click fetch #1 then immediately fetch #2 before #1 finishes
      await section.getByRole("button", { name: "Fetch todo #1" }).click();
      await section.getByRole("button", { name: "Fetch todo #2" }).click();

      await expect(section.getByText("Status:")).toContainText("fulfilled", { timeout: 10000 });
      // Should end with todo #2 data, not #1
      await expect(section.locator("pre")).toContainText('"id": 2');
    });
    expect(errors).toHaveLength(0);
  });

  test("reset goes back to idle and clears data", async ({ page }) => {
    const errors = await withConsoleErrors(page, async () => {
      await page.goto(BASE);
      const section = page.locator("section").filter({ hasText: "useAsync" }).first();

      await section.getByRole("button", { name: "Fetch todo #1" }).click();
      await expect(section.getByText("Status:")).toContainText("fulfilled", { timeout: 10000 });
      await expect(section.locator("pre")).toBeVisible();

      await section.getByRole("button", { name: "Reset" }).click();
      await expect(section.getByText("Status:")).toContainText("idle");
      await expect(section.locator("pre")).not.toBeVisible();
    });
    expect(errors).toHaveLength(0);
  });

  test("fetch button is disabled while loading", async ({ page }) => {
    const errors = await withConsoleErrors(page, async () => {
      await page.goto(BASE);
      const section = page.locator("section").filter({ hasText: "useAsync" }).first();
      const btn = section.getByRole("button", { name: "Fetch todo #1" });

      await btn.click();
      await expect(btn).toBeDisabled();
      await expect(section.getByText("Status:")).toContainText("fulfilled", { timeout: 10000 });
      await expect(btn).toBeEnabled();
    });
    expect(errors).toHaveLength(0);
  });

  test("rapid alternating fetches always land on the last one", async ({ page }) => {
    const errors = await withConsoleErrors(page, async () => {
      await page.goto(BASE);
      const section = page.locator("section").filter({ hasText: "useAsync" }).first();

      // Spam clicks alternating between #1 and #2
      for (let i = 0; i < 5; i++) {
        await section.getByRole("button", { name: `Fetch todo #${(i % 2) + 1}` }).click();
        await page.waitForTimeout(50);
      }

      // Last click was Fetch todo #1 (i=4, 4%2+1=1)
      await expect(section.getByText("Status:")).toContainText("fulfilled", { timeout: 10000 });
      await expect(section.locator("pre")).toContainText('"id": 1');
    });
    expect(errors).toHaveLength(0);
  });

  test("reset mid-flight aborts the request", async ({ page }) => {
    const errors = await withConsoleErrors(page, async () => {
      await page.goto(BASE);
      const section = page.locator("section").filter({ hasText: "useAsync" }).first();

      await section.getByRole("button", { name: "Fetch todo #1" }).click();
      await expect(section.getByText("Status:")).toContainText("pending", { timeout: 2000 });

      // Reset immediately — should abort
      await section.getByRole("button", { name: "Reset" }).click();
      await expect(section.getByText("Status:")).toContainText("idle");
      // Should NOT transition to fulfilled after abort
      await page.waitForTimeout(3000);
      await expect(section.getByText("Status:")).toContainText("idle");
    });
    expect(errors).toHaveLength(0);
  });
});

test.describe("useAsync immediate", () => {
  test("auto-fetches on mount without any interaction", async ({ page }) => {
    const errors = await withConsoleErrors(page, async () => {
      await page.goto(BASE);
      const section = page.locator("section").filter({ hasText: "useAsync (immediate)" });
      await expect(section.getByText("Status:")).toContainText("fulfilled", { timeout: 10000 });
      await expect(section.locator("pre")).toContainText('"id": 3');
    });
    expect(errors).toHaveLength(0);
  });
});

test.describe("useDebounce", () => {
  test("debounced value lags behind live input", async ({ page }) => {
    await page.goto(BASE);
    const section = page.locator("section").filter({ hasText: "useDebounce" });
    const input = section.locator("input");

    await input.fill("hello");
    // Live should update immediately, debounced should still be empty
    await expect(section.getByText(/Live:/)).toContainText("hello");
    await expect(section.getByText(/Debounced/)).not.toContainText("hello");

    // After 700ms debounce should catch up
    await page.waitForTimeout(700);
    await expect(section.getByText(/Debounced/)).toContainText("hello");
  });

  test("rapid typing only debounces to final value", async ({ page }) => {
    await page.goto(BASE);
    const section = page.locator("section").filter({ hasText: "useDebounce" });
    const input = section.locator("input");

    await input.pressSequentially("abc", { delay: 50 });
    await page.waitForTimeout(700);
    await expect(section.getByText(/Debounced/)).toContainText("abc");
  });
});

test.describe("useThrottle", () => {
  test("throttled value updates on leading edge", async ({ page }) => {
    await page.goto(BASE);
    const section = page.locator("section").filter({ hasText: "useThrottle" });
    const input = section.locator("input");

    await input.fill("x");
    await expect(section.getByText(/Throttled/)).toContainText("x", { timeout: 1000 });
  });
});

test.describe("useDelay", () => {
  test("fires callback after delay on button click", async ({ page }) => {
    await page.goto(BASE);
    const section = page.locator("section").filter({ hasText: "useDelay" });

    await expect(section.getByText("Waiting…")).toBeVisible();
    await section.getByRole("button").click();
    // Should still show "Waiting" immediately
    await expect(section.getByText("Waiting…")).toBeVisible();
    // After 1s+ should fire
    await expect(section.getByText("Fired after 1s!")).toBeVisible({ timeout: 2000 });
  });
});

test.describe("useLocalStorage", () => {
  test("set, read and remove item", async ({ page }) => {
    await page.goto(BASE);
    const section = page.locator("section").filter({ hasText: "useLocalStorage" });

    await expect(section.getByText(/Has "username"/)).toContainText("false");
    await section.getByRole("button", { name: "Set username" }).click();
    await expect(section.getByText(/Has "username"/)).toContainText("true");
    await expect(section.getByText(/username:/)).toContainText("Alice");

    await section.getByRole("button", { name: "Remove username" }).click();
    await expect(section.getByText(/Has "username"/)).toContainText("false");
  });

  test("increment count persists across re-renders", async ({ page }) => {
    await page.goto(BASE);
    const section = page.locator("section").filter({ hasText: "useLocalStorage" });

    await section.getByRole("button", { name: "Increment count" }).click();
    await section.getByRole("button", { name: "Increment count" }).click();
    await expect(section.getByText(/count:/)).toContainText("2");
  });
});

test.describe("useQueryParams", () => {
  test("set search param updates URL and display", async ({ page }) => {
    await page.goto(BASE);
    const section = page.locator("section").filter({ hasText: "useQueryParams" });
    const input = section.locator("input");

    await input.fill("react");
    await expect(section.getByText(/q:/)).toContainText("react");
    await expect(page.url()).toContain("q=react");
  });

  test("next page increments page param", async ({ page }) => {
    await page.goto(BASE);
    const section = page.locator("section").filter({ hasText: "useQueryParams" });

    await section.getByRole("button", { name: "Next page" }).click();
    await expect(section.getByText(/page:/)).toContainText("2");
    await expect(page.url()).toContain("page=2");

    await section.getByRole("button", { name: "Next page" }).click();
    await expect(section.getByText(/page:/)).toContainText("3");
  });

  test("clear removes all params from URL", async ({ page }) => {
    await page.goto(BASE);
    const section = page.locator("section").filter({ hasText: "useQueryParams" });

    await section.locator("input").fill("test");
    await section.getByRole("button", { name: "Next page" }).click();
    await section.getByRole("button", { name: "Clear" }).click();

    await expect(page.url()).not.toContain("q=");
    await expect(page.url()).not.toContain("page=");
  });
});

test.describe("EventContext", () => {
  test("publish triggers subscriber and logs message", async ({ page }) => {
    await page.goto(BASE);
    const section = page.locator("section").filter({ hasText: "EventContext" });

    await expect(section.getByText("No events yet")).toBeVisible();
    await section.getByRole("button", { name: "Publish ping" }).click();
    await expect(section.getByText(/Ping at/)).toBeVisible();
  });

  test("multiple publishes accumulate in log", async ({ page }) => {
    await page.goto(BASE);
    const section = page.locator("section").filter({ hasText: "EventContext" });

    await section.getByRole("button", { name: "Publish ping" }).click();
    await section.getByRole("button", { name: "Publish ping" }).click();
    await section.getByRole("button", { name: "Publish ping" }).click();

    const items = section.locator("li");
    await expect(items).toHaveCount(3);
  });
});
