
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useReport } from "@/context/ReportContext";
import ReportPageComponent from "@/components/plagiarism/report-page-component";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileWarning } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";

export default function ReportPage() {
  const { reportDetails, setReportDetails } = useReport();
  const router = useRouter();
  const [isClient, setIsClient] = React.useState(false);
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (isClient && !authIsLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isClient, authIsLoading, isAuthenticated, router]);

  const handleGoBack = () => {
    setReportDetails(null); 
    router.push("/");
  };

  if (!isClient || authIsLoading || (isClient && !authIsLoading && !isAuthenticated)) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }
  
  if (!reportDetails) {
    return (
      <div className="container mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md shadow-lg text-center">
          <CardHeader>
            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
              <FileWarning className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-semibold">No Report Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              It seems there's no plagiarism report data available. Please go back and generate a report first.
            </p>
            <Button onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Checker
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ReportPageComponent reportDetails={reportDetails} onBack={handleGoBack} />;
}
