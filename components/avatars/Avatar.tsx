import Image from "next/image";
import { cn } from "@/lib/utils";

const USER_AVATARS = Array.from({ length: 12 }, (_, i) => `user-${String(i + 1).padStart(2, "0")}`);
export const USER_AVATAR_IDS = USER_AVATARS;

export function normalizeAvatarId(id?: string | null): string {
  if (!id) return "user-01";
  if (id === "ai-counselor") return "ai-counselor";
  return USER_AVATARS.includes(id) ? id : "user-01";
}

export function avatarSrc(id?: string | null): string {
  return `/avatars/${normalizeAvatarId(id)}.svg`;
}

export function Avatar({
  id,
  size = 40,
  className,
  alt = "头像",
}: {
  id?: string | null;
  size?: number;
  className?: string;
  alt?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white ring-1 ring-black/5",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={avatarSrc(id)}
        alt={alt}
        width={size}
        height={size}
        unoptimized
        className="h-full w-full object-cover"
      />
    </span>
  );
}
