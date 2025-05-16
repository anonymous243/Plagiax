
"use client";
import type { GeneratePlagiarismReportOutput } from "@/ai/flows/generate-plagiarism-report";
import { createContext, useContext, useState, ReactNode } from "react";

export interface FullReportData {
  aiOutput: GeneratePlagiarismReportOutput;
  documentTitle: string;
  documentTextContent: string; // Full text for word count etc.
  submissionTimestamp: number;
  submissionId: string;
  // Consider adding fileName if different from documentTitle, and originalFileType if needed later
}

interface ReportContextType {
  reportDetails: FullReportData | null;
  setReportDetails: (data: FullReportData | null) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider = ({ children }: { children: ReactNode }) => {
  const [reportDetails, setReportDetails] = useState<FullReportData | null>(null);
  return (
    <ReportContext.Provider value={{ reportDetails, setReportDetails }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error("useReport must be used within a ReportProvider");
  }
  return context;
};
