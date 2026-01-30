import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ShieldCheck, ShieldAlert, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getRentScamCase, rentScamCases } from "@/data/rent-scam-cases";

type PageProps = {
  params: { slug: string };
};

function riskBadgeClassName(risk: string) {
  switch (risk) {
    case "高":
      return "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-200";
    case "中":
      return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200";
    case "低":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200";
    default:
      return "";
  }
}

export async function generateStaticParams() {
  return rentScamCases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = props.params;
  const item = getRentScamCase(slug);
  if (!item) return { title: "案例不存在 | Equivocal Legal" };
  return {
    title: `${item.title} | 经典租房诈骗案例`,
    description: item.summary,
  };
}

export default async function RentScamCaseDetailPage(props: PageProps) {
  const { slug } = props.params;
  const item = getRentScamCase(slug);
  if (!item) notFound();

  return (
    <main className="relative z-10">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6">
        <Link
          href="/rent-scam-cases"
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 motion-reduce:transition-none"
        >
          <ChevronLeft className="h-4 w-4" />
          返回案例列表
        </Link>

        <section className="mt-6">
          <div className="relative overflow-hidden rounded-3xl border bg-background/50 backdrop-blur">
            <div className="relative aspect-[16/7] w-full border-b">
              <Image
                src={item.cover.src}
                alt={item.cover.alt}
                fill
                sizes="(max-width: 768px) 100vw, 900px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={riskBadgeClassName(item.risk)}>
                  风险：{item.risk}
                </Badge>
                {item.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="bg-background/60">
                    {t}
                  </Badge>
                ))}
              </div>

              <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
                {item.title}
              </h1>
              <p className="mt-2 text-pretty text-base text-muted-foreground md:text-lg">
                {item.subtitle}
              </p>

              <Separator className="my-6" />

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-background/60 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ShieldAlert className="h-4 w-4" />
                      一句话概括
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {item.summary}
                  </CardContent>
                </Card>

                <Card className="bg-background/60 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ShieldCheck className="h-4 w-4" />
                      最关键的应对原则
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>不见面、不核验、不转账。</p>
                    <p>坚持平台流程与可追溯凭证，别被“马上就没了”带节奏。</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1 bg-background/60 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">典型话术（常见说法）</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <ul className="space-y-2">
                {item.typicalLines.map((line) => (
                  <li key={line} className="rounded-xl border bg-background/40 p-3">
                    {line}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-background/60 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TriangleAlert className="h-4 w-4" />
                红旗信号（出现任一条就要警惕）
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-3">
                {item.redFlags.map((flag) => (
                  <li key={flag} className="flex gap-3 rounded-xl border bg-background/40 p-4">
                    <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full border bg-foreground/5 p-1.5">
                      <TriangleAlert className="h-3 w-3 text-foreground" />
                    </div>
                    <div className="leading-relaxed">{flag}</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="mt-4">
          <Card className="bg-background/60 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4" />
                安全动作（建议立刻执行）
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="grid gap-3 md:grid-cols-2">
                {item.safeMoves.map((move) => (
                  <li key={move} className="rounded-xl border bg-background/40 p-4">
                    {move}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6">
          <Card className="bg-background/60 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">遇到疑似诈骗：30 秒行动清单</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ol className="list-decimal space-y-2 pl-5">
                <li>立即停止转账与屏幕共享，保留聊天记录、转账凭证、链接/二维码截图。</li>
                <li>如已转账：尽快联系银行/支付平台止付或申诉，并同步报警。</li>
                <li>通过平台 App 内的官方客服渠道核验订单与对方身份，不在私聊里处理。</li>
              </ol>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
