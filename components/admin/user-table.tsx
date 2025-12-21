"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Trash2, ChevronLeft, ChevronRight, MessageSquare, MoreHorizontal, Shield, ShieldAlert, Calendar } from "lucide-react";
import { EditRoleDialog } from "./edit-role-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { UserChatHistoryDialog } from "./user-chat-history-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { buildApiUrl } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  email: string;
  role: number;
  created_at: string;
  updated_at: string;
}

interface UserTableProps {
  token: string;
  currentUserId: string;
}

export function UserTable({ token, currentUserId }: UserTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 编辑和删除对话框状态
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

      console.log('[UserTable] 开始获取用户列表，token:', token ? '存在' : '不存在');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('[UserTable] API响应状态:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[UserTable] API错误:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('认证失败，请重新登录');
        }
        throw new Error(`获取用户列表失败 (${response.status})`);
      }

      const data = await response.json();
      console.log('[UserTable] 获取到数据:', data);
      
      // 确保数据格式正确
      if (!data || typeof data !== 'object') {
        throw new Error('API返回数据格式错误');
      }
      
      setUsers(Array.isArray(data.users) ? data.users : []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('[UserTable] 获取用户列表失败:', err);
      setError(err instanceof Error ? err.message : '获取用户列表失败');
      // 确保即使出错，users也是空数组而非undefined
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1); // 重置到第一页
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getRoleBadge = (role: number) => {
    if (role >= 10) {
      return (
        <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/50 shadow-[0_0_10px_rgba(var(--primary),0.2)]">
          <ShieldAlert className="w-3 h-3 mr-1" />
          管理员
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-muted/50 text-muted-foreground hover:bg-muted/80">
        <User className="w-3 h-3 mr-1" />
        普通用户
      </Badge>
    );
  };
  
  // 引入 User 图标用于 Badge
  const User = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  if (loading && users.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="h-10 flex-1 animate-pulse bg-muted/50 rounded backdrop-blur-sm"></div>
          <div className="h-10 w-20 animate-pulse bg-muted/50 rounded backdrop-blur-sm"></div>
        </div>
        <div className="h-64 animate-pulse bg-muted/50 rounded backdrop-blur-sm"></div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 backdrop-blur-md p-4">
        <p className="text-destructive text-sm font-medium">{error}</p>
        {error.includes('认证失败') && (
          <p className="text-destructive/70 text-xs mt-2">
            提示：您可能需要退出登录并重新登录以获取新的认证令牌
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 搜索框 */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
        <div className="relative flex gap-2 p-1.5 bg-white/80 dark:bg-background/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-lg shadow-xl shadow-black/5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索用户邮箱..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-9 bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/50 h-10"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-primary/25"
          >
            搜索
          </Button>
        </div>
      </div>

      {/* 用户表格 */}
      <Card className="overflow-hidden border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-background/50 backdrop-blur-xl shadow-xl shadow-black/5">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-black/20">
            <TableRow className="hover:bg-transparent border-gray-200 dark:border-white/5">
              <TableHead className="w-[300px] font-medium text-muted-foreground">邮箱</TableHead>
              <TableHead className="font-medium text-muted-foreground">角色</TableHead>
              <TableHead className="font-medium text-muted-foreground">注册时间</TableHead>
              <TableHead className="text-right font-medium text-muted-foreground">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!users || users.length === 0) ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Search className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">{search ? '未找到匹配的用户' : '暂无用户数据'}</p>
                    <p className="text-sm opacity-50">尝试调整搜索条件</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence mode="popLayout">
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group border-b border-gray-100 dark:border-white/5 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    <TableCell className="font-medium relative">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-primary border border-white/10">
                          {user.email.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-foreground/90 group-hover:text-primary transition-colors">{user.email}</span>
                      </div>
                      {/* 行高亮光效 */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono">
                        <Calendar className="w-3 h-3" />
                        {formatDate(user.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 data-[state=open]:opacity-100">
                            <span className="sr-only">打开菜单</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] bg-background/80 backdrop-blur-xl border-white/10">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setViewHistoryUser(user)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>聊天记录</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem onClick={() => setEditUser(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>编辑用户</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteUser(user)}
                            disabled={user.id === currentUserId}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>删除用户</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            共 {total} 条记录，第 {page} / {totalPages} 页
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="bg-background/40 backdrop-blur-md border-primary/10 hover:bg-primary/10"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="bg-background/40 backdrop-blur-md border-primary/10 hover:bg-primary/10"
            >
              下一页
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* 编辑角色对话框 */}
      <EditRoleDialog
        user={editUser}
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
        onSuccess={fetchUsers}
        token={token}
      />

      {/* 删除用户对话框 */}
      <DeleteUserDialog
        user={deleteUser}
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
        onSuccess={fetchUsers}
        token={token}
      />

      {/* 用户聊天记录对话框 */}
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
