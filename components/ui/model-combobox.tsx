"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/hooks/use-config";
import { LoaderIcon, Search } from "lucide-react";

type ModelComboboxProps = {
  value: string;
  onChange: (_value: string) => void;
  placeholder?: string;
  className?: string;
};

export function ModelCombobox({
  value,
  onChange,
  placeholder = "Select a model ID",
  className,
}: ModelComboboxProps) {
  const { apiKey, apiKeyHeader, baseUrl } = useConfig();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [models, setModels] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return models;
    return models.filter((m) => m.toLowerCase().includes(q));
  }, [models, query]);

  const fetchModels = React.useCallback(async () => {
    if (!apiKey) {
      setError("Please enter an API key first");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: { apiKey, apiKeyHeader, baseUrl },
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.detail || data?.error || `Failed: ${resp.status}`);
      const list: string[] = Array.isArray(data?.models) ? data.models : [];
      setModels(list);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [apiKey, apiKeyHeader, baseUrl]);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleFocus = () => {
    setOpen(true);
    if (models.length === 0 && !loading) void fetchModels();
  };

  const handleSelect = (m: string) => {
    onChange(m);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="pr-9"
        />
        <button
          type="button"
          aria-label="Search models"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => {
            setOpen((v) => !v);
            if (models.length === 0 && !loading) void fetchModels();
          }}
        >
          {loading ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-md">
          <div className="p-2 border-b border-border bg-background/60">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter models by keyword..."
            />
          </div>
          <div className="max-h-64 overflow-auto">
            {error ? (
              <div className="p-3 text-xs text-destructive/80">{error}</div>
            ) : filtered.length > 0 ? (
              filtered.map((m) => (
                <button
                  key={m}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                    m === value && "bg-accent/60",
                  )}
                  onClick={() => handleSelect(m)}
                >
                  {m}
                </button>
              ))
            ) : (
              <div className="p-3 text-sm text-muted-foreground">No matching models</div>
            )}
          </div>
          <div className="flex items-center justify-between p-2 border-t border-border bg-background/50 gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void fetchModels()}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh list"}
            </Button>
            <div className="text-xs text-muted-foreground">
              You can also type a model ID manually
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
