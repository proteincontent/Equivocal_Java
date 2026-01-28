"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, Shield, UserCheck } from "lucide-react";

interface StatData {
  total: number;
  admins: number;
  users: number;
}

interface HolographicStatsProps {
  stats: StatData;
  loading?: boolean;
}

function ArcGauge({ 
  value, 
  maxValue, 
  label, 
  icon: Icon, 
  color,
  delay = 0 
}: { 
  value: number; 
  maxValue: number; 
  label: string; 
  icon: React.ElementType;
  color: string;
  delay?: number;
}) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const springValue = useSpring(0, { stiffness: 50, damping: 20 });
  const displayValue = useTransform(springValue, v => Math.round(v));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      springValue.set(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay, springValue]);

  // SVG 弧形参数
  const radius = 70;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270度弧
  const strokeDashoffset = arcLength - (arcLength * percentage) / 100;

  const colorClasses: Record<string, { stroke: string; glow: string; text: string; bg: string }> = {
    cyan: {
      stroke: "stroke-cyan-400",
      glow: "drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]",
      text: "text-cyan-400",
      bg: "from-cyan-500/20"
    },
    purple: {
      stroke: "stroke-[#2563EB]",
      glow: "drop-shadow-[0_0_10px_rgba(37,99,235,0.8)]",
      text: "text-[#2563EB]",
      bg: "from-[#2563EB]/20"
    },
    emerald: {
      stroke: "stroke-indigo-400",
      glow: "drop-shadow-[0_0_10px_rgba(129,140,248,0.8)]",
      text: "text-indigo-400",
      bg: "from-indigo-500/20"
    }
  };

  const colors = colorClasses[color] || colorClasses.cyan;

  return (
    <motion.div 
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* 背景光晕 */}
      <div className={`absolute inset-0 bg-gradient-radial ${colors.bg} to-transparent blur-3xl opacity-50`} />
      
      {/* SVG 仪表盘 */}
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-[135deg]" viewBox="0 0 160 160">
          {/* 背景弧 */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            className="text-white/5"
          />
          
          {/* 刻度线 */}
          {[...Array(28)].map((_, i) => {
            const angle = (i * 270) / 27 - 135;
            const radian = (angle * Math.PI) / 180;
            const innerR = radius - 15;
            const outerR = radius - (i % 4 === 0 ? 20 : 18);
            return (
              <line
                key={i}
                x1={80 + innerR * Math.cos(radian)}
                y1={80 + innerR * Math.sin(radian)}
                x2={80 + outerR * Math.cos(radian)}
                y2={80 + outerR * Math.sin(radian)}
                stroke="currentColor"
                strokeWidth={i % 4 === 0 ? 2 : 1}
                className="text-white/20"
              />
            );
          })}
          
          {/* 进度弧 */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset: mounted ? strokeDashoffset : arcLength }}
            transition={{ duration: 1.5, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
            className={`${colors.stroke} ${colors.glow}`}
          />
          
          {/* 发光点 */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={`2 ${circumference}`}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset: mounted ? strokeDashoffset : arcLength }}
            transition={{ duration: 1.5, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
            className={`${colors.stroke} ${colors.glow} opacity-100`}
          />
        </svg>
        
        {/* 中心内容 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* 图标 */}
          <motion.div 
            className={`mb-1 ${colors.text}`}
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Icon className="w-6 h-6" />
          </motion.div>
          
          {/* 数值 */}
          <motion.span 
            className={`text-4xl font-black tabular-nums ${colors.text}`}
          >
            {displayValue}
          </motion.span>
          
          {/* 标签 */}
          <span className="text-xs text-muted-foreground/70 font-mono uppercase tracking-wider mt-1">
            {label}
          </span>
        </div>
      </div>
      
      {/* 底部装饰 */}
      <div className="mt-4 flex items-center gap-2">
        <div className={`w-1 h-1 rounded-full ${colors.text} animate-pulse`} />
        <span className="text-xs text-muted-foreground/50 font-mono">
          {percentage.toFixed(1)}%
        </span>
        <div className={`w-1 h-1 rounded-full ${colors.text} animate-pulse`} />
      </div>
    </motion.div>
  );
}

export function HolographicStats({ stats, loading }: HolographicStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-center">
            <div className="w-44 h-44 rounded-full bg-white/5 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 连接线装饰 */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent -translate-y-1/2 hidden md:block" />
      
      {/* 仪表盘网格 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        <ArcGauge
          value={stats.total}
          maxValue={Math.max(stats.total, 100)}
          label="总用户"
          icon={Users}
          color="cyan"
          delay={0}
        />
        <ArcGauge
          value={stats.admins}
          maxValue={stats.total}
          label="管理员"
          icon={Shield}
          color="purple"
          delay={200}
        />
        <ArcGauge
          value={stats.users}
          maxValue={stats.total}
          label="普通用户"
          icon={UserCheck}
          color="emerald"
          delay={400}
        />
      </div>
      
      {/* 底部数据流 */}
      <motion.div 
        className="mt-8 flex justify-center gap-4 text-xs font-mono text-muted-foreground/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span>用户总数：{stats.total}</span>
        <span className="text-cyan-500/50">|</span>
        <span>管理员数：{stats.admins}</span>
        <span className="text-cyan-500/50">|</span>
        <span>普通用户数：{stats.users}</span>
      </motion.div>
    </div>
  );
}
