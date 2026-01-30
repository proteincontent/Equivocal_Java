export type LegalServiceType =
  | "合同生成"
  | "合同审查"
  | "借条生成"
  | "租赁合同"
  | "保密协议"
  | "法律咨询";

export type LegalServiceCategory = "文书生成" | "合同审查" | "法律咨询";

export interface LegalServiceSummary {
  type: LegalServiceType;
  description: string;
  category: LegalServiceCategory;
}

export interface LegalServiceProfile {
  type: LegalServiceType;
  title: string;
  description: string;
  category: LegalServiceCategory;
  features: string[];
  examples: string[];
}

export const LEGAL_SERVICE_TYPES: LegalServiceType[] = [
  "合同生成",
  "合同审查",
  "借条生成",
  "租赁合同",
  "保密协议",
  "法律咨询",
];

export const LEGAL_SERVICE_SUMMARIES: LegalServiceSummary[] = [
  {
    type: "合同生成",
    description: "根据您的需求生成各类法律文书",
    category: "文书生成",
  },
  {
    type: "合同审查",
    description: "专业审查合同条款，识别风险点",
    category: "合同审查",
  },
  {
    type: "借条生成",
    description: "快速生成标准化的借条文书",
    category: "文书生成",
  },
  {
    type: "租赁合同",
    description: "生成房屋租赁合同及相关文书",
    category: "文书生成",
  },
  {
    type: "保密协议",
    description: "制定专业的保密协议文书",
    category: "文书生成",
  },
  {
    type: "法律咨询",
    description: "提供专业的法律咨询服务",
    category: "法律咨询",
  },
];

export const LEGAL_SERVICE_PROFILES: Record<LegalServiceType, LegalServiceProfile> = {
  合同生成: {
    type: "合同生成",
    title: "智能合同生成服务",
    description: "基于您提供的信息，智能生成符合法律规范的各种合同文书",
    category: "文书生成",
    features: ["多种合同模板选择", "自动填写关键信息", "法律条款自动匹配", "格式标准化输出"],
    examples: ["销售合同", "服务合同", "代理合同", "合作协议"],
  },
  合同审查: {
    type: "合同审查",
    title: "专业合同审查服务",
    description: "深度审查合同内容，识别潜在风险和不利条款",
    category: "合同审查",
    features: ["霸王条款识别", "风险评估提示", "修改建议提供", "法律依据引用"],
    examples: ["装修合同", "健身合同", "购房合同", "劳动合同"],
  },
  借条生成: {
    type: "借条生成",
    title: "标准化借条生成",
    description: "快速生成具有法律效力的标准化借条文书",
    category: "文书生成",
    features: ["关键信息自动填充", "利率计算功能", "还款方式设置", "法律条款完备"],
    examples: ["个人借款", "商业借款", "短期借款", "长期借款"],
  },
  租赁合同: {
    type: "租赁合同",
    title: "房屋租赁合同生成",
    description: "生成符合法律要求的房屋租赁合同及相关文书",
    category: "文书生成",
    features: ["租期灵活设置", "租金条款完善", "违约责任明确", "双方权益平衡"],
    examples: ["房屋租赁", "车位租赁", "设备租赁", "场地租赁"],
  },
  保密协议: {
    type: "保密协议",
    title: "专业保密协议制定",
    description: "制定严密的保密协议，保护商业机密和隐私信息",
    category: "文书生成",
    features: ["保密范围明确", "违约责任严格", "期限设置灵活", "救济措施完备"],
    examples: ["员工保密", "商业合作", "技术保密", "客户信息"],
  },
  法律咨询: {
    type: "法律咨询",
    title: "专业法律咨询服务",
    description: "提供各类法律问题的专业咨询服务",
    category: "法律咨询",
    features: ["专业律师解答", "法律条文引用", "案例参考分析", "解决方案建议"],
    examples: ["合同纠纷", "劳动争议", "债务问题", "知识产权"],
  },
};

export const LEGAL_CATEGORY_LABELS = {
  文书生成: "法律文书生成",
  合同审查: "合同审查服务",
  法律咨询: "法律咨询服务",
} as const;

export const LEGAL_CATEGORY_BACKGROUND_CLASSES: Record<LegalServiceCategory, string[]> = {
  文书生成: [
    "from-blue-900/20 via-sky-900/15 to-cyan-900/20",
    "from-sky-800/25 via-blue-800/20 to-sky-900/25",
    "from-cyan-900/20 via-blue-900/25 to-sky-800/20",
    "from-blue-900/30 via-sky-800/20 to-cyan-900/15",
  ],
  合同审查: [
    "from-purple-900/20 via-violet-900/15 to-indigo-900/20",
    "from-purple-800/25 via-violet-800/20 to-purple-900/25",
    "from-indigo-900/20 via-purple-900/25 to-violet-800/20",
    "from-violet-900/30 via-purple-800/20 to-indigo-900/15",
  ],
  法律咨询: [
    "from-green-900/20 via-emerald-900/15 to-teal-900/20",
    "from-emerald-800/25 via-green-800/20 to-emerald-900/25",
    "from-teal-900/20 via-green-900/25 to-emerald-800/20",
    "from-green-900/30 via-emerald-800/20 to-teal-900/15",
  ],
};

export function listLegalServices(): LegalServiceType[] {
  return [...LEGAL_SERVICE_TYPES];
}

export function isLegalServiceType(value: string): value is LegalServiceType {
  if (!value) return false;
  return LEGAL_SERVICE_TYPES.includes(value as LegalServiceType);
}

export function getLegalServiceProfile(type: LegalServiceType): LegalServiceProfile {
  return LEGAL_SERVICE_PROFILES[type];
}

export function getLegalServiceSummaryByType(type: LegalServiceType): LegalServiceSummary {
  return {
    type,
    description: LEGAL_SERVICE_PROFILES[type].description,
    category: LEGAL_SERVICE_PROFILES[type].category,
  };
}
