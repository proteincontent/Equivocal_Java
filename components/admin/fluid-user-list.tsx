"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MoreHorizontal,
  MessageSquare,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Loader2,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditRoleDialog } from "./edit-role-dialog";
import { AddUserDialog } from "./add-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { UserChatHistoryDialog } from "./user-chat-history-dialog";
import { buildApiUrl } from "@/lib/api";

interface User {
  id: string;
  email: string;
  role: number;
  createdAt: string;
  updatedAt: string;
}

interface FluidUserListProps {
  token: string;
  currentUserId: string;
  roleFilter?: 'all' | 'admin' | 'user';
  onFilterChange?: (_filter: 'all' | 'admin' | 'user') => void;
}

function UserCapsule({
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
  const isAdmin = user.role >= 10;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: index * 0.05
      }}
      whileHover={{
        scale: 1.02,
        y: -5,
        boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
        zIndex: 10
      }}
      className="group relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] p-4 flex items-center justify-between gap-4 transition-colors hover:bg-white/60"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg ${
          isAdmin ? 'bg-gradient-to-br from-violet-500 to-purple-500' : 'bg-gradient-to-br from-emerald-400 to-teal-400'
        }`}>
          {user.email.substring(0, 2).toUpperCase()}
          {isAdmin && (
            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 border-2 border-white shadow-sm">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-gray-800 truncate text-lg">
            {user.email}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isAdmin
                ? 'bg-purple-100 text-purple-600'
                : 'bg-emerald-100 text-emerald-600'
            }`}>
              {isAdmin ? '管理员' : '普通用户'}
            </span>
            {isCurrentUser && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-900 text-white">
                当前账号
              </span>
            )}
            <span className="text-xs text-gray-400 font-medium">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* 直接暴露的操作按钮 - 减少点击次数 */}
      <div className="flex items-center gap-2">
        {/* 编辑按钮 - 最高频操作，直接暴露 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-9 px-4 rounded-full bg-white border border-gray-200/60 text-gray-600 shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          <Edit className="h-3.5 w-3.5 mr-2" />
          <span className="text-sm font-medium">编辑</span>
        </Button>

        {/* 更多操作下拉菜单 - 次要操作 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              aria-label="更多操作"
              className="h-10 w-10 rounded-full hover:bg-white/50 data-[state=open]:bg-white/50"
            >
              <MoreHorizontal className="h-5 w-5 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 rounded-[1.5rem] bg-white/80 backdrop-blur-xl border-white/50 p-2 shadow-xl"
          >
            <DropdownMenuLabel className="pl-3 text-xs text-gray-400 uppercase tracking-wider">更多操作</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={onViewHistory}
              className="rounded-xl focus:bg-blue-50 focus:text-blue-600 cursor-pointer py-2.5"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>聊天记录</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-100" />
            <DropdownMenuItem
              onClick={onDelete}
              disabled={isCurrentUser}
              className="rounded-xl text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer py-2.5"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>删除用户</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

export function FluidUserList({ token, currentUserId, roleFilter = 'all', onFilterChange }: FluidUserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const prevRoleFilterRef = useRef(roleFilter);

  // 对话框状态
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [viewHistoryUser, setViewHistoryUser] = useState<User | null>(null);

  // 防止重复请求的 ref
  const fetchingRef = useRef(false);
  const lastFetchParamsRef = useRef<string>('');

  const fetchUsers = useCallback(async () => {
    // 生成当前请求的参数签名
    const currentParams = `${page}-${pageSize}-${search}-${token}-${roleFilter}`;
    
    // 如果正在请求中，或者参数没有变化，则跳过
    if (fetchingRef.current) {
      console.log('[FluidUserList] 跳过重复请求');
      return;
    }

    fetchingRef.current = true;
    lastFetchParamsRef.current = currentParams;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      // 添加角色筛选
      if (roleFilter === 'admin') {
        params.append('role', '10');
      } else if (roleFilter === 'user') {
        params.append('role', '0');
      }

      const response = await fetch(buildApiUrl(`/api/admin/users?${params}`), {
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
      console.error('[FluidUserList] 获取用户列表失败:', err);
      setError(err instanceof Error ? err.message : '获取用户列表失败');
      setUsers([]);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [page, pageSize, roleFilter, search, token]);

  useEffect(() => {
    const roleFilterChanged = prevRoleFilterRef.current !== roleFilter;
    if (roleFilterChanged) {
      prevRoleFilterRef.current = roleFilter;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    fetchUsers();
  }, [fetchUsers, page, roleFilter]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          (target as HTMLElement).isContentEditable);

      if (isTyping) return;

      const isCmdK =
        (e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K");
      const isSlash =
        e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey;

      if (!isCmdK && !isSlash) return;

      e.preventDefault();
      searchInputRef.current?.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleClearFilter = () => {
    onFilterChange?.('all');
  };

  const handleClearAll = () => {
    setSearchInput("");
    setSearch("");
    onFilterChange?.("all");
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // 计算当前显示的用户范围
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

  // 判断是否有活跃的筛选条件
  const hasActiveFilters = search || roleFilter !== 'all';

  return (
    <div className="space-y-8">
      {/* 搜索胶囊与操作栏 */}
      <motion.div
        className="relative max-w-3xl mx-auto flex items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="relative group flex-1">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500" />
          <div className="relative flex items-center bg-white/80 backdrop-blur-xl rounded-full p-2 shadow-lg ring-1 ring-white/50">
            <Search className="ml-4 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索用户邮箱...（/ 或 Ctrl+K）"
              ref={searchInputRef}
              className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-gray-700 placeholder:text-gray-400 min-w-0"
            />
            {/* 清除搜索按钮 */}
            {searchInput && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="rounded-full h-8 w-8 p-0 mr-2 hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-400" />
              </Button>
            )}
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="rounded-full bg-gray-900 text-white hover:bg-gray-800 px-6 whitespace-nowrap"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "更新中" : "搜索"}
            </Button>
          </div>
        </div>

        {/* 添加用户按钮 - 独立且醒目 */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setIsAddUserOpen(true)}
            className="h-[52px] px-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 border border-blue-400 hover:shadow-blue-300 transition-all duration-300"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            <span className="font-semibold">新增用户</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* 搜索结果反馈 + 筛选标签 */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            {/* 搜索结果数量 */}
            {search && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                <Search className="w-4 h-4" />
                <span>搜索 &ldquo;{search}&rdquo; 找到 {total} 个用户</span>
                <button
                  onClick={handleClearSearch}
                  className="ml-1 p-0.5 rounded-full hover:bg-blue-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 角色筛选标签 */}
            {roleFilter !== 'all' && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                roleFilter === 'admin'
                  ? 'bg-purple-50 text-purple-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}>
                <span>
                  {roleFilter === 'admin' ? '仅显示管理员' : '仅显示普通用户'}
                </span>
                <button
                  onClick={handleClearFilter}
                  className={`ml-1 p-0.5 rounded-full transition-colors ${
                    roleFilter === 'admin'
                      ? 'hover:bg-purple-100'
                      : 'hover:bg-emerald-100'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="rounded-full bg-white/60 hover:bg-white/80 border border-white/50"
            >
              清除全部
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 列表容器 */}
      <div className="relative min-h-[400px]">
        {loading && users.length === 0 ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white/20 rounded-[2rem] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50/50 rounded-[3rem] border border-red-100 space-y-4">
            <p className="text-red-400 font-medium">{error}</p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={fetchUsers}
                disabled={loading}
                className="rounded-full"
              >
                重试
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={handleClearAll}
                  disabled={loading}
                  className="rounded-full"
                >
                  清除筛选
                </Button>
              )}
            </div>
          </div>
        ) : users.length === 0 ? (
          <motion.div 
            className="text-center py-20 bg-white/30 backdrop-blur-md rounded-[3rem] border border-white/40"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/50 mb-4 shadow-inner">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-500">没有找到匹配的用户</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {users.map((user, index) => (
                <UserCapsule
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
      </div>

      {/* 分页 - 始终显示，即使只有一页 */}
      <div className="flex flex-col items-center gap-3">
        {/* 用户数量信息 */}
        <div className="text-sm text-gray-500">
          {total > 0 ? (
            <span>
              显示第 <span className="font-semibold text-gray-700 tabular-nums">{startIndex}</span> - <span className="font-semibold text-gray-700 tabular-nums">{endIndex}</span> 个，
              共 <span className="font-semibold text-gray-700 tabular-nums">{total}</span> 个用户
            </span>
          ) : (
            <span>暂无用户</span>
          )}
        </div>

        {/* 分页控制 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="rounded-full hover:bg-white/40"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center px-6 py-2 bg-white/30 backdrop-blur-md rounded-full text-sm font-medium text-gray-600 shadow-sm border border-white/40">
              <span className="tabular-nums">{page}</span>
              <span className="mx-2 text-gray-400">/</span>
              <span className="tabular-nums">{totalPages}</span>
            </div>
            <Button
              variant="ghost"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="rounded-full hover:bg-white/40"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* 对话框 */}
      <AddUserDialog
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        onSuccess={fetchUsers}
        token={token}
      />

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
