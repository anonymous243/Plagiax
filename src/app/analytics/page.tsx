
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { AlertTriangle, BarChartBig as AnalyticsIcon, FilePieChart, Percent, ListChecks } from 'lucide-react';
import type { ReportHistoryItemSummary } from '@/types/history';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Pie, PieChart, Cell } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface DocumentTypeDistribution {
  name: string;
  value: number;
  fill: string;
}

interface AnalyticsData {
  totalChecks: number;
  averageSimilarity: number;
  documentTypeDistribution: DocumentTypeDistribution[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--muted))', '#82ca9d', '#ffc658'];


const getFileExtension = (filename?: string): string | null => {
  if (!filename) return null;
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1 || lastDot === filename.length - 1) return null; // No extension or dot is last char
  return filename.slice(lastDot + 1).toLowerCase();
};

export default function AnalyticsPage() {
  const { isAuthenticated, currentUser, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

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
        const history: ReportHistoryItemSummary[] = storedHistoryString ? JSON.parse(storedHistoryString) : [];

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
        
        setAnalyticsData({
          totalChecks,
          averageSimilarity,
          documentTypeDistribution,
        });

      } catch (error) {
        console.error("Failed to load or process analytics data:", error);
        setAnalyticsData({ totalChecks: 0, averageSimilarity: 0, documentTypeDistribution: [] });
      } finally {
        setIsLoadingAnalytics(false);
      }
    } else if (!authIsLoading && !isAuthenticated) {
      setAnalyticsData(null);
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

  const chartConfig: ChartConfig = analyticsData?.documentTypeDistribution.reduce((config, item) => {
    config[item.name] = { label: item.name, color: item.fill };
    return config;
  }, {} as ChartConfig) ?? {};
   // Add a 'count' key for BarChart if needed, or adjust dataKey
  if (analyticsData?.documentTypeDistribution.length) {
    chartConfig.value = { label: "Count", color: "hsl(var(--primary))" };
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
        <div className="flex justify-center items-center py-20">
          <Spinner className="h-12 w-12 text-primary" />
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

      {analyticsData && analyticsData.documentTypeDistribution.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FilePieChart className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">Document Type Distribution (Bar)</CardTitle>
            </div>
            <CardDescription>Breakdown of checked document and text types.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] w-full">
           <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.documentTypeDistribution} layout="vertical" margin={{ right: 20, left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} interval={0} />
                  <ChartTooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                  <Bar dataKey="value" name="Count" radius={4}>
                     {analyticsData.documentTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl">
            <CardHeader>
                 <div className="flex items-center gap-2">
                    <FilePieChart className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Document Type Distribution (Pie)</CardTitle>
                </div>
                <CardDescription>Visual breakdown of checked document types.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full flex items-center justify-center">
                 <ChartContainer config={chartConfig} className="h-full w-full aspect-square">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            <Pie
                                data={analyticsData.documentTypeDistribution}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                labelLine={false}
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                                  const RADIAN = Math.PI / 180;
                                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                  return (
                                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">
                                      {`${name} (${(percent * 100).toFixed(0)}%)`}
                                    </text>
                                  );
                                }}
                            >
                                {analyticsData.documentTypeDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
        </div>
      )}
    </div>
  );
}
