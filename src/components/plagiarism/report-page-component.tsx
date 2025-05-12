"use client";

import type { GeneratePlagiarismReportOutput } from "@/ai/flows/generate-plagiarism-report";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, Download, FileSearch, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface ReportPageComponentProps {
  reportData: GeneratePlagiarismReportOutput;
  onBack: () => void;
}

const PLAGIARISM_FREE_THRESHOLD = 5; // Percentage

export default function ReportPageComponent({ reportData, onBack }: ReportPageComponentProps) {
  const { plagiarismPercentage, report } = reportData;
  const originalPercentage = 100 - plagiarismPercentage;
  const isPlagiarismFree = plagiarismPercentage <= PLAGIARISM_FREE_THRESHOLD;

  let statusText = "";
  let statusColorClass = "";
  let StatusIcon = AlertTriangle;

  if (plagiarismPercentage > 50) {
    statusText = "High Plagiarism Detected";
    statusColorClass = "text-destructive";
    StatusIcon = XCircle;
  } else if (plagiarismPercentage > PLAGIARISM_FREE_THRESHOLD) {
    statusText = "Plagiarism Detected";
    statusColorClass = "text-yellow-500 dark:text-yellow-400";
    StatusIcon = AlertTriangle;
  } else {
    statusText = "Plagiarism Free";
    statusColorClass = "text-green-600 dark:text-green-400";
    StatusIcon = CheckCircle;
  }

  const handleDownloadReport = () => {
    const reportContent = `
Plagiarism Report
-----------------------------------
Status: ${statusText}
Similarity Percentage: ${plagiarismPercentage.toFixed(1)}%
Originality Percentage: ${originalPercentage.toFixed(1)}%
-----------------------------------

Detailed Findings:
${report || "No detailed findings available."}
    `;
    const blob = new Blob([reportContent.trim()], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "plagiarism_report.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-3xl shadow-2xl rounded-xl">
        <CardHeader className="text-center">
           <div className={`mx-auto bg-opacity-10 p-3 rounded-full w-fit mb-4 ${isPlagiarismFree ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
            <StatusIcon className={`h-12 w-12 ${statusColorClass}`} />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Plagiarism Report</CardTitle>
          <CardDescription className={`text-xl font-medium ${statusColorClass}`}>
            {statusText}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6 text-center md:text-left">
            <div>
              <h3 className="text-xs uppercase text-muted-foreground tracking-wider mb-1">
                Similarity
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button aria-label="Information about similar percentage" className="ml-1.5 p-0.5 inline-block align-middle rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <Info className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      <p>Percentage of text found similar to existing sources.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h3>
              <p className={`text-5xl font-bold ${plagiarismPercentage > PLAGIARISM_FREE_THRESHOLD ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
                {plagiarismPercentage.toFixed(1)}%
              </p>
            </div>
            <div>
              <h3 className="text-xs uppercase text-muted-foreground tracking-wider mb-1">Originality</h3>
              <p className={`text-5xl font-bold ${originalPercentage < (100 - PLAGIARISM_FREE_THRESHOLD) ? 'text-yellow-500 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                {originalPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
          
          <Progress value={plagiarismPercentage} className="h-3" 
            aria-label={`Plagiarism percentage: ${plagiarismPercentage.toFixed(1)}%`}
          />
          
          <Separator className="my-6" />

          <div>
            <h3 className="text-xl font-semibold mb-3 text-center md:text-left">Detailed Findings</h3>
            <ScrollArea className="h-72 w-full rounded-md border p-4 bg-muted/30 shadow-inner">
              <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                {report || "No detailed findings were provided by the AI."}
              </pre>
            </ScrollArea>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto text-base py-3">
            <FileSearch className="mr-2 h-5 w-5" /> Check Another Document
          </Button>
          <Button onClick={handleDownloadReport} className="w-full sm:w-auto text-base py-3">
            <Download className="mr-2 h-5 w-5" /> Download Report
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
