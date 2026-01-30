"use client";

import { motion } from "framer-motion";
import { Settings as SettingsIcon, Users, Menu, ArrowLeft } from "lucide-react";
import { Theme } from "@/components/ui/theme";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "@/components/ui/settings";
import { UserAvatar } from "@/components/ui/auth-modal";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LegalChatToolbarProps {
  selectedType: string | null;
  onBack: () => void;
  settingsOpen: boolean;
  onSettingsOpenChange: (_open: boolean) => void;
  user?: { userId: string; email: string } | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onMobileMenuOpen?: () => void;
}

/**
 * 专业法律服务导航栏
 *
 * 设计理念：
 * - 极简克制，不抢占内容注意力
 * - 精致的玻璃态效果
 * - 统一的按钮样式系统
 * - 流畅的微交互
 */
export function LegalChatToolbar({
  selectedType,
  onBack,
  settingsOpen,
  onSettingsOpenChange,
  user,
  onLogin,
  onLogout,
  onMobileMenuOpen,
}: LegalChatToolbarProps) {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 统一的按钮基础样式
  const buttonBaseClass = cn(
    "flex items-center justify-center gap-2 rounded-xl",
    "border border-border/50 dark:border-white/10",
    "bg-background/80 dark:bg-white/5",
    "backdrop-blur-xl shadow-sm",
    "text-foreground/80 dark:text-white/80",
    "transition-all duration-300",
    "hover:bg-secondary dark:hover:bg-white/10",
    "hover:border-border dark:hover:border-white/20",
    "hover:shadow-md",
    "active:scale-[0.98]",
  );

  const iconButtonClass = cn(buttonBaseClass, "w-10 h-10");
  const textButtonClass = cn(buttonBaseClass, "px-4 h-10");

  return (
    <motion.header
      className="absolute inset-x-0 top-0 z-50 px-4 sm:px-6 py-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* 左侧区域 */}
        <div className="flex items-center gap-3">
          {/* 移动端菜单按钮 */}
          {selectedType && onMobileMenuOpen && (
            <motion.button
              onClick={onMobileMenuOpen}
              className={cn(iconButtonClass, "md:hidden")}
              whileTap={{ scale: 0.95 }}
              aria-label="打开菜单"
            >
              <Menu className="h-5 w-5" />
            </motion.button>
          )}

          {/* 返回按钮 - 仅在聊天界面显示 */}
          {selectedType && (
            <motion.button
              onClick={onBack}
              className={cn(textButtonClass, "hidden md:flex")}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              aria-label="返回首页"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">返回</span>
            </motion.button>
          )}

          {/* 品牌标识 - 仅在首页显示 */}
          {!selectedType && (
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Logo */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-[#2563EB]/20">
                <span className="text-white font-bold text-sm">法</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-foreground">智法顾问</p>
                <p className="text-xs text-muted-foreground">法律 AI 助手</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* 右侧区域 */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 用户头像/登录 */}
          {onLogin && onLogout && (
            <UserAvatar
              user={user ?? null}
              onLogin={onLogin}
              onLogout={onLogout}
              className="!rounded-xl !h-10"
            />
          )}

          {/* 管理员入口 */}
          {mounted && isAdmin() && (
            <motion.button
              onClick={() => router.push("/admin/users")}
              className={textButtonClass}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              aria-label="用户管理"
              title="用户管理"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">管理</span>
            </motion.button>
          )}

          {/* 主题切换 */}
          <Theme variant="button" size="sm" className={iconButtonClass} />

          {/* 设置按钮 - 仅在聊天界面显示 */}
          {mounted && selectedType && (
            <Dialog open={settingsOpen} onOpenChange={onSettingsOpenChange}>
              <DialogTrigger asChild>
                <motion.button
                  className={iconButtonClass}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  aria-label="打开设置"
                >
                  <SettingsIcon className="h-4 w-4" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">设置</DialogTitle>
                </DialogHeader>
                <Settings />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* 当前服务类型指示器 - 仅在聊天界面显示 */}
      {selectedType && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2563EB]/5 dark:bg-[#2563EB]/10 backdrop-blur-xl border border-[#2563EB]/20 dark:border-[#2563EB]/30 shadow-sm shadow-[#2563EB]/5">
            <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
            <span className="text-xs font-semibold text-[#2563EB]">{selectedType}</span>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
