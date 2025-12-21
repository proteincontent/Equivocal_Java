"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * 专业法律服务背景组件
 * 
 * 设计理念：
 * - 深邃的蓝黑色调传达权威与专业
 * - 微妙的金色点缀暗示高端与信任
 * - 极简的几何元素体现理性与逻辑
 * - 大量留白创造呼吸感与高端感
 */
export function DeveloperBackground({ className }: { className?: string }) {
  return (
    <div className={cn("fixed inset-0 z-0 pointer-events-none overflow-hidden select-none", className)}>
      {/* 1. 基础渐变层 - 纸张质感 vs 深邃专业感 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F9FAFB] via-[#F3F4F6] to-[#E5E7EB]/50 dark:from-[#0A1628] dark:via-[#0D1B2A] dark:to-[#1A2744]" />
      
      {/* 2. 精致的噪点纹理 - 增加质感 */}
      <div className="noise-bg opacity-[0.4] dark:opacity-[0.3]" />
      
      {/* 3. 微妙的几何装饰 - 法律的理性之美 */}
      {/* 左上角装饰线 - 浅色模式下更深一点以保证可见性 */}
      <div className="absolute top-0 left-0 w-[40vw] h-[1px] bg-gradient-to-r from-transparent via-slate-400/30 to-transparent dark:via-white/10" />
      <div className="absolute top-0 left-0 w-[1px] h-[30vh] bg-gradient-to-b from-transparent via-slate-400/30 to-transparent dark:via-white/10" />
      
      {/* 右下角装饰线 */}
      <div className="absolute bottom-0 right-0 w-[35vw] h-[1px] bg-gradient-to-l from-transparent via-slate-400/30 to-transparent dark:via-white/10" />
      <div className="absolute bottom-0 right-0 w-[1px] h-[25vh] bg-gradient-to-t from-transparent via-slate-400/30 to-transparent dark:via-white/10" />
      
      {/* 4. 金色光晕点缀 - 高端信任感 - 浅色模式下稍微加深一点 */}
      <div className="absolute top-[15%] right-[10%] w-[300px] h-[300px] rounded-full opacity-[0.05] dark:opacity-[0.05] animate-breathe"
           style={{ background: 'radial-gradient(circle, #D4A853 0%, transparent 70%)' }} />
      <div className="absolute bottom-[20%] left-[5%] w-[200px] h-[200px] rounded-full opacity-[0.04] dark:opacity-[0.04] animate-breathe animation-delay-4000"
           style={{ background: 'radial-gradient(circle, #D4A853 0%, transparent 70%)' }} />
      
      {/* 5. 蓝色专业光晕 - 可信赖感 */}
      <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full opacity-[0.02] dark:opacity-[0.06] animate-breathe animation-delay-2000"
           style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }} />
      
      {/* 6. 底部渐变遮罩 - 内容聚焦 */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
      
      {/* 7. 顶部微妙的光晕 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] opacity-[0.02] dark:opacity-[0.04]"
           style={{ background: 'radial-gradient(ellipse at top, #2563EB 0%, transparent 70%)' }} />
      
      {/* 8. 中心径向渐变 - 创造深度 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_40%,transparent_0%,var(--background)_100%)] opacity-60" />
    </div>
  );
}