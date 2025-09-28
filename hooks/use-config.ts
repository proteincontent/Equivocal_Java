import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  model: string;
  apiKeyHeader: string;
  setApiKey: (apiKey: string) => void;
  setBaseUrl: (baseUrl: string) => void;
  setModel: (model: string) => void;
  setApiKeyHeader: (header: string) => void;
  resetToDefaults: () => void;
}

export const useConfig = create<OpenAIConfig>()(
  persist(
    (set) => ({
      apiKey: "",
      baseUrl: DEFAULT_API_BASE_URL,
      model: DEFAULT_MODEL,
      apiKeyHeader: DEFAULT_API_KEY_HEADER,
      setApiKey: (apiKey: string) => set({ apiKey }),
      setBaseUrl: (baseUrl: string) => set({ baseUrl }),
      setModel: (model: string) => set({ model }),
      setApiKeyHeader: (header: string) => set({ apiKeyHeader: header }),
      resetToDefaults: () =>
        set({
          apiKey: "",
          baseUrl: DEFAULT_API_BASE_URL,
          model: DEFAULT_MODEL,
          apiKeyHeader: DEFAULT_API_KEY_HEADER,
        }),
    }),
    {
      name: "openai-config",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
