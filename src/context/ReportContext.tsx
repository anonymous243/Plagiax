"use client";
import type { GeneratePlagiarismReportOutput } from "@/ai/flows/generate-plagiarism-report";
import { createContext, useContext, useState, ReactNode } from "react";

interface ReportContextType {
  reportData: GeneratePlagiarismReportOutput | null;
  setReportData: (data: GeneratePlagiarismReportOutput | null) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider = ({ children }: { children: ReactNode }) => {
  const [reportData, setReportData] = useState<GeneratePlagiarismReportOutput | null>(null);
  return (
    <ReportContext.Provider value={{ reportData, setReportData }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => {
  const context = useContext(ReportContext);
  if (context === undefined) { // Check for undefined explicitly
    throw new Error("useReport must be used within a ReportProvider");
  }
  return context;
};
