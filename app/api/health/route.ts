import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/ai/model";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "counseling-agent",
    llm: {
      mode: isMockMode() ? "mock" : "live",
      model: isMockMode() ? "mock" : process.env.LLM_MODEL || "unknown",
    },
  });
}
