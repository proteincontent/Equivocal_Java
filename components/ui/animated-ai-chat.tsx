"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Paperclip,
  SendIcon,
  XIcon,
  LoaderIcon,
  ChevronDown,
  Copy,
  Check,
  FileIcon,
  ImageIcon as ImageFileIcon,
  Download,
  Globe,
  BrainCircuit,
  Search,
  Scale,
  Shield,
  FileText,
  Square,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { useConfig } from "@/hooks/use-config";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/ui/auth-modal";
import { buildApiUrl, fetchWithTimeout } from "@/lib/api";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY),
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight],
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
  icon: React.ReactNode;
  label: string;
  description: string;
  prefix: string;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("relative", containerClassName)}>
        <textarea
          className={cn(
            "flex min-h-[60px] w-full bg-transparent px-3 py-2 text-sm font-mono",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground/60",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "focus:outline-none",
            className,
          )}
          ref={ref}
          spellCheck={false}
          {...props}
        />
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AnimatedAIChatProps {
  sessionId?: string | null;
  onSessionChange?: (_sessionId: string) => void;
  onNewMessage?: () => void;
}

// 文件附件类型
interface FileAttachment {
  id: string;           // Coze 文件 ID
  fileName: string;     // 文件名
  fileSize: number;     // 文件大小
  fileType: string;     // 文件类型
  isUploading: boolean; // 是否正在上传
  error?: string;       // 上传错误信息
  localFile?: File;     // 本地文件对象（上传前）
}

