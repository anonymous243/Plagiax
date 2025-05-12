"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useReport } from "@/context/ReportContext";
import ReportPageComponent from "@/components/plagiarism/report-page-component";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileWarning } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportPage() {
  const { reportData, setReportData } = useReport();
  const router = useRouter();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    // Optionally clear report data when navigating away or on unmount if desired
    // return () => {
    //   setReportData(null); 
    // };
  }, [setReportData]);

  const handleGoBack = () => {
    setReportData(null); // Clear report data when going back
    router.push("/");
  };

  if (!isClient) {
    // Render nothing or a placeholder on the server/during first client render before hydration
    return null; 
  }

  if (!reportData) {
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

  return <ReportPageComponent reportData={reportData} onBack={handleGoBack} />;
}
