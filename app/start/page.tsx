import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/anonymous";
import { hasCompletedConsent } from "@/lib/consent";
import { StartFlow } from "@/components/consent/StartFlow";

export const dynamic = "force-dynamic";

export default async function StartPage() {
  const user = await getCurrentUser();

  // 已完成当前版本知情同意的用户，不再重复走 3 步流程。
  // 直接进入对话列表，由“新对话”按钮创建新会话。
  if (hasCompletedConsent(user)) {
    redirect("/chat");
  }

  return (
    <StartFlow
      defaultAvatar={user?.avatarId ?? "user-01"}
      defaultMemory={user?.memoryEnabled ?? false}
      hasExistingUser={Boolean(user)}
    />
  );
}
