"use client";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MBTI_GROUP_LABELS,
  MBTI_SUMMARIES,
  getMBTIProfile,
} from "@/data/mbti";
import type { MBTIGroup, MBTIType } from "@/data/mbti";

const groupCardClasses: Record<MBTIGroup, string> = {
  NT: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700 dark:hover:bg-purple-800/40",
  NF: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-800/40",
  SJ: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-800/40",
  SP: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700 dark:hover:bg-yellow-800/40",
};

const groupBadgeClasses: Record<MBTIGroup, string> = {
  NT: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  NF: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  SJ: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  SP: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
};

interface MBTISelectorProps {
  onConfirm?: (_type: MBTIType) => void;
  onSelect?: (_type: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function MBTISelector({ onConfirm, onSelect, onCancel, className }: MBTISelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<MBTIType | null>(null);

  const filteredTypes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return MBTI_SUMMARIES;

    return MBTI_SUMMARIES.filter(
      (summary) =>
        summary.type.toLowerCase().includes(query) ||
        summary.description.toLowerCase().includes(query),
    );
  }, [searchTerm]);

  const selectedProfile = selectedType ? getMBTIProfile(selectedType) : null;

  const handleSelect = (type: MBTIType) => {
    setSelectedType(type);
    onSelect?.(type);
  };

  const handleConfirm = () => {
    if (!selectedType) return;
    onConfirm?.(selectedType);
    setSelectedType(null);
    setSearchTerm("");
  };

  const handleCancel = () => {
    setSelectedType(null);
    setSearchTerm("");
    onCancel?.();
  };

  return (
    <motion.div
      className={cn("w-full max-w-md mx-auto", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      role="region"
      aria-label="MBTI personality type selector"
    >
      <div className="bg-popover border border-border rounded-lg shadow-lg p-4">
        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search MBTI types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-20 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            aria-label="Search MBTI personality types"
            role="searchbox"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              onClick={handleConfirm}
              disabled={!selectedType}
              className="p-1 rounded text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Confirm selection"
              aria-label="Confirm MBTI selection"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 rounded text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              title="Cancel"
              aria-label="Cancel selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {selectedProfile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-2 bg-primary/10 border border-primary/30 rounded-md"
            >
              <div className="text-sm text-primary font-medium">Selected: {selectedProfile.type}</div>
              <div className="text-xs text-primary/80">{selectedProfile.description}</div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto"
          role="listbox"
          aria-label="MBTI types list"
        >
          {filteredTypes.map((mbti) => (
            <button
              key={mbti.type}
              onClick={() => handleSelect(mbti.type)}
              className={cn(
                "p-3 rounded-md border text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring",
                groupCardClasses[mbti.group],
                selectedType === mbti.type &&
                  "ring-2 ring-primary ring-offset-2 ring-offset-background",
              )}
              role="option"
              aria-selected={selectedType === mbti.type}
              aria-label={`${mbti.type} - ${mbti.description}`}
            >
              <div className="font-semibold text-sm">{mbti.type}</div>
              <div className="text-xs opacity-80 mt-1">{mbti.description}</div>
            </button>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">Groups:</div>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(MBTI_GROUP_LABELS).map(([group, label]) => (
              <span
                key={group}
                className={cn("px-2 py-1 rounded", groupBadgeClasses[group as MBTIGroup])}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
