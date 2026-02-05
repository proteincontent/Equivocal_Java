"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LEGAL_CATEGORY_LABELS, LEGAL_SERVICE_SUMMARIES } from "@/data/legal-services";
import type { LegalServiceType } from "@/data/legal-services";

const categoryCardClasses: Record<string, string> = {
  文书生成:
    "bg-[#2563EB]/5 text-[#2563EB] border-[#2563EB]/20 hover:bg-[#2563EB]/10 dark:bg-[#2563EB]/10 dark:text-[#3B82F6] dark:border-[#2563EB]/30 dark:hover:bg-[#2563EB]/20",
  合同审查:
    "bg-cyan-500/5 text-cyan-600 border-cyan-500/20 hover:bg-cyan-500/10 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30 dark:hover:bg-cyan-500/20",
  法律咨询:
    "bg-indigo-500/5 text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/10 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30 dark:hover:bg-indigo-500/20",
};

const categoryBadgeClasses: Record<string, string> = {
  文书生成: "bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-[#3B82F6]",
  合同审查: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
  法律咨询: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
};

interface LegalServiceSelectorProps {
  onSelect?: (_type: string) => void;
  className?: string;
}

export function LegalServiceSelector({ onSelect, className }: LegalServiceSelectorProps) {
  const [selectedType, setSelectedType] = useState<LegalServiceType | null>(null);

  const handleSelect = (type: LegalServiceType) => {
    setSelectedType(type);
    onSelect?.(type);
  };

  return (
    <motion.div
      className={cn("w-full max-w-2xl mx-auto", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      role="region"
      aria-label="法律服务类型选择器"
    >
      <div className="bg-popover border border-border rounded-lg shadow-lg p-4">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto"
          role="listbox"
          aria-label="法律服务类型列表"
        >
          {LEGAL_SERVICE_SUMMARIES.map((service) => (
            <button
              key={service.type}
              onClick={() => handleSelect(service.type)}
              className={cn(
                "p-4 rounded-md border text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring",
                categoryCardClasses[service.category],
                selectedType === service.type &&
                  "ring-2 ring-primary ring-offset-2 ring-offset-background",
              )}
              role="option"
              aria-selected={selectedType === service.type}
              aria-label={`${service.type} - ${service.description}`}
            >
              <div className="font-semibold text-sm mb-1">{service.type}</div>
              <div className="text-xs opacity-80 leading-relaxed">{service.description}</div>
              <div className="mt-2">
                <span
                  className={cn(
                    "inline-block px-2 py-1 rounded text-xs",
                    categoryBadgeClasses[service.category],
                  )}
                >
                  {service.category}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">服务类别：</div>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(LEGAL_CATEGORY_LABELS).map(([category, label]) => (
              <span
                key={category}
                className={cn("px-2 py-1 rounded", categoryBadgeClasses[category])}
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
