"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface HolographicTitleProps {
  title: string;
  subtitle?: string;
  status?: "online" | "warning" | "critical";
}

export function HolographicTitle({ title, subtitle, status = "online" }: HolographicTitleProps) {
  const [glitchActive, setGlitchActive] = useState(false);
  const [scanlinePosition, setScanlinePosition] = useState(0);

  // 随机故障效果
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 100 + Math.random() * 150);
      }
    }, 100);

    return () => clearInterval(glitchInterval);
  }, []);

  // 扫描线动画
  useEffect(() => {
    const scanInterval = setInterval(() => {
      setScanlinePosition(prev => (prev + 1) % 100);
    }, 50);

    return () => clearInterval(scanInterval);
  }, []);

  const statusColors = {
    online: "text-emerald-400",
    warning: "text-amber-400",
    critical: "text-red-400",
  };

  const statusGlow = {
    online: "shadow-emerald-500/50",
    warning: "shadow-amber-500/50",
    critical: "shadow-red-500/50",
  };

  const statusText = {
    online: "系统运行正常",
    warning: "存在异常警告",
    critical: "系统状态危急",
  };

  return (
    <div className="relative">
      {/* 背景装饰线条 */}
      <div className="absolute -left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent" />
      <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
      
      {/* 主标题区域 */}
      <div className="relative overflow-hidden">
        {/* 扫描线效果 */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `linear-gradient(
              to bottom,
              transparent ${scanlinePosition - 5}%,
              rgba(0, 255, 255, 0.1) ${scanlinePosition}%,
              transparent ${scanlinePosition + 5}%
            )`
          }}
        />
        
        {/* 水平扫描线纹理 */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.03) 2px,
              rgba(255, 255, 255, 0.03) 4px
            )`
          }}
        />

        {/* 标题文字 */}
        <motion.h1 
          className={`text-5xl md:text-7xl font-black tracking-tighter relative ${glitchActive ? 'translate-x-[2px]' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* 主文字 */}
          <span className="relative inline-block">
            {/* 底层光晕 */}
            <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30" />
            
            {/* 主文字层 */}
            <span className="relative bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]">
              {title}
            </span>
            
            {/* 故障时的偏移层 */}
            {glitchActive && (
              <>
                <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent translate-x-[3px] translate-y-[-2px] opacity-70">
                  {title}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent translate-x-[-3px] translate-y-[2px] opacity-70">
                  {title}
                </span>
              </>
            )}
          </span>
        </motion.h1>

        {/* 副标题/状态指示器 */}
        <motion.div 
          className="mt-4 flex items-center gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* 状态指示灯 */}
          <div className="flex items-center gap-2">
            <div className={`relative w-2 h-2 rounded-full ${statusColors[status]} shadow-lg ${statusGlow[status]}`}>
              <div className={`absolute inset-0 rounded-full ${statusColors[status]} animate-ping opacity-75`} />
            </div>
            <span className={`text-sm font-mono uppercase tracking-wider ${statusColors[status]}`}>
              {statusText[status]}
            </span>
          </div>

          {/* 分隔线 */}
          <div className="h-4 w-px bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent" />

          {/* 副标题 */}
          {subtitle && (
            <span className="text-muted-foreground/70 font-mono text-sm tracking-wide">
              {subtitle}
            </span>
          )}
        </motion.div>

        {/* 底部装饰线 */}
        <motion.div 
          className="mt-6 h-px bg-gradient-to-r from-cyan-500/50 via-blue-500/30 to-transparent"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        />
      </div>

      {/* 右侧装饰 - 数据流动画 */}
      <div className="absolute -right-4 top-0 bottom-0 flex flex-col justify-center gap-1 opacity-30">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="h-px bg-cyan-500"
            style={{ width: Math.random() * 20 + 10 }}
            animate={{ 
              opacity: [0.3, 1, 0.3],
              width: [10, 30, 10]
            }}
            transition={{
              duration: 1 + Math.random(),
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    </div>
  );
}