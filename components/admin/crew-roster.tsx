"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Shield, 
  ShieldAlert, 
  User as UserIcon, 
  MessageSquare, 
  Edit, 
  Trash2, 
  Calendar,
  Activity,
  ChevronLeft,
  ChevronRight,
  Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditRoleDialog } from "./edit-role-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { UserChatHistoryDialog } from "./user-chat-history-dialog";

interface User {
  id: string;
  email: string;
  role: number;
  created_at: string;
  updated_at: string;
}

interface CrewRosterProps {
  token: string;
  currentUserId: string;
}

function CrewCard({ 
  user, 
  index, 
  onViewHistory, 
  onEdit, 
  onDelete,
  isCurrentUser
}: { 
  user: User; 
  index: number;
  onViewHistory: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isCurrentUser: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isAdmin = user.role >= 10;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 生成用户头像颜色
  const getAvatarGradient = (email: string) => {
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    return `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${(hue + 60) % 360}, 70%, 40%))`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      {/* 背景光晕 */}
      <motion.div 
        className={`absolute -inset-1 rounded-2xl blur-xl transition-opacity duration-500 ${
          isAdmin 
            ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30' 
            : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20'
        }`}
        animate={{ opacity: isHovered ? 0.8 : 0.3 }}
      />
      
      {/* 卡片主体 */}
      <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
        isHovered 
          ? 'border-cyan-500/50 bg-black/60' 
          : 'border-white/10 bg-black/40'
      } backdrop-blur-xl`}>
        
        {/* 扫描线效果 */}
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, rgba(0,255,255,0.03) 50%, transparent 100%)`,
            backgroundSize: '100% 200%'
          }}
          animate={{
            backgroundPosition: isHovered ? ['0% 0%', '0% 100%'] : '0% 0%'
          }}
          transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
        />

        {/* 顶部状态栏 */}
        <div className={`h-1 w-full ${isAdmin ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`} />

        <div className="p-4">
          {/* 头部：头像 + 身份 */}
          <div className="flex items-start gap-4">
            {/* 头像 */}
            <div className="relative">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-lg"
                style={{ background: getAvatarGradient(user.email) }}
              >
                {user.email.substring(0, 2).toUpperCase()}
              </div>
              {/* 在线状态指示 */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-black/80 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* 用户信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {isAdmin ? (
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                ) : (
                  <UserIcon className="w-4 h-4 text-cyan-400" />
                )}
                <span className={`text-xs font-mono uppercase tracking-wider ${
                  isAdmin ? 'text-purple-400' : 'text-cyan-400'
                }`}>
                  {isAdmin ? '管理员' : '舰员'}
                </span>
                {isCurrentUser && (
                  <span className="text-xs font-mono text-amber-400 ml-auto">YOU</span>
                )}
              </div>
              <p className="text-sm font-medium text-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>

          {/* 数据区域 */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-2">
              <div className="flex items-center gap-1.5 text-muted-foreground/60 mb-1">
                <Calendar className="w-3 h-3" />
                <span className="text-[10px] font-mono uppercase">注册时间</span>
              </div>
              <p className="text-xs font-mono text-foreground/80">{formatDate(user.created_at)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <div className="flex items-center gap-1.5 text-muted-foreground/60 mb-1">
                <Activity className="w-3 h-3" />
                <span className="text-[10px] font-mono uppercase">权限等级</span>
              </div>
              <p className="text-xs font-mono text-foreground/80">Level {user.role}</p>
            </div>
          </div>

          {/* 操作按钮 */}
          <motion.div 
            className="mt-4 flex gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-8 text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20"
              onClick={onViewHistory}
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              记录
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-8 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20"
              onClick={onEdit}
            >
              <Edit className="w-3 h-3 mr-1" />
              编辑
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
              onClick={onDelete}
              disabled={isCurrentUser}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </motion.div>
        </div>

        {/* 角落装饰 */}
        <div className="absolute top-0 right-0 w-8 h-8">
          <div className="absolute top-2 right-2 w-1 h-4 bg-gradient-to-b from-cyan-500/50 to-transparent" />
          <div className="absolute top-2 right-2 w-4 h-1 bg-gradient-to-r from-cyan-500/50 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 w-8 h-8">
          <div className="absolute bottom-2 left-2 w-1 h-4 bg-gradient-to-t from-cyan-500/50 to-transparent" />
          <div className="absolute bottom-2 left-2 w-4 h-1 bg-gradient-to-l from-cyan-500/50 to-transparent" />
        </div>
      </div>
    </motion.div>
  );
}

export function CrewRoster({ token, currentUserId }: CrewRosterProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commandFocused, setCommandFocused] = useState(false);

  // 对话框状态
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [viewHistoryUser, setViewHistoryUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page, search, token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12', // 网格布局，每页12个
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('认证失败，请重新登录');
        }
        throw new Error(`获取用户列表失败 (${response.status})`);
      }

      const data = await response.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('[CrewRoster] 获取用户列表失败:', err);
      setError(err instanceof Error ? err.message : '获取用户列表失败');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="space-y-8">
        {/* 命令行骨架 */}
        <div className="h-14 bg-white/5 rounded-xl animate-pulse" />
        {/* 卡片网格骨架 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="rounded-xl border border-red-500/50 bg-red-500/10 backdrop-blur-md p-6 text-center">
        <div className="text-red-400 text-lg font-mono mb-2">⚠ SYSTEM ERROR</div>
        <p className="text-red-300/80 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 命令行搜索 */}
      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
          commandFocused 
            ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.2)]' 
            : 'border-white/10'
        } bg-black/40 backdrop-blur-xl`}>
          
          {/* 顶部状态栏 */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-white/5">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs font-mono text-muted-foreground/50 ml-2">
              crew-search.sh — bash — 80×24
            </span>
          </div>
          
          {/* 命令输入区 */}
          <div className="flex items-center gap-3 px-4 py-3">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 font-mono text-sm">$</span>
            <span className="text-muted-foreground/70 font-mono text-sm">search --user</span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setCommandFocused(true)}
              onBlur={() => setCommandFocused(false)}
              placeholder="输入邮箱关键词..."
              className="flex-1 bg-transparent border-none outline-none text-foreground font-mono text-sm placeholder:text-muted-foreground/30"
            />
            <Button
              size="sm"
              onClick={handleSearch}
              disabled={loading}
              className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 font-mono text-xs"
            >
              EXECUTE
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 结果统计 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm font-mono">
          <span className="text-muted-foreground/60">
            CREW_COUNT: <span className="text-cyan-400">{total}</span>
          </span>
          <span className="text-muted-foreground/30">|</span>
          <span className="text-muted-foreground/60">
            PAGE: <span className="text-cyan-400">{page}</span>/<span className="text-muted-foreground/80">{totalPages}</span>
          </span>
        </div>
      </div>

      {/* 用户卡片网格 */}
      {(!users || users.length === 0) ? (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-4">
            <Search className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <p className="text-lg font-mono text-muted-foreground/60">NO CREW MEMBERS FOUND</p>
          <p className="text-sm text-muted-foreground/40 mt-1">尝试调整搜索条件</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {users.map((user, index) => (
              <CrewCard
                key={user.id}
                user={user}
                index={index}
                isCurrentUser={user.id === currentUserId}
                onViewHistory={() => setViewHistoryUser(user)}
                onEdit={() => setEditUser(user)}
                onDelete={() => setDeleteUser(user)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="bg-white/5 hover:bg-white/10 border border-white/10 font-mono"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            PREV
          </Button>
          
          <div className="flex items-center gap-2">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              if (pageNum > totalPages) return null;
              return (
                <Button
                  key={pageNum}
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 p-0 font-mono ${
                    page === pageNum 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="bg-white/5 hover:bg-white/10 border border-white/10 font-mono"
          >
            NEXT
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* 对话框 */}
      <EditRoleDialog
        user={editUser}
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
        onSuccess={fetchUsers}
        token={token}
      />

      <DeleteUserDialog
        user={deleteUser}
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
        onSuccess={fetchUsers}
        token={token}
      />

      <UserChatHistoryDialog
        userId={viewHistoryUser?.id || null}
        userEmail={viewHistoryUser?.email || null}
        isOpen={!!viewHistoryUser}
        onOpenChange={(open) => !open && setViewHistoryUser(null)}
        token={token}
      />
    </div>
  );
}
