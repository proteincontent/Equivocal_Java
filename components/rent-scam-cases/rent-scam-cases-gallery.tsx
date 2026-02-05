import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { rentScamCases, type RentScamRiskLevel } from "@/data/rent-scam-cases";
import { cn } from "@/lib/utils";

const riskConfig: Record<RentScamRiskLevel, { gradient: string; dot: string }> = {
  高: {
    gradient: "from-rose-500/22 via-fuchsia-500/10 to-transparent",
    dot: "text-rose-600 dark:text-rose-300",
  },
  中: {
    gradient: "from-amber-500/22 via-orange-500/10 to-transparent",
    dot: "text-amber-600 dark:text-amber-300",
  },
  低: {
    gradient: "from-emerald-500/22 via-sky-500/10 to-transparent",
    dot: "text-emerald-600 dark:text-emerald-300",
  },
};

const masonryAspects: string[] = [
  "aspect-[16/10]",
  "aspect-[4/3]",
  "aspect-[3/4]",
  "aspect-[9/16]",
  "aspect-[5/4]",
  "aspect-[1/1]",
];

export function RentScamCasesGallery() {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">案例列表</h2>
          <p className="text-sm text-muted-foreground">
            每个卡片一张图 + 一条链接（站内详情页），适合做演示与教学。
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          共 <span className="font-medium text-foreground">{rentScamCases.length}</span> 条
        </div>
      </div>

      <div className="columns-1 gap-3 sm:columns-2 sm:gap-4 lg:columns-3 2xl:columns-4">
        {rentScamCases.map((item, index) => (
          <Link
            key={item.slug}
            href={`/rent-scam-cases/${item.slug}`}
            className={cn(
              "group relative block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-3xl border border-border/60 bg-background/40 backdrop-blur",
              "mb-3 sm:mb-4",
              "shadow-[0_14px_70px_-45px_rgba(2,6,23,0.18)]",
              "transition-[transform,border-color,box-shadow] duration-300 ease-out",
              "hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_30px_90px_-55px_rgba(2,6,23,0.24)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
              masonryAspects[index % masonryAspects.length] ?? "",
            )}
            aria-label={`查看案例：${item.title}`}
          >
            <div
              className={cn("absolute inset-0 bg-gradient-to-br", riskConfig[item.risk].gradient)}
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_18%_12%,rgba(37,99,235,0.12),transparent_52%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_70%_80%,rgba(99,102,241,0.10),transparent_58%)]" />

            <div className="absolute inset-0">
              <Image
                src={item.cover.src}
                alt={item.cover.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={cn(
                  "object-contain p-5 sm:p-6",
                  "transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:transform-none",
                )}
                priority={index < 3}
              />
            </div>

            <div className="absolute left-4 top-4 right-4 flex items-start justify-end gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-background/75 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm ring-1 ring-foreground/10 backdrop-blur">
                <span
                  className={cn("h-1.5 w-1.5 rounded-full bg-current", riskConfig[item.risk].dot)}
                />
                风险{item.risk}
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0">
              <div className="pointer-events-none h-28 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent dark:from-black/90 dark:via-black/40" />
              <div className="relative flex items-end justify-between gap-3 p-4">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold tracking-tight text-white drop-shadow-sm line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-white/80 line-clamp-2">{item.subtitle}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center rounded-full bg-white/14 px-2 py-0.5 text-[10px] font-semibold text-white/90 ring-1 ring-white/20"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="shrink-0 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur-md transition-colors duration-200 group-hover:bg-white/20 motion-reduce:transition-none">
                  查看详情
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </span>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none">
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.10),transparent_45%)] dark:bg-[linear-gradient(120deg,rgba(255,255,255,0.06),transparent_45%)]" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
