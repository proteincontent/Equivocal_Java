"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
        setDynamicOffset(6);
        setDynamicScale(0.03);
        setCardSize({ height: "11rem", width: "9.5rem" });
      } else if (window.innerWidth < 1024) {
        setDynamicOffset(8);
        setDynamicScale(0.04);
        setCardSize({ height: "13rem", width: "11rem" });
      } else {
        setDynamicOffset(10);
        setDynamicScale(0.05);
        setCardSize({ height: "15rem", width: "12.5rem" });
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
          className="absolute bg-white dark:bg-neutral-900 rounded-2xl p-4 md:p-5 shadow-2xl border border-neutral-200 dark:border-white/[0.08] flex flex-col justify-between text-left overflow-hidden cursor-pointer"
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
          <div className="space-y-2">
            <div className="font-bold text-base md:text-lg text-neutral-800 dark:text-neutral-100 leading-tight">
              {card.name}
            </div>
            <div className="text-neutral-600 dark:text-neutral-300 text-[11px] sm:text-xs leading-relaxed line-clamp-3">
              {card.content}
            </div>

            {/* Image Section */}
            <div className="mt-1">
              <img
                src={card.image}
                alt={card.name}
                className="w-full h-16 sm:h-20 md:h-24 rounded-lg border border-neutral-200 dark:border-neutral-800 object-cover shadow-md"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 mt-2">
            <p className="text-neutral-700 dark:text-white font-medium text-[10px] sm:text-xs">
              {card.designation}
            </p>
          </div>
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
      name: "AI-Powered Automation",
      designation: "Efficiency through Intelligence",
      content: (
        <p>
          We design intelligent systems that streamline workflows, reduce
          overhead, and enable you to scale without friction. Our automation
          modules integrate seamlessly across{" "}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            multiple platforms and APIs
          </span>
          , ensuring precision and reliability.
        </p>
      ),
      image:
        "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/dashboard-gradient.png",
    },
    {
      id: 1,
      name: "Modern Design Systems",
      designation: "Built for Flexibility and Speed",
      content: (
        <p>
          From concept to code, our design systems empower product teams to move
          faster. We build reusable components, maintain visual consistency, and
          support{" "}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            theme-aware UI kits
          </span>{" "}
          that adapt dynamically to dark and light modes.
        </p>
      ),
      image:
        "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/crm-featured.png",
    },
    {
      id: 2,
      name: "Cloud & Edge Deployment",
      designation: "Reliable Infrastructure at Scale",
      content: (
        <p>
          Our deployments leverage the latest in container orchestration and
          edge computing. Whether you’re hosting on{" "}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            AWS, GCP, or on-prem
          </span>
          , our pipelines ensure performance, monitoring, and fault tolerance.
        </p>
      ),
      image:
        "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/featured-06.png",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-white dark:bg-black text-black dark:text-white py-16 sm:py-20 md:py-24">
      <div className="max-w-5xl mx-auto text-left px-4 sm:px-6">
        <div className="inline-block mb-4 border border-neutral-300 dark:border-neutral-700 rounded-full px-3 py-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Your building and design partner
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">
          We build technology that moves your vision forward
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mb-8">
          Empowering startups and teams to turn ambitious ideas into stunning
          products — fast, scalable, and beautifully engineered.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 sm:mb-20">
          <button className="rounded-full bg-black dark:bg-white text-white dark:text-black px-6 py-3 text-sm font-medium hover:opacity-80 transition">
            Explore Components
          </button>
          <button className="rounded-full border border-neutral-400 dark:border-neutral-600 px-6 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
            Get Started
          </button>
        </div>
      </div>

      {/* Background Image */}
      <div className="relative flex justify-center max-w-5xl mx-auto px-4 sm:px-6">
        <img
          src="https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/abstract-glass-walls.jpg"
          alt="Background"
          className="rounded-2xl shadow-xl w-full object-cover border-8 border-neutral-200 dark:border-neutral-800"
        />

        {/* Anchored Card Stack */}
        <div className="absolute -bottom-36 sm:-bottom-16 md:-bottom-9 flex justify-center w-full">
          <CardSlide items={CARDS} />
        </div>
      </div>
    </section>
  );
}