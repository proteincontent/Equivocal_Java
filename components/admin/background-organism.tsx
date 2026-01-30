"use client";

import { useEffect, useRef } from "react";

export function BackgroundOrganism() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      // Set to actual display size for sharpness on high DPI screens
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    window.addEventListener("resize", resize);
    resize();

    // 完美复刻参考图的配色方案 (Peach, Purple, Mint)
    // 这种配色不仅是颜色，更是一种情绪：温暖、神秘与清新的平衡
    const colors = [
      { r: 255, g: 225, b: 210 }, // Peach/Warm Nude - 左侧主调
      { r: 240, g: 225, b: 255 }, // Soft Lavender - 中间过渡
      { r: 210, g: 255, b: 235 }, // Mint Green - 右侧清新
    ];

    class Blob {
      x: number;
      y: number;
      size: number;
      color: { r: number; g: number; b: number };
      vx: number;
      vy: number;
      angle: number;
      speed: number;
      isFixed: boolean;
      initialX: number;
      initialY: number;

      constructor(fixedPosition?: {
        x: number;
        y: number;
        color: { r: number; g: number; b: number };
        size: number;
      }) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        if (fixedPosition) {
          this.x = fixedPosition.x;
          this.y = fixedPosition.y;
          this.initialX = fixedPosition.x;
          this.initialY = fixedPosition.y;
          this.size = fixedPosition.size;
          this.color = fixedPosition.color;
          this.isFixed = true;
          this.vx = 0;
          this.vy = 0;
          this.angle = Math.random() * Math.PI * 2;
          this.speed = 0.002; // 极慢的呼吸感
        } else {
          // 随机漂浮的粒子，作为点缀
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.initialX = this.x;
          this.initialY = this.y;
          this.size = Math.random() * 100 + 50;
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.isFixed = false;
          this.vx = (Math.random() - 0.5) * 0.2;
          this.vy = (Math.random() - 0.5) * 0.2;
          this.angle = Math.random() * Math.PI * 2;
          this.speed = Math.random() * 0.005 + 0.002;
        }
      }

      update() {
        this.angle += this.speed;

        if (this.isFixed) {
          // 固定光晕做"呼吸"运动，范围更小更细腻
          // 使用正弦波创造自然的律动
          this.x = this.initialX + Math.cos(this.angle) * 30;
          this.y = this.initialY + Math.sin(this.angle * 0.8) * 30;
        } else {
          // 自由粒子
          this.x += Math.cos(this.angle) * 0.5;
          this.y += Math.sin(this.angle) * 0.5;

          const width = window.innerWidth;
          const height = window.innerHeight;

          // 柔和的边界反弹
          if (this.x < -this.size) this.x = width + this.size;
          if (this.x > width + this.size) this.x = -this.size;
          if (this.y < -this.size) this.y = height + this.size;
          if (this.y > height + this.size) this.y = -this.size;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        // 径向渐变创造柔和的边缘
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);

        // 核心不透明度降低，边缘完全透明，创造"光雾"而非"球体"
        // 调整：降低整体不透明度，让背景更像"空气"而不是"墙纸"
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.35)`);
        gradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.15)`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

        ctx.fillStyle = gradient;
        // 使用 lighter 混合模式让重叠部分更亮，像光一样
        // 注意：在白色背景上，multiply 或 normal 更合适，但在这种极淡的色彩下，normal 最好控制
        ctx.globalCompositeOperation = "source-over";
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 重新布局：严格对齐参考图的视觉重心
    const fixedBlobs: Blob[] = [
      // 1. 左上：温暖的桃色/橙色 (Peach)
      // 占据左上角大片区域，给页面定下温暖基调
      new Blob({
        x: width * 0.2,
        y: height * 0.2,
        color: { r: 255, g: 230, b: 210 },
        size: Math.min(width, height) * 0.8, // 巨大
      }),

      // 2. 中上：神秘的淡紫色 (Purple)
      // 连接左右，增加层次感
      new Blob({
        x: width * 0.5,
        y: height * 0.15,
        color: { r: 240, g: 220, b: 255 },
        size: Math.min(width, height) * 0.7,
      }),

      // 3. 右侧：清新的薄荷绿 (Mint)
      // 调整：向右推移并缩小，减少对底部内容的视觉干扰，颜色更偏冷白
      new Blob({
        x: width * 0.95,
        y: height * 0.3,
        color: { r: 225, g: 255, b: 245 },
        size: Math.min(width, height) * 0.65,
      }),
    ];

    // 少量随机粒子增加空气感
    const randomBlobs: Blob[] = Array.from({ length: 3 }, () => new Blob());

    const blobs: Blob[] = [...fixedBlobs, ...randomBlobs];

    const animate = () => {
      // 使用逻辑分辨率清除
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // 纯白底色
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      blobs.forEach((blob) => {
        blob.update();
        blob.draw(ctx);
      });

      // 移除 CPU 密集的噪点循环
      // 如果需要质感，建议在 CSS 层使用 background-image: url(noise.png) overlay

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
        style={{ filter: "blur(60px)" }} // CSS 模糊让融合更完美
      />
      {/* 噪点层 - 使用 CSS 实现，性能更好 */}
      <div
        className="fixed inset-0 w-full h-full -z-10 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
}
