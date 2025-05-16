
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { generatePlagiarismReport } from "@/ai/flows/generate-plagiarism-report";
import { extractTextFromDocument } from "@/ai/flows/extract-text-from-document";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, CheckCircle, CloudUpload, Send, ChevronsRight } from "lucide-react"; // Changed FileText to Send, FileUp to CloudUpload
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useReport, type FullReportData } from "@/context/ReportContext";
import { useAuth } from "@/context/AuthContext";
import type { ReportHistoryItemSummary } from "@/types/history";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_HISTORY_ITEMS = 50;

export default function HomePage() {
  const { isAuthenticated, currentUser, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  
  const [documentText, setDocumentText] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [currentTask, setCurrentTask] = React.useState<string>(""); 
  const [error, setError] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { setReportDetails } = useReport();

  React.useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authIsLoading, isAuthenticated, router]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError("No file selected.");
      setFileName(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFileName(null);
      return;
    }

    const allowedTypes = [
      "application/pdf", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // DOCX
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a DOCX or PDF file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFileName(null);
      return;
    }

    setError(null);
    setIsLoading(true);
    setCurrentTask("Reading file...");
    setFileName(file.name);
    setDocumentText(""); // Clear pasted text if a file is chosen

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

        setCurrentTask("Extracting text...");
        toast({ title: "Processing Document", description: "Extracting text. This may take a moment." });
        
        try {
          const extractionResult = await extractTextFromDocument({ documentDataUri: dataUri });
          if (extractionResult && extractionResult.extractedText) {
            // Set documentText with extracted content, useful if user wants to see it (though it's not directly shown in this UI)
            // setDocumentText(extractionResult.extractedText); 
            toast({
              title: "File Ready",
              description: `${file.name} is ready to be checked.`,
              variant: "default",
            });
          } else {
            setError("Could not extract text or document is empty.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            setFileName(null);
          }
        } catch (extractionError: any) {
          console.error("Text extraction error:", extractionError);
          setError(`Failed to extract text: ${extractionError.message || "Unknown error."}`);
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
      setError(`An error occurred: ${err.message || "Unknown error."}`);
      setIsLoading(false);
      setCurrentTask("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFileName(null);
    }
  };

  const handleSubmit = async () => {
    let textToCheck = documentText;
    let docTitle = fileName || "Pasted Text";

    if (!fileName && !documentText.trim()) {
      setError("Please paste text or upload a document to check.");
      return;
    }
    
    if (fileName && !documentText.trim()) { // File is selected, but no text extracted yet or error during extraction
        // We need to re-extract if the user didn't paste text
        const file = fileInputRef.current?.files?.[0];
        if (file) {
            setIsLoading(true);
            setCurrentTask("Preparing file...");
            try {
                const dataUri = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                const extractionResult = await extractTextFromDocument({ documentDataUri: dataUri });
                if (!extractionResult || !extractionResult.extractedText) {
                    setError("Could not extract text from the selected file for checking.");
                    setIsLoading(false);
                    setCurrentTask("");
                    return;
                }
                textToCheck = extractionResult.extractedText;
            } catch (e: any) {
                 setError(`Error processing file for submission: ${e.message}`);
                 setIsLoading(false);
                 setCurrentTask("");
                 return;
            }
        } else if (!textToCheck.trim()){ // No file and no text
            setError("No content to check. Please upload a file or paste text.");
            setIsLoading(false);
            setCurrentTask("");
            return;
        }
    } else if (documentText.trim()){
        docTitle = documentText.substring(0, 70) + (documentText.length > 70 ? "..." : "");
    }


    if (!textToCheck.trim()) {
        setError("No text content available for plagiarism check. Please ensure your file has extractable text or paste text directly.");
        setIsLoading(false);
        setCurrentTask("");
        return;
    }


    setError(null);
    setIsLoading(true);
    setCurrentTask("Checking for plagiarism...");
    toast({ title: "Hold Tight!", description: "Analyzing your submission. This might take some time." });

    try {
      const aiReport = await generatePlagiarismReport({ documentText: textToCheck });
      
      const submissionTimestamp = Date.now();
      const submissionId = new Date(submissionTimestamp).toISOString() + Math.random().toString(36).substring(2, 9);
      
      const fullReportData: FullReportData = {
        aiOutput: aiReport,
        documentTitle: docTitle,
        documentTextContent: textToCheck,
        submissionTimestamp: submissionTimestamp,
        submissionId: submissionId,
      };
      setReportDetails(fullReportData);

      if (isAuthenticated && currentUser) {
        const historyItem: ReportHistoryItemSummary = {
          id: submissionId,
          timestamp: submissionTimestamp,
          plagiarismPercentage: aiReport.plagiarismPercentage,
          documentTitle: docTitle,
          fileName: fileName || undefined,
        };
        try {
          const historyKey = `plagiax_history_${currentUser.email}`;
          const existingHistoryString = localStorage.getItem(historyKey);
          const existingHistory: ReportHistoryItemSummary[] = existingHistoryString ? JSON.parse(existingHistoryString) : [];
          const updatedHistory = [historyItem, ...existingHistory].slice(0, MAX_HISTORY_ITEMS);
          localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
        } catch (e) {
          console.error("Failed to save report to history:", e);
        }
      }

      router.push("/report");
      toast({
        title: "Analysis Complete!",
        description: "Your plagiarism report is ready.",
        variant: "default",
        className: "bg-green-500 text-white dark:bg-green-600"
      });
    } catch (err: any) {
      console.error("Plagiarism check error:", err);
      setError(`An error occurred: ${err.message || "Please try again."}`);
      toast({
        title: "Analysis Failed",
        description: `Could not generate report: ${err.message || "Please try again."}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCurrentTask("");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (authIsLoading && !isAuthenticated) { // Show spinner only if not authenticated and auth is loading
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 md:py-16">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Left Column */}
        <div className="space-y-6 relative">
          <span className="inline-block bg-secondary text-secondary-foreground px-3 py-1 text-sm font-medium rounded-full">
            #1 for students
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Plagiarism Checker
          </h1>
          <p className="text-lg text-muted-foreground">
            Our plagiarism checker detects similarities in your text against a vast online database.
          </p>
          {/* Placeholder for swirl - using a Lucide icon for now */}
          <ChevronsRight className="hidden md:block absolute top-1/2 right-0 h-24 w-24 text-primary/30 transform translate-x-1/2 -translate-y-1/2" />

           {/* Simplified Swirl SVG - uncomment to use, might need positioning adjustments */}
           {/* 
            <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="hidden md:block absolute -bottom-10 -left-10 opacity-50">
              <path d="M10 90C20 70 40 30 60 30C80 30 90 70 110 90" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M105 85L110 90L105 95" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
           */}
        </div>

        {/* Right Column - Form */}
        <div className="space-y-6 bg-card p-6 sm:p-8 rounded-xl shadow-xl border border-border">
          <p className="text-base text-muted-foreground">
            Please provide your text or upload a document to check for plagiarism.
          </p>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Textarea
            id="text-input"
            placeholder="Paste your text here..."
            value={documentText}
            onChange={(e) => {
              setDocumentText(e.target.value);
              if (e.target.value && fileName) { // If user types, deselect file
                setFileName(null);
                if(fileInputRef.current) fileInputRef.current.value = "";
              }
            }}
            rows={8}
            className="rounded-lg text-base focus:ring-primary/80 border-input"
            disabled={isLoading}
          />

          <div 
            className="mt-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-input rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
            onClick={triggerFileInput}
            onDragOver={(e) => e.preventDefault()} // Basic drag over
            onDrop={(e) => { // Basic drop, delegates to file input
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    if (fileInputRef.current) {
                        fileInputRef.current.files = e.dataTransfer.files;
                        const changeEvent = new Event('change', { bubbles: true });
                        fileInputRef.current.dispatchEvent(changeEvent);
                    }
                }
            }}
          >
            <CloudUpload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Drag and drop or{' '}
              <span className="font-semibold text-primary">browse</span> your files
            </p>
            <p className="text-xs text-muted-foreground mt-1">DOCX, PDF up to {MAX_FILE_SIZE_MB}MB</p>
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
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <CheckCircle className="h-4 w-4 mr-1.5 shrink-0" /> Selected: {fileName}
            </p>
          )}

          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || (!documentText.trim() && !fileName)}
            className="w-full text-lg py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-5 w-5" /> {currentTask || "Processing..."}
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" /> Send
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

