"use client";

import { motion } from "framer-motion";
import { Users, Shield, UserCheck } from "lucide-react";
import { ParallaxTilt } from "@/components/ui/parallax-tilt";

interface StatData {
  total: number;
  admins: number;
  users: number;
}

interface CellStatsProps {
  stats: StatData;
  loading?: boolean;
  activeFilter?: 'all' | 'admin' | 'user';
  onFilterChange?: (filter: 'all' | 'admin' | 'user') => void;
}

function Cell({
  value,
  label,
  icon: Icon,
  color,
  delay = 0,
  isActive = false,
  onClick
}: {
  value: number;
  label: string;
  icon: React.ElementType;
  color: string;
  delay?: number;
  isActive?: boolean;
  onClick?: () => void;
}) {
  const colorStyles: Record<string, { bg: string; shadow: string; icon: string }> = {
    peach: {
      bg: "bg-orange-100/50",
      shadow: "shadow-[0_20px_50px_rgba(255,166,128,0.3)]",
      icon: "text-orange-400"
    },
    lavender: {
      bg: "bg-purple-100/50",
      shadow: "shadow-[0_20px_50px_rgba(192,132,252,0.3)]",
      icon: "text-purple-400"
    },
    mint: {
      bg: "bg-emerald-100/50",
      shadow: "shadow-[0_20px_50px_rgba(52,211,153,0.3)]",
      icon: "text-emerald-400"
    }
  };

  const style = colorStyles[color];

  return (
    <ParallaxTilt intensity={20}>
      <motion.div
        className={`relative p-8 rounded-[3rem] backdrop-blur-3xl border-2 ${style.bg} ${style.shadow} overflow-hidden h-full cursor-pointer select-none ${
          isActive
            ? 'border-gray-800 ring-2 ring-gray-800/20'
            : 'border-white/40 hover:border-gray-300'
        }`}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: delay,
          type: "spring",
          stiffness: 100,
          damping: 20
        }}
        whileHover={{
          scale: 1.05,
          transition: { type: "spring", stiffness: 300, damping: 15 }
        }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        {/* 内部的高光，模拟像果冻一样的质感 */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/80 via-transparent to-transparent opacity-60 pointer-events-none" />
        
        {/* 呼吸动画的背景斑点 */}
        <motion.div
          className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full ${style.icon} opacity-10 blur-2xl`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 flex flex-col items-center text-center h-full justify-center">
          <div className={`p-4 rounded-2xl bg-white/60 mb-4 backdrop-blur-sm ${style.icon}`}>
            <Icon className="w-8 h-8" strokeWidth={2.5} />
          </div>
          
          <motion.span
            className="text-5xl font-black text-gray-800 tracking-tight tabular-nums"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.2 }}
          >
            {value}
          </motion.span>
          
          <span className="text-sm font-bold text-gray-500/80 uppercase tracking-widest mt-2">
            {label}
          </span>
          
          {/* 激活状态指示器 */}
          {isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded-full"
            >
              筛选中
            </motion.div>
          )}
          
          {/* 点击提示 */}
          {!isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="mt-3 text-xs text-gray-400"
            >
              点击筛选
            </motion.div>
          )}
        </div>
      </motion.div>
    </ParallaxTilt>
  );
}

export function CellStats({ stats, loading, activeFilter = 'all', onFilterChange }: CellStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-[3rem] bg-white/20 animate-pulse backdrop-blur-md" />
        ))}
      </div>
    );
  }

  const handleFilterClick = (filter: 'all' | 'admin' | 'user') => {
    // 如果点击当前激活的筛选，则清除筛选
    if (activeFilter === filter) {
      onFilterChange?.('all');
    } else {
      onFilterChange?.(filter);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
      <Cell
        value={stats.total}
        label="总用户"
        icon={Users}
        color="peach"
        delay={0}
        isActive={activeFilter === 'all'}
        onClick={() => handleFilterClick('all')}
      />
      <Cell
        value={stats.admins}
        label="管理员"
        icon={Shield}
        color="lavender"
        delay={0.1}
        isActive={activeFilter === 'admin'}
        onClick={() => handleFilterClick('admin')}
      />
      <Cell
        value={stats.users}
        label="普通用户"
        icon={UserCheck}
        color="mint"
        delay={0.2}
        isActive={activeFilter === 'user'}
        onClick={() => handleFilterClick('user')}
      />
    </div>
  );
}
