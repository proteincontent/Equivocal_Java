"use client";

import {
  useState,
  useEffect,
  useRef,
} from "react"; /* Hook就是一些以use开头的函数，让你“钩入”React的内部机制 */
import { motion } from "framer-motion";
import { SplineScene } from "./spline-enhanced";
import { cn } from "@/lib/utils";

const POINTER_OFFSET = 8;

interface InteractiveRobotProps {
  className?: string;
  onInteraction?: () => void;
}

export function InteractiveRobot({ className, onInteraction }: InteractiveRobotProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for robot eyes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = document.querySelector(".robot-container")?.getBoundingClientRect();
      if (rect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const maxDistance = POINTER_OFFSET;

        const deltaX = ((e.clientX - centerX) / rect.width) * maxDistance;
        const deltaY = ((e.clientY - centerY) / rect.height) * maxDistance;

        setEyePosition({
          x: Math.max(-maxDistance, Math.min(maxDistance, deltaX)),
          y: Math.max(-maxDistance, Math.min(maxDistance, deltaY)),
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const handleClick = () => {
    if (onInteraction) {
      onInteraction();
    }
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const maxDistance = POINTER_OFFSET;

      const deltaX = ((e.clientX - centerX) / rect.width) * maxDistance;
      const deltaY = ((e.clientY - centerY) / rect.height) * maxDistance;

      setEyePosition({
        x: Math.max(-maxDistance, Math.min(maxDistance, deltaX)),
        y: Math.max(-maxDistance, Math.min(maxDistance, deltaY)),
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("robot-container relative cursor-pointer", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="交互式机器人助手 - 点击或悬停以互动"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      {/* Spline 3D Robot Scene */}
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] -my-12">
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full"
          eyePosition={eyePosition}
          maxPointerOffset={POINTER_OFFSET}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/60 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      {/* Glow effect - Shopify Style Magenta/Purple */}
      <motion.div
        className="absolute inset-0 rounded-full -z-10"
        style={{
          background:
            "radial-gradient(circle at center, rgba(192, 38, 211, 0.25) 0%, rgba(147, 51, 234, 0.1) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          opacity: isHovered ? 1 : 0.6,
          scale: isHovered ? 1.1 : 0.95,
        }}
        transition={{ duration: 0.8 }}
      />
    </div>
  );
}
