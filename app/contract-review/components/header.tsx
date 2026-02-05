"use client";

import Link from "next/link";
import { ChevronLeft, FileText, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContract } from "../context/contract-context";

export function Header() {
  const { state, actions } = useContract();

  return (
    <header className="h-14 border-b flex items-center justify-between px-4 bg-background z-20 shrink-0">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div className="h-6 w-px bg-border/60 mx-1" />

        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-primary/10 rounded">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col leading-none gap-1">
            <h1
              className="font-semibold text-sm max-w-[200px] sm:max-w-[400px] truncate"
              title={state.fileName}
            >
              {state.fileName}
            </h1>
            <span className="text-[10px] text-muted-foreground">AI 智能审查模式</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {state.undoStack.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.undo}
            className="text-muted-foreground hover:text-foreground h-8 text-xs gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            撤销
          </Button>
        )}

        <div className="h-4 w-px bg-border/60 mx-1" />

        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-2"
          onClick={() => {
            // 简单的重新加载页面来模拟重新上传，或者调用 actions.reset
            window.location.reload();
          }}
        >
          重新上传
        </Button>
        <Button size="sm" className="h-8 text-xs gap-2 shadow-sm">
          <Download className="w-3.5 h-3.5" />
          导出报告
        </Button>
      </div>
    </header>
  );
}
