
"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { generatePlagiarismReport } from "@/ai/flows/generate-plagiarism-report";
import { extractTextFromDocument } from "@/ai/flows/extract-text-from-document";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, CheckCircle, CloudUpload, Send, ChevronsRight, FileText, Info as InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useReport, type FullReportData } from "@/context/ReportContext";
import { useAuth } from "@/context/AuthContext";
import type { ReportHistoryItemSummary } from "@/types/history";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_HISTORY_ITEMS = 50;

export default function HomePage() {
  const { isAuthenticated, currentUser, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const currentPathname = usePathname();

  const [documentTitleInput, setDocumentTitleInput] = React.useState("");
  const [documentText, setDocumentText] = React.useState(""); // For textarea manual input
  const [extractedFileText, setExtractedFileText] = React.useState<string | null>(null); // For text extracted from files
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentTask, setCurrentTask] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { setReportDetails } = useReport();

  React.useEffect(() => {
    if (!authIsLoading && !isAuthenticated && !['/login', '/signup', '/about', '/terms'].includes(currentPathname || '')) {
      router.replace('/login');
    }
  }, [authIsLoading, isAuthenticated, router, currentPathname]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);
    setInfo(null);
    setDocumentText(""); 
    setExtractedFileText(null); 
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input immediately

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    
    if (file.type !== "application/pdf") {
      setError(`Invalid file type: ${file.name}. Only PDF files are supported for direct text extraction. If you have other file types, please paste the text directly.`);
      return;
    }

    setFileName(file.name);
    if (!documentTitleInput && file.name) {
      setDocumentTitleInput(file.name.split('.').slice(0, -1).join('.'));
    }

    setIsLoading(true);
    setCurrentTask("Reading file...");

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUri = e.target?.result as string;
        if (!dataUri) {
          setError("Failed to read file data.");
          setIsLoading(false);
          setCurrentTask("");
          setFileName(null);
          return;
        }

        setCurrentTask(`Extracting text from PDF: ${file.name}...`);
        toast({ title: `Processing ${file.name}`, description: "Attempting to extract text. This may take a moment." });

        try {
          const extractionResult = await extractTextFromDocument({ documentDataUri: dataUri });
          if (extractionResult && typeof extractionResult.extractedText === 'string') {
            if (extractionResult.extractedText.trim().length === 0) {
              setError(`Could not extract any text from '${file.name}'. The PDF might be image-based, empty, or password-protected. Please paste text directly if issues persist.`);
              setExtractedFileText(null);
            } else {
              setExtractedFileText(extractionResult.extractedText);
              setInfo(`PDF processed: ${file.name} is ready. Its content will be used if the text area is empty.`);
              setDocumentText(""); // Clear textarea since file content will be used
            }
          } else {
            setError("Could not extract text or the PDF is empty. Please ensure it's a text-based PDF or paste text directly.");
            setExtractedFileText(null);
          }
        } catch (extractionError: any) {
          console.error("Text extraction error:", extractionError);
          let errorMsg = `Failed to extract text from ${file.name}: ${extractionError.message || "Unknown error."}`;
           if ((extractionError.message || "").toLowerCase().includes("flow execution") || (extractionError.message || "").toLowerCase().includes("server components render")) {
            errorMsg = `Failed to extract text from ${file.name} due to a server-side issue. Please try again or paste the text.`;
          }
          setError(errorMsg);
          setExtractedFileText(null);
        } finally {
          setIsLoading(false);
          setCurrentTask("");
        }
      };
      reader.onerror = () => {
        setError(`Failed to read ${file.name}.`);
        setIsLoading(false);
        setCurrentTask("");
        setFileName(null);
        setExtractedFileText(null);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("File processing error:", err);
      setError(`An error occurred: ${err.message || "Unknown error."}`);
      setIsLoading(false);
      setCurrentTask("");
      setFileName(null);
      setExtractedFileText(null);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setInfo(null);

    let textToCheck = documentText.trim();
    let docTitleForReport = documentTitleInput.trim();
    let currentFileNameForHistory = fileName; 
    let sourceDescription = "pasted text";

    if (!textToCheck && extractedFileText && extractedFileText.trim()) {
      textToCheck = extractedFileText.trim();
      sourceDescription = `content from ${fileName || "uploaded PDF"}`;
      if (!docTitleForReport && fileName) {
        docTitleForReport = fileName.split('.').slice(0, -1).join('.') || "Uploaded PDF Document";
      }
    } else if (textToCheck) {
      if (!docTitleForReport) {
        docTitleForReport = textToCheck.substring(0, 70) + (textToCheck.length > 70 ? "..." : "") || "Pasted Text";
      }
      if (extractedFileText && textToCheck !== extractedFileText) {
        currentFileNameForHistory = null; 
      } else if (!extractedFileText) {
        currentFileNameForHistory = null; 
      }
    }
    
    if (!textToCheck) {
      setError("No text content available for plagiarism check. Please paste text or upload a supported PDF file with extractable content.");
      setIsLoading(false);
      setCurrentTask("");
      return;
    }
    if (!docTitleForReport) {
      docTitleForReport = "Untitled Document";
    }

    setIsLoading(true);
    setCurrentTask("Checking for plagiarism...");
    toast({ title: "Hold Tight!", description: "Analyzing your submission. This might take some time." });

    try {
      const aiReport = await generatePlagiarismReport({ documentText: textToCheck });

      const submissionTimestamp = Date.now();
      const submissionId = new Date(submissionTimestamp).toISOString() + Math.random().toString(36).substring(2, 9);

      const fullReportData: FullReportData = {
        aiOutput: aiReport,
        documentTitle: docTitleForReport,
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
          documentTitle: docTitleForReport,
          fileName: currentFileNameForHistory || undefined, 
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
      setError(`An error occurred during plagiarism check: ${err.message || "Please try again."}`);
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

  if (authIsLoading && !isAuthenticated && !['/login', '/signup', '/about', '/terms'].includes(currentPathname || '')) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:py-12">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Left Column */}
        <div className="space-y-6 relative">

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Plagiarism Checker
          </h1>

          <ChevronsRight className="hidden md:block absolute top-1/2 right-0 h-24 w-24 text-primary/30 transform translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Right Column - Form */}
        <div className="space-y-6 bg-card p-6 sm:p-8 rounded-xl shadow-xl border border-border transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1">
          <p className="text-base text-muted-foreground">
            Paste text directly, or upload a PDF (text will be attempted for extraction).
          </p>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {info && !error && (
             <Alert variant="default" className="border-primary/50 text-primary bg-primary/5 dark:bg-primary/10">
              <InfoIcon className="h-4 w-4 text-primary" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>{info}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="document-title-input" className="text-sm font-medium text-foreground flex items-center">
              <FileText className="mr-2 h-4 w-4 text-primary" />
              Document Title (Optional)
            </label>
            <Input
              id="document-title-input"
              type="text"
              placeholder="Enter a title for your document..."
              value={documentTitleInput}
              onChange={(e) => setDocumentTitleInput(e.target.value)}
              className="rounded-lg text-base focus:ring-primary/80 border-input"
              disabled={isLoading}
            />
          </div>

          <Textarea
            id="text-input"
            placeholder="Paste your text here..."
            value={documentText}
            onChange={(e) => {
              setDocumentText(e.target.value);
              if (error && !e.target.value.trim() && !extractedFileText) setError(null); 
              if (info) setInfo(null); 
            }}
            rows={8}
            className="rounded-lg text-base focus:ring-primary/80 border-input"
            disabled={isLoading}
          />

          <div
            className="mt-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-input rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
            onClick={triggerFileInput}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
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
              <span className="font-semibold text-primary">browse</span> your PDF file
            </p>
            <p className="text-xs text-muted-foreground mt-1">PDF up to {MAX_FILE_SIZE_MB}MB. For other file types, please paste text.</p>
            <input
              id="file-upload"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,application/pdf" 
              className="hidden"
              disabled={isLoading}
            />
          </div>
          {fileName && !isLoading && !error && !info && ( 
            <p className="text-sm text-muted-foreground flex items-center">
              <CheckCircle className="h-4 w-4 mr-1.5 shrink-0 text-green-500" />
              Selected PDF: {fileName}.
              {extractedFileText ? ` (${extractedFileText.split(/\s+/).filter(Boolean).length} words extracted). Ready for check.` : " Paste content if PDF extraction fails."}
            </p>
          )}

          {isLoading && (
             <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Spinner className="mr-2 h-4 w-4" />
                <span>{currentTask || "Processing..."}</span>
              </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isLoading || (!documentText.trim() && !extractedFileText)}
            className="w-full text-lg py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-5 w-5 animate-spin" /> {currentTask || "Processing..."}
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" /> Send
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-16 text-sm text-muted-foreground max-w-3xl mx-auto text-left md:text-center">
          Leveraging state-of-the-art artificial intelligence, Plagiax conducts comprehensive textual analysis by cross-referencing submitted documents against an expansive global content database. Our intelligent system provides nuanced originality insights, with intelligent parsing capabilities that extract and analyze core content from PDF files. Users should interpret results as a sophisticated guidance tool, recognizing the contextual nature of content similarity. For other text formats, please paste the content directly.
      </div>
    </div>
  );
}
