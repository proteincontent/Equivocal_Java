import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ApiProvider = "openai" | "gemini" | "anthropic";

const PROVIDER_CONFIGS = {
  openai: {
    baseDomain: "https://api.openai.com",
    apiPath: "/v1",
    model: "gpt-4o-mini",
    apiKeyHeader: "Authorization",
  },
  gemini: {
    baseDomain: "https://generativelanguage.googleapis.com",
    apiPath: "/v1beta",
    model: "gemini-pro",
    apiKeyHeader: "x-goog-api-key",
  },
  anthropic: {
    baseDomain: "https://api.anthropic.com",
    apiPath: "/v1",
    model: "claude-3-5-sonnet-20241022",
    apiKeyHeader: "x-api-key",
  },
} as const;

const FALLBACK_API_BASE_URL = "https://api.openai.com/v1";
const FALLBACK_MODEL = "gpt-4o-mini";
const FALLBACK_API_KEY_HEADER = "Authorization";

const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_OPENAI_API_BASE_URL ?? FALLBACK_API_BASE_URL;
const DEFAULT_MODEL = process.env.NEXT_PUBLIC_OPENAI_MODEL ?? FALLBACK_MODEL;
const DEFAULT_API_KEY_HEADER =
  process.env.NEXT_PUBLIC_OPENAI_API_KEY_HEADER ?? FALLBACK_API_KEY_HEADER;

export interface OpenAIConfig {
  apiKey: string;
  baseUrl: string;
  baseDomain: string;
  model: string;
  apiKeyHeader: string;
  provider: ApiProvider;
  setApiKey: (apiKey: string) => void;
  setBaseUrl: (baseUrl: string) => void;
  setBaseDomain: (domain: string) => void;
  setModel: (model: string) => void;
  setApiKeyHeader: (header: string) => void;
  setProvider: (provider: ApiProvider) => void;
  resetToDefaults: () => void;
  getFullApiUrl: () => string;
}

export const useConfig = create<OpenAIConfig>()(
  persist(
    (set, get) => ({
      apiKey: "",
      baseUrl: DEFAULT_API_BASE_URL,
      baseDomain: PROVIDER_CONFIGS.openai.baseDomain,
      model: DEFAULT_MODEL,
      apiKeyHeader: DEFAULT_API_KEY_HEADER,
      provider: "openai",
      setApiKey: (apiKey: string) => set({ apiKey }),
      setBaseUrl: (baseUrl: string) => set({ baseUrl }),
      setBaseDomain: (domain: string) => {
        const state = get();
        let finalUrl: string;

        // 如果以 # 结尾，强制使用输入地址（去掉 #）
        if (domain.endsWith('#')) {
          const cleanDomain = domain.slice(0, -1);
          finalUrl = cleanDomain;
          set({ baseDomain: cleanDomain, baseUrl: finalUrl });
          return;
        }

        // 如果以 / 结尾，忽略版本路径（去掉 /）
        if (domain.endsWith('/')) {
          const cleanDomain = domain.slice(0, -1);
          finalUrl = cleanDomain;
          set({ baseDomain: cleanDomain, baseUrl: finalUrl });
          return;
        }

        // 默认行为：自动添加 API 路径
        const apiPath = PROVIDER_CONFIGS[state.provider].apiPath;
        finalUrl = domain + apiPath;
        set({ baseDomain: domain, baseUrl: finalUrl });
      },
      setModel: (model: string) => set({ model }),
      setApiKeyHeader: (header: string) => set({ apiKeyHeader: header }),
      setProvider: (provider: ApiProvider) => {
        const config = PROVIDER_CONFIGS[provider];
        set({
          provider,
          baseDomain: config.baseDomain,
          baseUrl: config.baseDomain + config.apiPath,
          model: config.model,
          apiKeyHeader: config.apiKeyHeader,
        });
      },
      resetToDefaults: () =>
        set({
          apiKey: "",
          baseDomain: PROVIDER_CONFIGS.openai.baseDomain,
          baseUrl: DEFAULT_API_BASE_URL,
          model: DEFAULT_MODEL,
          apiKeyHeader: DEFAULT_API_KEY_HEADER,
          provider: "openai",
        }),
      getFullApiUrl: () => {
        const state = get();
        return state.baseUrl;
      },
    }),
    {
      name: "openai-config",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
