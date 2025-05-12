"use client";

import type { GeneratePlagiarismReportOutput } from "@/ai/flows/generate-plagiarism-report";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ReportDisplayProps {
  reportData: GeneratePlagiarismReportOutput | null;
}

export function ReportDisplay({ reportData }: ReportDisplayProps) {
  if (!reportData) {
    return null;
  }

  const { plagiarismPercentage, report } = reportData;

  let progressColorClass = "bg-green-500";
  let percentageBadgeVariant: "default" | "secondary" | "destructive" | "outline" = "default";
  if (plagiarismPercentage >= 70) {
    progressColorClass = "bg-red-500";
    percentageBadgeVariant = "destructive";
  } else if (plagiarismPercentage >= 30) {
    progressColorClass = "bg-yellow-500";
    percentageBadgeVariant = "secondary"; // Using secondary for yellow-ish
  }


  return (
    <Card className="w-full shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Plagiarism Report</CardTitle>
        <CardDescription>Detailed analysis of the submitted text.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Plagiarism Percentage</h3>
            <Badge variant={percentageBadgeVariant} className="text-lg px-3 py-1">
              {plagiarismPercentage.toFixed(2)}%
            </Badge>
          </div>
          <Progress value={plagiarismPercentage} className={`h-3 [&>div]:${progressColorClass}`} />
           <p className="text-sm text-muted-foreground mt-1">
            {plagiarismPercentage === 0 ? "No plagiarism detected." :
             plagiarismPercentage < 30 ? "Low level of similarity found." :
             plagiarismPercentage < 70 ? "Moderate level of similarity found." :
             "High level of similarity found. Review recommended."}
          </p>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Detailed Report</h3>
          <div className="p-4 border rounded-md bg-muted/50 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{report}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
