"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type HeroCard = {
  id: number;
  name: string;
  designation: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
  onClick?: () => void;
};

interface HeroCardStackProps {
  items: HeroCard[];
  offset?: number;
  scaleFactor?: number;
  intervalDuration?: number;
}

export const HeroCardStack = ({
  items,
  offset = 22,
  scaleFactor = 0.06,
  intervalDuration = 5000,
}: HeroCardStackProps) => {
  const [cards, setCards] = useState<HeroCard[]>(items);
  const [dynamicOffset, setDynamicOffset] = useState(offset);
  const [dynamicScale, setDynamicScale] = useState(scaleFactor);
  const [cardSize, setCardSize] = useState({ height: "420px", width: "320px" });

  // Responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setDynamicOffset(10);
        setDynamicScale(0.04);
        setCardSize({ height: "380px", width: "280px" });
      } else if (window.innerWidth < 1024) {
        setDynamicOffset(14);
        setDynamicScale(0.05);
        setCardSize({ height: "400px", width: "300px" });
      } else {
        setDynamicOffset(offset);
        setDynamicScale(scaleFactor);
        setCardSize({ height: "420px", width: "340px" });
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
        // Move the last card to the front (or first to back, depending on desired effect)
        // The original code did: arr.unshift(arr.pop()!) -> Last becomes First
        // Let's keep that logic so the bottom card comes to top
        const last = arr.pop();
        if (last) {
          arr.unshift(last);
        }
        return arr;
      });
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [intervalDuration]);

  // Manual rotation on click (optional, but good for UX)
  const rotateCards = () => {
    setCards((prev) => {
      const arr = [...prev];
      const last = arr.pop();
      if (last) {
        arr.unshift(last);
      }
      return arr;
    });
  };

  return (
    <div
      className="relative flex justify-center perspective-1000"
      style={{
        height: `calc(${cardSize.height} + ${cards.length * dynamicOffset}px)`,
        width: cardSize.width,
      }}
    >
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          onClick={() => {
            if (index === 0 && card.onClick) {
              card.onClick();
            } else {
              rotateCards();
            }
          }}
          className={cn(
            "absolute bg-white dark:bg-[#1A1A1A] rounded-xl p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-white/5 flex flex-col justify-between text-left overflow-hidden cursor-pointer hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] transition-shadow duration-500",
            index === 0 ? "z-50" : "z-auto"
          )}
          style={{
            transformOrigin: "top center",
            height: cardSize.height,
            width: cardSize.width,
          }}
          animate={{
            top: index * -dynamicOffset,
            scale: 1 - index * dynamicScale,
            zIndex: cards.length - index,
            opacity: index > 2 ? 0 : 1 - index * 0.1, // Fade out cards deep in stack
          }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        >
          {/* Content Container */}
          <div className="flex flex-col h-full">
            {/* Header with Icon */}
            <div className="flex flex-col gap-6 mb-6">
              <div className="flex justify-between items-start">
                 <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center border",
                    card.color === 'blue' && "bg-blue-50/50 border-blue-100 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500/20 dark:text-blue-400",
                    card.color === 'amber' && "bg-amber-50/50 border-amber-100 text-amber-600 dark:bg-amber-900/20 dark:border-amber-500/20 dark:text-amber-400",
                    card.color === 'indigo' && "bg-indigo-50/50 border-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-500/20 dark:text-indigo-400",
                    !card.color && "bg-slate-50 border-slate-100 text-slate-600"
                  )}
                >
                  {card.icon}
                </div>
                <div className="text-[10px] font-mono text-slate-300 dark:text-slate-600">
                   ID_0{card.id}
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {card.designation}
                </p>
                <h3 className="font-black text-3xl text-slate-900 dark:text-white leading-none tracking-tight">
                  {card.name}
                </h3>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 mt-4">
               {card.content}
            </div>

            {/* Footer / Action hint */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 group/btn">
                 <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider group-hover/btn:underline decoration-2 underline-offset-4 decoration-slate-900 dark:decoration-white transition-all">
                    {index === 0 ? "Execute Protocol" : "Standby"}
                 </span>
                 {index === 0 && (
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                 )}
              </div>
              
              <div className="flex gap-1 opacity-20">
                 {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-[2px] h-3 bg-slate-900 dark:bg-white skew-x-[-20deg]" />
                 ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};