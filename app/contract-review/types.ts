export interface ContractRisk {
  id: string;
  level: "high" | "medium" | "safe";
  title: string;
  description: string;
  originalText: string;
  suggestion?: string;
  startIndex?: number; // 可选，因为 AI 可能不返回精确索引
  endIndex?: number; // 可选
  category: string; // 风险类别
}
