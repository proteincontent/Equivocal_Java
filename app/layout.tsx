import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Equivocal MBTI Companion",
  description:
    "Bring your own OpenAI key and chat through MBTI-aligned prompts, strengths, and growth ideas inside an immersive interface.",
  keywords: [
    "MBTI chatbot",
    "OpenAI",
    "personality coaching",
    "16 personalities",
    "Equivocal",
  ],
  authors: [{ name: "Equivocal Team" }],
  creator: "Equivocal",
  publisher: "Equivocal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://equivocal.app"),
  openGraph: {
    title: "Equivocal MBTI Companion",
    description: "Bring your own OpenAI key and explore MBTI-aligned conversations.",
    url: "/",
    siteName: "Equivocal",
    images: [
      {
        url: "/placeholder-logo.png",
        width: 512,
        height: 512,
        alt: "Equivocal MBTI Companion",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Equivocal MBTI Companion",
    description: "Bring your own OpenAI key and explore MBTI-aligned conversations.",
    images: ["/placeholder-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/placeholder.svg",
    shortcut: "/placeholder.png",
    apple: "/placeholder.png",
  },
  manifest: "/site.webmanifest",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}

