import type { MBTIGroup } from "./types";

export const MBTI_GROUP_BACKGROUND_CLASSES: Record<MBTIGroup, string[]> = {
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
};

export const MBTI_GROUP_LABELS: Record<MBTIGroup, string> = {
  NT: "NT - Analysts",
  NF: "NF - Diplomats",
  SJ: "SJ - Sentinels",
  SP: "SP - Explorers",
};

export const MBTI_GROUP_SINGULAR_TITLES: Record<MBTIGroup, string> = {
  NT: "Analyst",
  NF: "Diplomat",
  SJ: "Sentinel",
  SP: "Explorer",
};

export const MBTI_GROUP_COLORS: Record<MBTIGroup, { primary: string; secondary: string }> = {
  NT: { primary: "#8b5cf6", secondary: "#a855f7" },
  NF: { primary: "#10b981", secondary: "#059669" },
  SJ: { primary: "#3b82f6", secondary: "#2563eb" },
  SP: { primary: "#f59e0b", secondary: "#d97706" },
};