export function AnimatedAIChat({ sessionId, onSessionChange, onNewMessage }: AnimatedAIChatProps) {
  const { botId } = useConfig();
  const { user, token, login } = useAuth();

  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [_recentCommand, setRecentCommand] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });
  const [inputFocused, setInputFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const commandPaletteRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevMessageCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSubmittedTextRef = useRef<string>("");
  const prevSessionIdRef = useRef<string | null | undefined>(sessionId);

  // 判断是否开始聊天（是否有消息，或者有非默认的欢迎消息）
  const isChatStarted = useMemo(() => {
    return messages.length > 0;
  }, [messages]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const container = messageListRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  }, []);

  const handleMessageListScroll = useCallback(() => {
    const container = messageListRef.current;
    if (!container) return;

    const thresholdPx = 80;
    const distanceToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const atBottom = distanceToBottom <= thresholdPx;

    setIsAtBottom(atBottom);
    if (atBottom) {
      setUnreadCount(0);
    }
  }, []);

  const handleCopy = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }, []);

  const handleStopGenerating = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsTyping(false);
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const prevSessionId = prevSessionIdRef.current;
    prevSessionIdRef.current = sessionId;

    // Only stop generating if we are switching from one valid session to another.
    // We do NOT want to stop if we are transitioning from null -> sessionId (Session Creation).
    if (prevSessionId && prevSessionId !== sessionId && isTyping) {
      handleStopGenerating();
    }
  }, [handleStopGenerating, isTyping, sessionId]);

  useEffect(() => {
    // Removed API key validation logic
    setErrorMessage(null);
  }, []);

  // 用于跟踪 fetchHistory 的上一个 sessionId，独立于全局 prevSessionIdRef
  const fetchHistorySessionIdRef = useRef<string | null | undefined>(sessionId);

  // 加载聊天历史记录
  useEffect(() => {
    const prevSessionId = fetchHistorySessionIdRef.current;
    fetchHistorySessionIdRef.current = sessionId;

    const fetchHistory = async () => {
      if (!token) return;

      // 如果没有 sessionId，重置为空数组，显示初始界面
      if (!sessionId) {
        setMessages([]);
        setUnreadCount(0);
        setIsAtBottom(true);
        prevMessageCountRef.current = 0;
        return;
      }

      // 🚨 关键修复：防止发送消息时的闪烁
      // 如果正在输入(流式传输中)，或者是刚刚发送了消息导致 sessionId 变化
      // 我们都不应该重新拉取历史，因为当前内存中的 messages 才是最新的
      if (isTyping) {
        // 如果 sessionId 变了，更新 ref 以便下次正确判断，但不拉取数据
        if (sessionId) {
            fetchHistorySessionIdRef.current = sessionId;
        }
        return;
      }

      // 如果是从无 SessionId 变为有 SessionId (通常是第一条消息发送后)
      // 且当前已经有消息在展示了，说明是本地状态更新，不需要拉取历史
      if (!prevSessionId && sessionId && messages.length > 0) {
        return;
      }

      try {
        // 使用新的 API 端点获取指定会话的消息
        const response = await fetch(buildApiUrl(`/api/chat/sessions/${sessionId}`), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages(data.messages.map((msg: any) => ({
              role: msg.role,
              content: msg.content
            })));
            
            // 滚动到底部
            setUnreadCount(0);
            setIsAtBottom(true);
            setTimeout(() => scrollToBottom("auto"), 0);
          } else {
            // 会话存在但没有消息
            setMessages([]);
            setUnreadCount(0);
            setIsAtBottom(true);
            prevMessageCountRef.current = 0;
          }
        } else {
          // 会话不存在或出错
          setMessages([]);
          setUnreadCount(0);
          setIsAtBottom(true);
          prevMessageCountRef.current = 0;
        }
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
        setMessages([]);
        setUnreadCount(0);
        setIsAtBottom(true);
        prevMessageCountRef.current = 0;
      }
    };

    fetchHistory();
  }, [scrollToBottom, sessionId, token]);

  const commandSuggestions: CommandSuggestion[] = useMemo(
    () => [
      {
        icon: <Scale className="w-4 h-4" />,
        label: "法律咨询",
        description: "快速提问并获取风险与建议",
        prefix: "/ask",
      },
      {
        icon: <FileText className="w-4 h-4" />,
        label: "合同起草",
        description: "生成合同/条款草案与注意事项",
        prefix: "/contract",
      },
      {
        icon: <Shield className="w-4 h-4" />,
        label: "合规审查",
        description: "列出合规风险点与整改清单",
        prefix: "/compliance",
      },
      {
        icon: <Search className="w-4 h-4" />,
        label: "案例检索",
        description: "按事实要点梳理检索关键词",
        prefix: "/cases",
      },
    ],
    []
  );

  const featureSuggestions = [
    { icon: <FileText className="w-5 h-5 text-[#2563EB]" />, label: "起草合同" },
    { icon: <Scale className="w-5 h-5 text-[#2563EB]" />, label: "法律咨询" },
    { icon: <Shield className="w-5 h-5 text-[#2563EB]" />, label: "合规审查" },
    { icon: <Search className="w-5 h-5 text-[#2563EB]" />, label: "案例检索" },
  ];

  useEffect(() => {
    if (value.startsWith("/") && !value.includes(" ")) {
      setShowCommandPalette(true);

      const matchingSuggestionIndex = commandSuggestions.findIndex((cmd) =>
        cmd.prefix.startsWith(value),
      );

      if (matchingSuggestionIndex >= 0) {
        setActiveSuggestion(matchingSuggestionIndex);
      } else {
        setActiveSuggestion(-1);
      }
    } else {
      setShowCommandPalette(false);
    }
  }, [value, commandSuggestions]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const commandButton = document.querySelector("[data-command-button]");

      if (
        commandPaletteRef.current &&
        !commandPaletteRef.current.contains(target) &&
        !commandButton?.contains(target)
      ) {
        setShowCommandPalette(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const prevCount = prevMessageCountRef.current;
    const nextCount = messages.length;

    if (nextCount > prevCount && !isAtBottom) {
      setUnreadCount((current) => current + (nextCount - prevCount));
    }

    prevMessageCountRef.current = nextCount;

    if (isAtBottom) {
      // 使用 requestAnimationFrame 确保在 DOM 更新后滚动
      requestAnimationFrame(() => {
        scrollToBottom("auto");
      });
    }
  }, [isAtBottom, messages, scrollToBottom]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandPalette) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion((prev) => (prev < commandSuggestions.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : commandSuggestions.length - 1));
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        if (activeSuggestion >= 0) {
          const selectedCommand = commandSuggestions[activeSuggestion];
          setValue(selectedCommand.prefix + " ");
          setShowCommandPalette(false);

          setRecentCommand(selectedCommand.label);
          setTimeout(() => setRecentCommand(null), 3500);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowCommandPalette(false);
      }
    } else if (e.key === "Escape" && isTyping) {
      e.preventDefault();
      handleStopGenerating();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      void handleSendMessage();
    }
  };

  /**
   * 上传单个文件到 Coze
   */
  const uploadFile = useCallback(async (file: File): Promise<FileAttachment> => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // 创建临时附件对象
    const tempAttachment: FileAttachment = {
      id: tempId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      isUploading: true,
      localFile: file,
    };

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('[AnimatedAIChat] Starting file upload:', file.name);
      const response = await fetch(buildApiUrl('/api/upload'), {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });

      console.log('[AnimatedAIChat] Upload response status:', response.status);
      if (response.status === 401) {
        setErrorMessage('登录已过期，请重新登录');
        setShowAuthModal(true);
        throw new Error('未登录或登录已过期');
      }
      const responseText = await response.text();
      console.log('[AnimatedAIChat] Upload response text:', responseText);

      let result;
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('[AnimatedAIChat] Failed to parse response as JSON:', e);
        throw new Error(`服务器响应格式错误: ${response.status}`);
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || '文件上传失败');
      }

      const responseData = result?.data ?? {};
      const uploadedId = responseData.id || responseData.file_id;
      if (!uploadedId) {
        throw new Error('上传成功但未返回文件ID');
      }

      // 返回成功的附件对象
      return {
        id: uploadedId,
        fileName: responseData.file_name || result.filename || file.name,
        fileSize: responseData.bytes || result.size || file.size,
        fileType: file.type,
        isUploading: false,
      };
    } catch (error) {
      console.error('[AnimatedAIChat] File upload error:', error);
      return {
        ...tempAttachment,
        isUploading: false,
        error: error instanceof Error ? error.message : '上传失败',
      };
    }
  }, [token]);

  /**
   * 处理拖拽进入
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 检查是否有文件
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  /**
   * 处理拖拽离开
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 只有当离开整个拖放区域时才取消高亮
    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (rect) {
      const { clientX, clientY } = e;
      if (
        clientX <= rect.left ||
        clientX >= rect.right ||
        clientY <= rect.top ||
        clientY >= rect.bottom
      ) {
        setIsDragging(false);
      }
    }
  }, []);

  /**
   * 处理拖拽悬停
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  /**
   * 处理文件放置
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    // 限制最多上传 5 个文件
    const maxFiles = 5;
    const currentCount = attachments.length;
    const availableSlots = maxFiles - currentCount;

    if (availableSlots <= 0) {
      setErrorMessage('最多只能上传 5 个文件');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);

    // 为每个文件创建临时附件并开始上传
    for (const file of filesToUpload) {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // 添加临时附件（显示上传中状态）
      const tempAttachment: FileAttachment = {
        id: tempId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        isUploading: true,
        localFile: file,
      };
      
      setAttachments(prev => [...prev, tempAttachment]);

      // 异步上传文件
      uploadFile(file).then(uploadedAttachment => {
        setAttachments(prev => 
          prev.map(att => 
            att.id === tempId ? uploadedAttachment : att
          )
        );
      });
    }
  }, [attachments.length, uploadFile]);

  /**
   * 处理文件选择
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // 限制最多上传 5 个文件
    const maxFiles = 5;
    const currentCount = attachments.length;
    const availableSlots = maxFiles - currentCount;

    if (availableSlots <= 0) {
      setErrorMessage('最多只能上传 5 个文件');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);

    // 为每个文件创建临时附件并开始上传
    for (const file of filesToUpload) {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // 添加临时附件（显示上传中状态）
      const tempAttachment: FileAttachment = {
        id: tempId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        isUploading: true,
        localFile: file,
      };
      
      setAttachments(prev => [...prev, tempAttachment]);

      // 异步上传文件
      uploadFile(file).then(uploadedAttachment => {
        setAttachments(prev => 
          prev.map(att => 
            att.id === tempId ? uploadedAttachment : att
          )
        );
      });
    }

    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * 点击附件按钮
   */
  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
  };

  const selectCommandSuggestion = (index: number) => {
    const selectedCommand = commandSuggestions[index];
    setValue(selectedCommand.prefix + " ");
    setShowCommandPalette(false);

    setRecentCommand(selectedCommand.label);
    setTimeout(() => setRecentCommand(null), 2000);
  };

  /**
   * 发送消息 - 使用 SSE 流式响应
   */
  const handleSendMessage = async (e?: React.MouseEvent | React.FormEvent) => {
    // 阻止默认提交行为（防止页面刷新）
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // 🚨 发送前检查登录状态
    if (!user || !token) {
      setErrorMessage('请先登录后再使用聊天功能');
      setShowAuthModal(true);
      return;
    }

    const trimmed = value.trim();
    lastSubmittedTextRef.current = trimmed;
    
    // 检查是否有正在上传的文件
    const uploadingFiles = attachments.filter(att => att.isUploading);
    if (uploadingFiles.length > 0) {
      setErrorMessage('请等待文件上传完成');
      return;
    }

    // 检查是否有上传失败的文件
    const failedFiles = attachments.filter(att => att.error);
    if (failedFiles.length > 0) {
      setErrorMessage('部分文件上传失败，请移除后重试');
      return;
    }

    // 如果没有文本也没有附件，不发送
    if (!trimmed && attachments.length === 0) {
      return;
    }

    // 构建消息内容
    let messageContent = trimmed;
    let contentType: "text" | "object_string" = "text";

    // 如果有附件，构建 object_string 格式的内容
    const uploadedFileIds = attachments.map(att => att.id);
    if (attachments.length > 0) {
      const contentParts: any[] = [];
      
      // 添加文件
      for (const att of attachments) {
        const isImage = att.fileType.startsWith('image/');
        contentParts.push({
          type: isImage ? 'image' : 'file',
          file_id: att.id,
        });
      }
      
      // 添加文本：如果用户没输入内容，也要给一个默认指令，避免“只上传文件”时模型不知道要做什么
      const promptText =
        trimmed ||
        (attachments.some(att => att.fileType.startsWith("image/"))
          ? "请识别并分析我上传的图片内容，并给出要点总结。"
          : "请阅读并分析我上传的文件（如合同/材料），提取关键信息，指出风险点，并给出修改或应对建议。");

      contentParts.push({
        type: 'text',
        text: promptText,
      });
      
      messageContent = JSON.stringify(contentParts);
      contentType = "object_string";
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed || `[已上传 ${attachments.length} 个文件]`,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setValue("");
    adjustHeight(true);
    setAttachments([]);
    setShowCommandPalette(false);
    setRecentCommand(null);
    setErrorMessage(null);
    setIsTyping(true);
    setUnreadCount(0);
    setIsAtBottom(true);
    setTimeout(() => scrollToBottom("auto"), 0);

    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const configPayload: Record<string, string> = {};
    if (botId) {
      configPayload.botId = botId;
    }

    // 构建发送给后端的消息
    const apiMessages = nextMessages.map((msg, index) => {
      // 只有最后一条用户消息需要包含文件
      if (index === nextMessages.length - 1 && msg.role === 'user' && uploadedFileIds.length > 0) {
        return {
          role: msg.role,
          content: messageContent,
          content_type: contentType,
        };
      }
      return {
        role: msg.role,
        content: msg.content,
        content_type: "text" as const,
      };
    });

    const payload: Record<string, unknown> = {
      messages: apiMessages,
      sessionId: sessionId || undefined,
    };

    if (Object.keys(configPayload).length > 0) {
      payload.config = configPayload;
    }

    try {
      // 使用流式端点
      const apiEndpoint = buildApiUrl("/api/chat");
      
      // 🔑 添加 Authorization 头
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const chatTimeoutMs = Number.parseInt(
        process.env.NEXT_PUBLIC_CHAT_TIMEOUT_MS ?? "600000",
        10,
      );
      const response = await fetchWithTimeout(
        apiEndpoint,
        {
          method: "POST",
          headers,
          signal: abortController.signal,
          body: JSON.stringify(payload),
        },
        Number.isFinite(chatTimeoutMs) && chatTimeoutMs > 0 ? chatTimeoutMs : 600000,
      );

      // 🚫 处理错误响应
      if (!response.ok) {
        if (response.status === 401) {
          setErrorMessage('登录已过期，请重新登录');
          setShowAuthModal(true);
          setIsTyping(false);
          return;
        }

        let friendlyMessage = "请求失败，请稍后重试";
        
        if (response.status === 403) {
          friendlyMessage = "抱歉，您没有权限执行此操作";
        } else if (response.status === 404) {
          friendlyMessage = "未找到相关资源或服务";
        } else if (response.status === 429) {
          friendlyMessage = "请求过于频繁，请喝杯茶稍后再试";
        } else if (response.status >= 500) {
          friendlyMessage = "服务器正在开小差，工程师正在紧急修复中";
        }

        let detail: string | undefined;
        try {
          const rawText = await response.text();
          if (rawText) {
            try {
              const errorBody = JSON.parse(rawText);
              detail =
                typeof errorBody?.detail === "string"
                  ? errorBody.detail
                  : typeof errorBody?.message === "string"
                    ? errorBody.message
                    : typeof errorBody?.title === "string"
                      ? errorBody.title
                      : typeof errorBody?.error === "string"
                        ? errorBody.error
                        : typeof errorBody?.error?.message === "string"
                          ? errorBody.error.message
                          : undefined;
            } catch {
              detail = rawText.trim();
            }
          }
        } catch {
          // ignore body parse error
        }

        const finalMessage = detail || friendlyMessage;

        // 避免在 dev 环境触发 Next 的 Console Error Overlay：这里不 throw，直接展示提示并退出。
        console.warn("[AnimatedAIChat] Chat request failed", {
          status: response.status,
          statusText: response.statusText,
          message: finalMessage,
        });

        setErrorMessage(finalMessage);
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: `请求失败（${response.status}）：${finalMessage}\n\n你可以稍后重试，或检查后端(8080)与 AI Agent(8000)是否正常运行。`,
          },
        ]);
        return;
      }

      // 检查是否是 SSE 流式响应
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/event-stream')) {
        // 处理 SSE 流式响应
        await handleStreamResponse(response);
      } else {
        // 处理普通 JSON 响应（兼容旧版）
        const data = await response.json();
        
        let assistantContent = "";
        
        if (data?.choices && Array.isArray(data.choices) && data.choices.length > 0) {
          assistantContent = extractMessageContent(data.choices[0].message);
        } else {
          assistantContent = extractMessageContent(data?.message);
        }

        if (
          !assistantContent ||
          (typeof assistantContent === "string" && assistantContent.trim() === "")
        ) {
          setMessages((current) => [
            ...current,
            {
              role: "assistant",
              content:
                "抱歉，我没有生成有效回复。可以换一种说法再试试。",
            },
          ]);
          return;
        }

        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: assistantContent,
          },
        ]);

        onNewMessage?.();

        if (data.sessionId && data.sessionId !== sessionId) {
          onSessionChange?.(data.sessionId);
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setErrorMessage("请求已取消或超时，请重试");
        return;
      }
      console.warn("[AnimatedAIChat] Failed to send message", error);
      
      const errorMsg = error instanceof Error ? error.message : "未知错误";
      const isNetworkError = errorMsg.includes("Failed to fetch") || errorMsg.includes("Network");

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: isNetworkError
            ? "网络连接似乎断开了，请检查您的网络设置，或确认后端服务是否可访问。"
            : `请求出错：${errorMsg}`,
        },
      ]);
      
      setErrorMessage(errorMsg);
      return;
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  /**
   * 处理 SSE 流式响应 (优化版：分离网络接收与 UI 渲染，实现平滑打字机效果)
   */
  const handleStreamResponse = async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    
    // 渲染状态
    let displayedContent = ""; // 屏幕上实际显示的内容
    let bufferContent = "";    // 待显示的缓冲内容（蓄水池）
    let hasAddedAssistantMessage = false;
    
    // 流状态
    let isStreamEnded = false;
    let newSessionId: string | null = null;
    let streamError: string | null = null;

    // 1. 生产者：全速从网络读取数据
    const pumpNetworkStream = async () => {
      let networkBuffer = ""; // SSE 数据包解析缓冲
      let shouldStop = false;
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          networkBuffer += decoder.decode(value, { stream: true });
          
          const events = networkBuffer.split('\n\n');
          networkBuffer = events.pop() || "";

          for (const eventBlock of events) {
            const lines = eventBlock.split('\n');
            for (const line of lines) {
              if (!line.startsWith('data:')) continue;
              
              const dataStr = line.substring(5).trim();
              if (!dataStr) continue;

              // 兼容 OpenAI/Agent 的结束信号：不要只依赖连接关闭
              if (dataStr === "[DONE]") {
                shouldStop = true;
                break;
              }

              try {
                const event = JSON.parse(dataStr);
                
                if (event.type === 'session') {
                  newSessionId = event.sessionId;
                  if (newSessionId && newSessionId !== sessionId) {
                    onSessionChange?.(newSessionId);
                  }
                } else if (event.type === 'content' || event.type === 'answer') {
                  // 关键点：只写入缓冲池，不直接更新 UI
                  bufferContent += event.content;
                } else if (event.type === "done") {
                  shouldStop = true;
                  break;
                } else if (event.type === 'error') {
                  streamError = event.message || "Unknown error from stream";
                  shouldStop = true;
                  break;
                }
              } catch (e) {
                // ignore parse error
              }
            }

            if (shouldStop) break;
          }

          if (shouldStop) {
            try {
              await reader.cancel();
            } catch {
              // ignore cancel error
            }
            break;
          }
        }
        
        // 处理剩余 buffer
        if (networkBuffer.trim()) {
           // 简单处理剩余数据，通常不重要
        }
      } catch (err) {
        console.warn("Stream reading error:", err);
      } finally {
        isStreamEnded = true;
        reader.releaseLock();
      }
    };

    // 启动网络读取（不等待它完成，而是并行执行）
    pumpNetworkStream();

    // 2. 消费者：以平滑的节奏渲染 UI
    await new Promise<void>((resolve) => {
      const renderTimer = setInterval(() => {
        // 如果缓冲区有数据，移动一部分到 displayedContent
        if (bufferContent.length > 0) {
          // 动态速度控制（Cognitive Pacing）：
          // 积压越多，吐字越快，避免用户等待过久
          const backlog = bufferContent.length;
          let chunkSize = 1;

          if (backlog > 200) chunkSize = 20;      // 极速追赶
          else if (backlog > 100) chunkSize = 10; // 快速追赶
          else if (backlog > 50) chunkSize = 5;   // 中速
          else if (backlog > 20) chunkSize = 2;   // 稍快
          // 默认 chunkSize = 1，提供最细腻的打字感

          const chunk = bufferContent.slice(0, chunkSize);
          bufferContent = bufferContent.slice(chunkSize);
          displayedContent += chunk;

          // 更新 UI
          if (!hasAddedAssistantMessage) {
            setMessages((current) => [
              ...current,
              {
                role: "assistant",
                content: displayedContent,
              },
            ]);
            hasAddedAssistantMessage = true;
          } else {
            setMessages((current) => {
              const updated = [...current];
              if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: displayedContent,
                };
              }
              return updated;
            });
          }
        } else if (isStreamEnded) {
          // 缓冲区空了，且网络流也结束了 -> 任务完成
          clearInterval(renderTimer);
          resolve();
        }
        // 如果缓冲区空了但流还没结束，说明在等待网络数据，继续空转
      }, 20); // 20ms 间隔 = 50fps，非常平滑
    });

    // 3. 收尾处理
    if (streamError) {
      setErrorMessage(streamError);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `生成过程中服务返回错误：${streamError}`,
        },
      ]);
      return;
    }

    if (!displayedContent) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "抱歉，我没有生成有效回复。可以换一种说法再试试。",
        },
      ]);
    }

    onNewMessage?.();
  };

  /**
   * 获取文件图标
   */
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageFileIcon className="w-3 h-3" />;
    }
    return <FileIcon className="w-3 h-3" />;
  };

  const renderInputArea = (centered = false) => (
    <div className={cn(
      "relative group flex flex-col transition-all duration-500",
      centered ? "w-full max-w-3xl mx-auto" : "w-full"
    )}>
      <div className={cn(
        "relative rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-xl",
        inputFocused
          ? "bg-background/95 border-[#2563EB] shadow-[0_0_50px_-12px_rgba(37,99,235,0.2)] ring-1 ring-[#2563EB]/30"
          : "bg-background/60 border-border/50 hover:border-[#2563EB]/40 hover:bg-background/80"
      )}>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder={
            centered
              ? "简单说说你的情况：发生了什么、你希望达成什么结果？"
              : "输入消息…（Enter 发送，Shift+Enter 换行）"
          }
          className={cn(
            "text-foreground placeholder:text-muted-foreground/60 px-6 font-sans text-[16px] leading-relaxed resize-none bg-transparent",
            centered ? "min-h-[80px] py-6" : "min-h-[52px] py-4"
          )}
        />

        {/* Attachments Preview */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              className="flex gap-2 flex-wrap px-6 pb-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {attachments.map((attachment) => (
                <motion.div
                  key={attachment.id}
                  className={cn(
                    "flex items-center gap-2 text-xs py-1.5 px-3 rounded-md border",
                    attachment.error
                      ? "bg-red-500/10 border-red-500/20 text-red-400"
                      : "bg-[#2563EB]/5 border-[#2563EB]/10 text-[#2563EB]/80"
                  )}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  {attachment.isUploading ? (
                    <LoaderIcon className="w-3 h-3 animate-spin" />
                  ) : (
                    getFileIcon(attachment.fileType)
                  )}
                  <span className="max-w-[120px] truncate font-mono">{attachment.fileName}</span>
                  {attachment.error && (
                    <span className="text-red-400 text-[10px]">失败</span>
                  )}
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 pb-3">
           <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleAttachFile}
                className="p-2 text-muted-foreground/40 hover:text-[#2563EB] hover:bg-[#2563EB]/10 rounded-lg transition-all"
                title="上传文件"
                aria-label="上传文件"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-border/40 mx-2" />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-transparent border border-transparent text-xs text-muted-foreground/40 opacity-60 cursor-not-allowed"
                  title="即将上线"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>联网</span>
                </button>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-transparent border border-transparent text-xs text-muted-foreground/40 opacity-60 cursor-not-allowed"
                  title="即将上线"
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>深度</span>
                </button>
              </div>
           </div>
           
            {isTyping ? (
              <button
                type="button"
                onClick={handleStopGenerating}
                aria-label="停止生成"
                title="停止生成（Esc）"
                className={cn(
                  "p-2 rounded-lg transition-all duration-300 flex items-center justify-center",
                  "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Square className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={(!value.trim() && attachments.length === 0) || attachments.some(att => att.isUploading)}
                aria-label="发送"
                title="发送（Enter）"
                className={cn(
                  "p-2 rounded-lg transition-all duration-300 flex items-center justify-center",
                  (value.trim() || attachments.length > 0) && !attachments.some(att => att.isUploading)
                    ? "bg-[#2563EB] text-white hover:bg-[#3B82F6] shadow-lg hover:shadow-[#2563EB]/20"
                    : "bg-muted text-muted-foreground/40 cursor-not-allowed"
                )}
              >
                <SendIcon className="w-4 h-4" />
              </button>
            )}
        </div>
      </div>
      
      {/* Decorative Focus Glow */}
      <div className={cn(
        "absolute -inset-[1px] -z-10 rounded-[17px] bg-gradient-to-r from-[#2563EB]/0 via-[#2563EB]/30 to-[#2563EB]/0 opacity-0 transition-opacity duration-500 blur-sm",
        inputFocused && "opacity-100"
      )} />
    </div>
  );

  return (
    <div className="h-full flex flex-col w-full relative overflow-hidden">
      
      {/* 🔐 认证模态框 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(authUser) => {
          // 🔑 更新全局认证状态
          const savedToken = localStorage.getItem('auth_token');
          if (savedToken) {
            login(authUser, savedToken);
          }
          setShowAuthModal(false);
          setErrorMessage(null);
        }}
        initialMode="login"
      />

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv,.json,.xml,.jpg,.jpeg,.png,.gif,.webp,.bmp,.mp3,.wav,.m4a,.mp4,.mov,.avi,.mkv,.zip,.rar,.7z"
      />

      <div className="w-full h-full flex flex-col relative z-10">
        <motion.div
          className="flex-1 flex flex-col h-full"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Header - Only show in chat mode */}
      {isChatStarted && (
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#2563EB]/5 border border-[#2563EB]/10">
            <div className="relative">
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#2563EB] animate-ping opacity-50" />
              <div className="relative w-2 h-2 rounded-full bg-[#2563EB] shadow-[0_0_10px_rgba(37,99,235,0.6)]" />
            </div>
            <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">
              系统在线
            </span>
          </div>
        </div>
      )}

          <motion.div
            ref={dropZoneRef}
            className={cn(
              "relative flex-1 flex flex-col min-h-0",
              isDragging && "ring-2 ring-[#2563EB]/50 inset-0 z-50 bg-black/50"
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* 拖拽提示覆盖层 */}
            <AnimatePresence>
              {isDragging && (
                <motion.div
                  className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="flex flex-col items-center gap-4 text-white">
                    <div className="p-4 rounded-full bg-white/10 border border-white/20">
                       <Paperclip className="w-8 h-8" />
                    </div>
                    <span className="text-lg font-medium">松开即可上传文件</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content Area */}
            {isChatStarted ? (
              // Chat Mode
              <>
                <div
                  ref={messageListRef}
                  onScroll={handleMessageListScroll}
                  className="flex-1 px-6 py-6 space-y-8 overflow-y-auto custom-scrollbar"
                >
                  {messages.map((message, index) => {
                    const isUser = message.role === "user";
                    return (
                      <motion.div
                        key={`${message.role}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={cn("flex w-full mb-8 flex-col group", isUser ? "items-end" : "items-start")}
                      >
                        <div
                          className={cn(
                            "relative transition-all duration-500",
                            isUser
                              ? "max-w-[85%] px-5 py-3.5 bg-[#2563EB]/[0.08] dark:bg-[#2563EB]/[0.12] text-foreground rounded-2xl rounded-tr-md border border-[#2563EB]/15 dark:border-[#2563EB]/20"
                              : "w-full px-0 py-4 text-foreground"
                          )}
                        >
                          {!isUser && (
                             <div className="flex items-center gap-3 mb-4 border-b border-[#2563EB]/20 pb-3">
                                 <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#3B82F6] shadow-md shadow-[#2563EB]/20">
                                    <Scale className="w-4 h-4 text-white" />
                                 </div>
                                 <span className="text-xs font-bold text-[#2563EB] tracking-widest uppercase">法律顾问</span>
                              </div>
                           )}
                          <div className={cn(
                            "prose max-w-none prose-p:leading-7 prose-li:marker:text-[#2563EB]/50",
                            !isUser ? "font-sans text-[15px] text-foreground/90 leading-relaxed" : "text-foreground font-sans text-sm"
                          )}>
                            {isUser ? message.content : renderMessageContent(message.content)}
                          </div>
                        </div>
                        {isUser && (
                          <div className="flex items-center gap-1 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleCopy(message.content, index)}
                              className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-[#2563EB] hover:bg-[#2563EB]/10 transition-all"
                              title="复制消息"
                            >
                              {copiedIndex === index ? (
                                <Check className="w-3.5 h-3.5 text-[#2563EB]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                  
                  {isTyping && messages[messages.length - 1]?.role !== "assistant" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start w-full relative pl-0 mb-8"
                    >
                      <ContractGenerationLoader />
                    </motion.div>
                  )}
                  
                  {isTyping && messages[messages.length - 1]?.role === "assistant" && (
                     <div className="flex justify-start w-full relative pl-0 mb-2">
                         <div className="flex items-center gap-2 text-[#2563EB]/60">
                            <span className="text-xs font-mono animate-pulse">正在输入...</span>
                         </div>
                     </div>
                  )}
                </div>

                {!isAtBottom && (
                  <button
                    type="button"
                    onClick={() => {
                      scrollToBottom("smooth");
                      setUnreadCount(0);
                      setIsAtBottom(true);
                    }}
                    className="absolute right-6 bottom-28 md:bottom-32 z-40 inline-flex items-center gap-2 rounded-full bg-background/90 backdrop-blur-xl border border-border/50 shadow-lg px-4 py-2 text-xs text-foreground hover:bg-background transition-colors"
                    aria-label="跳到最新消息"
                    title="跳到最新消息"
                  >
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">回到最新</span>
                    {unreadCount > 0 && (
                      <span className="ml-1 min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-[#2563EB] text-white text-[10px] font-bold tabular-nums">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Bottom Input Area */}
                <div className="p-4 md:p-6 bg-gradient-to-t from-background via-background/95 to-transparent">
                  {renderInputArea(false)}
                  <div className="text-center mt-3">
                     <span className="text-[10px] text-muted-foreground/40 font-mono tracking-widest">对话内容仅用于咨询，请勿上传敏感隐私</span>
                  </div>
                </div>
              </>
            ) : (
              // Initial/Empty State (Legal Console Style)
              <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-3xl mx-auto w-full relative">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="mb-16 text-center space-y-6"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 mb-4">
                    <Scale className="w-8 h-8 text-[#2563EB]" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-serif font-medium text-foreground tracking-tight">
                    我能怎么帮你处理 <br />
                    <span className="text-[#2563EB] italic">法律问题</span>？
                  </h1>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="w-full mb-12"
                >
                  {renderInputArea(true)}
                </motion.div>

                {/* Feature Suggestions - Minimalist */}
                <motion.div
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {featureSuggestions.map((feature, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setValue(`帮我${feature.label}...`);
                        textareaRef.current?.focus();
                        setTimeout(() => adjustHeight(), 0);
                      }}
                      className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-background/60 backdrop-blur-md border border-border/80 hover:border-[#2563EB]/50 hover:bg-background/90 hover:shadow-[0_8px_30px_rgb(0,0,0,0.15)] transition-all duration-300"
                    >
                      <div className="p-2.5 rounded-lg bg-muted/50 group-hover:bg-[#2563EB]/10 transition-colors">
                        {feature.icon}
                      </div>
                      <span className="text-sm text-foreground group-hover:text-[#2563EB] font-medium transition-colors">{feature.label}</span>
                    </button>
                  ))}
                </motion.div>
              </div>
            )}

            {errorMessage && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-xs backdrop-blur-md flex flex-wrap items-center gap-2 max-w-[90vw] sm:max-w-[720px] break-words">
                <span className="font-medium">提示：</span>
                <span className="font-mono">{errorMessage}</span>
                {lastSubmittedTextRef.current && !isTyping && (
                  <button
                    type="button"
                    onClick={() => {
                      setValue(lastSubmittedTextRef.current);
                      setErrorMessage(null);
                      textareaRef.current?.focus();
                      setTimeout(() => adjustHeight(), 0);
                    }}
                    className="ml-1 px-2 py-1 rounded-full border border-red-500/20 hover:bg-red-500/10 transition-colors"
                  >
                    重试
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="ml-1 p-1 rounded-full hover:bg-red-500/10 transition-colors"
                  aria-label="关闭提示"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
          
          {/* Command Palette */}
          <AnimatePresence>
            {showCommandPalette && (
              <motion.div
                ref={commandPaletteRef}
                className="absolute left-0 right-0 bottom-[100px] mb-2 glass-panel rounded-lg z-50 overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
              >
                <div className="py-1">
                  {commandSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={suggestion.prefix}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-sm transition-colors cursor-pointer border-l-2",
                        activeSuggestion === index
                          ? "bg-[#2563EB]/10 border-[#2563EB] text-foreground"
                          : "border-transparent text-muted-foreground hover:bg-muted",
                      )}
                      onClick={() => selectCommandSuggestion(index)}
                    >
                      <div className="w-5 h-5 flex items-center justify-center text-muted-foreground/60">
                        {suggestion.icon}
                      </div>
                      <div className="flex flex-col">
                         <span className="font-medium">{suggestion.label}</span>
                         <span className="text-xs text-muted-foreground/50 font-mono">{suggestion.prefix}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>

      {inputFocused && (
        <motion.div
          className="fixed w-[60rem] h-[60rem] rounded-full pointer-events-none z-0 opacity-[0.015] bg-gradient-to-r from-[#2563EB] via-blue-500 to-blue-600 blur-[150px]"
          animate={{
            x: mousePosition.x - 480,
            y: mousePosition.y - 480,
          }}
          transition={{
            type: "spring",
            damping: 40,
            stiffness: 100,
            mass: 1,
          }}
        />
      )}
    </div>
  );
}

/**
 * 判断 URL 是否是文件链接
 */
const isFileUrl = (url: string): boolean => {
  const fileExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.7z', '.txt', '.csv'];
  const lowerUrl = url.toLowerCase();
  return fileExtensions.some(ext => lowerUrl.includes(ext));
};

/**
 * 从 URL 中提取文件名
 */
const extractFileName = (url: string): string => {
  try {
    // 尝试从 URL 路径中提取文件名
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    
    if (lastSegment && lastSegment.includes('.')) {
      // 解码 URL 编码的文件名
      return decodeURIComponent(lastSegment);
    }
    
    // 如果无法提取，返回通用名称
    return '下载文件';
  } catch {
    return '下载文件';
  }
};

/**
 * 渲染消息内容，使用 ReactMarkdown 支持 Markdown 和 HTML (如 <u> 标签)
 * 同时保留对文件下载链接的特殊处理
 */
const renderMessageContent = (content: string): React.ReactNode => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        a: ({ href, children }) => {
          const url = href || "";
          const isFile = isFileUrl(url);
          const fileName = extractFileName(url);

          if (isFile) {
            const isWord = fileName.endsWith('.doc') || fileName.endsWith('.docx');
            const isPdf = fileName.endsWith('.pdf');
            
            return (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                download={fileName}
                className="group flex items-center gap-3 p-3 my-2 rounded-xl bg-card border border-border hover:border-[#2563EB]/50 hover:shadow-md transition-all duration-300 no-underline max-w-sm"
              >
                <span className={cn(
                  "p-2.5 rounded-lg flex-shrink-0 transition-colors",
                  isWord ? "bg-blue-50 text-blue-600" :
                  isPdf ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"
                )}>
                  {isWord ? <FileText className="w-5 h-5" /> :
                   isPdf ? <FileIcon className="w-5 h-5" /> :
                   <Download className="w-5 h-5" />}
                </span>
                <span className="flex flex-col min-w-0 overflow-hidden">
                  <span className="text-sm font-medium text-foreground truncate pr-2 group-hover:text-[#2563EB] transition-colors">
                    {children || fileName}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono uppercase">
                    点击下载文件
                  </span>
                </span>
                <Download className="w-4 h-4 text-muted-foreground/30 ml-auto group-hover:text-[#2563EB] transition-colors" />
              </a>
            );
          }

          return (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2563EB] hover:text-[#3B82F6] hover:underline transition-colors"
            >
              {children}
            </a>
          );
        },
        // 确保 <u> 标签正常显示
        u: ({ children }) => <u className="decoration-[#2563EB]/40 underline-offset-4">{children}</u>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

function extractMessageContent(message: unknown): string {
  if (!message) {
    return "";
  }

  if (typeof message === "string") {
    return message;
  }

  const content = (message as any).content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part: any) => {
        if (!part) return "";
        if (typeof part === "string") return part;
        if (typeof part.text === "string") return part.text;
        if (part.type === "text" && typeof part.text?.value === "string") return part.text.value;
        if (typeof part?.text?.content === "string") return part.text.content;
        return "";
      })
      .join("");
  }

  if (typeof (message as any).text === "string") {
    return (message as any).text;
  }

  return "";
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 h-4">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-0.5 bg-[#2563EB]/60 rounded-full"
          initial={{ height: 4, opacity: 0.5 }}
          animate={{
            height: [4, 12, 4],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function ContractGenerationLoader() {
  const [step, setStep] = useState(0);
  const steps = [
    "解析合同需求与关键要素...",
    "检索《民法典》相关法律法规...",
    "构建标准合同框架...",
    "拟定核心条款与补充协议...",
    "进行合规性与风险审查...",
    "正在生成最终文档..."
  ];

  useEffect(() => {
    const times = [2000, 2500, 2000, 3000, 2500, 10000];
    let currentStep = 0;
    let timer: NodeJS.Timeout;
    
    const next = () => {
      if (currentStep >= steps.length - 1) return;
      timer = setTimeout(() => {
        currentStep++;
        setStep(currentStep);
        next();
      }, times[currentStep]);
    };
    
    next();
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-4 py-2 max-w-md w-full">
       <div className="flex items-center gap-3 text-[#2563EB]">
          <div className="p-1.5 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20">
            <Scale className="w-4 h-4 animate-pulse" />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase">AI 法律助理工作流</span>
       </div>
       
       <div className="pl-11 space-y-3 w-full">
          <div className="space-y-2">
             {steps.map((s, i) => {
                if (i > step) return null;
                
                const isCurrent = i === step;
                
                return (
                   <motion.div
                     key={i}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="flex items-center gap-3"
                   >
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-500",
                        isCurrent ? "bg-[#2563EB] shadow-[0_0_8px_rgba(37,99,235,0.6)] scale-110" : "bg-[#2563EB]/30"
                      )} />
                      <span className={cn(
                        "text-sm transition-colors duration-500",
                        isCurrent ? "text-foreground font-medium" : "text-muted-foreground/60"
                      )}>
                        {s}
                      </span>
                      {isCurrent && (
                        <span className="text-xs text-[#2563EB] font-mono animate-pulse ml-auto">处理中</span>
                      )}
                   </motion.div>
                )
             })}
          </div>
          
          {/* 进度条 */}
          <div className="h-1 w-full bg-muted/50 rounded-full overflow-hidden mt-4">
             <motion.div
               className="h-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6]"
               initial={{ width: "0%" }}
               animate={{ width: `${Math.min(((step + 1) / steps.length) * 100, 95)}%` }}
               transition={{ duration: 0.5 }}
             />
          </div>
       </div>
    </div>
  );
}
