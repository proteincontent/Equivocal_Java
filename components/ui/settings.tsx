"use client";

import * as React from "react";
import { LockKeyhole, Loader2, RefreshCcw } from "lucide-react";
import { useConfig } from "@/hooks/use-config";
import { useServerConfig } from "@/hooks/use-server-config";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Settings() {
  const { botId, resetToDefaults } = useConfig();
  const { loading } = useServerConfig();

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground/80 px-1">
        <LockKeyhole className="size-3.5 shrink-0" aria-hidden="true" />
        {loading ? (
          <span className="flex items-center gap-1.5">
            <Loader2 className="size-3 animate-spin" aria-hidden="true" />
            Checking server configuration…
          </span>
        ) : (
          <span>Using built-in Coze integration. No configuration required.</span>
        )}
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="bot-id" className="text-sm font-medium">Bot ID</Label>
        <Input
          id="bot-id"
          value={botId}
          disabled
          className="font-mono bg-muted"
        />
        <p className="text-xs text-muted-foreground/80">
          Using built-in Coze Bot ID
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
        </div>
      </div>
    </div>
  );
}
