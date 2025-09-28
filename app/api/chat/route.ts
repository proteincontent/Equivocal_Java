import { NextResponse } from "next/server";

type ChatRequest = {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  response_format?: unknown;
  config?: {
    apiKey?: string;
    apiKeyHeader?: string;
    model?: string;
    baseUrl?: string;
    apiVersion?: string;
  };
};

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_PATH = "chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

const defaultApiKey = process.env.OPENAI_API_KEY;
const apiKeyHeader = process.env.OPENAI_API_KEY_HEADER ?? "Authorization";
const defaultBaseUrl = process.env.OPENAI_API_BASE_URL?.replace(/\/$/, "") ?? DEFAULT_BASE_URL;
const path = (process.env.OPENAI_CHAT_COMPLETIONS_PATH ?? DEFAULT_PATH).replace(/^\//, "");
const explicitUrl = process.env.OPENAI_CHAT_COMPLETIONS_URL;
const defaultModel = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;
const apiVersionHeader = process.env.OPENAI_API_VERSION;

export async function POST(request: Request) {
  let body: ChatRequest;
  try {
    body = (await request.json()) as ChatRequest;
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const apiKey = body.config?.apiKey || defaultApiKey;
  const model = body.config?.model || defaultModel;
  const baseUrl = body.config?.baseUrl?.replace(/\/$/, "") || defaultBaseUrl;
  const dynamicApiKeyHeader = body.config?.apiKeyHeader || apiKeyHeader;
  const dynamicApiVersion = body.config?.apiVersion || apiVersionHeader;
  const chatCompletionsUrl = explicitUrl || `${baseUrl}/${path}`;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Missing OpenAI API key",
        detail: "Add OPENAI_API_KEY to your environment or supply a key from the Settings panel before chatting.",
        helpUrl: "https://github.com/proteincontent/Equivocal#setup",
      },
      { status: 400 },
    );
  }

  if (!body?.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "`messages` array is required." }, { status: 400 });
  }

  const payload: Record<string, unknown> = {
    model,
    messages: body.messages,
  };

  if (typeof body.temperature === "number") {
    payload.temperature = body.temperature;
  }

  if (typeof body.maxTokens === "number") {
    payload.max_tokens = body.maxTokens;
  }

  if (typeof body.topP === "number") {
    payload.top_p = body.topP;
  }

  if (body.response_format) {
    payload.response_format = body.response_format;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (dynamicApiKeyHeader.toLowerCase() === "authorization") {
    headers.Authorization = apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}`;
  } else {
    headers[dynamicApiKeyHeader] = apiKey;
  }

  if (dynamicApiVersion) {
    headers["api-version"] = dynamicApiVersion;
  }

  try {
    const upstreamResponse = await fetch(chatCompletionsUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      return NextResponse.json(
        {
          error: "Upstream chat completion failed",
          detail: errorText,
        },
        { status: upstreamResponse.status },
      );
    }

    const data = await upstreamResponse.json();
    const message = data?.choices?.[0]?.message ?? null;

    return NextResponse.json({
      message,
      usage: data?.usage,
    });
  } catch (error) {
    console.error("[api/chat] request failed", error);
    return NextResponse.json(
      { error: "Failed to reach the OpenAI-compatible endpoint." },
      { status: 500 },
    );
  }
}

