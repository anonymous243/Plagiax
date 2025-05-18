
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { AlertTriangle, BarChartBig as AnalyticsIcon, FilePieChart, Percent, ListChecks } from 'lucide-react';
import type { ReportHistoryItemSummary } from '@/types/history';
import { ChartConfig } from '@/components/ui/chart'; // Only ChartConfig is needed directly here
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

// Dynamically import chart wrappers
const DynamicBarChartWrapper = dynamic(() => import('@/components/analytics/bar-chart-wrapper'), {
  loading: () => <Skeleton className="h-[450px] w-full rounded-xl" />, // Approx height of Card
  ssr: false,
});

const DynamicPieChartWrapper = dynamic(() => import('@/components/analytics/pie-chart-wrapper'), {
  loading: () => <Skeleton className="h-[450px] w-full rounded-xl" />, // Approx height of Card
  ssr: false,
});


export interface DocumentTypeDistribution { // Exporting for wrapper components
  name: string;
  value: number;
  fill: string;
}

export interface AnalyticsData { // Exporting for wrapper components
  totalChecks: number;
  averageSimilarity: number;
  documentTypeDistribution: DocumentTypeDistribution[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--muted))', '#82ca9d', '#ffc658'];

const getFileExtension = (filename?: string): string | null => {
  if (!filename) return null;
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1 || lastDot === filename.length - 1) return null; 
  return filename.slice(lastDot + 1).toLowerCase();
};

const isValidHistoryItem = (item: any): item is ReportHistoryItemSummary => {
  return (
    item &&
    typeof item.id === 'string' &&
    typeof item.timestamp === 'number' &&
    typeof item.plagiarismPercentage === 'number' &&
    typeof item.documentTitle === 'string' &&
    (typeof item.fileName === 'string' || typeof item.fileName === 'undefined')
  );
};


export default function AnalyticsPage() {
  const { isAuthenticated, currentUser, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({});

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authIsLoading, isAuthenticated, router]);

  useEffect(() => {
    if (currentUser && isAuthenticated) {
      setIsLoadingAnalytics(true);
      try {
        const historyKey = `plagiax_history_${currentUser.email}`;
        const storedHistoryString = localStorage.getItem(historyKey);
        let history: ReportHistoryItemSummary[] = [];

        if (storedHistoryString) {
            const parsedHistory = JSON.parse(storedHistoryString);
            if (Array.isArray(parsedHistory)) {
                history = parsedHistory.filter(isValidHistoryItem);
            }
        }

        if (history.length === 0) {
          setAnalyticsData({ totalChecks: 0, averageSimilarity: 0, documentTypeDistribution: [] });
          setIsLoadingAnalytics(false);
          return;
        }

        const totalChecks = history.length;
        const sumOfPercentages = history.reduce((sum, item) => sum + item.plagiarismPercentage, 0);
        const averageSimilarity = totalChecks > 0 ? sumOfPercentages / totalChecks : 0;

        const docTypeCounts: { [key: string]: number } = {};
        history.forEach(item => {
          const extension = getFileExtension(item.fileName);
          const type = extension ? extension.toUpperCase() : (item.fileName ? 'Unknown File' : 'Text Paste');
          docTypeCounts[type] = (docTypeCounts[type] || 0) + 1;
        });

        const documentTypeDistribution: DocumentTypeDistribution[] = Object.entries(docTypeCounts)
          .map(([name, value], index) => ({
            name,
            value,
            fill: COLORS[index % COLORS.length],
          }))
          .sort((a, b) => b.value - a.value);
        
        const currentAnalyticsData = {
          totalChecks,
          averageSimilarity,
          documentTypeDistribution,
        };
        setAnalyticsData(currentAnalyticsData);

        const newChartConfig: ChartConfig = currentAnalyticsData.documentTypeDistribution.reduce((config, item) => {
          config[item.name] = { label: item.name, color: item.fill };
          return config;
        }, {} as ChartConfig);
        
        if (currentAnalyticsData.documentTypeDistribution.length) {
          newChartConfig.value = { label: "Count", color: "hsl(var(--primary))" };
        }
        setChartConfig(newChartConfig);

      } catch (error) {
        console.error("Failed to load or process analytics data:", error);
        setAnalyticsData({ totalChecks: 0, averageSimilarity: 0, documentTypeDistribution: [] });
      } finally {
        setIsLoadingAnalytics(false);
      }
    } else if (!authIsLoading && !isAuthenticated) {
      setAnalyticsData(null); 
      setIsLoadingAnalytics(false);
    } else if (authIsLoading) {
        // Still loading auth, do nothing
    } else {
        setAnalyticsData({ totalChecks: 0, averageSimilarity: 0, documentTypeDistribution: [] });
        setIsLoadingAnalytics(false);
    }
  }, [currentUser, isAuthenticated, authIsLoading]);

  if (authIsLoading || (!isAuthenticated && !authIsLoading && typeof window !== 'undefined' && !['/login', '/signup', '/about', '/terms'].includes(window.location.pathname)) ) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary mb-3">
          Analytics Dashboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Track your plagiarism checking activity and document trends.
        </p>
      </header>

      {isLoadingAnalytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : !analyticsData || analyticsData.totalChecks === 0 ? (
        <Card className="shadow-lg rounded-xl text-center py-10">
          <CardHeader>
            <AlertTriangle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">No Analytics Data Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Start checking documents to see your analytics here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-lg rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
              <ListChecks className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analyticsData.totalChecks}</div>
              <p className="text-xs text-muted-foreground">
                Total documents and texts analyzed
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-lg rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Similarity</CardTitle>
              <Percent className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analyticsData.averageSimilarity.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Average plagiarism score across all checks
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {!isLoadingAnalytics && analyticsData && analyticsData.documentTypeDistribution.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DynamicBarChartWrapper data={analyticsData.documentTypeDistribution} chartConfig={chartConfig} />
          <DynamicPieChartWrapper data={analyticsData.documentTypeDistribution} chartConfig={chartConfig} />
        </div>
      )}
    </div>
  );
}

