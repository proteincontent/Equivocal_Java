"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { buildApiUrl } from "@/lib/api";

interface User {
  id: string;
  email: string;
  role: number;
}

interface EditRoleDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  onSuccess: () => void;
  token: string;
}

export function EditRoleDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
  token,
}: EditRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<string>("1");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const normalizedCurrentRole = useMemo(() => {
    if (!user) return 1;
    const roleNum = Number.isFinite(user.role) ? user.role : Number.parseInt(String(user.role ?? "1"), 10);
    return roleNum >= 10 ? 10 : 1;
  }, [user]);

  const userId = user?.id;

  useEffect(() => {
    if (!open || !userId) return;
    setSelectedRole(normalizedCurrentRole >= 10 ? "10" : "1");
    setNewPassword("");
  }, [open, userId, normalizedCurrentRole]);

  const handleSubmit = async () => {
    if (!user) return;

    const trimmedPassword = newPassword.trim();
    const newRole = Number.parseInt(selectedRole, 10);
    const roleChanged = Number.isFinite(newRole) && newRole !== normalizedCurrentRole;
    const passwordChanged = trimmedPassword.length > 0;

    if (!roleChanged && !passwordChanged) {
      toast({
        title: "提示",
        description: "未进行任何更改",
      });
      return;
    }

    try {
      setLoading(true);
      let roleUpdated = false;
      let passwordUpdated = false;

      // 更新角色（如果改变了）
      if (roleChanged) {
        const response = await fetch(buildApiUrl(`/api/admin/users/${user.id}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || '更新角色失败');
        }
        roleUpdated = true;
      }

      // 重置密码（如果提供了新密码）
      if (passwordChanged) {
        const response = await fetch(buildApiUrl(`/api/admin/users/${user.id}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ newPassword: trimmedPassword }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || '重置密码失败');
        }
        passwordUpdated = true;
      }

      // 显示成功消息
      if (roleUpdated && passwordUpdated) {
        toast({
          title: "成功",
          description: "用户角色和密码已更新",
        });
      } else if (roleUpdated) {
        toast({
          title: "成功",
          description: "用户角色已更新",
        });
      } else if (passwordUpdated) {
        toast({
          title: "成功",
          description: "用户密码已重置",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('更新用户信息失败:', error);
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : '更新失败',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑用户信息</DialogTitle>
          <DialogDescription>
            修改用户 {user.email} 的权限和密码
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* 角色管理 */}
          <div className="space-y-3">
            <Label>当前角色</Label>
            <p className="text-sm text-muted-foreground">
              {user.role >= 10 ? "管理员 (10)" : "普通用户 (1)"}
            </p>
          </div>

          <div className="space-y-3">
            <Label>新角色</Label>
            <RadioGroup value={selectedRole} onValueChange={setSelectedRole}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="role-user" />
                <Label htmlFor="role-user" className="font-normal cursor-pointer">
                  普通用户 (1) - 标准权限
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="10" id="role-admin" />
                <Label htmlFor="role-admin" className="font-normal cursor-pointer">
                  管理员 (10) - 完全权限
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* 密码重置 */}
          <div className="space-y-3">
            <Label htmlFor="new-password">重置密码（可选）</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="留空表示不修改密码"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              如需重置密码，请输入新密码
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "保存中..." : "保存更改"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
