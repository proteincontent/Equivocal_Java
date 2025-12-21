"use client";

import { SplineScene } from "@/components/ui/spline-scene";
import { Card } from "@/components/ui/card";
import { SpotlightInteractive } from "@/components/ui/spotlight-interactive";
import { Theme } from "@/components/ui/theme";
import { LegalServiceSelector } from "@/components/ui/legal-service-selector";

export function SplineSceneBasic() {
  const handleServiceSelect = (type: string) => {
    console.log("[v0] Selected legal service type:", type);
  };

  return (
    <Card className="w-full h-[500px] bg-card border-border relative overflow-hidden">
      <SpotlightInteractive
        className="z-10"
        size={300}
        springOptions={{ stiffness: 100, damping: 20, mass: 0.2 }}
      />

      <div className="absolute top-4 right-4 z-30">
        <Theme
          variant="button"
          size="md"
          themes={["light", "dark", "system"]}
          className="bg-background/80 backdrop-blur-sm border-border hover:bg-accent text-foreground shadow-lg"
        />
      </div>

      <div className="flex h-full">
        {/* Left content */}
        <div className="flex-1 p-8 relative z-20 flex flex-col justify-center">
          <LegalServiceSelector onSelect={handleServiceSelect} />
          <p className="mt-4 text-muted-foreground max-w-lg">
            Bring your UI to life with beautiful 3D scenes. Create immersive experiences that
            capture attention and enhance your design.
          </p>
        </div>

        {/* Right content */}
        <div className="flex-1 relative z-20">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  );
}
