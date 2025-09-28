import { useEffect, useState } from "react";

interface ServerConfigResponse {
  hasOpenAIKey: boolean;
  defaults: {
    model: string;
    baseUrl: string;
    apiKeyHeader: string;
  };
}

interface UseServerConfigState {
  config: ServerConfigResponse | null;
  loading: boolean;
  error: string | null;
}

export function useServerConfig(): UseServerConfigState {
  const [state, setState] = useState<UseServerConfigState>({
    config: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/config");
        if (!response.ok) {
          throw new Error(`Failed to load server config (${response.status})`);
        }
        const json = (await response.json()) as ServerConfigResponse;
        if (!cancelled) {
          setState({ config: json, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            config: null,
            loading: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
