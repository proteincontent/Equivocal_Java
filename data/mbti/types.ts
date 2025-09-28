export const MBTI_TYPES = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
] as const;

export type MBTIType = (typeof MBTI_TYPES)[number];

export type MBTIGroup = "NT" | "NF" | "SJ" | "SP";

export interface MBTIProfile {
  type: MBTIType;
  description: string;
  group: MBTIGroup;
  traits: string[];
  strengths: string[];
  challenges: string[];
}

export interface MBTISummary {
  type: MBTIType;
  description: string;
  group: MBTIGroup;
}
