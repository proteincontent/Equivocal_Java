"use client";

import * as React from "react";
import { LockKeyhole, Loader2, RefreshCcw } from "lucide-react";
import { useConfig } from "@/hooks/use-config";
import { useServerConfig } from "@/hooks/use-server-config";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModelCombobox } from "@/components/ui/model-combobox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export function Settings() {
  const {
    apiKey,
    setApiKey,
    model,
    setModel,
    baseUrl,
    setBaseUrl,
    apiKeyHeader,
    setApiKeyHeader,
    resetToDefaults,
  } = useConfig();
  const { config, loading, error } = useServerConfig();

  const requiresUserApiKey = React.useMemo(() => {
    if (!config) return null;
    return !config.hasOpenAIKey;
  }, [config]);

  const showServerDefaults = Boolean(config?.defaults);

  return (
    <div className="grid gap-6 p-4">
      <Alert className="bg-muted/40 border-border/60">
        <LockKeyhole className="mt-0.5" aria-hidden="true" />
        <AlertTitle>Bring your own API key</AlertTitle>
        <AlertDescription className="space-y-2">
          {loading && (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Checking server configuration…
            </span>
          )}
          {requiresUserApiKey === true && (
            <span className="block text-sm text-muted-foreground">
              Add a valid OpenAI-compatible key below to enable chat responses.
            </span>
          )}
          {requiresUserApiKey === false && (
            <span className="block text-sm text-muted-foreground">
              An API key is already configured on the server. Updating these fields lets you override it locally.
            </span>
          )}
          {requiresUserApiKey === null && !loading && (
            <span className="block text-sm text-muted-foreground">
              Enter your OpenAI-compatible key below. It stays in this browser only.
            </span>
          )}
          <span className="block text-xs text-muted-foreground/80">
            Keys are persisted to local storage and never leave your device.
          </span>
          {error && (
            <span className="block text-xs text-destructive">
              Failed to load server defaults: {error}
            </span>
          )}
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="api-key">API Key</Label>
        <Input
          id="api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          autoComplete="off"
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">Local only</Badge>
          <span>We send this key with requests only when you start a chat.</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="api-key-header">API Key Header</Label>
        <Input
          id="api-key-header"
          value={apiKeyHeader}
          onChange={(e) => setApiKeyHeader(e.target.value)}
          placeholder="Authorization or api-key"
        />
        {showServerDefaults && (
          <span className="block text-xs text-muted-foreground">
            Server default: {config?.defaults.apiKeyHeader ?? "Authorization"}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="model">Model</Label>
        <ModelCombobox value={model} onChange={setModel} />
        {showServerDefaults && (
          <span className="block text-xs text-muted-foreground">
            Server default: {config?.defaults.model}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="base-url">Base URL</Label>
        <Input
          id="base-url"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://api.openai.com/v1"
        />
        {showServerDefaults && (
          <span className="block text-xs text-muted-foreground">
            Server default: {config?.defaults.baseUrl}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          Need help? Follow the setup guide in the project README.
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={resetToDefaults}>
            <RefreshCcw className="mr-2 size-4" aria-hidden="true" />
            Reset to defaults
          </Button>
          <Button type="button" size="sm" asChild variant="secondary">
            <a href="https://github.com/proteincontent/Equivocal#setup" target="_blank" rel="noreferrer">
              View setup guide
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
