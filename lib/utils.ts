import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDay(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / 86400000,
  );
  if (diff === 0) return "今天";
  if (diff === 1) return "昨天";
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function truncate(text: string, max = 80) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}
