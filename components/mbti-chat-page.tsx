"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { MBTIBackground } from "@/components/mbti-chat/background";
import { MBTIChatToolbar } from "@/components/mbti-chat/toolbar";
import { IntroScreen } from "@/components/mbti-chat/intro-screen";
import { SelectedBadge } from "@/components/mbti-chat/selected-badge";
import { MBTI_GROUP_BACKGROUND_CLASSES, getMBTIGroup, type MBTIGroup, type MBTIType } from "@/data/mbti";
import { SpotlightInteractive } from "@/components/ui/spotlight-interactive";

export function MBTIChatPage() {
  const [selectedMBTI, setSelectedMBTI] = useState<MBTIType | null>(null);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [showMBTISelector, setShowMBTISelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!selectedMBTI) {
      setShowChat(false);
      return;
    }

    const timer = setTimeout(() => setShowChat(true), 800);
    return () => clearTimeout(timer);
  }, [selectedMBTI]);

  useEffect(() => {
    if (!selectedMBTI) {
      setCurrentBgIndex(0);
      if (showSettings) {
        setShowSettings(false);
      }
      return;
    }

    const group = getMBTIGroup(selectedMBTI);
    const backgrounds = MBTI_GROUP_BACKGROUND_CLASSES[group] ?? [];
    const backgroundCount = backgrounds.length || 1;

    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundCount);
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedMBTI, showSettings]);

  const handleBackToHome = useCallback(() => {
    setSelectedMBTI(null);
    setShowChat(false);
    setCurrentBgIndex(0);
    setShowMBTISelector(false);
  }, []);

  const handleMBTIConfirm = useCallback((type: MBTIType) => {
    setSelectedMBTI(type);
    setCurrentBgIndex(0);
    setShowMBTISelector(false);
  }, []);

  const currentGroup = useMemo<MBTIGroup | null>(
    () => (selectedMBTI ? getMBTIGroup(selectedMBTI) : null),
    [selectedMBTI],
  );

  const currentBg = useMemo(() => {
    if (!currentGroup) return null;
    const backgrounds = MBTI_GROUP_BACKGROUND_CLASSES[currentGroup];
    if (!backgrounds?.length) return null;
    return backgrounds[currentBgIndex % backgrounds.length];
  }, [currentGroup, currentBgIndex]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MBTIChatToolbar
        selectedType={selectedMBTI}
        onBack={handleBackToHome}
        settingsOpen={showSettings}
        onSettingsOpenChange={setShowSettings}
      />

      <MBTIBackground selectedType={selectedMBTI} backgroundClass={currentBg} />

      {!showChat && <SpotlightInteractive />}

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {!showChat ? (
            <IntroScreen
              showSelector={showMBTISelector}
              onToggleSelector={setShowMBTISelector}
              onConfirm={handleMBTIConfirm}
              selectedType={selectedMBTI}
            />
          ) : (
            <motion.div
              key="chat-interface"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <AnimatedAIChat />
              <SelectedBadge selectedType={selectedMBTI} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
