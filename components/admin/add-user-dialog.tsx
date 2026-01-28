"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { buildApiUrl } from "@/lib/api";
import { Loader2, UserPlus, ShieldAlert, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  token: string;
}

export function AddUserDialog({
  open,
  onOpenChange,
  onSuccess,
  token,
}: AddUserDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("1");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setEmail("");
      setPassword("");
      setRole("1");
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "缺少信息",
        description: "请填写完整的邮箱和密码",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(buildApiUrl("/api/admin/users"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          password,
          role: parseInt(role),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "创建用户失败");
      }

      toast({
        title: "灵魂注入成功",
        description: (
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>新用户 {email} 已激活</span>
          </div>
        ),
        className: "bg-white/90 backdrop-blur-xl border-emerald-200",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("创建用户失败:", error);
      toast({
        title: "创建失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = role === "10";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white/90 backdrop-blur-2xl border-white/40 shadow-2xl rounded-[2rem]">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white/50 to-blue-50/50 pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="relative z-10 p-6 sm:p-8">
          <DialogHeader className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-2xl shadow-inner">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                注入新灵魂
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-500 ml-1">
              创建一个新的数字身份。请谨慎赋予权限。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-gray-600 font-medium ml-1 transition-colors group-focus-within:text-blue-600">
                电子邮箱
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="identity@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                disabled={loading}
              />
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="password" className="text-gray-600 font-medium ml-1 transition-colors group-focus-within:text-blue-600">
                初始密码
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                disabled={loading}
              />
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-gray-600 font-medium ml-1">权限等级</Label>
              <RadioGroup
                value={role}
                onValueChange={setRole}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="1" id="new-role-user" className="peer sr-only" />
                  <Label
                    htmlFor="new-role-user"
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-transparent bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all duration-200 peer-data-[state=checked]:bg-white peer-data-[state=checked]:border-emerald-400 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:shadow-emerald-100"
                  >
                    <span className="text-2xl mb-2">🌱</span>
                    <span className="font-semibold text-gray-900">普通用户</span>
                    <span className="text-xs text-gray-400 mt-1">标准权限</span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="10" id="new-role-admin" className="peer sr-only" />
                  <Label
                    htmlFor="new-role-admin"
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-transparent bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all duration-200 peer-data-[state=checked]:bg-white peer-data-[state=checked]:border-purple-400 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:shadow-purple-100"
                  >
                    <span className="text-2xl mb-2">⚡</span>
                    <span className="font-semibold text-gray-900">管理员</span>
                    <span className="text-xs text-gray-400 mt-1">完全控制</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <AnimatePresence>
              {isAdmin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-sm">
                    <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
                    <p>
                      您正在创建一个<strong>管理员账号</strong>。该账号将拥有系统的完整控制权，包括删除其他用户和查看敏感数据的权限。请慎重操作。
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter className="mt-8 gap-3 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-xl h-12 px-6 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={`rounded-xl h-12 px-8 text-white shadow-lg transition-all duration-300 ${
                isAdmin
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-purple-200 hover:scale-[1.02]"
                  : "bg-gradient-to-r from-gray-900 to-gray-700 hover:shadow-gray-200 hover:scale-[1.02]"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  构造中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  确认创建
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}