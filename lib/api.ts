/**
 * API 工具函数
 * 支持通过环境变量切换 Next.js API Routes 和 Java 后端
 */

const DEFAULT_API_TIMEOUT_MS = (() => {
  const raw =
    process.env.NEXT_PUBLIC_API_TIMEOUT_MS ??
    process.env.API_TIMEOUT_MS ??
    "15000";
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 15000;
})();

// 获取 API 基础 URL
// 如果设置了 NEXT_PUBLIC_API_URL，使用外部后端；否则使用 Next.js API Routes
export function getApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  return apiUrl || '';
}

// 构建完整的 API URL
export function buildApiUrl(path: string): string {
  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // In the browser, prefer same-origin requests so Next.js can proxy via rewrites.
  // This avoids CORS issues when the backend runs on a different origin (e.g. :8080).
  if (typeof window !== "undefined") {
    return normalizedPath;
  }

  const baseUrl = getApiBaseUrl();
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  timeoutMs: number = DEFAULT_API_TIMEOUT_MS
): Promise<Response> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

  const signal =
    init?.signal && typeof AbortSignal !== "undefined" && "any" in AbortSignal
      ? // @ts-expect-error AbortSignal.any is not in older TS lib defs
        AbortSignal.any([init.signal, timeoutController.signal])
      : init?.signal ?? timeoutController.signal;

  try {
    return await fetch(input, { ...init, signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function readResponseJsonSafe<T = unknown>(
  response: Response
): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function isNetworkOrTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  // Browser fetch: AbortController triggers AbortError.
  // Browser fetch network errors often surface as TypeError: Failed to fetch.
  return (
    error.name === "AbortError" ||
    error.name === "TimeoutError" ||
    /Failed to fetch/i.test(error.message)
  );
}

// 通用的 fetch 包装函数
export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = buildApiUrl(path);
  const response = await fetchWithTimeout(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  }, DEFAULT_API_TIMEOUT_MS);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// 带认证的 fetch 包装函数
export async function apiAuthFetch<T = unknown>(
  path: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
}

// 检查是否使用外部后端
export function isUsingExternalBackend(): boolean {
  return !!process.env.NEXT_PUBLIC_API_URL;
}

// 获取后端类型描述
export function getBackendType(): 'java' | 'nextjs' {
  return isUsingExternalBackend() ? 'java' : 'nextjs';
}
