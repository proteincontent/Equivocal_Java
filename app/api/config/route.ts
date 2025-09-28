import { NextResponse } from "next/server";

const FALLBACK_BASE_URL = "https://api.openai.com/v1";
const FALLBACK_MODEL = "gpt-4o-mini";
const FALLBACK_HEADER = "Authorization";

export async function GET() {
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY?.trim());
  const baseUrl = process.env.OPENAI_API_BASE_URL?.replace(/\/$/, "") ?? FALLBACK_BASE_URL;
  const model = process.env.OPENAI_MODEL ?? FALLBACK_MODEL;
  const apiKeyHeader = process.env.OPENAI_API_KEY_HEADER ?? FALLBACK_HEADER;

  return NextResponse.json({
    hasOpenAIKey,
    defaults: {
      model,
      baseUrl,
      apiKeyHeader,
    },
  });
}
