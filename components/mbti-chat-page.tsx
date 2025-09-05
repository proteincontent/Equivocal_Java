"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { MBTISelector } from "@/components/ui/mbti-selector"
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat"
import { Theme } from "@/components/ui/theme"
import { SpotlightInteractive } from "@/components/ui/spotlight-interactive"
import { InteractiveRobot } from "@/components/ui/interactive-robot"

// MBTI group color mappings for background effects
const mbtiBackgrounds = {
  NT: [
    "from-purple-900/20 via-violet-900/15 to-indigo-900/20",
    "from-purple-800/25 via-violet-800/20 to-purple-900/25",
    "from-indigo-900/20 via-purple-900/25 to-violet-800/20",
    "from-violet-900/30 via-purple-800/20 to-indigo-900/15",
  ],
  NF: [
    "from-green-900/20 via-emerald-900/15 to-teal-900/20",
    "from-emerald-800/25 via-green-800/20 to-emerald-900/25",
    "from-teal-900/20 via-green-900/25 to-emerald-800/20",
    "from-green-900/30 via-emerald-800/20 to-teal-900/15",
  ],
  SJ: [
    "from-blue-900/20 via-sky-900/15 to-cyan-900/20",
    "from-sky-800/25 via-blue-800/20 to-sky-900/25",
    "from-cyan-900/20 via-blue-900/25 to-sky-800/20",
    "from-blue-900/30 via-sky-800/20 to-cyan-900/15",
  ],
  SP: [
    "from-yellow-900/20 via-amber-900/15 to-orange-900/20",
    "from-amber-800/25 via-yellow-800/20 to-amber-900/25",
    "from-orange-900/20 via-yellow-900/25 to-amber-800/20",
    "from-yellow-900/30 via-amber-800/20 to-orange-900/15",
  ],
}

// Get MBTI group from type
function getMBTIGroup(type: string): keyof typeof mbtiBackgrounds {
  const ntTypes = ["INTJ", "INTP", "ENTJ", "ENTP"]
  const nfTypes = ["INFJ", "INFP", "ENFJ", "ENFP"]
  const sjTypes = ["ISTJ", "ISFJ", "ESTJ", "ESFJ"]
  const spTypes = ["ISTP", "ISFP", "ESTP", "ESFP"]

  if (ntTypes.includes(type)) return "NT"
  if (nfTypes.includes(type)) return "NF"
  if (sjTypes.includes(type)) return "SJ"
  if (spTypes.includes(type)) return "SP"
  return "NT" // fallback
}

export function MBTIChatPage() {
  const [selectedMBTI, setSelectedMBTI] = useState<string | null>(null)
  const [currentBgIndex, setCurrentBgIndex] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [showMBTISelector, setShowMBTISelector] = useState(false)

  // Cycle through background gradients when MBTI is selected
  useEffect(() => {
    if (!selectedMBTI) return

    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % 4)
    }, 2000) // Change every 2 seconds

    return () => clearInterval(interval)
  }, [selectedMBTI])

  // Show chat interface after MBTI selection
  useEffect(() => {
    if (selectedMBTI) {
      const timer = setTimeout(() => setShowChat(true), 800)
      return () => clearTimeout(timer)
    } else {
      setShowChat(false)
    }
  }, [selectedMBTI])

  const handleBackToHome = () => {
    setSelectedMBTI(null)
    setShowChat(false)
    setCurrentBgIndex(0)
    setShowMBTISelector(false)
  }

  const handleMBTIConfirm = (type: string) => {
    setSelectedMBTI(type)
    setCurrentBgIndex(0)
    setShowMBTISelector(false)
  }

  const handleRobotInteraction = () => {
    if (!showMBTISelector && !selectedMBTI) {
      setShowMBTISelector(true)
    }
  }

  const currentGroup = selectedMBTI ? getMBTIGroup(selectedMBTI) : null
  const currentBg = currentGroup ? mbtiBackgrounds[currentGroup][currentBgIndex] : null

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute top-4 left-4 z-50">
        <motion.button
          onClick={handleBackToHome}
          className="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-xl bg-background/80 dark:bg-background/10 border border-border/50 dark:border-border/20 text-foreground shadow-lg dark:shadow-none hover:bg-background/90 dark:hover:bg-background/20 transition-all duration-300 hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">Home</span>
        </motion.button>
      </div>

      {/* Theme toggle in top-right */}
      <div className="absolute top-4 right-4 z-50">
        <Theme variant="button" size="sm" />
      </div>

      <AnimatePresence mode="wait">
        {selectedMBTI && currentBg ? (
          <motion.div
            key={`${selectedMBTI}-${currentBgIndex}`}
            className={`absolute inset-0 bg-gradient-to-br ${currentBg} dark:opacity-100 opacity-30`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        ) : (
          <motion.div
            key="default-bg"
            className="absolute inset-0 bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* SpotlightInteractive for mouse cursor light circle effect on main page */}
      {!showChat && <SpotlightInteractive />}

      {/* Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {!showChat ? (
            // Initial state with MBTI selector
            <motion.div
              key="mbti-selector"
              className="min-h-screen flex flex-col items-center justify-center p-6"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h1 className="text-2xl md:text-3xl font-light text-foreground mb-4 drop-shadow-sm">
                    Discover your personality type
                  </h1>
                  <p className="text-muted-foreground mb-8 drop-shadow-sm">Choose your MBTI type to get started</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div className="text-center space-y-6">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground">Equivocal</h2>

                    {!showMBTISelector ? (
                      <motion.button
                        onClick={() => setShowMBTISelector(true)}
                        className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 border border-primary rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Choose your MBTI
                      </motion.button>
                    ) : (
                      <MBTISelector onConfirm={handleMBTIConfirm} onCancel={() => setShowMBTISelector(false)} />
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                      className="w-full max-w-3xl mx-auto"
                    >
                      <InteractiveRobot className="cursor-pointer" onInteraction={handleRobotInteraction} />
                      <motion.p
                        className="text-sm text-muted-foreground mt-4 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ delay: 1.2 }}
                      >
                        Meet your AI personality guide - click to start your journey
                      </motion.p>
                    </motion.div>
                  </div>
                </motion.div>

                {selectedMBTI && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                    <div className="bg-background/80 dark:bg-transparent backdrop-blur-sm rounded-lg px-4 py-2 border border-border/30 dark:border-transparent shadow-sm dark:shadow-none">
                      <p className="text-lg font-medium text-foreground">Selected: {selectedMBTI}</p>
                      <p className="text-sm text-muted-foreground mt-2">Preparing your personalized experience...</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            // Chat interface after MBTI selection
            <motion.div
              key="chat-interface"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <AnimatedAIChat />

              <motion.div
                className="fixed bottom-4 left-4 z-40"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="backdrop-blur-xl bg-background/80 dark:bg-background/10 border border-border/50 dark:border-border/20 rounded-lg px-3 py-2 shadow-lg dark:shadow-none">
                  <p className="text-xs text-muted-foreground">Personality Type</p>
                  <p className="text-sm font-medium text-foreground">{selectedMBTI}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
