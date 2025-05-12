"use client";

import * as React from "react";
import { generatePlagiarismReport, type GeneratePlagiarismReportOutput } from "@/ai/flows/generate-plagiarism-report";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ReportDisplay } from "@/components/plagiarism/report-display";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, FileText, UploadCloud } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function HomePage() {
  const [documentText, setDocumentText] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [reportData, setReportData] = React.useState<GeneratePlagiarismReportOutput | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleCheckPlagiarism = async () => {
    if (!documentText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text to check for plagiarism.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setReportData(null);

    try {
      const result = await generatePlagiarismReport({ documentText });
      setReportData(result);
      toast({
        title: "Report Generated",
        description: "Plagiarism check completed successfully.",
      });
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to generate report: ${errorMessage}`);
      toast({
        title: "Error",
        description: `Failed to generate report: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const countWords = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-2xl shadow-2xl rounded-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Plagiarism Checker</CardTitle>
          <CardDescription className="text-md text-muted-foreground">
            Paste your text below to check for plagiarism using our AI-powered tool.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid w-full gap-2">
            <Label htmlFor="document-text" className="text-base font-medium">
              Enter your text
            </Label>
            <Textarea
              id="document-text"
              placeholder="Paste your document content here..."
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              rows={10}
              className="text-base border-input focus:ring-primary focus:border-primary rounded-lg shadow-sm"
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground text-right pr-1">
              Word count: {countWords(documentText)}
            </p>
          </div>
          {error && (
             <Alert variant="destructive" className="rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleCheckPlagiarism}
            disabled={isLoading || !documentText.trim()}
            className="w-full text-lg py-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-5 w-5" /> Checking...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-5 w-5" /> Check for Plagiarism
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {reportData && (
        <div className="w-full max-w-2xl mt-8">
          <ReportDisplay reportData={reportData} />
        </div>
      )}
       <div className="mt-12 text-center w-full max-w-2xl">
          <p className="text-sm text-muted-foreground">
            Plagiax uses advanced AI to compare your text against a vast index of online content.
            Results are indicative and should be used as a guide.
          </p>
        </div>
    </div>
  );
}
