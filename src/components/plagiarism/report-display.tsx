"use client";

import type { GeneratePlagiarismReportOutput } from "@/ai/flows/generate-plagiarism-report";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ReportDisplayProps {
  reportData: GeneratePlagiarismReportOutput | null;
}

export function ReportDisplay({ reportData }: ReportDisplayProps) {
  if (!reportData) {
    return null;
  }

  const { plagiarismPercentage, report } = reportData;
  const originalPercentage = 100 - plagiarismPercentage;

  let similarTextColor = "text-green-600 dark:text-green-400";
  let messageText = "Well done, your text is unique!";
  let messageTextColor = "text-green-600 dark:text-green-400";

  if (plagiarismPercentage >= 70) {
    similarTextColor = "text-destructive"; // Red
    messageText = "High level of similarity found. Thorough review required.";
    messageTextColor = "text-destructive";
  } else if (plagiarismPercentage >= 30) {
    similarTextColor = "text-yellow-500 dark:text-yellow-400"; // Yellow/Amber
    messageText = "Moderate level of similarity found. Review recommended.";
    messageTextColor = "text-yellow-500 dark:text-yellow-400";
  } else if (plagiarismPercentage > 0) { // Slight modification for any similarity
    similarTextColor = "text-green-600 dark:text-green-400"; // Still green for low similarity
    messageText = "Low level of similarity found.";
    messageTextColor = "text-green-600 dark:text-green-400";
  }


  return (
    <Card className="w-full shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Plagiarism Report</CardTitle>
        <CardDescription>Detailed analysis of the submitted text.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6 text-center md:text-left">
          <div>
            <h3 className="text-xs uppercase text-muted-foreground tracking-wider mb-1">SIMILAR</h3>
            <p className={`text-5xl font-bold ${similarTextColor}`}>
              {plagiarismPercentage.toFixed(1)}%
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button aria-label="Information about similar percentage" className="ml-2 p-1 inline-block align-middle rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <Info className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    <p>Percentage of text found similar to existing sources.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
          </div>
          <div>
            <h3 className="text-xs uppercase text-muted-foreground tracking-wider mb-1">ORIGINAL</h3>
            <p className="text-5xl font-bold text-green-600 dark:text-green-400">
              {originalPercentage.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="text-center mb-2">
          <p className={`text-xl font-medium ${messageTextColor}`}>
            {messageText}
          </p>
        </div>
        
        <Progress value={plagiarismPercentage} className="h-2.5" />
        
        <Separator className="my-6" />

        <div>
          <h3 className="text-lg font-medium mb-2">Detailed Report</h3>
          <div className="p-4 border rounded-md bg-muted/50 max-h-96 overflow-y-auto prose dark:prose-invert prose-sm sm:prose-base">
            <pre className="whitespace-pre-wrap text-foreground leading-relaxed">{report || "No detailed report available."}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
