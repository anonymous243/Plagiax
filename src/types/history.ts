
export interface ReportHistoryItemSummary {
  id: string;
  timestamp: number;
  plagiarismPercentage: number;
  documentTitle: string;
  fileName?: string; // Ensure fileName is part of the type
}
