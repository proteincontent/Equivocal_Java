"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ParallaxTiltProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number; // 倾斜强度，默认 15
}

export function ParallaxTilt({ children, className = "", intensity = 15 }: ParallaxTiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 使用弹簧物理让倾斜更平滑
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-intensity, intensity]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;

    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative transform-gpu perspective-1000 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
    >
      {/* 内部容器，用于抵消父级的 perspective，确保内容清晰 */}
      <div className="relative w-full h-full" style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
      
      {/* 光泽层 (Gloss) - 随倾斜角度移动 */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br from-white/50 to-transparent rounded-[inherit] z-20"
        style={{
          x: useTransform(mouseX, [-0.5, 0.5], ["-10%", "10%"]),
          y: useTransform(mouseY, [-0.5, 0.5], ["-10%", "10%"]),
        }}
      />
    </motion.div>
  );
}