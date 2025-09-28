import { NextResponse } from "next/server";

type ModelsRequest = {
  config?: {
    apiKey?: string;
    apiKeyHeader?: string;
    baseUrl?: string;
    modelsPath?: string;
    modelsUrl?: string;
    apiVersion?: string;
  };
};

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODELS_PATH = "models";

export async function POST(request: Request) {
  let body: ModelsRequest | undefined;
  try {
    body = (await request.json()) as ModelsRequest;
  } catch {
    // allow empty body
  }

  const apiKey = body?.config?.apiKey ?? process.env.OPENAI_API_KEY ?? "";
  const apiKeyHeader =
    body?.config?.apiKeyHeader ?? process.env.OPENAI_API_KEY_HEADER ?? "Authorization";
  const baseUrl = (
    body?.config?.baseUrl ??
    process.env.OPENAI_API_BASE_URL ??
    DEFAULT_BASE_URL
  ).replace(/\/$/, "");
  const modelsPath = (
    body?.config?.modelsPath ??
    process.env.OPENAI_MODELS_PATH ??
    DEFAULT_MODELS_PATH
  ).replace(/^\//, "");
  const modelsUrl = body?.config?.modelsUrl ?? process.env.OPENAI_MODELS_URL;
  const apiVersion = body?.config?.apiVersion ?? process.env.OPENAI_API_VERSION;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  const url = modelsUrl || `${baseUrl}/${modelsPath}`;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKeyHeader.toLowerCase() === "authorization") {
    headers.Authorization = apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}`;
  } else {
    headers[apiKeyHeader] = apiKey;
  }
  if (apiVersion) headers["api-version"] = apiVersion;

  try {
    const resp = await fetch(url, { method: "GET", headers });
    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { error: "Failed to fetch models", detail: text },
        { status: resp.status },
      );
    }
    const data = await resp.json();
    // Normalize to a simple array of strings
    const models: string[] = Array.isArray(data?.data)
      ? data.data
          .map((m: any) => (typeof m === "string" ? m : m?.id))
          .filter((id: any) => typeof id === "string")
      : [];

    return NextResponse.json({ models });
  } catch (e) {
    console.error("[api/models] request failed", e);
    return NextResponse.json({ error: "Failed to reach the models endpoint" }, { status: 500 });
  }
}
