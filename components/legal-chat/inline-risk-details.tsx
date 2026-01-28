"use client";

import { ContractRisk } from "@/app/contract-review/types";
import { Button } from "@/components/ui/button";
import { Wand2, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface InlineRiskDetailsProps {
  risk: ContractRisk;
  onAcceptFix: (riskId: string, newText: string) => void;
  onDismiss: () => void;
  className?: string;
}

export function InlineRiskDetails({
  risk,
  onAcceptFix,
  onDismiss,
  className,
}: InlineRiskDetailsProps) {
  // 提取建议中的修改文本
  const suggestedText = risk.suggestion?.match(/建议修改为[："""](.*?)["""]|建议改为[："""](.*?)["""]/)?.[1] || risk.suggestion;
  
  // 只有当存在"建议修改"且看起来像是一段具体的文本时，才显示 Diff 视图
  const showDiff = suggestedText && suggestedText.length < 500 && suggestedText !== risk.originalText;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0, marginTop: 0 }}
      animate={{ height: "auto", opacity: 1, marginTop: 12 }}
      exit={{ height: 0, opacity: 0, marginTop: 0 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className={cn("overflow-hidden rounded-lg border bg-card/95 backdrop-blur shadow-sm select-text cursor-auto", className)}
      onClick={(e) => e.stopPropagation()} // 防止点击内部触发折叠
    >
      {/* Header */}
      <div className={cn(
        "px-3 py-2 border-b flex items-center justify-between text-xs font-medium",
        risk.level === 'high' ? "bg-destructive/10 text-destructive" :
        risk.level === 'medium' ? "bg-yellow-500/10 text-yellow-600" :
        "bg-green-500/10 text-green-600"
      )}>
        <span className="flex items-center gap-1.5">
          {risk.level === 'high' && "⚠️ 高风险条款"}
          {risk.level === 'medium' && "⚡ 建议优化"}
          {risk.level === 'safe' && "🛡️ 权益保障"}
        </span>
        <div className="flex items-center gap-2">
           <span className="text-[10px] text-muted-foreground/60 font-normal">
             按 Esc 收起
           </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* 风险标题 & 描述 */}
        <div className="space-y-1.5">
          <div className="text-sm font-medium text-foreground">
            {risk.title}
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            {risk.description}
          </div>
        </div>
        
        {showDiff ? (
          <div className="space-y-3 text-sm border-t pt-4 bg-muted/10 -mx-4 px-4 pb-2">
            <div className="text-xs font-medium text-muted-foreground mb-2 mt-2">修改建议</div>
            
            <div className="grid grid-cols-[24px_1fr] gap-2 items-start opacity-60">
              <div className="w-6 h-6 rounded bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold">-</span>
              </div>
              <p className="line-through decoration-red-400/50 text-muted-foreground leading-relaxed text-xs">
                {risk.originalText}
              </p>
            </div>
            
            <div className="grid grid-cols-[24px_1fr] gap-2 items-start">
              <div className="w-6 h-6 rounded bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold">+</span>
              </div>
              <p className="text-foreground font-medium leading-relaxed bg-green-50/50 p-2 rounded text-xs border border-green-100/50">
                {suggestedText}
              </p>
            </div>
          </div>
        ) : risk.suggestion ? (
          <div className="border-t pt-4">
            <div className="text-xs font-medium text-muted-foreground mb-2">建议</div>
            <div className="text-sm text-foreground/90 leading-relaxed bg-muted/30 p-3 rounded">
              {risk.suggestion}
            </div>
          </div>
        ) : null}

        {/* Footer Actions */}
        <div className="flex items-center gap-2 pt-2">
          {showDiff ? (
            <Button 
              size="sm" 
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white shadow-sm h-8"
              onClick={() => suggestedText && onAcceptFix(risk.id, suggestedText)}
            >
              <Wand2 className="w-3.5 h-3.5" />
              采纳修改
            </Button>
          ) : null}
          <Button 
            size="sm" 
            variant="secondary"
            className={cn("gap-2 h-8", showDiff ? "flex-1" : "w-full")}
            onClick={() => {
              navigator.clipboard.writeText(risk.suggestion || risk.description || "");
              toast.success("已复制到剪贴板");
            }}
          >
            <Copy className="w-3.5 h-3.5" />
            复制内容
          </Button>
        </div>
      </div>
    </motion.div>
  );
}