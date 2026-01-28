"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ContractRisk } from "@/app/contract-review/types";
import { Button } from "@/components/ui/button";
import { X, Wand2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface RiskActionPopoverProps {
  activeRiskId: string | null;
  risks: ContractRisk[];
  onAcceptFix: (riskId: string, newText: string) => void;
  onDismiss: () => void;
}

type PopoverPosition = "bottom" | "top";

export function RiskActionPopover({
  activeRiskId,
  risks,
  onAcceptFix,
  onDismiss,
}: RiskActionPopoverProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>("bottom");
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const risk = risks.find((r) => r.id === activeRiskId);

  // 计算弹窗位置，包含边界检测
  const updatePosition = useCallback(() => {
    if (!activeRiskId) {
      setPosition(null);
      return;
    }

    const element = document.getElementById(`risk-text-${activeRiskId}`);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const popoverHeight = 300; // 预估弹窗高度
    const popoverWidth = 380;
    const margin = 8;
    
    // 计算可用空间
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    
    // 决定弹窗位置：优先下方，空间不足时上方
    let finalTop: number;
    let finalPosition: PopoverPosition;
    
    if (spaceBelow >= popoverHeight || spaceBelow >= spaceAbove) {
      // 显示在下方
      finalTop = rect.bottom + margin;
      finalPosition = "bottom";
    } else {
      // 显示在上方
      finalTop = rect.top - margin;
      finalPosition = "top";
    }
    
    // 计算水平位置，确保不超出视口
    let finalLeft = rect.left + rect.width / 2;
    const halfWidth = popoverWidth / 2;
    
    // 左边界检测
    if (finalLeft - halfWidth < margin) {
      finalLeft = halfWidth + margin;
    }
    // 右边界检测
    if (finalLeft + halfWidth > window.innerWidth - margin) {
      finalLeft = window.innerWidth - halfWidth - margin;
    }
    
    setPopoverPosition(finalPosition);
    setPosition({
      top: finalTop,
      left: finalLeft,
    });
  }, [activeRiskId]);

  // 监听目标元素位置变化
  useEffect(() => {
    if (!activeRiskId) {
      setPosition(null);
      return;
    }

    updatePosition();
    
    // 监听滚动和调整窗口大小
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [activeRiskId, updatePosition]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        // 检查是否点击了高亮文本（这种情况由父组件处理）
        const target = e.target as HTMLElement;
        if (target.closest('.risk-highlight')) return;
        
        onDismiss();
      }
    };

    if (activeRiskId) {
      // 延迟添加监听器，避免立即触发
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [activeRiskId, onDismiss]);

  if (!risk || !position || !activeRiskId) return null;

  // 提取建议中的修改文本
  const suggestedText = risk.suggestion?.match(/建议修改为[："""](.*?)["""]|建议改为[："""](.*?)["""]/)?.[1] || risk.suggestion;
  
  // 只有当存在"建议修改"且看起来像是一段具体的文本时，才显示 Diff 视图
  const showDiff = suggestedText && suggestedText.length < 200 && suggestedText !== risk.originalText;

  // 动画变体
  const variants = {
    initial: { 
      opacity: 0, 
      y: popoverPosition === "bottom" ? -8 : 8, 
      scale: 0.95 
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1 
    },
    exit: { 
      opacity: 0, 
      scale: 0.95 
    },
  };

  return createPortal(
    <AnimatePresence mode="wait">
      <motion.div
        key={activeRiskId}
        ref={popoverRef}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={cn(
          "fixed z-50 pointer-events-auto",
          popoverPosition === "bottom" ? "-translate-x-1/2" : "-translate-x-1/2 -translate-y-full"
        )}
        style={{ 
          top: position.top, 
          left: position.left,
        }}
      >
        <div className="bg-popover border shadow-xl rounded-lg overflow-hidden w-[380px] max-w-[90vw] flex flex-col">
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
            <button 
              onClick={onDismiss} 
              className="hover:bg-black/5 rounded p-0.5 transition-colors"
              aria-label="关闭"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 bg-card/50 backdrop-blur-sm max-h-[60vh] overflow-y-auto">
            {/* 风险标题 */}
            <div className="text-sm font-medium text-foreground">
              {risk.title}
            </div>
            
            {/* 风险描述 */}
            <div className="text-xs text-muted-foreground leading-relaxed">
              {risk.description}
            </div>
            
            {showDiff ? (
              <div className="space-y-3 text-sm border-t pt-4">
                <div className="text-xs font-medium text-muted-foreground mb-2">修改建议</div>
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
                  <p className="text-foreground font-medium leading-relaxed bg-green-50/50 p-1 -m-1 rounded text-xs">
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
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                  onClick={() => suggestedText && onAcceptFix(risk.id, suggestedText)}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  采纳修改
                </Button>
              ) : null}
              <Button 
                size="sm" 
                variant="secondary"
                className={cn("gap-2", showDiff ? "flex-1" : "w-full")}
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
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}