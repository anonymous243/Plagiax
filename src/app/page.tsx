
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
import { AlertCircle, CheckCircle, CloudUpload, Send, ChevronsRight, FileText } from "lucide-react";
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
      setError("No file selected.");
      setFileName(null);
      setExtractedFileText(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFileName(null);
      setExtractedFileText(null);
      return;
    }
    
    const allowedMimeTypes = [
      "application/pdf", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // DOCX
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      setError(`Invalid file type. Please upload a PDF or DOCX file.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFileName(null);
      setExtractedFileText(null);
      return;
    }

    setError(null);
    setDocumentText(""); // Clear textarea, as it's for manual input now
    setExtractedFileText(null); // Clear previously extracted text
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
          if (fileInputRef.current) fileInputRef.current.value = "";
          setFileName(null);
          setExtractedFileText(null);
          return;
        }

        setCurrentTask("Extracting text from file...");
        toast({ title: "Processing File", description: "Attempting to extract text. This may take a moment." });
        
        try {
          const extractionResult = await extractTextFromDocument({ documentDataUri: dataUri });
          if (extractionResult && typeof extractionResult.extractedText === 'string') {
            setExtractedFileText(extractionResult.extractedText); // Store extracted text separately
            toast({
              title: "File Processed",
              description: `${file.name} is ready for plagiarism check.`,
              variant: "default",
            });
          } else {
            let specificError = "Could not extract text or document is empty.";
            setError(specificError);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setFileName(null);
            setExtractedFileText(null);
          }
        } catch (extractionError: any) {
          console.error("Text extraction error:", extractionError);
          let errorMsg = `Failed to extract text: ${extractionError.message || "Unknown error."}`;
          if (extractionError.message && extractionError.message.toLowerCase().includes("not supported")) {
              errorMsg = `The AI model may not support direct text extraction for '${file.type}'. If issues persist, please paste the text directly.`;
          } else if ((extractionError.message || "").toLowerCase().includes("server component") || (extractionError.message || "").toLowerCase().includes("flow execution")) {
              errorMsg = "Failed to extract text due to a server-side issue. Please try again or paste the text.";
          }
          setError(errorMsg);
          if (fileInputRef.current) fileInputRef.current.value = "";
          setFileName(null);
          setExtractedFileText(null);
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
        setExtractedFileText(null);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("File processing error:", err);
      setError(`An error occurred: ${err.message || "Unknown error."}`);
      setIsLoading(false);
      setCurrentTask("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFileName(null);
      setExtractedFileText(null);
    }
  };

  const handleSubmit = async () => {
    let textToCheck = documentText.trim(); // Text from textarea
    let docTitleForReport = documentTitleInput.trim();
    let currentFileNameForHistory = fileName; // Last selected/processed file name
    let sourceDescription = "pasted text";

    // If textarea is empty, try using text extracted from a file
    if (!textToCheck && extractedFileText && extractedFileText.trim()) {
      textToCheck = extractedFileText.trim();
      sourceDescription = `content from ${fileName || "uploaded file"}`;
      if (!docTitleForReport && fileName) { // If no manual title, use filename for title
        docTitleForReport = fileName.split('.').slice(0, -1).join('.') || "Uploaded Document";
      }
    } else if (textToCheck) { // Text from textarea is primary
      if (!docTitleForReport) { // If no manual title, generate from pasted text
        docTitleForReport = textToCheck.substring(0, 70) + (textToCheck.length > 70 ? "..." : "") || "Pasted Text";
      }
      // If using pasted text, should `currentFileNameForHistory` be cleared or kept?
      // Keeping it indicates a file *might* have been selected, even if its content wasn't used.
      // For clarity, if pasted text is used, let's make fileName in history undefined for this check.
      if (sourceDescription === "pasted text") {
        currentFileNameForHistory = null; 
      }
    }

    if (!textToCheck) {
      setError("Please paste text directly or upload a PDF/DOCX file from which text can be extracted.");
      setIsLoading(false);
      setCurrentTask("");
      return;
    }
    if (!docTitleForReport) { 
        docTitleForReport = "Untitled Document";
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
        documentTitle: docTitleForReport,
        documentTextContent: textToCheck, // The actual text used for the check
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
            Paste text directly, or upload a PDF/DOCX file (text will be extracted for checking).
          </p>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
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
              if (error) setError(null); // Clear error when user types in textarea
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
              <span className="font-semibold text-primary">browse</span> your files
            </p>
            <p className="text-xs text-muted-foreground mt-1">PDF or DOCX. Up to {MAX_FILE_SIZE_MB}MB.</p>
            <input
              id="file-upload"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              disabled={isLoading}
            />
          </div>
          {fileName && !isLoading && !error && ( 
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <CheckCircle className="h-4 w-4 mr-1.5 shrink-0" /> 
              File: {fileName} {extractedFileText ? ` (processed, ${extractedFileText.split(/\s+/).filter(Boolean).length} words)` : '(selected)'}
            </p>
          )}
           {fileName && !isLoading && error && error.includes(fileName) && ( // Show filename if error relates to it
            <p className="text-sm text-destructive flex items-center">
              <AlertCircle className="h-4 w-4 mr-1.5 shrink-0" />
              Selected: {fileName}
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
            disabled={isLoading || (!documentText.trim() && (!extractedFileText || !extractedFileText.trim()))}
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
          Leveraging state-of-the-art artificial intelligence, Plagiax conducts comprehensive textual analysis by cross-referencing submitted documents against an expansive global content database. Our intelligent system provides nuanced originality insights, with intelligent parsing capabilities that extract and analyze core content from diverse file formats including DOCX and PDF. Users should interpret results as a sophisticated guidance tool, recognizing the contextual nature of content similarity.
      </div>
    </div>
  );
}
    

    

    