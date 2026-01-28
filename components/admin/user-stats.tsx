"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, User, Activity } from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";
import { SpotlightCard } from "@/components/ui/spotlight-card";

interface UserStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
}

interface UserStatsProps {
  token: string;
}

function Counter({ value }: { value: number }) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

function StatCard({ title, icon: Icon, value, description, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <SpotlightCard className="bg-white/80 dark:bg-background/60 backdrop-blur-xl border border-gray-200/80 dark:border-white/10 shadow-xl shadow-black/5 h-full">
        <div className="p-6 relative overflow-hidden h-full flex flex-col justify-between">
          {/* 巨大的背景图标装饰 */}
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Icon className="h-32 w-32 rotate-12" />
          </div>
          
          <div className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <h3 className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors tracking-wide uppercase">{title}</h3>
            <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              <Icon className="h-4 w-4" />
            </div>
          </div>
          
          <div className="relative z-10 mt-4">
            <div className="text-4xl font-bold tracking-tight font-mono tabular-nums">
              <Counter value={value} />
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5 font-medium">
              <span className="flex h-2 w-2 rounded-full bg-[#2563EB] animate-pulse" />
              {description}
            </p>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

export function UserStats({ token }: UserStatsProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [token]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取统计信息失败');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('获取统计信息失败:', err);
      setError(err instanceof Error ? err.message : '获取统计信息失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-background/40 backdrop-blur-md border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">加载中...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 animate-pulse bg-muted/50 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="border-destructive/50 bg-destructive/10 backdrop-blur-md">
        <CardContent className="pt-6">
          <p className="text-destructive text-sm">{error || '无法加载统计信息'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="总用户数"
        icon={Users}
        value={stats.totalUsers}
        description="系统注册用户总数"
        delay={0}
      />
      <StatCard
        title="管理员"
        icon={Shield}
        value={stats.adminUsers}
        description="拥有管理权限的用户"
        delay={0.1}
      />
      <StatCard
        title="普通用户"
        icon={User}
        value={stats.regularUsers}
        description="标准权限用户"
        delay={0.2}
      />
    </div>
  );
}