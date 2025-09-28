"use client";

import { motion } from "framer-motion";
import type { MBTIType } from "@/data/mbti";

interface SelectedBadgeProps {
  selectedType: MBTIType | null;
}

export function SelectedBadge({ selectedType }: SelectedBadgeProps) {
  if (!selectedType) {
    return null;
  }

  return (
    <motion.div
      className="fixed bottom-4 left-4 z-40"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-lg border border-border/50 bg-background/80 px-3 py-2 text-foreground shadow-md backdrop-blur-xl dark:border-border/20 dark:bg-background/10">
        <p className="text-xs text-muted-foreground">Personality Type</p>
        <p className="text-sm font-medium">{selectedType}</p>
      </div>
    </motion.div>
  );
}
