"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float } from "@react-three/drei";
import { useRef, useState } from "react";
import * as random from "maath/random/dist/maath-random.esm";
import { useTheme } from "next-themes";
import * as THREE from "three";

function Stars(props: any) {
  const ref = useRef<THREE.Points>(null);
  const [sphere] = useState(() => random.inSphere(new Float32Array(5001), { radius: 1.5 }));

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#888888"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

export function Background3D() {
  const { theme } = useTheme();

  // 根据主题调整背景色
  const bgColor = theme === "dark" ? "#000000" : "#f0f0f0";
  const fogColor = theme === "dark" ? "#000000" : "#f0f0f0";

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[fogColor, 1, 3]} />

        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Stars />
        </Float>

        {/* 环境光 */}
        <ambientLight intensity={0.5} />
      </Canvas>

      {/* 渐变遮罩，让底部更自然地融入 */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80 pointer-events-none" />
    </div>
  );
}
