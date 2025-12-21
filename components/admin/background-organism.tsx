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
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    // 柔和的有机配色 (Peach, Lavender, Mint, Soft Blue)
    const colors = [
      { r: 255, g: 218, b: 193 }, // Peach
      { r: 230, g: 230, b: 250 }, // Lavender
      { r: 209, g: 250, b: 229 }, // Mint
      { r: 191, g: 219, b: 254 }, // Soft Blue
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

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 200 + 150; // 巨大的斑点
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.002 + 0.001;
      }

      update() {
        this.angle += this.speed;
        this.x += Math.cos(this.angle) * 0.5;
        this.y += Math.sin(this.angle) * 0.5;

        // 边界反弹
        if (this.x < -this.size) this.x = canvas!.width + this.size;
        if (this.x > canvas!.width + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = canvas!.height + this.size;
        if (this.y > canvas!.height + this.size) this.y = -this.size;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.size
        );
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.6)`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const blobs: Blob[] = Array.from({ length: 6 }, () => new Blob());

    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 纯白背景
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 混合模式创造"粘性"效果
      ctx.globalCompositeOperation = "multiply"; // 或者 'screen' for dark mode

      blobs.forEach(blob => {
        blob.update();
        blob.draw(ctx);
      });

      // 噪点纹理，增加质感
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 10;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
        data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
      }
      ctx.putImageData(imageData, 0, 0);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
    />
  );
}