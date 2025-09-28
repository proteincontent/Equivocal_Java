import { MBTI_TYPES } from "./types";
import type { MBTIProfile, MBTISummary, MBTIType } from "./types";

export const MBTI_PROFILES: Record<MBTIType, MBTIProfile> = {
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
};

export const MBTI_SUMMARIES: MBTISummary[] = MBTI_TYPES.map((type) => {
  const { description, group } = MBTI_PROFILES[type];
  return { type, description, group };
});

export function getMBTIProfile(type: MBTIType): MBTIProfile {
  return MBTI_PROFILES[type];
}

export function getMBTISummaries(): MBTISummary[] {
  return MBTI_SUMMARIES;
}



