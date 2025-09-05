"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Search, Check, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface MBTIType {
  type: string
  description: string
  group: "NT" | "NF" | "SJ" | "SP"
}

const mbtiTypes: MBTIType[] = [
  // Purple group (NT - Analysts)
  { type: "INTJ", description: "The Architect", group: "NT" },
  { type: "INTP", description: "The Thinker", group: "NT" },
  { type: "ENTJ", description: "The Commander", group: "NT" },
  { type: "ENTP", description: "The Debater", group: "NT" },

  // Green group (NF - Diplomats)
  { type: "INFJ", description: "The Advocate", group: "NF" },
  { type: "INFP", description: "The Mediator", group: "NF" },
  { type: "ENFJ", description: "The Protagonist", group: "NF" },
  { type: "ENFP", description: "The Campaigner", group: "NF" },

  // Blue group (SJ - Sentinels)
  { type: "ISTJ", description: "The Logistician", group: "SJ" },
  { type: "ISFJ", description: "The Protector", group: "SJ" },
  { type: "ESTJ", description: "The Executive", group: "SJ" },
  { type: "ESFJ", description: "The Consul", group: "SJ" },

  // Yellow group (SP - Explorers)
  { type: "ISTP", description: "The Virtuoso", group: "SP" },
  { type: "ISFP", description: "The Adventurer", group: "SP" },
  { type: "ESTP", description: "The Entrepreneur", group: "SP" },
  { type: "ESFP", description: "The Entertainer", group: "SP" },
]

const groupColors = {
  NT: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700 dark:hover:bg-purple-800/40",
  NF: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-800/40",
  SJ: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-800/40",
  SP: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700 dark:hover:bg-yellow-800/40",
}

interface MBTISelectorProps {
  onConfirm?: (type: string) => void
  onCancel?: () => void
  className?: string
}

export function MBTISelector({ onConfirm, onCancel, className }: MBTISelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const filteredTypes = mbtiTypes.filter(
    (mbti) =>
      mbti.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mbti.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelect = (type: string) => {
    setSelectedType(type)
  }

  const handleConfirm = () => {
    if (selectedType) {
      onConfirm?.(selectedType)
      setSelectedType(null)
      setSearchTerm("")
    }
  }

  const handleCancel = () => {
    setSelectedType(null)
    setSearchTerm("")
    onCancel?.()
  }

  return (
    <motion.div
      className={cn("w-full max-w-md mx-auto", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-popover border border-border rounded-lg shadow-lg p-4">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search MBTI types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-20 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            <button
              onClick={handleConfirm}
              disabled={!selectedType}
              className="p-1 rounded text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Confirm selection"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 rounded text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-2 bg-primary/10 border border-primary/30 rounded-md"
            >
              <div className="text-sm text-primary font-medium">Selected: {selectedType}</div>
              <div className="text-xs text-primary/80">
                {mbtiTypes.find((t) => t.type === selectedType)?.description}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {filteredTypes.map((mbti) => (
            <button
              key={mbti.type}
              onClick={() => handleSelect(mbti.type)}
              className={cn(
                "p-3 rounded-md border text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring",
                groupColors[mbti.group],
                selectedType === mbti.type && "ring-2 ring-primary ring-offset-2 ring-offset-background",
              )}
            >
              <div className="font-semibold text-sm">{mbti.type}</div>
              <div className="text-xs opacity-80 mt-1">{mbti.description}</div>
            </button>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">Groups:</div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              NT - Analysts
            </span>
            <span className="px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              NF - Diplomats
            </span>
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              SJ - Sentinels
            </span>
            <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              SP - Explorers
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
