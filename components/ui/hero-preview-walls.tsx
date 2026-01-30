"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export type Card = {
  id: number;
  name: string;
  designation: string;
  content: React.ReactNode;
  image: string;
  onClick?: () => void;
};

// ---------------------------
// CardSlide Component
// ---------------------------
export const CardSlide = ({
  items,
  offset = 22,
  scaleFactor = 0.06,
  intervalDuration = 5000,
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
  intervalDuration?: number;
}) => {
  const [cards, setCards] = useState<Card[]>(items);
  const [dynamicOffset, setDynamicOffset] = useState(offset);
  const [dynamicScale, setDynamicScale] = useState(scaleFactor);
  const [cardSize, setCardSize] = useState({ height: "18rem", width: "15rem" });

  // Responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setDynamicOffset(10);
        setDynamicScale(0.05);
        setCardSize({ height: "16rem", width: "13rem" }); // 移动端加大
      } else if (window.innerWidth < 1024) {
        setDynamicOffset(12);
        setDynamicScale(0.06);
        setCardSize({ height: "20rem", width: "16rem" }); // 平板端加大
      } else {
        setDynamicOffset(15);
        setDynamicScale(0.06);
        setCardSize({ height: "24rem", width: "20rem" }); // 桌面端大幅加大：从 12.5rem -> 20rem
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [offset, scaleFactor]);

  // Auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCards((prev) => {
        const arr = [...prev];
        const last = arr.pop();
        if (last) {
          arr.unshift(last);
        }
        return arr;
      });
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [intervalDuration]);

  const handleCardClick = (index: number, card: Card) => {
    if (index === 0 && card.onClick) {
      card.onClick();
    } else {
      setCards((prev) => {
        const arr = [...prev];
        const last = arr.pop();
        if (last) arr.unshift(last);
        return arr;
      });
    }
  };

  return (
    <div
      className="relative flex justify-center"
      style={{
        height: `calc(${cardSize.height} + ${cards.length * dynamicOffset}px)`,
        width: cardSize.width,
      }}
    >
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          onClick={() => handleCardClick(index, card)}
          className="absolute bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 dark:border-white/10 flex flex-col justify-between text-left overflow-hidden cursor-pointer transition-all duration-300 group hover:shadow-[0_20px_40px_rgb(0,0,0,0.2)]"
          style={{
            transformOrigin: "top center",
            height: cardSize.height,
            width: cardSize.width,
          }}
          animate={{
            top: index * -dynamicOffset,
            scale: 1 - index * dynamicScale,
            zIndex: cards.length - index,
          }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        >
          <div className="space-y-3 relative z-10">
            <div className="font-bold text-lg md:text-xl text-neutral-900 dark:text-neutral-50 leading-tight tracking-tight">
              {card.name}
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed line-clamp-3 font-medium">
              {card.content}
            </div>

            {/* Image Section */}
            <div className="mt-2 relative h-20 sm:h-24 md:h-28 overflow-hidden rounded-lg">
              <div className="absolute inset-0 bg-gradient-to-t from-[#2563EB]/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Image
                src={card.image}
                alt={card.name}
                fill
                sizes="(max-width: 640px) 90vw, 420px"
                className="rounded-lg border border-neutral-200/50 dark:border-neutral-700/50 object-cover shadow-sm transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60 mt-3 flex items-center justify-between">
            <p className="text-neutral-800 dark:text-neutral-200 font-semibold text-[10px] sm:text-xs uppercase tracking-wider">
              {card.designation}
            </p>
            <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
          </div>

          {/* Subtle noise texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply dark:mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

// ---------------------------
// HeroPreviewWalls Component
// ---------------------------
export function HeroPreviewWalls() {
  const CARDS = [
    {
      id: 0,
      name: "AI 自动化",
      designation: "以智能提升效率",
      content: (
        <p>
          我们设计智能系统来优化工作流、降低管理成本，并帮助业务平滑扩展。我们的自动化模块可无缝集成于{" "}
          <span className="font-semibold text-[#2563EB] dark:text-[#3B82F6]">多平台与 API</span>
          ，确保精度与可靠性。
        </p>
      ),
      image: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/dashboard-gradient.png",
    },
    {
      id: 1,
      name: "现代化设计系统",
      designation: "为灵活与速度而生",
      content: (
        <p>
          从概念到落地，我们的设计系统帮助产品团队更快推进。我们构建可复用组件、保持视觉一致性，并提供{" "}
          <span className="font-semibold text-[#2563EB] dark:text-[#3B82F6]">
            支持主题切换的 UI 组件库
          </span>{" "}
          ，可在深色与浅色模式间动态适配。
        </p>
      ),
      image: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/crm-featured.png",
    },
    {
      id: 2,
      name: "云端与边缘部署",
      designation: "可规模化的可靠基础设施",
      content: (
        <p>
          我们的部署方案结合最新的容器编排与边缘计算能力。无论您选择{" "}
          <span className="font-semibold text-[#2563EB] dark:text-[#3B82F6]">
            AWS、GCP 或本地部署
          </span>
          ，我们的流水线都能保障性能、监控与容错能力。
        </p>
      ),
      image: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/featured-06.png",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-white dark:bg-black text-black dark:text-white py-16 sm:py-20 md:py-24">
      <div className="max-w-5xl mx-auto text-left px-4 sm:px-6">
        <div className="inline-block mb-4 border border-neutral-300 dark:border-neutral-700 rounded-full px-3 py-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          您的建设与设计伙伴
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">
          我们打造推动愿景前行的技术
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mb-8">
          助力创业团队与组织将宏大想法快速落地为惊艳产品：更快、更可扩展，并且精工打造。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 sm:mb-20">
          <button className="rounded-full bg-black dark:bg-white text-white dark:text-black px-6 py-3 text-sm font-medium hover:opacity-80 transition">
            浏览组件
          </button>
          <button className="rounded-full border border-neutral-400 dark:border-neutral-600 px-6 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
            开始使用
          </button>
        </div>
      </div>

      {/* Background Image */}
      <div className="relative flex justify-center max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative w-full aspect-[16/9]">
          <Image
            src="https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/abstract-glass-walls.jpg"
            alt="背景"
            fill
            sizes="(max-width: 1024px) 100vw, 900px"
            className="rounded-2xl shadow-xl object-cover border-8 border-neutral-200 dark:border-neutral-800"
          />
        </div>

        {/* Anchored Card Stack */}
        <div className="absolute -bottom-36 sm:-bottom-16 md:-bottom-9 flex justify-center w-full">
          <CardSlide items={CARDS} />
        </div>
      </div>
    </section>
  );
}
