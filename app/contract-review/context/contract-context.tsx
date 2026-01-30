"use client";

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import { ContractRisk } from "../types";
import { toast } from "sonner";

// --- Types ---

export type ReviewStage = "idle" | "parsing" | "reviewing" | "ready" | "error";
export type RiskFilter = "all" | ContractRisk["level"];

interface ContractState {
  reviewStage: ReviewStage;
  fileName: string;
  htmlContent: string;
  baseHtmlContent: string; // 原始 HTML（无高亮）
  risks: ContractRisk[];
  activeRiskId: string | null;
  riskFilter: RiskFilter;
  errorMessage: string | null;
  undoStack: Array<{
    htmlContent: string;
    baseHtmlContent: string;
    risks: ContractRisk[];
    riskId: string;
    originalText: string;
    newText: string;
  }>;
}

type Action =
  | { type: "RESET" }
  | { type: "SET_STAGE"; payload: ReviewStage }
  | { type: "SET_FILE_NAME"; payload: string }
  | { type: "SET_CONTENT"; payload: { html: string; baseHtml: string } }
  | { type: "SET_RISKS"; payload: ContractRisk[] }
  | { type: "SET_ACTIVE_RISK"; payload: string | null }
  | { type: "SET_FILTER"; payload: RiskFilter }
  | { type: "SET_ERROR"; payload: string }
  | { type: "UPDATE_HTML"; payload: string } // 仅更新显示HTML
  | {
      type: "ACCEPT_FIX";
      payload: { riskId: string; newText: string; newHtml: string; newBaseHtml: string };
    }
  | { type: "UNDO" };

// --- Initial State ---

const initialState: ContractState = {
  reviewStage: "idle",
  fileName: "请上传合同",
  htmlContent: "",
  baseHtmlContent: "",
  risks: [],
  activeRiskId: null,
  riskFilter: "all",
  errorMessage: null,
  undoStack: [],
};

// --- Reducer ---

function contractReducer(state: ContractState, action: Action): ContractState {
  switch (action.type) {
    case "RESET":
      return { ...initialState };

    case "SET_STAGE":
      return { ...state, reviewStage: action.payload };

    case "SET_FILE_NAME":
      return { ...state, fileName: action.payload };

    case "SET_CONTENT":
      return {
        ...state,
        htmlContent: action.payload.html,
        baseHtmlContent: action.payload.baseHtml,
      };

    case "SET_RISKS":
      return { ...state, risks: action.payload };

    case "SET_ACTIVE_RISK":
      return { ...state, activeRiskId: action.payload };

    case "SET_FILTER":
      return { ...state, riskFilter: action.payload };

    case "SET_ERROR":
      return { ...state, errorMessage: action.payload, reviewStage: "error" };

    case "UPDATE_HTML":
      return { ...state, htmlContent: action.payload };

    case "ACCEPT_FIX": {
      const { riskId, newText, newHtml, newBaseHtml } = action.payload;
      const risk = state.risks.find((r) => r.id === riskId);

      if (!risk) return state;

      const newUndoStack = [
        ...state.undoStack,
        {
          htmlContent: state.htmlContent,
          baseHtmlContent: state.baseHtmlContent,
          risks: state.risks,
          riskId,
          originalText: risk.originalText,
          newText,
        },
      ];

      return {
        ...state,
        htmlContent: newHtml,
        baseHtmlContent: newBaseHtml,
        risks: state.risks.filter((r) => r.id !== riskId),
        activeRiskId: null,
        undoStack: newUndoStack,
      };
    }

    case "UNDO": {
      if (state.undoStack.length === 0) return state;
      const lastState = state.undoStack[state.undoStack.length - 1];

      return {
        ...state,
        htmlContent: lastState.htmlContent,
        baseHtmlContent: lastState.baseHtmlContent,
        risks: lastState.risks,
        undoStack: state.undoStack.slice(0, -1),
      };
    }

    default:
      return state;
  }
}

// --- Context ---

interface ContractContextType {
  state: ContractState;
  dispatch: React.Dispatch<Action>;
  actions: {
    startReview: (fileName: string) => void;
    finishParsing: (html: string) => void;
    finishReview: (risks: ContractRisk[], highlightedHtml: string) => void;
    handleError: (error: string) => void;
    acceptFix: (riskId: string, newText: string) => void;
    undo: () => void;
  };
  computed: {
    visibleRisks: ContractRisk[];
    stats: { high: number; medium: number; safe: number };
  };
}

const ContractContext = createContext<ContractContextType | null>(null);

export function ContractProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(contractReducer, initialState);

  // Helper actions
  const startReview = useCallback((fileName: string) => {
    dispatch({ type: "RESET" });
    dispatch({ type: "SET_FILE_NAME", payload: fileName });
    dispatch({ type: "SET_STAGE", payload: "parsing" });
  }, []);

  const finishParsing = useCallback((html: string) => {
    dispatch({ type: "SET_CONTENT", payload: { html, baseHtml: html } });
    dispatch({ type: "SET_STAGE", payload: "reviewing" });
  }, []);

  const finishReview = useCallback((risks: ContractRisk[], highlightedHtml: string) => {
    dispatch({ type: "SET_RISKS", payload: risks });
    dispatch({ type: "UPDATE_HTML", payload: highlightedHtml });
    dispatch({ type: "SET_STAGE", payload: "ready" });
  }, []);

  const handleError = useCallback((error: string) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const acceptFix = useCallback((_riskId: string, _newText: string) => {
    // 这里的逻辑需要访问 DOM，或者在组件层处理 DOM 操作后调用 dispatch
    // 为了保持 Context 纯净，我们假设组件层已经生成了新的 HTML
    // 但为了方便，我们在这里模拟一下或者要求组件传入新 HTML
    // 实际上，DOM 操作最好在组件层（ContractViewer）完成，然后将结果传回来
    // 这里我们先保留接口，具体逻辑在组件中实现后调用 dispatch({ type: 'ACCEPT_FIX', ... })
    // 所以这里只是一个空的占位，或者我们需要修改 acceptFix 的签名来接收新 HTML
    // 为了简化，我们让组件直接 dispatch ACCEPT_FIX
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
    toast.success("已撤销修改");
  }, []);

  // Computed
  const visibleRisks =
    state.riskFilter === "all"
      ? state.risks
      : state.risks.filter((r) => r.level === state.riskFilter);

  const stats = {
    high: state.risks.filter((r) => r.level === "high").length,
    medium: state.risks.filter((r) => r.level === "medium").length,
    safe: state.risks.filter((r) => r.level === "safe").length,
  };

  return (
    <ContractContext.Provider
      value={{
        state,
        dispatch,
        actions: {
          startReview,
          finishParsing,
          finishReview,
          handleError,
          acceptFix,
          undo,
        },
        computed: {
          visibleRisks,
          stats,
        },
      }}
    >
      {children}
    </ContractContext.Provider>
  );
}

export function useContract() {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error("useContract must be used within a ContractProvider");
  }
  return context;
}
