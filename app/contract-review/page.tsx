"use client";

import { ContractProvider, useContract } from "./context/contract-context";
import { Header } from "./components/header";
import { UploadZone } from "./components/upload-zone";
import { ContractViewer } from "./components/document-viewer";
import { RiskPanel } from "./components/risk-panel";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

function ContractReviewLayout() {
  const { state } = useContract();

  if (!state.htmlContent && state.reviewStage === "idle") {
    return (
      <div className="h-screen flex flex-col bg-background">
        <Header />
        <UploadZone />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={70} minSize={50}>
            <ContractViewer />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
            <RiskPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

export default function ContractReviewPage() {
  return (
    <ContractProvider>
      <ContractReviewLayout />
    </ContractProvider>
  );
}
