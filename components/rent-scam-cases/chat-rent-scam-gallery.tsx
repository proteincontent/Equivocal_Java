"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { rentScamCases, type RentScamRiskLevel } from "@/data/rent-scam-cases";
import { cn } from "@/lib/utils";

// 风险等级配色 - 更柔和
const riskConfig: Record<RentScamRiskLevel, { gradient: string; dot: string }> = {
  高: {
    gradient: "from-rose-400/20 via-pink-400/10 to-transparent",
    dot: "text-rose-600 dark:text-rose-300",
  },
  中: {
    gradient: "from-amber-400/20 via-orange-300/10 to-transparent",
    dot: "text-amber-600 dark:text-amber-300",
  },
  低: {
    gradient: "from-emerald-400/20 via-teal-300/10 to-transparent",
    dot: "text-emerald-600 dark:text-emerald-300",
  },
};

const bentoLayout: string[] = [
  "sm:col-span-2 lg:row-span-2",
  "lg:row-span-2",
  "",
  "",
  "sm:col-span-2",
  "",
  "",
  "",
];

type Tag = string;
const ALL = "__all__";

export function ChatRentScamGallery({ limit = 8 }: { limit?: number }) {
  const tags = useMemo<Tag[]>(() => {
    const set = new Set<string>();
    for (const c of rentScamCases) for (const t of c.tags) set.add(t);
    return Array.from(set);
  }, []);

  const [activeTag, setActiveTag] = useState<string>(ALL);

  const items = useMemo(() => {
    const filtered =
      activeTag === ALL
        ? rentScamCases
        : rentScamCases.filter((c) => c.tags.includes(activeTag as any));
    return filtered.slice(0, Math.max(1, limit));
  }, [activeTag, limit]);

  return (
    <section className="w-full rounded-[32px] border border-white/60 bg-gradient-to-br from-white via-slate-50/80 to-slate-100/60 p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] backdrop-blur-xl md:p-8 dark:border-white/10 dark:from-slate-950 dark:via-slate-950/80 dark:to-slate-900/50">
      {/* 头部 */}
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
              经典租房诈骗案例
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-300/80">
            点击标签筛选案例，学习识别常见租房骗局套路
          </p>
        </div>
        <Link
          href="/rent-scam-cases"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
        >
          查看全部
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </header>

      {/* 标签栏 */}
      <div className="mt-6 -mx-2 flex gap-2 overflow-x-auto px-2 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <TagButton active={activeTag === ALL} onClick={() => setActiveTag(ALL)}>
          全部
        </TagButton>
        {tags.map((t) => (
          <TagButton key={t} active={activeTag === t} onClick={() => setActiveTag(t)}>
            {t}
          </TagButton>
        ))}
      </div>

      {/* 卡片（豆包风格：Bento Grid） */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 auto-rows-[12rem] sm:auto-rows-[13rem] lg:auto-rows-[14rem]">
        {items.map((item, index) => (
          <Card key={item.slug} item={item} index={index} className={bentoLayout[index] ?? ""} />
        ))}
      </div>
    </section>
  );
}

// 标签按钮组件
function TagButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex h-9 shrink-0 items-center justify-center rounded-full px-4 text-sm font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
        active
          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/25"
          : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300 dark:bg-slate-900/40 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-slate-900/60 dark:hover:ring-white/20",
      )}
    >
      {children}
    </button>
  );
}

// 卡片组件
function Card({
  item,
  index,
  className,
}: {
  item: (typeof rentScamCases)[0];
  index: number;
  className?: string;
}) {
  const config = riskConfig[item.risk];

  return (
    <Link
      href={`/rent-scam-cases/${item.slug}`}
      className={cn(
        "group relative h-full overflow-hidden rounded-[28px] bg-white shadow-[0_10px_44px_-18px_rgba(2,6,23,0.18)] ring-1 ring-slate-200/60",
        "transition-[transform,box-shadow,filter] duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-[0_22px_70px_-30px_rgba(2,6,23,0.22)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        "dark:bg-slate-950 dark:ring-white/10 dark:shadow-[0_18px_70px_-40px_rgba(0,0,0,0.9)]",
        className,
      )}
    >
      {/* 背景光晕 */}
      <div className={cn("absolute inset-0 bg-gradient-to-br", config.gradient)} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_18%_12%,rgba(37,99,235,0.14),transparent_50%)] dark:bg-[radial-gradient(900px_circle_at_18%_12%,rgba(37,99,235,0.20),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_70%_80%,rgba(99,102,241,0.10),transparent_55%)] dark:bg-[radial-gradient(900px_circle_at_70%_80%,rgba(99,102,241,0.16),transparent_55%)]" />

      {/* 主图 */}
      <div className="absolute inset-0">
        <Image
          src={item.cover.src}
          alt={item.cover.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={cn(
            "object-contain p-8",
            "transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:transform-none",
          )}
          priority={index < 2}
        />
      </div>

      {/* 顶部信息 */}
      <div className="absolute left-4 top-4 right-4 flex items-start justify-between gap-3">
        <div className="inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm ring-1 ring-black/5 backdrop-blur dark:bg-slate-950/60 dark:text-slate-100 dark:ring-white/10">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
          法律案例
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ring-1 ring-black/5 backdrop-blur",
            "bg-white/80 text-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:ring-white/10",
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full bg-current", config.dot)} />
          风险{item.risk}
        </div>
      </div>

      {/* 底部遮罩 + 文案 */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="pointer-events-none h-28 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent dark:from-black/90 dark:via-black/40" />
        <div className="relative flex items-end justify-between gap-3 p-4">
          <div className="min-w-0">
            <h3 className="text-base font-semibold tracking-tight text-white drop-shadow-sm line-clamp-1">
              {item.title}
            </h3>
            <p className="mt-1 text-xs text-white/80 line-clamp-2">{item.subtitle}</p>
          </div>
          <span
            className={cn(
              "shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold",
              "bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-md",
              "transition-colors duration-200 group-hover:bg-white/20 motion-reduce:transition-none",
            )}
          >
            查看详情
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </span>
        </div>
      </div>

      {/* Hover 质感 */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_45%)] dark:bg-[linear-gradient(120deg,rgba(255,255,255,0.06),transparent_45%)]" />
      </div>
    </Link>
  );
}
