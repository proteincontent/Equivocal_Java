"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

// 使用 Next.js 的 dynamic import 替代 React.lazy，以获得更好的 SSR/Hydration 支持
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => <SplineSkeletonLoader />,
});

interface SplineSceneProps {
  scene: string;
  className?: string;
}

function SplineSkeletonLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-slate-400 animate-spin" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-slate-200/50 animate-ping" />
        </div>
        <div className="text-sm text-slate-400 font-medium tracking-widest uppercase">Loading 3D Experience</div>
      </div>
    </div>
  );
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <div className={className}>
      <Suspense fallback={<SplineSkeletonLoader />}>
        <Spline scene={scene} />
      </Suspense>
    </div>
  );
}