
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
import { AlertCircle, FileText, UploadCloud, FileUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function HomePage() {
  const [documentText, setDocumentText] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [reportData, setReportData] = React.useState<GeneratePlagiarismReportOutput | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCheckPlagiarism = async () => {
    if (!documentText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text or upload a document to check for plagiarism.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // setError(null); // Error state might contain the DOCX/PDF warning, let's not clear it here if it's a warning.
                    // Or, ensure this function is only called after user acknowledges the warning or if text is pasted.
                    // For now, let's clear specific operational errors but retain format warnings if they were set.
    if (error && !error.startsWith("Important:")) { // Simple check to not clear format warnings
        setError(null);
    }
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null); // Clear previous operational errors/warnings first
      setReportData(null); // Clear previous report if a new file is uploaded

      const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx");
      const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");

      if (isDocx || isPdf) {
        const warningMessage = "Important: DOCX/PDF files are allowed, but the current text extraction method is basic (reads as plain text). This can lead to highly inaccurate content for plagiarism checking. Full support for these formats is planned for a future update.";
        setError(warningMessage); // Display persistent warning
        toast({
          title: "File Format Notice",
          description: "DOCX/PDF uploaded. Text extraction accuracy will be limited with the current method.",
          variant: "default", 
          duration: 10000, // Keep toast longer
        });
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          setDocumentText(text); // This text will likely be garbled for DOCX/PDF
          // Do not show a success toast for file load if it's docx/pdf due to inaccuracy
          if (!isDocx && !isPdf) {
            toast({
              title: "File Loaded",
              description: `${file.name} has been loaded successfully.`,
            });
          } else {
             toast({
              title: "File Content Loaded (Potentially Inaccurate)",
              description: `${file.name} content read. Note: accuracy issues with DOCX/PDF.`,
              duration: 8000
            });
          }
        } catch (readError) {
          console.error("Error processing file content:", readError);
          const errorMessage = readError instanceof Error ? readError.message : "Unknown error processing file.";
          setError(`Failed to process file: ${errorMessage}`);
          toast({
            title: "Error Processing File",
            description: `Could not process the content of ${file.name}. ${errorMessage}`,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; 
          }
        }
      };
      reader.onerror = () => {
        setError(`Failed to read file: ${reader.error?.message || "Unknown error"}`);
        toast({
          title: "Error Reading File",
          description: `Could not read the file ${file.name}.`,
          variant: "destructive",
        });
        setIsLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; 
        }
      };
      reader.readAsText(file);
    }
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
            Paste your text or upload a document (.docx, .pdf) to check for plagiarism.
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
              onChange={(e) => {
                setDocumentText(e.target.value);
                if (error && error.startsWith("Important:")) setError(null); // Clear format warning if user types
              }}
              rows={10}
              className="text-base border-input focus:ring-primary focus:border-primary rounded-lg shadow-sm"
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground text-right pr-1">
              Word count: {countWords(documentText)}
            </p>
          </div>

          <div className="flex items-center my-2">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase">Or</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full py-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            aria-label="Upload a document file"
          >
            <FileUp className="mr-2 h-5 w-5" />
            Upload Document (.docx, .pdf)
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />

          {error && (
             <Alert variant={error.startsWith("Important:") ? "default" : "destructive"} className="rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{error.startsWith("Important:") ? "Notice" : "Error"}</AlertTitle>
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
            {isLoading && !reportData ? ( 
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

      {isLoading && !error && !reportData && (
        <div className="w-full max-w-2xl mt-8 flex justify-center">
           <Spinner className="h-8 w-8 text-primary" /> 
        </div>
      )}

      {reportData && (
        <div className="w-full max-w-2xl mt-8">
          <ReportDisplay reportData={reportData} />
        </div>
      )}
       <div className="mt-12 text-center w-full max-w-2xl">
          <p className="text-sm text-muted-foreground">
            Plagiax uses advanced AI to compare your text against a vast index of online content.
            Results are indicative and should be used as a guide. For DOCX/PDF, accuracy may be limited.
          </p>
        </div>
    </div>
  );
}

