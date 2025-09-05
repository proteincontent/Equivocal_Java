"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface MBTIData {
  type: string
  description: string
  group: "NT" | "NF" | "SJ" | "SP"
  traits: string[]
  strengths: string[]
  challenges: string[]
}

const mbtiData: Record<string, MBTIData> = {
  // NT Group - Analysts (Purple)
  INTJ: {
    type: "INTJ",
    description: "The Architect",
    group: "NT",
    traits: ["Strategic", "Independent", "Decisive", "Visionary"],
    strengths: ["Long-term planning", "Systems thinking", "Innovation"],
    challenges: ["Perfectionism", "Impatience with inefficiency", "Social interaction"],
  },
  INTP: {
    type: "INTP",
    description: "The Thinker",
    group: "NT",
    traits: ["Analytical", "Curious", "Flexible", "Logical"],
    strengths: ["Problem solving", "Theoretical thinking", "Adaptability"],
    challenges: ["Procrastination", "Difficulty with routine", "Emotional expression"],
  },
  ENTJ: {
    type: "ENTJ",
    description: "The Commander",
    group: "NT",
    traits: ["Natural leader", "Confident", "Strategic", "Efficient"],
    strengths: ["Leadership", "Goal achievement", "Organization"],
    challenges: ["Impatience", "Overlooking feelings", "Work-life balance"],
  },
  ENTP: {
    type: "ENTP",
    description: "The Debater",
    group: "NT",
    traits: ["Innovative", "Enthusiastic", "Versatile", "Charismatic"],
    strengths: ["Brainstorming", "Networking", "Adaptability"],
    challenges: ["Follow-through", "Routine tasks", "Sensitivity to criticism"],
  },

  // NF Group - Diplomats (Green)
  INFJ: {
    type: "INFJ",
    description: "The Advocate",
    group: "NF",
    traits: ["Insightful", "Principled", "Passionate", "Altruistic"],
    strengths: ["Understanding others", "Long-term vision", "Creativity"],
    challenges: ["Perfectionism", "Burnout", "Conflict avoidance"],
  },
  INFP: {
    type: "INFP",
    description: "The Mediator",
    group: "NF",
    traits: ["Idealistic", "Loyal", "Adaptable", "Curious"],
    strengths: ["Empathy", "Creativity", "Value-driven decisions"],
    challenges: ["Procrastination", "Self-criticism", "Practical matters"],
  },
  ENFJ: {
    type: "ENFJ",
    description: "The Protagonist",
    group: "NF",
    traits: ["Charismatic", "Altruistic", "Natural leader", "Reliable"],
    strengths: ["Inspiring others", "Communication", "Organization"],
    challenges: ["Overcommitment", "Taking criticism personally", "Neglecting self-care"],
  },
  ENFP: {
    type: "ENFP",
    description: "The Campaigner",
    group: "NF",
    traits: ["Enthusiastic", "Creative", "Sociable", "Free-spirited"],
    strengths: ["Motivation", "Networking", "Innovation"],
    challenges: ["Focus", "Routine tasks", "Overthinking"],
  },

  // SJ Group - Sentinels (Blue)
  ISTJ: {
    type: "ISTJ",
    description: "The Logistician",
    group: "SJ",
    traits: ["Practical", "Fact-minded", "Reliable", "Responsible"],
    strengths: ["Organization", "Attention to detail", "Consistency"],
    challenges: ["Adapting to change", "Expressing emotions", "Risk-taking"],
  },
  ISFJ: {
    type: "ISFJ",
    description: "The Protector",
    group: "SJ",
    traits: ["Warm-hearted", "Conscientious", "Cooperative", "Practical"],
    strengths: ["Supporting others", "Attention to detail", "Loyalty"],
    challenges: ["Saying no", "Self-advocacy", "Handling conflict"],
  },
  ESTJ: {
    type: "ESTJ",
    description: "The Executive",
    group: "SJ",
    traits: ["Organized", "Practical", "Logical", "Decisive"],
    strengths: ["Leadership", "Project management", "Efficiency"],
    challenges: ["Flexibility", "Considering emotions", "Delegating"],
  },
  ESFJ: {
    type: "ESFJ",
    description: "The Consul",
    group: "SJ",
    traits: ["Caring", "Social", "Popular", "Conscientious"],
    strengths: ["Team harmony", "Practical help", "Organization"],
    challenges: ["Criticism", "Conflict", "Personal needs"],
  },

  // SP Group - Explorers (Yellow)
  ISTP: {
    type: "ISTP",
    description: "The Virtuoso",
    group: "SP",
    traits: ["Bold", "Practical", "Experimental", "Flexible"],
    strengths: ["Problem solving", "Crisis management", "Technical skills"],
    challenges: ["Long-term planning", "Emotional expression", "Routine"],
  },
  ISFP: {
    type: "ISFP",
    description: "The Adventurer",
    group: "SP",
    traits: ["Flexible", "Charming", "Curious", "Artistic"],
    strengths: ["Creativity", "Adaptability", "Empathy"],
    challenges: ["Planning ahead", "Criticism", "Stress management"],
  },
  ESTP: {
    type: "ESTP",
    description: "The Entrepreneur",
    group: "SP",
    traits: ["Energetic", "Perceptive", "Spontaneous", "Pragmatic"],
    strengths: ["Adaptability", "People skills", "Crisis management"],
    challenges: ["Long-term focus", "Theory", "Sensitivity"],
  },
  ESFP: {
    type: "ESFP",
    description: "The Entertainer",
    group: "SP",
    traits: ["Spontaneous", "Enthusiastic", "Friendly", "Flexible"],
    strengths: ["Motivation", "Teamwork", "Practical help"],
    challenges: ["Planning", "Criticism", "Conflict"],
  },
}

