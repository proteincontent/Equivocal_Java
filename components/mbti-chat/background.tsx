"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { MBTIType } from "@/data/mbti";

interface MBTIBackgroundProps {
  selectedType: MBTIType | null;
  backgroundClass: string | null;
}

export function MBTIBackground({ selectedType, backgroundClass }: MBTIBackgroundProps) {
  return (
    <AnimatePresence mode="wait">
      {selectedType && backgroundClass ? (
        <motion.div
          key={`${selectedType}-${backgroundClass}`}
          className={`absolute inset-0 bg-gradient-to-br ${backgroundClass} opacity-50 dark:opacity-60`}
          initial={{ opacity: 0 }}
          animate={{ opacity: selectedType ? 0.5 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      ) : (
        <motion.div
          key="default-bg"
          className="absolute inset-0 bg-white dark:bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </AnimatePresence>
  );
}
