"use client";

import { motion } from "framer-motion";
import { MBTISelector } from "@/components/ui/mbti-selector";
import { InteractiveRobot } from "@/components/ui/interactive-robot";
import type { MBTIType } from "@/data/mbti";

interface IntroScreenProps {
  showSelector: boolean;
  onToggleSelector: (_open: boolean) => void;
  onConfirm: (_type: MBTIType) => void;
  selectedType: MBTIType | null;
}

export function IntroScreen({ showSelector, onToggleSelector, onConfirm, selectedType }: IntroScreenProps) {
  return (
    <motion.div
      key="mbti-selector"
      className="min-h-screen flex flex-col items-center justify-center p-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="mb-4 text-2xl font-light text-foreground drop-shadow-sm md:text-3xl">
            Discover your personality type
          </h1>
          <p className="text-muted-foreground drop-shadow-sm">
            Choose your MBTI type to get started
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
          <div className="text-center space-y-6">
            <h2 className="text-4xl font-bold text-foreground md:text-5xl">Equivocal</h2>

            {!showSelector ? (
              <motion.button
                onClick={() => onToggleSelector(true)}
                className="rounded-lg border border-primary bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm transition-all duration-300 hover:scale-105 hover:bg-primary/90"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Open MBTI personality type selector"
              >
                Choose your MBTI
              </motion.button>
            ) : (
              <MBTISelector onConfirm={onConfirm} onCancel={() => onToggleSelector(false)} />
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mx-auto w-full max-w-3xl"
              role="region"
              aria-label="Interactive robot assistant"
            >
              <InteractiveRobot className="cursor-pointer" />
              <motion.p
                className="mt-4 text-center text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 1.2 }}
              >
                Meet your AI personality guide
              </motion.p>
            </motion.div>
          </div>
        </motion.div>

        {selectedType && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="rounded-lg border border-border/30 bg-background/80 px-4 py-2 text-foreground shadow-sm backdrop-blur-sm dark:bg-background/20">
              <p className="text-lg font-medium">Selected: {selectedType}</p>
              <p className="mt-2 text-sm text-muted-foreground">Preparing your personalized experience...</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

