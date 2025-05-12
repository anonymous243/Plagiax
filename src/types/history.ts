
export interface ReportHistoryItemSummary {
  id: string;
  timestamp: number;
  plagiarismPercentage: number;
  documentTitle: string;
  fileName?: string;
}
