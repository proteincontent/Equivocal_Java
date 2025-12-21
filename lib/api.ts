/**
 * API 工具函数
 * 支持通过环境变量切换 Next.js API Routes 和 Java 后端
 */

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

// 通用的 fetch 包装函数
export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = buildApiUrl(path);
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

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
