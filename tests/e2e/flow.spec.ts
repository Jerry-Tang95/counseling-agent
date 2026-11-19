import { expect, test } from "@playwright/test";

test("complete flow: consent → avatar → chat → summary → memory", async ({ page }) => {
  await page.goto("/start");
  await expect(page.getByRole("heading", { name: /你已经 18 岁了吗/ })).toBeVisible();

  await page.getByRole("button", { name: /下一步：了解边界/ }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /下一步：选一个头像/ }).click();

  await page.getByRole("button", { name: "选择头像 user-05" }).click();
  const memorySwitch = page.getByRole("switch", { name: "长期记忆" });
  if ((await memorySwitch.getAttribute("aria-checked")) !== "true") {
    await memorySwitch.click();
  }

  await page.getByRole("button", { name: "进入对话" }).click();
  await expect(page).toHaveURL(/\/chat\//);
  await expect(page.getByText("你好，我是心屿。")).toBeVisible();

  const composer = page.locator("textarea");
  await composer.fill("最近工作压力很大，我想学会拒绝不合理的加班，我总觉得自己不够好。");
  await page.keyboard.press("Enter");
  const assistantMessage = page.getByTestId("assistant-message").last();
  await expect(assistantMessage).toBeVisible({ timeout: 30_000 });
  await expect(assistantMessage).not.toHaveText("", { timeout: 30_000 });

  await page.getByRole("button", { name: "结束并总结" }).click();
  await page.getByRole("button", { name: "生成总结" }).click();
  await expect(page).toHaveURL(/\/summary\//, { timeout: 60_000 });
  await expect(page.getByText("本次对话总结")).toBeVisible();
  await expect(page.getByText("这周可以试的一小步")).toBeVisible();

  await page.getByRole("button", { name: "有帮助 5 分" }).click();
  await page.getByRole("button", { name: "被照顾到（安全与边界） 5 分" }).click();
  await page.getByRole("button", { name: "提交反馈" }).click();
  await expect(page.getByText("谢谢你的反馈")).toBeVisible();

  await page.goto("/memory");
  await expect(page.getByText("我记住的，都在这里。")).toBeVisible();
  await expect(page.getByText(/学会拒绝不合理的加班/)).toBeVisible();
});
