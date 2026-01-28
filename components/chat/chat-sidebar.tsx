"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  PlusIcon,
  MessageSquareIcon,
  Trash2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  PencilIcon,
  LayoutTemplate,
  PanelLeft,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buildApiUrl } from "@/lib/api";

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onSessionsChange?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  refreshTrigger?: number;
  onBackToHome?: () => void;
}

// 按日期分组会话
function groupSessionsByDate(sessions: ChatSession[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups: { label: string; sessions: ChatSession[] }[] = [
    { label: "今天", sessions: [] },
    { label: "昨天", sessions: [] },
    { label: "最近7天", sessions: [] },
    { label: "更早", sessions: [] },
  ];

  sessions.forEach((session) => {
    const sessionDate = new Date(session.updatedAt || session.createdAt);
    const sessionDay = new Date(
      sessionDate.getFullYear(),
      sessionDate.getMonth(),
      sessionDate.getDate()
    );

    if (sessionDay >= today) {
      groups[0].sessions.push(session);
    } else if (sessionDay >= yesterday) {
      groups[1].sessions.push(session);
    } else if (sessionDay >= lastWeek) {
      groups[2].sessions.push(session);
    } else {
      groups[3].sessions.push(session);
    }
  });

  return groups.filter((group) => group.sessions.length > 0);
}

export function ChatSidebar({
  currentSessionId,
  onSelectSession,
  onNewSession,
  onSessionsChange,
  collapsed = false,
  onCollapsedChange,
  refreshTrigger = 0,
  onBackToHome,
}: ChatSidebarProps) {
  const { token } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // 获取会话列表
  const fetchSessions = useCallback(async (silent = false) => {
    if (!token) return;

    // 只有在非静默模式且没有数据时才显示 loading
    if (!silent && sessions.length === 0) {
      setLoading(true);
    }
    
    try {
      const response = await fetch(buildApiUrl("/api/chat/sessions"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.sessions)) {
          setSessions(data.sessions);
        }
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  }, [token, sessions.length]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // 当 refreshTrigger 变化时刷新会话列表
  useEffect(() => {
    if (refreshTrigger > 0) {
      // 触发静默刷新，不显示 loading
      fetchSessions(true);
    }
  }, [refreshTrigger, fetchSessions]);

  // 删除会话
  const handleDeleteSession = async () => {
    if (!sessionToDelete || !token) return;

    try {
      const response = await fetch(buildApiUrl(`/api/chat/sessions/${sessionToDelete}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete));
        if (currentSessionId === sessionToDelete) {
          onNewSession();
        }
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    } finally {
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  };

  // 更新会话标题
  const handleUpdateTitle = async (sessionId: string, newTitle: string) => {
    if (!token || !newTitle.trim()) return;

    try {
      const response = await fetch(buildApiUrl(`/api/chat/sessions/${sessionId}`), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (response.ok) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId ? { ...s, title: newTitle.trim() } : s
          )
        );
      }
    } catch (error) {
      console.error("Failed to update session title:", error);
    } finally {
      setEditingSessionId(null);
      setEditingTitle("");
    }
  };

  const groupedSessions = groupSessionsByDate(sessions);

  // 刷新会话列表的公共方法
  const refreshSessions = useCallback(() => {
    fetchSessions(true);
  }, [fetchSessions]);

  // 将刷新方法暴露给父组件
  useEffect(() => {
    (window as any).__refreshChatSessions = refreshSessions;
    return () => {
      delete (window as any).__refreshChatSessions;
    };
  }, [refreshSessions]);

return (
  <>
    <motion.aside
      className={cn(
        "h-full flex flex-col relative z-20 overflow-hidden border-r border-border/50 bg-background/80 backdrop-blur-xl dark:bg-brand-navy dark:border-border/10",
        "transition-all duration-300 ease-in-out"
      )}
      animate={{
        width: collapsed ? 70 : 260,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* 头部 */}
      <div className="flex flex-col gap-2 p-3 pb-0">
        {/* 顶部栏：Logo/首页 + 折叠按钮 */}
        <div className={cn("flex items-center", collapsed ? "justify-center flex-col gap-4" : "justify-between px-1")}>
          <motion.button
            onClick={() => {
              if (onBackToHome) {
                onBackToHome();
              } else {
                router.push("/");
              }
            }}
            className={cn(
              "flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-xl hover:bg-muted/50 group",
              collapsed && "p-2 justify-center"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="返回首页"
          >
            <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center flex-shrink-0">
              <LayoutTemplate className="w-4 h-4 text-[#2563EB]" />
            </div>
            
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  className="flex flex-col items-start text-left overflow-hidden"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-sm font-serif font-medium tracking-wide text-foreground leading-none mb-1">智法顾问</span>
                  <span className="text-[10px] text-[#2563EB]/80 uppercase tracking-widest leading-none">法律 AI</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <button
            onClick={() => onCollapsedChange?.(!collapsed)}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all",
              collapsed && "rotate-180"
            )}
          >
             <PanelLeft className="w-5 h-5" />
          </button>
        </div>

        {/* 新建聊天按钮 */}
        <motion.button
          onClick={onNewSession}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-3 rounded-lg mt-4 mb-2",
            "bg-[#2563EB] text-white font-medium",
            "transition-all duration-200 shadow-md shadow-[#2563EB]/20 hover:shadow-[#2563EB]/30 hover:bg-[#3B82F6]",
            collapsed && "justify-center px-2"
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <PlusIcon className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                className="text-sm font-medium whitespace-nowrap"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                新建咨询
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="h-px bg-border/40 mx-4 my-3" />

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-muted-foreground/60 rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground/40 text-xs font-mono">
            {!collapsed && "暂无历史"}
          </div>
        ) : (
          <div className="space-y-4">
            {groupedSessions.map((group) => (
              <div key={group.label}>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      className="px-3 py-2 text-[11px] text-muted-foreground/50 font-medium tracking-wider select-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {group.label}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="space-y-0.5">
                  {group.sessions.map((session) => (
                    <motion.div
                      key={session.id}
                      className={cn(
                        "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer mx-2",
                        "transition-all duration-200 border border-transparent",
                        currentSessionId === session.id
                          ? "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20 shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                        collapsed && "justify-center px-2 mx-1"
                      )}
                      onClick={() => onSelectSession(session.id)}
                    >
                      <MessageSquareIcon className={cn(
                        "w-4 h-4 flex-shrink-0 transition-opacity",
                        currentSessionId === session.id ? "opacity-100" : "opacity-50 group-hover:opacity-80"
                      )} />
                      
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.div
                            className="flex-1 min-w-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            {editingSessionId === session.id ? (
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onBlur={() => handleUpdateTitle(session.id, editingTitle)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleUpdateTitle(session.id, editingTitle);
                                  } else if (e.key === "Escape") {
                                    setEditingSessionId(null);
                                    setEditingTitle("");
                                  }
                                }}
                                className="w-full bg-transparent border-b border-[#2563EB]/30 outline-none text-sm font-mono text-foreground"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className="text-sm truncate block font-sans">
                                {session.title}
                              </span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* 操作菜单 */}
                      <AnimatePresence>
                        {!collapsed && editingSessionId !== session.id && (
                          <div
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1.5 rounded-md hover:bg-background/80 text-muted-foreground/60 hover:text-foreground transition-colors">
                                  <MoreHorizontalIcon className="w-4 h-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32 bg-popover border-border text-popover-foreground backdrop-blur-xl shadow-xl">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingSessionId(session.id);
                                    setEditingTitle(session.title);
                                  }}
                                  className="focus:bg-muted focus:text-foreground cursor-pointer text-xs py-2"
                                >
                                  <PencilIcon className="w-3.5 h-3.5 mr-2 opacity-70" />
                                  重命名
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer text-xs py-2"
                                  onClick={() => {
                                    setSessionToDelete(session.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2Icon className="w-3.5 h-3.5 mr-2 opacity-70" />
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </motion.aside>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-popover border-border text-popover-foreground backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除会话？</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              删除后将无法恢复该会话及其消息记录，请谨慎操作。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted border-border text-foreground hover:bg-muted/80">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSession}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
