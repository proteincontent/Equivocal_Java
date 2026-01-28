"use client";

import { useState, useRef } from "react";
import { Upload, FileText, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import mammoth from "mammoth";
import { useContract } from "../context/contract-context";
import { motion } from "framer-motion";

export function UploadZone() {
  const { actions, state } = useContract();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    actions.startReview(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();

      // 1. Parse HTML for display
      const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
      const baseHtml = sanitizeHtml(htmlResult.value);
      actions.finishParsing(baseHtml);

      // 2. Extract Text for AI Analysis
      const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
      const rawText = rawTextResult.value;

      // 3. Call AI API
      const response = await fetch("/api/contract/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: rawText }),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        let detail = errorBody.trim();
        if (detail) {
          try {
            const parsed = JSON.parse(detail) as { detail?: unknown; message?: unknown };
            if (typeof parsed?.detail === "string") detail = parsed.detail;
            else if (typeof parsed?.message === "string") detail = parsed.message;
          } catch {
            // Keep raw text when it's not JSON.
          }
        }
        throw new Error(
          `AI 审查服务调用失败（HTTP ${response.status}）${detail ? `：${detail}` : ""}`,
        );
      }

      const data = await response.json();
      const aiRisks = data.risks || [];
      
      // 4. Inject Highlights (Initial)
      // Note: We do this in the component usually, but for initial load we can do it here or let the effect handle it.
      // Let's pass the raw risks and let the context/viewer handle the highlighting logic to keep it centralized.
      // But wait, finishReview expects highlightedHtml. 
      // Let's perform initial highlighting here to avoid flash.
      const highlightedHtml = injectHighlightsIntoHtml(baseHtml, aiRisks);
      
      actions.finishReview(aiRisks, highlightedHtml);

    } catch (error) {
      console.error("处理失败:", error);
      const message = error instanceof Error ? error.message : "未知错误";
      actions.handleError(message);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".docx")) {
      actions.handleError("仅支持 .docx 格式的 Word 合同文件");
      return;
    }
    await processFile(file);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
    event.target.value = "";
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className="h-full flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"
        />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".docx"
        className="hidden"
      />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={cn(
          "relative w-full max-w-lg p-12 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center text-center bg-background/50 backdrop-blur-sm shadow-sm z-10",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02] shadow-xl"
            : "border-border/60 hover:border-primary/30 hover:bg-card/80",
        )}
      >
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center mb-8 shadow-inner ring-1 ring-white/50"
        >
          <Upload className="h-10 w-10 text-primary/80" />
        </motion.div>
        
        <h3 className="text-2xl font-bold mb-3 tracking-tight">上传合同文件</h3>
        <p className="text-muted-foreground mb-10 max-w-[300px] leading-relaxed">
          拖拽 .docx 文件到这里，开启 AI 智能审查之旅
        </p>

        <Button
          onClick={triggerFileUpload}
          size="lg"
          className="min-w-[180px] h-12 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
        >
          选择文件
        </Button>

        {isDragging && (
          <div className="absolute inset-0 rounded-2xl bg-background/90 backdrop-blur-[2px] flex items-center justify-center z-10 animate-in fade-in duration-200">
            <div className="text-xl font-medium text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 animate-pulse" />
              松手开始上传
            </div>
          </div>
        )}
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mt-12 flex items-center gap-8 sm:gap-12 text-sm text-muted-foreground/70 z-10"
      >
        <div className="flex flex-col items-center gap-2 group cursor-default">
          <div className="p-2 rounded-full bg-background/80 shadow-sm group-hover:scale-110 transition-transform duration-300">
            <ShieldCheck className="w-4 h-4 text-green-600" />
          </div>
          <span>隐私安全保护</span>
        </div>
        <div className="flex flex-col items-center gap-2 group cursor-default">
           <div className="p-2 rounded-full bg-background/80 shadow-sm group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <span>AI 智能解析</span>
        </div>
        <div className="flex flex-col items-center gap-2 group cursor-default">
           <div className="p-2 rounded-full bg-background/80 shadow-sm group-hover:scale-110 transition-transform duration-300">
            <FileText className="w-4 h-4 text-orange-600" />
          </div>
          <span>专业法律建议</span>
        </div>
      </motion.div>

      {state.reviewStage === 'parsing' && (
         <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <h3 className="text-lg font-medium">正在解析文档结构...</h3>
         </div>
      )}
    </div>
  );
}

// --- Helper Functions (Duplicated from original for now, should be in utils) ---

function sanitizeHtml(html: string) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
}

function replaceFirstOccurrence(haystack: string, needle: string, replacement: string) {
  const index = haystack.indexOf(needle);
  if (index === -1) return haystack;
  return haystack.slice(0, index) + replacement + haystack.slice(index + needle.length);
}

// Simple version for initial load
function injectHighlightsIntoHtml(html: string, risks: any[]) {
  let processedHtml = html;
  const risksSorted = [...risks].sort((a, b) => (b.originalText?.length ?? 0) - (a.originalText?.length ?? 0));
  
  for (const risk of risksSorted) {
    const originalText = (risk.originalText ?? "").trim();
    if (!originalText) continue;
    if (!processedHtml.includes(originalText)) continue;

    const highlightClass =
      risk.level === "high"
        ? "risk-high"
        : risk.level === "medium"
          ? "risk-medium"
          : "risk-safe";

    const replacement = `<span id="risk-text-${risk.id}" class="risk-highlight ${highlightClass}" data-risk-id="${risk.id}">${originalText}</span>`;
    processedHtml = replaceFirstOccurrence(processedHtml, originalText, replacement);
  }
  return processedHtml;
}
