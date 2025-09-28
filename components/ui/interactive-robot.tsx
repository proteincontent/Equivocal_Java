"use client";

import { useState, useEffect, useRef } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
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
      aria-label="Interactive robot assistant - click or hover to interact"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      {/* Spline 3D Robot Scene */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden bg-[rgb(250,250,252)] dark:bg-slate-900/60 border border-black/5 dark:border-white/10">
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full"
          eyePosition={eyePosition}
          maxPointerOffset={POINTER_OFFSET}
        />

        {/* Interactive overlay effects */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-purple-500/10 pointer-events-none"
            />
          )}
        </AnimatePresence>

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

        {/* Interactive prompt */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <motion.div
            className={cn(
              "px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-700/50 text-slate-100 text-sm font-medium shadow-lg",
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0.8, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.3 }}
            role="status"
            aria-live="polite"
          >
            {isHovered ? "Click to interact!" : "Hover to activate"}
          </motion.div>
        </div>
      </div>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background:
            "radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
        animate={{
          opacity: isHovered ? 0.8 : 0.3,
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}
