"use client";

import { useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { buildApiUrl } from "@/lib/api";

interface User {
  id: string;
  email: string;
  role: number;
}

interface DeleteUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  token: string;
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
  token,
}: DeleteUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const response = await fetch(buildApiUrl(`/api/admin/users/${user.id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "删除用户失败");
      }

      toast({
        title: "成功",
        description: "用户已成功删除",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("删除用户失败:", error);
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "删除用户失败",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除用户？</AlertDialogTitle>
          <AlertDialogDescription>
            您即将删除用户 <span className="font-semibold text-foreground">{user.email}</span>。
            此操作将：
          </AlertDialogDescription>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
            <li>永久删除该用户的账号信息</li>
            <li>删除该用户的所有聊天会话</li>
            <li>删除该用户的所有聊天消息</li>
          </ul>
          <p className="mt-3 text-sm font-semibold text-destructive">
            此操作无法撤销，请谨慎操作！
          </p>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {loading ? "删除中..." : "确认删除"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
