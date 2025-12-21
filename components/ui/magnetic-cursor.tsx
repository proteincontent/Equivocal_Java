"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

export function MagneticCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTarget, setHoverTarget] = useState<{
    width: number;
    height: number;
    x: number;
    y: number;
    borderRadius: string;
  } | null>(null);

  // 鼠标位置
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 光标位置（带弹簧物理）
  const cursorX = useSpring(mouseX, { stiffness: 500, damping: 28 });
  const cursorY = useSpring(mouseY, { stiffness: 500, damping: 28 });

  // 磁性吸附位置（更强的弹簧）
  const magneticX = useSpring(mouseX, { stiffness: 300, damping: 20 });
  const magneticY = useSpring(mouseY, { stiffness: 300, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // 自动检测可交互元素
      const target = e.target as HTMLElement;
      const clickable = target.closest("button, a, input, [role='button'], .magnetic-target");
      
      if (clickable) {
        const rect = clickable.getBoundingClientRect();
        const style = window.getComputedStyle(clickable);
        
        setIsHovering(true);
        setHoverTarget({
          width: rect.width,
          height: rect.height,
          x: rect.left,
          y: rect.top,
          borderRadius: style.borderRadius === '0px' ? '8px' : style.borderRadius
        });

        // 磁性吸附：设置目标位置为元素中心
        magneticX.set(rect.left + rect.width / 2);
        magneticY.set(rect.top + rect.height / 2);
      } else {
        setIsHovering(false);
        setHoverTarget(null);
        // 恢复自由跟随
        magneticX.set(e.clientX);
        magneticY.set(e.clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    
    // 隐藏默认光标
    document.body.style.cursor = "none";
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.style.cursor = "auto";
    };
  }, [mouseX, mouseY, magneticX, magneticY]);

  return (
    <>
      {/* 主光标 (小圆点/吸附框) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: isHovering ? hoverTarget?.x : cursorX,
          y: isHovering ? hoverTarget?.y : cursorY,
          width: isHovering ? hoverTarget?.width : 16,
          height: isHovering ? hoverTarget?.height : 16,
          borderRadius: isHovering ? hoverTarget?.borderRadius : "50%",
          backgroundColor: "white",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
      >
        {/* 悬停时的光晕效果 */}
        <AnimatePresence>
          {isHovering && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -inset-2 bg-white/20 rounded-[inherit] blur-md"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* 尾随光标 (仅在非悬停时显示) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] border border-gray-400/50 rounded-full"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isHovering ? 0 : 40,
          height: isHovering ? 0 : 40,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
      />
    </>
  );
}