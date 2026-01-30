import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ShieldAlert } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { RentScamCasesGallery } from "@/components/rent-scam-cases/rent-scam-cases-gallery";

export const metadata: Metadata = {
  title: "经典租房诈骗案例 | Equivocal Legal",
  description: "用图片 + 链接的方式，快速浏览常见租房诈骗套路与防范要点。",
};

export default function RentScamCasesPage() {
  return (
    <main className="relative z-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 motion-reduce:transition-none"
          >
            <ChevronLeft className="h-4 w-4" />
            返回首页
          </Link>
        </div>

        <section className="mt-8">
          <div className="flex items-start gap-4">
            <div className="mt-1 hidden sm:block">
              <div className="rounded-2xl border bg-background/40 p-3 shadow-sm backdrop-blur">
                <ShieldAlert className="h-5 w-5 text-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
                经典租房诈骗案例库
              </h1>
              <p className="mt-3 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
                参考“豆包”卡片流的呈现方式：每个案例一张图 +
                一条链接，点进去看「典型话术、红旗信号、应对动作」。
              </p>
            </div>
          </div>

          <Card className="mt-6 bg-background/60 backdrop-blur">
            <CardContent className="pt-6">
              <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3 md:gap-4">
                <p>
                  本页内容用于安全教育与风险提示，不构成法律意见；如遇资金风险请优先止付并报警。
                </p>
                <p>任何情况下，未核验身份与房屋权属/授权前，不要支付定金、押金或“服务费”。</p>
                <p>链接默认跳转站内详情页，适合做演示/教学；如需指向外部权威来源可再补一列链接。</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10">
          <RentScamCasesGallery />
        </section>
      </div>
    </main>
  );
}
