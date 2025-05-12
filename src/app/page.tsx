
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { generatePlagiarismReport } from "@/ai/flows/generate-plagiarism-report";
import { extractTextFromDocument } from "@/ai/flows/extract-text-from-document";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, FileText, FileUp, CheckCircle, Brain } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useReport } from "@/context/ReportContext";
import { useAuth } from "@/context/AuthContext";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function HomePage() {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  
  const [documentText, setDocumentText] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false); // For plagiarism check / file processing
  const [currentTask, setCurrentTask] = React.useState<string>(""); 
  const [error, setError] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { setReportData } = useReport();

  React.useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authIsLoading, isAuthenticated, router]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError("No file selected.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear the input
      }
      setFileName(null);
      return;
    }

    const allowedTypes = [
      "application/pdf", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // DOCX
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a DOCX or PDF file.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFileName(null);
      return;
    }

    setError(null);
    setIsLoading(true);
    setCurrentTask("Reading file...");
    setFileName(file.name);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUri = e.target?.result as string;
        if (!dataUri) {
          setError("Failed to read file data.");
          setIsLoading(false);
          setCurrentTask("");
          if (fileInputRef.current) fileInputRef.current.value = "";
          setFileName(null);
          return;
        }

        setCurrentTask("Extracting text from document...");
        toast({ title: "Processing Document", description: "Extracting text from your document. This may take a moment." });
        
        try {
          const extractionResult = await extractTextFromDocument({ documentDataUri: dataUri });
          if (extractionResult && extractionResult.extractedText) {
            setDocumentText(extractionResult.extractedText);
            toast({
              title: "Text Extracted Successfully",
              description: "You can now check for plagiarism.",
              variant: "default",
            });
          } else {
            setError("Could not extract text from the document or the document body is empty.");
            setDocumentText(""); // Clear any previous text
            if (fileInputRef.current) fileInputRef.current.value = "";
            setFileName(null);
          }
        } catch (extractionError: any) {
          console.error("Text extraction error:", extractionError);
          setError(`Failed to extract text: ${extractionError.message || "Unknown error during extraction."}`);
          setDocumentText("");
          if (fileInputRef.current) fileInputRef.current.value = "";
          setFileName(null);
        } finally {
          setIsLoading(false);
          setCurrentTask("");
        }
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        setIsLoading(false);
        setCurrentTask("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setFileName(null);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("File processing error:", err);
      setError(`An error occurred while processing the file: ${err.message || "Unknown error."}`);
      setIsLoading(false);
      setCurrentTask("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFileName(null);
    }
  };

  const handleSubmit = async () => {
    if (!documentText.trim() && !fileName) {
      setError("Please upload a document or paste text to check for plagiarism.");
      return;
    }
    if (!documentText.trim() && fileName) { // File was uploaded but text extraction might have failed or is empty
      setError("No text content to check. Please ensure the document has extractable text or paste text directly.");
      return;
    }


    setError(null);
    setIsLoading(true);
    setCurrentTask("Checking for plagiarism...");
    toast({ title: "Hold Tight!", description: "Analyzing your document for plagiarism. This might take some time." });

    try {
      const report = await generatePlagiarismReport({ documentText });
      setReportData(report);
      router.push("/report");
      toast({
        title: "Analysis Complete!",
        description: "Your plagiarism report is ready.",
        variant: "default",
        className: "bg-green-500 text-white dark:bg-green-600"
      });
    } catch (err: any) {
      console.error("Plagiarism check error:", err);
      setError(`An error occurred during plagiarism check: ${err.message || "Please try again."}`);
      toast({
        title: "Analysis Failed",
        description: `Could not generate plagiarism report: ${err.message || "Please try again."}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCurrentTask("");
    }
  };

  const handleClear = () => {
    setDocumentText("");
    setError(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
    toast({ description: "Content cleared." });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (authIsLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  // If not authenticated and auth loading is finished, useEffect would have redirected.
  // So, if we reach here and !isAuthenticated, it's an edge case or during the brief moment before redirect.
  // The main protection is the useEffect.
  
  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center">
      <Card className="w-full max-w-2xl shadow-2xl rounded-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold tracking-tight text-primary">
            Plagiarism Checker
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2 px-4">
            Leveraging state-of-the-art artificial intelligence, Plagiax conducts comprehensive textual analysis by cross-referencing submitted documents against an expansive global content database. Our intelligent system provides nuanced originality insights, with intelligent parsing capabilities that extract and analyze core content from diverse file formats including DOCX and PDF. Users should interpret results as a sophisticated guidance tool, recognizing the contextual nature of content similarity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="file-upload" className="text-base font-medium">Upload Document (DOCX, PDF)</Label>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={triggerFileInput} 
                disabled={isLoading}
                className="flex-grow justify-start text-left text-muted-foreground hover:text-foreground"
              >
                <FileUp className="mr-2 h-5 w-5 text-primary" />
                {fileName || "Choose a file..."}
              </Button>
              <input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".docx,.pdf"
                className="hidden"
                disabled={isLoading}
              />
            </div>
             {fileName && !isLoading && (
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                <CheckCircle className="h-4 w-4 mr-1.5" /> Selected: {fileName}
              </p>
            )}
          </div>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-border" />
            <span className="mx-3 text-sm text-muted-foreground">OR</span>
            <hr className="flex-grow border-border" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="text-input" className="text-base font-medium">Paste Text</Label>
            <Textarea
              id="text-input"
              placeholder="Paste your text here to check for plagiarism..."
              value={documentText}
              onChange={(e) => {
                setDocumentText(e.target.value);
                if (e.target.value && fileName) { // If user starts typing, deselect file
                  setFileName(null);
                  if(fileInputRef.current) fileInputRef.current.value = "";
                }
              }}
              rows={10}
              className="rounded-lg text-base focus:ring-primary/80"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Max characters: 100,000. If you paste text, any uploaded file will be deselected.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 p-6 border-t border-border pt-6">
          <Button 
            variant="outline" 
            onClick={handleClear} 
            disabled={isLoading}
            className="w-full sm:w-auto text-base py-3 rounded-lg"
          >
            Clear
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || (!documentText.trim() && !fileName)}
            className="w-full sm:w-auto text-base py-3 rounded-lg bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-5 w-5" /> {currentTask || "Processing..."}
              </>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" /> Check Plagiarism
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    