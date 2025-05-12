
"use client";

import type { GeneratePlagiarismReportOutput } from "@/ai/flows/generate-plagiarism-report";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, FileSearch, CheckCircle, XCircle, AlertTriangle, LinkIcon, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import * as React from "react";

interface ReportPageComponentProps {
  reportData: GeneratePlagiarismReportOutput;
  onBack: () => void;
}

const PLAGIARISM_FREE_THRESHOLD = 5; // Percentage

export default function ReportPageComponent({ reportData, onBack }: ReportPageComponentProps) {
  const { plagiarismPercentage, findings } = reportData;
  const originalPercentage = 100 - plagiarismPercentage;
  const isPlagiarismFree = plagiarismPercentage <= PLAGIARISM_FREE_THRESHOLD;


  let statusText = "";
  let statusColorClass = "";
  let StatusIcon = AlertTriangle;
  let badgeVariant: "default" | "destructive" | "secondary" | "outline" = "default";


  if (plagiarismPercentage > 50) {
    statusText = "High Plagiarism Detected";
    statusColorClass = "text-destructive";
    StatusIcon = XCircle;
    badgeVariant = "destructive";
  } else if (plagiarismPercentage > PLAGIARISM_FREE_THRESHOLD) {
    statusText = "Plagiarism Detected";
    statusColorClass = "text-yellow-500 dark:text-yellow-400"; 
    StatusIcon = AlertTriangle;
    badgeVariant = "secondary"; 
  } else {
    statusText = "Plagiarism Free";
    statusColorClass = "text-green-600 dark:text-green-400";
    StatusIcon = CheckCircle;
  }

  const getSimilarityColor = (score?: number) => {
    if (score === undefined) return "text-muted-foreground";
    if (score > 75) return "text-destructive";
    if (score > 40) return "text-yellow-500 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };


  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-3xl shadow-2xl rounded-xl">
        <CardHeader className="text-center pb-4">
           <div className={`mx-auto bg-opacity-10 p-3 rounded-full w-fit mb-4 ${isPlagiarismFree ? 'bg-green-500/10' : plagiarismPercentage > 50 ? 'bg-destructive/10' : 'bg-yellow-500/10'}`}>
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
                      <p>Overall percentage of text found similar to existing sources.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h3>
              <p className={`text-5xl font-bold ${plagiarismPercentage > PLAGIARISM_FREE_THRESHOLD ? statusColorClass : 'text-green-600 dark:text-green-400'}`}>
                {plagiarismPercentage.toFixed(1)}%
              </p>
            </div>
            <div>
              <h3 className="text-xs uppercase text-muted-foreground tracking-wider mb-1">Originality</h3>
              <p className={`text-5xl font-bold ${originalPercentage < (100 - PLAGIARISM_FREE_THRESHOLD) ? statusColorClass : 'text-green-600 dark:text-green-400'}`}>
                {originalPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
          
          <Progress 
            value={plagiarismPercentage} 
            className={`h-3 rounded-full ${isPlagiarismFree ? 'bg-green-200 dark:bg-green-700 [&>div]:bg-green-500' : plagiarismPercentage > 50 ? 'bg-red-200 dark:bg-red-700 [&>div]:bg-destructive' : 'bg-yellow-200 dark:bg-yellow-700 [&>div]:bg-yellow-500'}`}
            aria-label={`Plagiarism percentage: ${plagiarismPercentage.toFixed(1)}%`}
          />
          
          {findings && findings.length > 0 && (
            <div className="pt-4">
              <Separator className="my-4" />
              <h3 className="text-xl font-semibold mb-3 text-center md:text-left">Detailed Findings</h3>
              <Accordion type="single" collapsible className="w-full">
                {findings.map((finding, index) => (
                  <AccordionItem value={`item-${index}`} key={index} data-radix-accordion-item className="border-border rounded-lg mb-3 shadow-sm hover:shadow-md transition-shadow bg-card">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate text-sm font-medium max-w-[calc(100%-8rem)] sm:max-w-[calc(100%-6rem)]">
                          Match #{index + 1}: "{finding.snippetFromDocument.substring(0,40)}..."
                        </span>
                        {finding.similarityScore !== undefined && (
                           <Badge variant={
                            finding.similarityScore > 75 ? "destructive" :
                            finding.similarityScore > 40 ? "secondary" : 
                            "default" 
                          } className={`ml-auto ${getSimilarityColor(finding.similarityScore)}`}>
                            {finding.similarityScore.toFixed(0)}% Similar
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-3 text-sm">
                      <div>
                        <h4 className="font-semibold text-muted-foreground mb-1">Matched Snippet from Your Document:</h4>
                        <p className="p-2 bg-muted/50 rounded-md border border-dashed border-border text-foreground italic">"{finding.snippetFromDocument}"</p>
                      </div>
                      {finding.sourceSnippet && (
                         <div>
                          <h4 className="font-semibold text-muted-foreground mb-1">Potential Source Snippet:</h4>
                          <p className="p-2 bg-muted/50 rounded-md border border-dashed border-border text-foreground italic">"{finding.sourceSnippet}"</p>
                        </div>
                      )}
                      {finding.sourceURL && (
                        <div className="flex items-center">
                           <LinkIcon className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                          <a 
                            href={finding.sourceURL} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline truncate flex-grow break-all"
                          >
                            {finding.sourceURL}
                          </a>
                          <ExternalLink className="h-4 w-4 ml-1 text-muted-foreground flex-shrink-0" />
                        </div>
                      )}
                       {!finding.sourceURL && !finding.sourceSnippet && (
                        <p className="text-muted-foreground text-xs">Source information not available for this match.</p>
                       )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
           {findings && findings.length === 0 && !isPlagiarismFree && (
             <div className="pt-4 text-center">
                <Separator className="my-4" />
                <p className="text-muted-foreground">While an overall similarity percentage was detected, specific matching snippets could not be detailed by the AI.</p>
             </div>
           )}


        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 p-6 pt-6 border-t border-border mt-4">
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto text-base py-3 rounded-lg">
            <FileSearch className="mr-2 h-5 w-5" /> Check Another
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

