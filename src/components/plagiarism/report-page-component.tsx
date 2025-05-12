
"use client";

import type { GeneratePlagiarismReportOutput } from "@/ai/flows/generate-plagiarism-report";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, FileSearch, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface ReportPageComponentProps {
  reportData: GeneratePlagiarismReportOutput;
  onBack: () => void;
}

const PLAGIARISM_FREE_THRESHOLD = 5; // Percentage

export default function ReportPageComponent({ reportData, onBack }: ReportPageComponentProps) {
  const { plagiarismPercentage } = reportData; // Removed 'report' as it's no longer used
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
          
          {/* Detailed Findings section and Separator removed */}

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-6"> {/* Centered the remaining button */}
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto text-base py-3">
            <FileSearch className="mr-2 h-5 w-5" /> Check Another Document
          </Button>
          {/* Download Report button removed */}
        </CardFooter>
      </Card>
    </div>
  );
}
