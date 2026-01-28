"use client";

import { useEffect, useRef } from "react";
import { useContract } from "../context/contract-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function ContractViewer() {
  const { state, dispatch } = useContract();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 监听点击事件，更新 activeRiskId
  useEffect(() => {
    const handleRiskClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // 忽略 Inline 组件内部的点击（如果有的话）
      if (target.closest('.inline-risk-details')) return;
      if (target.closest('.risk-fixed')) return;

      const highlightElement = target.closest?.(".risk-highlight") as HTMLElement | null;
      
      if (highlightElement) {
        const riskId = highlightElement.getAttribute("data-risk-id");
        if (riskId) {
          // 如果点击的是已经激活的，不取消，保持激活状态，让用户去点别的地方取消
          // 或者再次点击取消？这里我们选择：点击即激活，点击空白处取消
          dispatch({ type: "SET_ACTIVE_RISK", payload: riskId });
        }
      } else {
        // 点击非高亮区域，取消选中
        dispatch({ type: "SET_ACTIVE_RISK", payload: null });
      }
    };

    const wrapper = wrapperRef.current;
    wrapper?.addEventListener("click", handleRiskClick);

    return () => {
      wrapper?.removeEventListener("click", handleRiskClick);
    };
  }, [dispatch]);

  // 监听 activeRiskId 变化，滚动到对应位置并添加激活样式
  useEffect(() => {
    // 1. 清除旧的激活样式
    document.querySelectorAll('.risk-highlight-active').forEach(el => {
      if (!state.activeRiskId || el.getAttribute('data-risk-id') !== state.activeRiskId) {
         el.classList.remove('risk-highlight-active');
      }
    });

    if (!state.activeRiskId) return;

    // 2. 添加新的激活样式并滚动
    const docElement = document.getElementById(`risk-text-${state.activeRiskId}`);
    
    if (docElement) {
      docElement.classList.add("risk-highlight-active");
      
      // 平滑滚动到视野中央
      docElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state.activeRiskId]);

  return (
    <div className="h-full bg-muted/20 flex flex-col" ref={wrapperRef}>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="px-8 py-12 flex justify-center min-h-full">
          <div className="w-full max-w-[800px] bg-white shadow-sm border rounded-xl p-12 min-h-[1000px]">
             {/* 模拟纸张头部 */}
             <div className="mb-12 border-b pb-4 flex justify-between items-end">
                <h1 className="text-2xl font-serif font-bold text-gray-900">{state.fileName}</h1>
                <span className="text-xs text-muted-foreground font-mono">DOCUMENT ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
             </div>

             {/* 文档内容 */}
             <div 
                ref={containerRef}
                id="contract-container" 
                className={cn(
                  "contract-doc prose prose-slate max-w-none",
                  "prose-headings:font-serif prose-headings:font-bold",
                  "prose-p:leading-relaxed prose-p:text-justify",
                  "prose-strong:font-bold prose-strong:text-gray-900"
                )}
                dangerouslySetInnerHTML={{ __html: state.htmlContent || "" }} 
             />
             
             {/* 模拟纸张底部 */}
             <div className="mt-24 pt-8 border-t text-center text-xs text-gray-300 font-mono">
                END OF DOCUMENT
             </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}