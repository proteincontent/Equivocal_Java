"use client"; // Client-side only component

import { Suspense, lazy, useRef, useEffect } from "react";
import { Application, type SPEObject } from "@splinetool/runtime";

// lazy: defer loading until needed for render
// Suspense: placeholder UI while lazy component loads
const Spline = lazy(() => import("@splinetool/react-spline"));

const POINTER_OFFSET_FALLBACK = 8;
const HEAD_MAX_ROTATION = Math.PI / 18;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

interface SplineSceneProps {
  scene: string;
  className?: string;
  eyePosition?: { x: number; y: number };
  maxPointerOffset?: number;
}
// Props for SplineScene component

export function SplineScene({ scene, className, eyePosition, maxPointerOffset }: SplineSceneProps) {
  const spline = useRef<Application>();
  const headRef = useRef<SPEObject | null>(null);
  const defaultHeadRotation = useRef<{ x: number; y: number; z: number } | null>(null);

  function onLoad(splineApp: Application) {
    spline.current = splineApp;

    const headCandidates = ["Head", "Head 2", "HeadEmpty"];
    const foundHead =
      headCandidates
        .map((name) => splineApp.findObjectByName(name))
        .find((object): object is SPEObject => Boolean(object)) ?? null;

    headRef.current = foundHead;

    if (foundHead && !defaultHeadRotation.current) {
      defaultHeadRotation.current = {
        x: foundHead.rotation.x,
        y: foundHead.rotation.y,
        z: foundHead.rotation.z,
      };
    }

    if (!foundHead) {
      console.warn("[SplineScene] Unable to find a head object in the Spline scene.");
    }
  }

  const pointerX = eyePosition?.x ?? 0;
  const pointerY = eyePosition?.y ?? 0;
  const hasPointer = eyePosition !== undefined;

  useEffect(() => {
    const splineInstance = spline.current;
    const head = headRef.current;

    if (!splineInstance || !head) {
      return;
    }

    if (!hasPointer) {
      if (defaultHeadRotation.current) {
        head.rotation.x = defaultHeadRotation.current.x;
        head.rotation.y = defaultHeadRotation.current.y;
        head.rotation.z = defaultHeadRotation.current.z;
        splineInstance.requestRender();
      }
      return;
    }

    const limit = Math.max(maxPointerOffset ?? POINTER_OFFSET_FALLBACK, 1);
    const normalizedX = clamp(pointerX / limit, -1, 1);
    const normalizedY = clamp(pointerY / limit, -1, 1);

    head.rotation.y = normalizedX * HEAD_MAX_ROTATION;
    head.rotation.x = normalizedY * HEAD_MAX_ROTATION * 0.7;

    splineInstance.requestRender();
  }, [hasPointer, pointerX, pointerY, maxPointerOffset]);

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <Spline scene={scene} className={className} onLoad={onLoad} />
    </Suspense>
  );
}

export function SplineSceneBasic() {
  return (
    <div className="w-full h-[500px] bg-black/[0.96] relative overflow-hidden rounded-lg">
      <div className="flex h-full">
        {/* Left content */}
        <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            Interactive 3D
          </h1>
          <p className="mt-4 text-neutral-300 max-w-lg">
            Bring your UI to life with beautiful 3D scenes. Create immersive experiences that
            capture attention and enhance your design.
          </p>
        </div>

        {/* Right content */}
        <div className="flex-1 relative">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
