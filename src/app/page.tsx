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
import { AlertCircle, FileText, FileUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useReport } from "@/context/ReportContext";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

export default function HomePage() {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  
  const [documentText, setDocumentText] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false); // For plagiarism check / file processing
  const [currentTask, setCurrentTask] = React.useState<string>(""); 
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { setReportData } = useReport();

  React.useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace('/login'); 
    }
  }, [isAuthenticated, authIsLoading, router]);

  if (authIsLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

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
    setCurrentTask("Checking for plagiarism...");
    setError(null);
    setReportData(null);

    try {
      const result = await generatePlagiarismReport({ documentText });
      setReportData(result); 
      toast({
        title: "Report Generated",
        description: "Plagiarism check completed. Redirecting to report page...",
      });
      router.push('/report'); 
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to generate report: ${errorMessage}`);
      setReportData(null);
      toast({
        title: "Error Generating Report",
        description: `Failed to generate report: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCurrentTask("");
    }
  };
  
  const countWords = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setCurrentTask("Processing file...");
      setError(null);
      setReportData(null);
      setDocumentText(""); 

      const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx");
      const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
      
      if (isDocx || isPdf) {
        setCurrentTask(`Extracting text from ${file.name}...`);
        toast({
          title: "Processing Document",
          description: `Extracting text from ${file.name}. This may take a moment...`,
        });
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const documentDataUri = e.target?.result as string;
            const extractionResult = await extractTextFromDocument({ documentDataUri });
            if (extractionResult.extractedText && extractionResult.extractedText.trim() !== "") {
              setDocumentText(extractionResult.extractedText);
              toast({
                title: "Text Extracted",
                description: `Successfully extracted text from ${file.name}. Ready for plagiarism check.`,
              });
            } else {
              setDocumentText(""); 
              setError(`Failed to extract text from ${file.name}. The document might be empty, password-protected, or in an unreadable format. Try pasting the text directly.`);
              toast({
                title: "Extraction Failed",
                description: `Could not extract significant text from ${file.name}. The AI model might have encountered an issue processing this specific file.`,
                variant: "destructive",
                duration: 8000,
              });
            }
          } catch (extractError) {
            console.error("Error extracting text from document:", extractError);
            const errorMessage = extractError instanceof Error ? extractError.message : "Unknown error during text extraction.";
            setError(`Text extraction failed: ${errorMessage}. Please try a different file or copy/paste the text.`);
            setDocumentText("");
            toast({
              title: "Error Extracting Text",
              description: `Could not extract text: ${errorMessage}`,
              variant: "destructive",
            });
          } finally {
            setIsLoading(false);
            setCurrentTask("");
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
          setCurrentTask("");
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; 
          }
        };
        reader.readAsDataURL(file);
      } else {
         setError(`Unsupported file type: ${file.name}. Please upload a DOCX or PDF file.`);
         toast({
            title: "Unsupported File Type",
            description: "Please upload a DOCX or PDF file.",
            variant: "destructive",
         });
         setIsLoading(false);
         setCurrentTask("");
         if (fileInputRef.current) {
            fileInputRef.current.value = ""; 
         }
      }
    }
  };


  return (
    <div className="min-h-screen flex flex-col">
      {/* Welcome message and signup button */}
      <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-md">
        <h1 className="text-2xl font-bold">Welcome to Plagiax, the free plagiarism checker tool!</h1>
        <Button variant="default" onClick={() => router.push('/signup')}>Sign Up</Button>
      </div>

      {/* Existing content */}
      <div className="container mx-auto py-8 px-4 flex flex-col items-center">
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
                Enter or upload your text
              </Label>
              <Textarea
                id="document-text"
                placeholder="Paste your document content here, or upload a file below..."
                value={documentText}
                onChange={(e) => {
                  setDocumentText(e.target.value);
                  if (error) setError(null);
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
              <Alert variant={"destructive"} className="rounded-lg">
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
              {isLoading && currentTask === "Checking for plagiarism..." ? (
                <>
                  <Spinner className="mr-2 h-5 w-5" /> Checking...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-5 w-5" /> Check for Plagiarism
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {isLoading && currentTask && !error && (
          <div className="w-full max-w-2xl mt-8 flex flex-col items-center space-y-2">
            <Spinner className="h-8 w-8 text-primary" />
            <p className="text-muted-foreground">{currentTask}</p>
          </div>
        )}

        <div className="mt-12 text-center w-full max-w-2xl">
          <p className="text-sm text-muted-foreground">
            Plagiax uses advanced AI to compare your text against a vast index of online content.
            Results are indicative and should be used as a guide.
            AI-powered text extraction is used for DOCX/PDF files, focusing on main body content.
          </p>
        </div>
      </div>
    </div>
  );
}
