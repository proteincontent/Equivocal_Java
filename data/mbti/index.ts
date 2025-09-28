import { MBTI_GROUP_BACKGROUND_CLASSES, MBTI_GROUP_COLORS, MBTI_GROUP_LABELS, MBTI_GROUP_SINGULAR_TITLES } from "./groups";
import { MBTI_PROFILES, MBTI_SUMMARIES, getMBTIProfile, getMBTISummaries } from "./profiles";
import { MBTI_TYPES } from "./types";
import type { MBTIGroup, MBTISummary, MBTIType } from "./types";

export * from "./types";
export { MBTI_GROUP_BACKGROUND_CLASSES, MBTI_GROUP_COLORS, MBTI_GROUP_LABELS, MBTI_GROUP_SINGULAR_TITLES };
export { MBTI_PROFILES, MBTI_SUMMARIES, getMBTIProfile, getMBTISummaries };

export function listMBTITypes(): MBTIType[] {
  return [...MBTI_TYPES];
}

export function isMBTIType(value: string): value is MBTIType {
  if (!value) return false;
  return MBTI_TYPES.includes(value.toUpperCase() as MBTIType);
}

export function getMBTIGroup(type: MBTIType): MBTIGroup {
  return MBTI_PROFILES[type].group;
}

export function getMBTISummaryByType(type: MBTIType): MBTISummary {
  return {
    type,
    description: MBTI_PROFILES[type].description,
    group: MBTI_PROFILES[type].group,
  };
}


