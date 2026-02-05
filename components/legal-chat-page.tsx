"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { LegalChatToolbar } from "@/components/legal-chat/toolbar";
import { IntroScreen } from "@/components/legal-chat/intro-screen";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { DeveloperBackground } from "@/components/ui/developer-background";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { type LegalServiceType } from "@/data/legal-services";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/ui/auth-modal";

/**
 * 专业法律服务主页面
 *
 * 设计理念：
 * - 简洁专业的视觉呈现
 * - 流畅的状态过渡动画
 * - 清晰的信息层级
 * - 一致的品牌体验
 */
export function LegalChatPage({ initialShowChat = false }: { initialShowChat?: boolean }) {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<LegalServiceType | null>(
    initialShowChat ? ("法律咨询" as LegalServiceType) : null,
  );
  const [showChat, setShowChat] = useState(initialShowChat);
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // 会话管理状态
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [refreshSessionsTrigger, setRefreshSessionsTrigger] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, login, logout, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogin = useCallback(() => {
    setAuthMode("login");
    setShowAuthModal(true);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleAuthSuccess = useCallback(
    (authUser: { userId: string; email: string; role?: number }) => {
      login({ ...authUser, role: authUser.role || 1 }, localStorage.getItem("auth_token") || "");
      setShowAuthModal(false);
    },
    [login],
  );

  useEffect(() => {
    if (!selectedService) {
      setShowChat(false);
      return;
    }

    const timer = setTimeout(() => setShowChat(true), 600);
    return () => clearTimeout(timer);
  }, [selectedService]);

  const handleBackToHome = useCallback(() => {
    setSelectedService(null);
    setShowChat(false);
    setShowServiceSelector(false);
  }, []);

  const handleServiceConfirm = useCallback(
    (type: LegalServiceType) => {
      if (type === "合同审查") {
        router.push("/contract-review");
        return;
      }
      setSelectedService(type);
      setShowServiceSelector(false);
    },
    [router],
  );

  const handleStartChat = useCallback(() => {
    setSelectedService("法律咨询");
    setShowServiceSelector(false);
  }, []);

  const handleNewSession = useCallback(() => {
    setCurrentSessionId(null);
  }, []);

  const handleSelectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    setMobileMenuOpen(false);
  }, []);

  const handleSessionChange = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    setRefreshSessionsTrigger((prev) => prev + 1);
  }, []);

  const handleNewMessage = useCallback(() => {
    setRefreshSessionsTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="relative h-screen bg-background overflow-hidden">
      {/* 背景层 */}
      <DeveloperBackground />

      {/* 认证模态框 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authMode}
      />

      {/* 主内容区 */}
      <div className="relative z-10 h-full flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {!showChat ? (
            /* 首页/介绍页 */
            <motion.div
              key="intro"
              className="flex-1 relative flex flex-col overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              {/* 导航栏 */}
              <LegalChatToolbar
                selectedType={selectedService}
                onBack={handleBackToHome}
                settingsOpen={showSettings}
                onSettingsOpenChange={setShowSettings}
                user={user}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onMobileMenuOpen={() => setMobileMenuOpen(true)}
              />

              {/* 介绍内容 */}
              <div className="flex-1 min-h-0">
                <IntroScreen
                  showSelector={showServiceSelector}
                  onToggleSelector={setShowServiceSelector}
                  onConfirm={handleServiceConfirm}
                  selectedType={selectedService}
                  onStartChat={handleStartChat}
                />
              </div>
            </motion.div>
          ) : (
            /* 聊天界面 */
            <motion.div
              key="chat-interface"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 w-full flex flex-col md:flex-row overflow-hidden"
            >
              {/* 侧边栏 - 仅登录后显示 */}
              {user && (
                <>
                  {/* 桌面端侧边栏 */}
                  <div className="hidden md:block h-full flex-shrink-0 z-20 border-r border-border/50 dark:border-white/5">
                    <ChatSidebar
                      currentSessionId={currentSessionId}
                      onSelectSession={handleSelectSession}
                      onNewSession={handleNewSession}
                      collapsed={sidebarCollapsed}
                      onCollapsedChange={setSidebarCollapsed}
                      refreshTrigger={refreshSessionsTrigger}
                      onBackToHome={handleBackToHome}
                    />
                  </div>

                  {/* 移动端侧边栏 (Sheet) */}
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetContent
                      side="left"
                      className="p-0 w-[300px] border-none bg-background/95 backdrop-blur-2xl"
                      aria-describedby={undefined}
                    >
                      <div className="sr-only">
                        <SheetTitle>导航菜单</SheetTitle>
                      </div>
                      <div className="h-full w-full py-4">
                        <ChatSidebar
                          currentSessionId={currentSessionId}
                          onSelectSession={handleSelectSession}
                          onNewSession={() => {
                            handleNewSession();
                            setMobileMenuOpen(false);
                          }}
                          collapsed={false}
                          refreshTrigger={refreshSessionsTrigger}
                          onBackToHome={handleBackToHome}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                </>
              )}

              {/* 主聊天区域 */}
              <div className="flex-1 h-full min-w-0 relative flex flex-col">
                {/* 导航栏 */}
                <LegalChatToolbar
                  selectedType={selectedService}
                  onBack={handleBackToHome}
                  settingsOpen={showSettings}
                  onSettingsOpenChange={setShowSettings}
                  user={user}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  onMobileMenuOpen={() => setMobileMenuOpen(true)}
                />

                {/* 聊天组件 */}
                <div className="flex-1 pt-20 min-h-0">
                  <AnimatedAIChat
                    sessionId={currentSessionId}
                    onSessionChange={handleSessionChange}
                    onNewMessage={handleNewMessage}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
