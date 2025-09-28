"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

import { MBTI_GROUP_BACKGROUND_CLASSES, MBTI_GROUP_COLORS, MBTI_GROUP_SINGULAR_TITLES, getMBTIProfile, isMBTIType } from "@/data/mbti";
export default function MBTIResultPage() {
  const params = useParams();
  const router = useRouter();
  const rawType = (params.type as string | undefined) ?? "";
  const normalizedType = rawType.toUpperCase();
  const resolvedType = isMBTIType(normalizedType) ? normalizedType : null;
  const profile = resolvedType ? getMBTIProfile(resolvedType) : null;
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!profile) {
      router.push("/");
      return;
    }

    setIsVisible(true);
    setCurrentBgIndex(0);

    const backgrounds = MBTI_GROUP_BACKGROUND_CLASSES[profile.group] ?? [];
    if (backgrounds.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [profile, router]);

  if (!profile) {
    return null;
  }

  const backgrounds = MBTI_GROUP_BACKGROUND_CLASSES[profile.group] ?? [];
  const backgroundClass = backgrounds.length ? backgrounds[currentBgIndex % backgrounds.length] : "";
  const groupColors = MBTI_GROUP_COLORS[profile.group];
  const groupTitle = MBTI_GROUP_SINGULAR_TITLES[profile.group];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-to-br transition-all duration-2000 ease-in-out",
          backgroundClass,
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
            backgroundColor: groupColors.primary,
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
            backgroundColor: groupColors.secondary,
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
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight">{profile.type}</h1>
                <Sparkles className="w-8 h-8 text-white/80" />
              </div>
              <p className="text-2xl md:text-3xl text-white/90 font-light">{profile.description}</p>
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
                  {profile.traits.map((trait, index) => (
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
                  {profile.strengths.map((strength, index) => (
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
                  {profile.challenges.map((challenge, index) => (
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
                <span className="font-semibold text-white">{groupTitle}</span>{" "}
                temperament group, known for their unique approach to life and problem-solving.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}




















