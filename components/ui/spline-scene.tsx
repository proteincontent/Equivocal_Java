"use client";

import { Suspense, lazy } from "react";
const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineSceneProps {
  scene: string;
  className?: string;
}

function SplineSkeletonLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-background to-muted/20 rounded-lg animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary/10 animate-ping" />
        </div>
        <div className="text-sm text-muted-foreground font-medium">Loading 3D Experience...</div>
      </div>
    </div>
  );
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense fallback={<SplineSkeletonLoader />}>
      <Spline scene={scene} className={className} />
    </Suspense>
  );
}
