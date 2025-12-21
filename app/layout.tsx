import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Equivocal Legal - 法律 AI 助手",
  description: "基于 AI 的智能法律服务助手",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 grid-bg" />
            {/* Geometric Arcs - Shopify Style */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 Q 50 -50 100 100" fill="none" stroke="currentColor" strokeWidth="0.2" />
              <circle cx="0" cy="0" r="45" fill="none" stroke="currentColor" strokeWidth="0.2" />
              <circle cx="100" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.2" />
            </svg>
          </div>
          <div className="noise-bg" />
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

