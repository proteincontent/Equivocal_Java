"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoaderIcon, MessageSquare, Calendar, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { buildApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface UserChatHistoryDialogProps {
  userId: string | null;
  userEmail: string | null;
  isOpen: boolean;
  onOpenChange: (_open: boolean) => void;
  token?: string | null;
}

export function UserChatHistoryDialog({
  userId,
  userEmail,
  isOpen,
  onOpenChange,
  token,
}: UserChatHistoryDialogProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 获取用户会话列表
  useEffect(() => {
    if (isOpen && userId) {
      const fetchSessions = async () => {
        setIsLoadingSessions(true);
        setSessionsError(null);
        try {
          const response = await fetch(buildApiUrl(`/api/admin/users/${userId}/chat-sessions`), {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (response.ok) {
            const data = await response.json();
            setSessions(data.sessions || []);
            // 如果有会话，默认选中第一个
            if (data.sessions && data.sessions.length > 0) {
              setSelectedSessionId(data.sessions[0].id);
            } else {
              setSelectedSessionId(null);
              setMessages([]);
            }
          } else {
            setSessionsError(`加载会话失败 (${response.status})`);
          }
        } catch (error) {
          console.error("Failed to fetch user sessions:", error);
          setSessionsError("加载会话失败，请检查网络或权限");
        } finally {
          setIsLoadingSessions(false);
        }
      };

      fetchSessions();
    } else if (!isOpen) {
      setSessions([]);
      setSelectedSessionId(null);
      setMessages([]);
      setSessionsError(null);
      setMessagesError(null);
    }
  }, [isOpen, token, userId]);

  // 获取选中会话的消息
  useEffect(() => {
    if (selectedSessionId) {
      const fetchMessages = async () => {
        setIsLoadingMessages(true);
        setMessagesError(null);
        try {
          const response = await fetch(
            buildApiUrl(`/api/admin/chat-sessions/${selectedSessionId}/messages`),
            {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            }
          );
          if (response.ok) {
            const data = await response.json();
            setMessages(data.messages || []);
          } else {
            setMessagesError(`加载消息失败 (${response.status})`);
          }
        } catch (error) {
          console.error("Failed to fetch session messages:", error);
          setMessagesError("加载消息失败，请稍后重试");
        } finally {
          setIsLoadingMessages(false);
        }
      };

      fetchMessages();
    }
  }, [selectedSessionId, token]);

  // 消息列表自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            聊天记录查看
          </DialogTitle>
          <DialogDescription>
            查看用户 <span className="font-medium text-foreground">{userEmail}</span> 的对话历史
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* 左侧会话列表 */}
          <div className="w-64 border-r bg-muted/30 flex flex-col">
            <div className="p-4 border-b text-sm font-medium text-muted-foreground bg-muted/50">
              会话列表 ({sessions.length})
            </div>
            <ScrollArea className="flex-1">
              {isLoadingSessions ? (
                <div className="flex justify-center p-8">
                  <LoaderIcon className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : sessionsError ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-3">
                  <MessageSquare className="w-8 h-8 opacity-20" />
                  <span className="text-sm">{sessionsError}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSessionsError(null);
                      setIsLoadingSessions(true);
                      fetch(buildApiUrl(`/api/admin/users/${userId}/chat-sessions`), {
                        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                      })
                        .then(async (response) => {
                          if (!response.ok) {
                            throw new Error(`加载会话失败 (${response.status})`);
                          }
                          return response.json();
                        })
                        .then((data) => {
                          setSessions(data.sessions || []);
                          if (data.sessions && data.sessions.length > 0) {
                            setSelectedSessionId(data.sessions[0].id);
                          } else {
                            setSelectedSessionId(null);
                            setMessages([]);
                          }
                        })
                        .catch((error) => {
                          console.error("Failed to fetch user sessions:", error);
                          setSessionsError(error instanceof Error ? error.message : "加载会话失败");
                        })
                        .finally(() => setIsLoadingSessions(false));
                    }}
                    disabled={!userId}
                  >
                    重试
                  </Button>
                </div>
              ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-2">
                  <MessageSquare className="w-8 h-8 opacity-20" />
                  <span className="text-sm">暂无会话记录</span>
                </div>
              ) : (
                <div className="flex flex-col">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      className={cn(
                        "flex flex-col items-start gap-1 p-4 text-left transition-colors border-b border-border/50 hover:bg-muted/50",
                        selectedSessionId === session.id && "bg-primary/5 border-l-4 border-l-primary"
                      )}
                    >
                      <span className="font-medium text-sm line-clamp-1">
                        {session.title || "新对话"}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(session.updated_at), "MM-dd HH:mm", { locale: zhCN })}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* 右侧消息内容 */}
          <div className="flex-1 flex flex-col bg-background">
            <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <LoaderIcon className="w-8 h-8 animate-spin" />
                    <span className="text-sm">加载消息中...</span>
                  </div>
                </div>
              ) : messagesError ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                  <span className="text-sm">{messagesError}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!selectedSessionId) return;
                      setIsLoadingMessages(true);
                      setMessagesError(null);
                      fetch(buildApiUrl(`/api/admin/chat-sessions/${selectedSessionId}/messages`), {
                        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                      })
                        .then(async (response) => {
                          if (!response.ok) {
                            throw new Error(`加载消息失败 (${response.status})`);
                          }
                          return response.json();
                        })
                        .then((data) => setMessages(data.messages || []))
                        .catch((error) => {
                          console.error("Failed to fetch session messages:", error);
                          setMessagesError(error instanceof Error ? error.message : "加载消息失败");
                        })
                        .finally(() => setIsLoadingMessages(false));
                    }}
                    disabled={!selectedSessionId}
                  >
                    重试
                  </Button>
                </div>
              ) : !selectedSessionId ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  请选择一个会话查看详情
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  该会话暂无消息
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3 max-w-[85%]",
                        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className="space-y-1">
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                            isUser
                              ? "bg-primary text-primary-foreground rounded-tr-none"
                              : "bg-muted/50 border rounded-tl-none"
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                        <div
                          className={cn(
                            "text-[10px] text-muted-foreground px-1",
                            isUser ? "text-right" : "text-left"
                          )}
                        >
                          {format(new Date(msg.created_at), "yyyy-MM-dd HH:mm:ss", { locale: zhCN })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
