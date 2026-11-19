import { createHmac, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/client";
import { CURRENT_CONSENT_VERSION } from "@/lib/consent";

const COOKIE_NAME = "counsel_uid";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 年

function secret(): string {
  return process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me";
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createSignedUserId(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

export function verifySignedUserId(raw: string | undefined): string | null {
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const userId = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  const expected = sign(userId);
  if (
    signature.length !== expected.length ||
    !Buffer.from(signature).equals(Buffer.from(expected))
  ) {
    return null;
  }
  return userId;
}

export async function readSignedUserId(): Promise<string | null> {
  const store = await cookies();
  return verifySignedUserId(store.get(COOKIE_NAME)?.value);
}

export async function getCurrentUser() {
  const userId = await readSignedUserId();
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    include: { sessions: { orderBy: { startedAt: "desc" } } },
  });
}

export async function createUserWithCookie(input: {
  ageRange?: string;
  avatarId?: string;
  memoryEnabled?: boolean;
}) {
  const user = await prisma.user.create({
    data: {
      ageRange: input.ageRange,
      avatarId: input.avatarId || "user-01",
      memoryEnabled: input.memoryEnabled ?? false,
      consentVersion: CURRENT_CONSENT_VERSION,
    },
  });
  const store = await cookies();
  store.set(COOKIE_NAME, createSignedUserId(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return user;
}

export function newAnonymousId() {
  return randomUUID();
}

export const anonymousCookieName = COOKIE_NAME;
