
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { History, AlertTriangle, FileText, CalendarDays, Percent } from 'lucide-react';
import type { ReportHistoryItemSummary } from '@/types/history';
import { format } from 'date-fns';
import Link from 'next/link';


export default function DashboardPage() {
  const { isAuthenticated, currentUser, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<ReportHistoryItemSummary[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authIsLoading, isAuthenticated, router]);

  useEffect(() => {
    if (currentUser && isAuthenticated) {
      setIsLoadingHistory(true);
      try {
        const historyKey = `plagiax_history_${currentUser.email}`;
        const storedHistory = localStorage.getItem(historyKey);
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        } else {
          setHistory([]); // Ensure history is an empty array if nothing is stored
        }
      } catch (error) {
        console.error("Failed to load history from localStorage:", error);
        setHistory([]); 
      } finally {
        setIsLoadingHistory(false);
      }
    } else if (!authIsLoading && !isAuthenticated) {
      setHistory([]);
      setIsLoadingHistory(false);
    }
  }, [currentUser, isAuthenticated, authIsLoading]);

  if (authIsLoading || (!isAuthenticated && !authIsLoading && typeof window !== 'undefined' && !['/login', '/signup', '/about', '/terms'].includes(window.location.pathname)) ) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }
  
  const getBadgeVariant = (percentage: number): "destructive" | "secondary" | "default" => {
    if (percentage > 50) return "destructive";
    if (percentage > 5) return "secondary"; // Consider 5% as threshold for "some" plagiarism
    return "default"; // Green for low/no plagiarism
  };


  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <History className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-semibold">User Dashboard</CardTitle>
          </div>
          <CardDescription>
            View your plagiarism check history and track your submissions. Total reports checked: {history.length}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="flex justify-center items-center py-10">
              <Spinner className="h-8 w-8 text-primary" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold text-muted-foreground">No History Found</p>
              <p className="text-muted-foreground">You haven't checked any documents yet.</p>
              <Button asChild className="mt-6">
                <Link href="/">Check a Document</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><FileText className="inline-block mr-1 h-4 w-4" />Document Title</TableHead>
                    <TableHead><CalendarDays className="inline-block mr-1 h-4 w-4" />Date Checked</TableHead>
                    <TableHead className="text-right"><Percent className="inline-block mr-1 h-4 w-4" />Similarity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium break-words max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                        {item.documentTitle}
                        {item.fileName && <span className="block text-xs text-muted-foreground">({item.fileName})</span>}
                      </TableCell>
                      <TableCell>{format(new Date(item.timestamp), 'MMM d, yyyy HH:mm')}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={getBadgeVariant(item.plagiarismPercentage)}>
                          {item.plagiarismPercentage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