const groupBackgrounds = {
  NT: [
    "from-purple-600 via-violet-700 to-indigo-800",
    "from-purple-700 via-purple-600 to-violet-800",
    "from-indigo-700 via-purple-700 to-violet-600",
    "from-violet-800 via-purple-600 to-indigo-700",
  ],
  NF: [
    "from-emerald-600 via-green-700 to-teal-800",
    "from-green-700 via-emerald-600 to-green-800",
    "from-teal-700 via-green-700 to-emerald-600",
    "from-green-800 via-emerald-600 to-teal-700",
  ],
  SJ: [
    "from-blue-600 via-sky-700 to-cyan-800",
    "from-sky-700 via-blue-600 to-blue-800",
    "from-cyan-700 via-blue-700 to-sky-600",
    "from-blue-800 via-sky-600 to-cyan-700",
  ],
  SP: [
    "from-amber-600 via-yellow-700 to-orange-800",
    "from-yellow-700 via-amber-600 to-yellow-800",
    "from-orange-700 via-yellow-700 to-amber-600",
    "from-yellow-800 via-amber-600 to-orange-700",
  ],
}

export default function MBTIResultPage() {
  const params = useParams()
  const router = useRouter()
  const type = params.type as string
  const [currentBgIndex, setCurrentBgIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const data = mbtiData[type?.toUpperCase()]

  useEffect(() => {
    if (!data) {
      router.push("/")
      return
    }

    setIsVisible(true)

    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % groupBackgrounds[data.group].length)
    }, 2000)

    return () => clearInterval(interval)
  }, [data, router])

  if (!data) {
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-to-br transition-all duration-2000 ease-in-out",
          groupBackgrounds[data.group][currentBgIndex],
        )}
        key={currentBgIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />

      {/* Animated overlay patterns */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full mix-blend-overlay filter blur-[128px] opacity-30"
          style={{
            backgroundColor:
              data.group === "NT"
                ? "#8b5cf6"
                : data.group === "NF"
                  ? "#10b981"
                  : data.group === "SJ"
                    ? "#3b82f6"
                    : "#f59e0b",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full mix-blend-overlay filter blur-[96px] opacity-20"
          style={{
            backgroundColor:
              data.group === "NT"
                ? "#a855f7"
                : data.group === "NF"
                  ? "#059669"
                  : data.group === "SJ"
                    ? "#2563eb"
                    : "#d97706",
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.div
          className="p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            className="max-w-4xl w-full text-center text-white"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {/* MBTI Type Header */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-white/80" />
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight">{data.type}</h1>
                <Sparkles className="w-8 h-8 text-white/80" />
              </div>
              <p className="text-2xl md:text-3xl text-white/90 font-light">{data.description}</p>
            </motion.div>

            {/* Content Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Traits */}
              <motion.div
                className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                transition={{ delay: 0.8 }}
              >
                <h3 className="text-xl font-semibold mb-4 text-white/90">Key Traits</h3>
                <div className="space-y-2">
                  {data.traits.map((trait, index) => (
                    <motion.div
                      key={trait}
                      className="text-white/80 text-sm bg-white/5 rounded-lg px-3 py-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
                      transition={{ delay: 1 + index * 0.1 }}
                    >
                      {trait}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Strengths */}
              <motion.div
                className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ delay: 1 }}
              >
                <h3 className="text-xl font-semibold mb-4 text-white/90">Strengths</h3>
                <div className="space-y-2">
                  {data.strengths.map((strength, index) => (
                    <motion.div
                      key={strength}
                      className="text-white/80 text-sm bg-white/5 rounded-lg px-3 py-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                    >
                      {strength}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Challenges */}
              <motion.div
                className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
                transition={{ delay: 1.2 }}
              >
                <h3 className="text-xl font-semibold mb-4 text-white/90">Growth Areas</h3>
                <div className="space-y-2">
                  {data.challenges.map((challenge, index) => (
                    <motion.div
                      key={challenge}
                      className="text-white/80 text-sm bg-white/5 rounded-lg px-3 py-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
                      transition={{ delay: 1.4 + index * 0.1 }}
                    >
                      {challenge}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Group Info */}
            <motion.div
              className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ delay: 1.6 }}
            >
              <p className="text-white/70 text-lg">
                You belong to the{" "}
                <span className="font-semibold text-white">
                  {data.group === "NT"
                    ? "Analyst"
                    : data.group === "NF"
                      ? "Diplomat"
                      : data.group === "SJ"
                        ? "Sentinel"
                        : "Explorer"}
                </span>{" "}
                temperament group, known for their unique approach to life and problem-solving.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
