"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, SlidersHorizontal, Sparkles } from "lucide-react";
import Link from "next/link";
import { BackgroundOrganism } from "@/components/admin/background-organism";
import { CellStats } from "@/components/admin/cell-stats";
import { FluidUserList } from "@/components/admin/fluid-user-list";
import { motion } from "framer-motion";
import { buildApiUrl } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, token, isAdmin } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ total: 0, admins: 0, users: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [uiScale, setUiScale] = useState(1.1);

  useEffect(() => {
    // 让此页面在硬刷新（Ctrl+R）后依旧保持同样的视觉尺寸（并可持久化）
    const STORAGE_KEY = "admin-users-ui-scale";
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? Number(raw) : NaN;
    const initialScale = Number.isFinite(parsed) ? parsed : 1.1;

    // 合理范围：避免误操作写入极端值导致页面不可用
    const clampedScale = Math.min(1.5, Math.max(0.9, initialScale));

    setUiScale(clampedScale);
    document.documentElement.style.setProperty("--app-scale", String(clampedScale));

    return () => {
      document.documentElement.style.removeProperty("--app-scale");
    };
  }, []);

  useEffect(() => {
    const STORAGE_KEY = "admin-users-ui-scale";
    window.localStorage.setItem(STORAGE_KEY, String(uiScale));
    document.documentElement.style.setProperty("--app-scale", String(uiScale));
  }, [uiScale]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 使用 useCallback 优化 fetchStats，避免不必要的重新创建
  const fetchStats = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(buildApiUrl('/api/admin/stats'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats({
          total: data.totalUsers || 0,
          admins: data.adminUsers || 0,
          users: data.regularUsers || 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (mounted && token) {
      fetchStats();
    }
  }, [mounted, token, fetchStats]);

  useEffect(() => {
    if (mounted && !isAdmin()) {
      router.push('/');
    }
  }, [mounted, isAdmin, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <BackgroundOrganism />
        <motion.div
          key="loading-state"
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-300 via-purple-300 to-indigo-300 animate-pulse blur-md" />
        </motion.div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <BackgroundOrganism />
        <div className="relative z-10 text-center p-12 rounded-[3rem] bg-white/40 backdrop-blur-2xl shadow-xl border border-white/60">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">权限不足</h1>
          <p className="text-gray-500 mb-6">这里是管理员的私密花园</p>
          <Button
            onClick={() => router.push('/')}
            className="rounded-full bg-gray-900 text-white hover:bg-gray-800 px-8 py-6"
          >
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <BackgroundOrganism />
        <div className="relative z-10 text-center p-12 rounded-[3rem] bg-white/40 backdrop-blur-2xl shadow-xl border border-white/60">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">未登录</h1>
          <p className="text-gray-500 mb-6">请先验证身份</p>
          <Button
            onClick={() => router.push('/')}
            className="rounded-full bg-gray-900 text-white hover:bg-gray-800 px-8 py-6"
          >
            去登录
          </Button>
        </div>
      </div>
    );
  }

  const scaleOptions = [
    { label: "100%", value: 1 },
    { label: "110%", value: 1.1 },
    { label: "120%", value: 1.2 },
    { label: "125%", value: 1.25 },
    { label: "130%", value: 1.3 },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <BackgroundOrganism />
      
      <motion.div
        key="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full mx-auto py-12 px-6 lg:px-12 xl:px-16 max-w-none relative z-10"
      >
        {/* 导航 */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 flex justify-between items-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors bg-white/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 hover:bg-white/60"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">返回首页</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 rounded-full bg-white/40 backdrop-blur-md px-4 border border-white/50 hover:bg-white/60 hover:text-gray-900 text-gray-600"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium tabular-nums">{Math.round(uiScale * 100)}%</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 rounded-[1.25rem] bg-white/85 backdrop-blur-xl border-white/50 p-2 shadow-xl"
              >
                <DropdownMenuLabel className="pl-3 text-xs text-gray-400 uppercase tracking-wider">
                  显示比例
                </DropdownMenuLabel>
                {scaleOptions.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => setUiScale(opt.value)}
                    className="rounded-xl cursor-pointer py-2.5"
                  >
                    <span className="w-5 inline-flex justify-center mr-2">
                      {uiScale === opt.value ? <Check className="w-4 h-4" /> : null}
                    </span>
                    <span className="tabular-nums">{opt.label}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem
                  onClick={() => setUiScale(1.1)}
                  className="rounded-xl cursor-pointer py-2.5 text-gray-500"
                >
                  默认（110%）
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/50">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-gray-600">系统运转正常</span>
            </div>
          </div>
        </motion.nav>

        {/* 标题区 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-20 text-center"
        >
          <div className="inline-block mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 text-purple-600 text-sm font-bold tracking-wide uppercase">
              <Sparkles className="w-4 h-4" />
              管理控制台
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight mb-6">
            用户生态系统
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            管理您的数字社区。在这里，每个用户都是独特的个体，每个数据都在自由流动。
          </p>
        </motion.section>

        {/* 统计区 */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-24"
        >
          <CellStats
            stats={stats}
            loading={statsLoading}
            activeFilter={roleFilter}
            onFilterChange={setRoleFilter}
          />
        </motion.section>

        {/* 列表区 */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-8 px-4">
            <h2 className="text-2xl font-bold text-gray-800">成员列表</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent ml-8" />
          </div>
          <FluidUserList
            token={token}
            currentUserId={user.userId}
            roleFilter={roleFilter}
            onFilterChange={setRoleFilter}
          />
        </motion.section>
      </motion.div>
    </div>
  );
}
