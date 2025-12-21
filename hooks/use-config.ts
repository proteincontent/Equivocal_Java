import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const COZE_CONFIG = {
  baseDomain: "https://api.coze.cn",
  apiKeyHeader: "Authorization",
} as const;

export interface CozeConfig {
  baseDomain: string;
  apiKeyHeader: string;
  // Coze 特定配置
  botId: string;
  setBotId: (botId: string) => void;
  resetToDefaults: () => void;
}

export const useConfig = create<CozeConfig>()(
  persist(
    (set) => ({
      baseDomain: COZE_CONFIG.baseDomain,
      apiKeyHeader: COZE_CONFIG.apiKeyHeader,
      botId: "7571379515847737407",
      setBotId: (botId: string) => set({ botId }),
      resetToDefaults: () =>
        set({
          baseDomain: COZE_CONFIG.baseDomain,
          apiKeyHeader: COZE_CONFIG.apiKeyHeader,
          botId: "7571379515847737407",
        }),
    }),
    {
      name: "coze-config",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
