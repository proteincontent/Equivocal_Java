"use client";

import { useEffect, useRef } from "react";
import { useContract } from "../context/contract-context";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Wand2, Copy, CheckCircle2, AlertTriangle, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ContractRisk } from "../types";

export function RiskPanel() {
  const { state, dispatch, actions, computed } = useContract();
  const scrollRef = useRef<HTMLDivElement>(null);

  // 监听 activeRiskId 变化，滚动到对应卡片
  useEffect(() => {
    if (!state.activeRiskId) return;

    const cardElement = document.getElementById(`risk-card-${state.activeRiskId}`);
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state.activeRiskId]);

  return (
    <div className="h-full flex flex-col bg-background border-l">
      {/* Header Stats */}
      <div className="p-4 border-b bg-muted/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">风险审查报告</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            共 {state.risks.length} 处
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatBadge
            count={computed.stats.high}
            label="高风险"
            type="high"
            active={state.riskFilter === "high"}
            onClick={() =>
              dispatch({
                type: "SET_FILTER",
                payload: state.riskFilter === "high" ? "all" : "high",
              })
            }
          />
          <StatBadge
            count={computed.stats.medium}
            label="建议优化"
            type="medium"
            active={state.riskFilter === "medium"}
            onClick={() =>
              dispatch({
                type: "SET_FILTER",
                payload: state.riskFilter === "medium" ? "all" : "medium",
              })
            }
          />
          <StatBadge
            count={computed.stats.safe}
            label="权益保障"
            type="safe"
            active={state.riskFilter === "safe"}
            onClick={() =>
              dispatch({
                type: "SET_FILTER",
                payload: state.riskFilter === "safe" ? "all" : "safe",
              })
            }
          />
        </div>
      </div>

      {/* Risk List */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4 space-y-3">
          {computed.visibleRisks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p>暂无相关风险点</p>
            </div>
          ) : (
            computed.visibleRisks.map((risk) => (
              <RiskCard
                key={risk.id}
                risk={risk}
                isActive={state.activeRiskId === risk.id}
                onClick={() => dispatch({ type: "SET_ACTIVE_RISK", payload: risk.id })}
                onAccept={(text) => actions.acceptFix(risk.id, text)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function StatBadge({
  count,
  label,
  type,
  active,
  onClick,
}: {
  count: number;
  label: string;
  type: "high" | "medium" | "safe";
  active: boolean;
  onClick: () => void;
}) {
  const colors = {
    high: "text-destructive bg-destructive/10 border-destructive/20 hover:bg-destructive/20",
    medium: "text-yellow-600 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20",
    safe: "text-green-600 bg-green-500/10 border-green-500/20 hover:bg-green-500/20",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-2 rounded-lg border transition-all",
        colors[type],
        active ? "ring-2 ring-primary ring-offset-1" : "opacity-70 hover:opacity-100",
      )}
    >
      <span className="text-lg font-bold leading-none mb-1">{count}</span>
      <span className="text-[10px] font-medium opacity-80">{label}</span>
    </button>
  );
}

function RiskCard({
  risk,
  isActive,
  onClick,
  onAccept,
}: {
  risk: ContractRisk;
  isActive: boolean;
  onClick: () => void;
  onAccept: (text: string) => void;
}) {
  const suggestedText =
    risk.suggestion?.match(/建议修改为[："""](.*?)["""]|建议改为[："""](.*?)["""]/)?.[1] ||
    risk.suggestion;
  const showDiff =
    suggestedText && suggestedText.length < 500 && suggestedText !== risk.originalText;

  return (
    <div
      id={`risk-card-${risk.id}`}
      onClick={onClick}
      className={cn(
        "group relative p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md",
        isActive
          ? "bg-card border-primary ring-1 ring-primary shadow-lg scale-[1.02] z-10"
          : "bg-card border-border hover:border-primary/30",
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {risk.level === "high" && <AlertCircle className="w-4 h-4 text-destructive shrink-0" />}
          {risk.level === "medium" && (
            <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
          )}
          {risk.level === "safe" && <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />}
          <h3
            className={cn(
              "font-medium text-sm leading-tight",
              risk.level === "high" ? "text-destructive" : "text-foreground",
            )}
          >
            {risk.title}
          </h3>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2 group-hover:line-clamp-none transition-all">
        {risk.description}
      </p>

      {isActive && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          {showDiff ? (
            <div className="space-y-2 mt-3 pt-3 border-t">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                修改建议
              </div>
              <div className="bg-muted/30 rounded p-2 text-xs space-y-2">
                <div className="flex gap-2 opacity-60">
                  <span className="text-destructive font-bold select-none">-</span>
                  <span className="line-through decoration-destructive/50">
                    {risk.originalText}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-green-600 font-bold select-none">+</span>
                  <span className="text-green-700 bg-green-50 rounded px-1">{suggestedText}</span>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full h-8 mt-2 text-xs gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onAccept(suggestedText!);
                }}
              >
                <Wand2 className="w-3 h-3" />
                采纳修改
              </Button>
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                建议
              </div>
              <div className="text-xs bg-muted/30 p-2 rounded text-foreground/90 leading-relaxed">
                {risk.suggestion}
              </div>
            </div>
          )}

          <div className="flex justify-end mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(risk.suggestion || "");
                toast.success("已复制");
              }}
            >
              <Copy className="w-3 h-3 mr-1" />
              复制
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
