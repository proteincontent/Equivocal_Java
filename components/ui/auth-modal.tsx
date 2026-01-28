"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon, LoaderIcon, User, LogOut, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildApiUrl, fetchWithTimeout, isNetworkOrTimeoutError, readResponseJsonSafe } from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { userId: string; email: string; role: number }) => void;
  initialMode?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [codeMessage, setCodeMessage] = useState<string | null>(null);
  const [mouseDownPos, setMouseDownPos] = useState<{ x: number; y: number } | null>(null);

  // 倒计时逻辑
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // 发送验证码
  const handleSendCode = async () => {
    setError(null);
    setCodeMessage(null);

    if (!email) {
      setError("请先输入邮箱");
      return;
    }

    if (!validateEmail(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }

    setIsSendingCode(true);

    try {
      const response = await fetchWithTimeout(buildApiUrl("/api/auth/send-code"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }, 15000);

      const data = await readResponseJsonSafe<{ error?: string; message?: string }>(response);

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "发送验证码失败");
      }

      setCodeMessage("验证码已发送到您的邮箱，请查收");
      setCountdown(60); // 60秒倒计时
    } catch (err) {
      if (isNetworkOrTimeoutError(err)) {
        setError("请求超时或无法连接服务器，请确认后端服务可用后重试");
      } else {
        setError(err instanceof Error ? err.message : "发送验证码失败");
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    // 验证
    if (!email || !password) {
      setError("请填写邮箱和密码");
      return;
    }

    if (!validateEmail(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }

    if (mode === "register") {
      // 只在注册时验证密码长度
      if (password.length < 6) {
        setError("密码至少需要6个字符");
        return;
      }

      if (password !== confirmPassword) {
        setError("两次输入的密码不一致");
        return;
      }

      if (!verificationCode) {
        setError("请输入邮箱验证码");
        return;
      }

      if (!/^\d{6}$/.test(verificationCode)) {
        setError("验证码格式不正确");
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetchWithTimeout(buildApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          email,
          password,
          ...(mode === "register" && { code: verificationCode }),
        }),
      }, 15000);

      const data = await readResponseJsonSafe<any>(response);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            (mode === "login" ? "登录失败" : "注册失败")
        );
      }

      // 保存到 localStorage
      if (!data?.token) {
        throw new Error("服务端未返回 token，请联系管理员检查后端响应");
      }

      localStorage.setItem("auth_token", data.token);
      
      // 适配 Java 后端响应结构 (data.user) 或旧版扁平结构
      const userInfo = data.user || data;
      const userToSave = {
        userId: userInfo.id || userInfo.userId,
        email: userInfo.email,
        role: userInfo.role || 1
      };

      localStorage.setItem("auth_user", JSON.stringify(userToSave));

      onAuthSuccess(userToSave);
      handleClose();
    } catch (err) {
      if (isNetworkOrTimeoutError(err)) {
        setError("请求超时或无法连接服务器，请确认后端服务可用后重试");
      } else {
        setError(err instanceof Error ? err.message : "操作失败，请稍后再试");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setVerificationCode("");
    setError(null);
    setCodeMessage(null);
    setShowPassword(false);
    setCountdown(0);
    onClose();
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError(null);
    setCodeMessage(null);
    setConfirmPassword("");
    setVerificationCode("");
    setCountdown(0);
  };

  // 处理背景层点击 - 只有真正的点击才关闭，拖拽操作不关闭
  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setMouseDownPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleBackgroundMouseUp = (e: React.MouseEvent) => {
    if (mouseDownPos && e.target === e.currentTarget) {
      // 计算鼠标移动距离
      const distance = Math.sqrt(
        Math.pow(e.clientX - mouseDownPos.x, 2) + 
        Math.pow(e.clientY - mouseDownPos.y, 2)
      );
      // 只有移动距离小于5px才算真实点击
      if (distance < 5) {
        handleClose();
      }
    }
    setMouseDownPos(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={handleBackgroundMouseDown}
          onMouseUp={handleBackgroundMouseUp}
        >
          <motion.div
            className="bg-background rounded-2xl shadow-2xl p-6 w-full max-w-md border border-border/20 dark:border-white/[0.08] max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {mode === "login" ? "欢迎回来" : "创建账号"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {mode === "login" ? "登录以继续使用" : "注册以开始使用"}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <XIcon className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                >
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}
              
              {codeMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                >
                  <p className="text-sm text-green-600 dark:text-green-400">{codeMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auth-email" className="text-sm font-medium">
                  邮箱
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                </div>
              </div>

              {/* 验证码输入（仅注册时显示） */}
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="auth-code" className="text-sm font-medium">
                    邮箱验证码
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="auth-code"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6位数字验证码"
                        className="pl-10"
                        maxLength={6}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendCode}
                      disabled={isSendingCode || countdown > 0}
                      className="whitespace-nowrap"
                    >
                      {isSendingCode ? (
                        <>
                          <LoaderIcon className="h-4 w-4 animate-spin" />
                        </>
                      ) : countdown > 0 ? (
                        `${countdown}秒`
                      ) : (
                        "获取验证码"
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="auth-password" className="text-sm font-medium">
                  密码
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="auth-confirm-password" className="text-sm font-medium">
                    确认密码
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="auth-confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10"
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    />
                  </div>
                </motion.div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-11 text-base font-medium"
              >
                {isLoading ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "login" ? "登录中..." : "注册中..."}
                  </>
                ) : (
                  mode === "login" ? "登录" : "注册"
                )}
              </Button>
            </div>

            {/* Switch Mode */}
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {mode === "login" ? "还没有账号？" : "已有账号？"}
              </span>
              <button
                type="button"
                onClick={switchMode}
                className="ml-1 text-primary hover:underline font-medium bg-transparent border-none cursor-pointer p-0"
              >
                {mode === "login" ? "立即注册" : "立即登录"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface UserAvatarProps {
  user: { userId: string; email: string; role?: number } | null;
  onLogin: () => void;
  onLogout: () => void;
  className?: string;
}

/**
 * 用户头像组件
 *
 * 设计理念：
 * - 统一的按钮风格
 * - 精致的下拉菜单
 * - 流畅的微交互
 */
export function UserAvatar({ user, onLogin, onLogout, className }: UserAvatarProps) {
  const [showMenu, setShowMenu] = useState(false);

  // 未登录状态 - 显示登录按钮
  if (!user) {
    return (
      <button
        onClick={onLogin}
        className={cn(
          "flex items-center justify-center gap-2 rounded-xl h-10 px-4",
          "border border-border/50 dark:border-white/10",
          "bg-background/80 dark:bg-white/5",
          "backdrop-blur-xl shadow-sm",
          "text-foreground/80 dark:text-white/80",
          "transition-all duration-300",
          "hover:bg-secondary dark:hover:bg-white/10",
          "hover:border-border dark:hover:border-white/20",
          "hover:shadow-md",
          "active:scale-[0.98]",
          className
        )}
      >
        <User className="h-4 w-4" />
        <span className="text-sm font-medium">登录</span>
      </button>
    );
  }

  // 已登录状态
  const email = user.email || "Unknown";
  const initial = email.charAt(0).toUpperCase();
  const username = email.split("@")[0];

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={cn(
          "flex items-center gap-2 rounded-xl h-10 px-3",
          "border border-border/50 dark:border-white/10",
          "bg-background/80 dark:bg-white/5",
          "backdrop-blur-xl shadow-sm",
          "transition-all duration-300",
          "hover:bg-secondary dark:hover:bg-white/10",
          "hover:border-border dark:hover:border-white/20",
          "hover:shadow-md",
          "active:scale-[0.98]",
          className
        )}
      >
        {/* 头像 */}
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
          <span className="text-xs font-semibold text-primary-foreground">
            {initial}
          </span>
        </div>
        {/* 用户名 - 仅桌面端显示 */}
        <div className="hidden sm:flex flex-col items-start leading-none">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">User ID</span>
          <span className="text-sm font-medium text-foreground/80 dark:text-white/80 max-w-[100px] truncate">
            {username}
          </span>
        </div>
      </button>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* 遮罩层 */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
            />
            {/* 菜单面板 */}
            <motion.div
              className={cn(
                "absolute right-0 top-full mt-2 w-56",
                "bg-background/95 dark:bg-card/95 backdrop-blur-xl",
                "rounded-xl shadow-xl",
                "border border-border/50 dark:border-white/10",
                "overflow-hidden z-50"
              )}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* 用户信息 */}
              <div className="p-4 border-b border-border/50 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                    <span className="text-sm font-semibold text-primary-foreground">
                      {initial}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{username}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="p-2">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onLogout();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    "text-sm font-medium text-destructive",
                    "hover:bg-destructive/10",
                    "transition-colors duration-200"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  <span>退出登录</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
