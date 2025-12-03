"use client";

import * as React from "react";
import { LockKeyhole, Loader2, RefreshCcw, Clipboard, Check } from "lucide-react";
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
    baseDomain,
    setBaseDomain,
    apiKeyHeader,
    setApiKeyHeader,
    provider,
    setProvider,
    resetToDefaults,
  } = useConfig();
  const { config, loading, error } = useServerConfig();
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [isPasted, setIsPasted] = React.useState(false);

  const requiresUserApiKey = React.useMemo(() => {
    if (!config) return null;
    return !config.hasOpenAIKey;
  }, [config]);

  const showServerDefaults = Boolean(config?.defaults);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setApiKey(text);
      setIsPasted(true);
      setTimeout(() => setIsPasted(false), 2000);
    } catch (err) {
      console.error("Failed to paste:", err);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground/80 px-1">
        <LockKeyhole className="size-3.5 shrink-0" aria-hidden="true" />
        {loading ? (
          <span className="flex items-center gap-1.5">
            <Loader2 className="size-3 animate-spin" aria-hidden="true" />
            Checking server configuration…
          </span>
        ) : error ? (
          <span className="text-destructive">Failed to load server defaults: {error}</span>
        ) : requiresUserApiKey === true ? (
          <span>Add a valid OpenAI-compatible key below. Keys stored locally only.</span>
        ) : requiresUserApiKey === false ? (
          <span>Server key configured. Override locally if needed.</span>
        ) : (
          <span>Keys stored locally and never leave your device.</span>
        )}
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="provider" className="text-sm font-medium">Provider</Label>
        <div className="flex gap-2">
          {(["openai", "gemini", "anthropic"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProvider(p)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                provider === p
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              {p === "openai" ? "OpenAI" : p === "gemini" ? "Gemini" : "Anthropic"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="api-key" className="text-sm font-medium">API Key</Label>
        <div className="relative">
          <Input
            id="api-key"
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onFocus={() => setShowApiKey(true)}
            onBlur={() => setShowApiKey(false)}
            placeholder="sk-..."
            autoComplete="off"
            className="font-mono pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handlePaste}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            title="Paste from clipboard"
          >
            {isPasted ? (
              <Check className="size-4 text-green-500" />
            ) : (
              <Clipboard className="size-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground/90">
          <Badge variant="outline" className="text-xs">Local only</Badge>
          <span>We send this key with requests only when you start a chat.</span>
        </div>
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="model" className="text-sm font-medium">Model</Label>
        <ModelCombobox value={model} onChange={setModel} />
        {showServerDefaults && (
          <p className="text-xs text-muted-foreground/80">
            Server default: <code className="font-mono text-foreground/70">{config?.defaults.model}</code>
          </p>
        )}
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="base-domain" className="text-sm font-medium">Base URL</Label>
        <Input
          id="base-domain"
          value={baseDomain}
          onChange={(e) => setBaseDomain(e.target.value)}
          placeholder="https://api.openai.com"
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground/80">
          / 结尾忽略 v1 版本，# 结尾强制使用输入地址
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t border-border/40">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="sm:flex-1"
          >
            <RefreshCcw className="mr-2 size-4" aria-hidden="true" />
            Reset to defaults
          </Button>
          <Button
            type="button"
            size="sm"
            asChild
            variant="secondary"
            className="sm:flex-1"
          >
            <a href="https://github.com/proteincontent/Equivocal#setup" target="_blank" rel="noreferrer">
              View setup guide
            </a>
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground/70">
          Need help? Follow the setup guide in the project README.
        </p>
      </div>
    </div>
  );
}
