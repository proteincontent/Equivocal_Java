"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";
import { Theme } from "@/components/ui/theme";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "@/components/ui/settings";
import type { MBTIType } from "@/data/mbti";

interface MBTIChatToolbarProps {
  selectedType: MBTIType | null;
  onBack: () => void;
  settingsOpen: boolean;
  onSettingsOpenChange: (_open: boolean) => void;
}

export function MBTIChatToolbar({
  selectedType,
  onBack,
  settingsOpen,
  onSettingsOpenChange,
}: MBTIChatToolbarProps) {
  return (
    <div className="absolute inset-x-0 top-4 z-50 flex items-center justify-between px-4 sm:px-6">
      <div>
        {selectedType && (
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-xl bg-background/80 dark:bg-background/10 border border-border/50 dark:border-border/20 text-foreground shadow-md hover:bg-background/90 dark:hover:bg-background/20 transition-all duration-300 hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            aria-label="Return to home page"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden text-sm font-medium sm:inline">Home</span>
          </motion.button>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Theme variant="button" size="sm" />

        {selectedType && (
          <Dialog open={settingsOpen} onOpenChange={onSettingsOpenChange}>
            <DialogTrigger asChild>
              <motion.button
                className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/80 px-4 py-2 text-foreground shadow-md backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-background/90 dark:border-border/20 dark:bg-background/10 dark:hover:bg-background/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                aria-label="Open settings"
              >
                <SettingsIcon className="h-4 w-4" />
              </motion.button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
              </DialogHeader>
              <Settings />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

