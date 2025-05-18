
"use client";

import type { DocumentTypeDistribution, AnalyticsData } from "@/app/analytics/page"; // Assuming types are exported from page or a types file
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, ResponsiveContainer } from 'recharts';
import { BarChartBig as AnalyticsIcon } from 'lucide-react';

interface BarChartWrapperProps {
  data: DocumentTypeDistribution[];
  chartConfig: ChartConfig;
}

export default function BarChartWrapper({ data, chartConfig }: BarChartWrapperProps) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AnalyticsIcon className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">Document Type Distribution (Bar)</CardTitle>
        </div>
        <CardDescription>Breakdown of checked document and text types.</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px] w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ right: 20, left: 30, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} interval={0} />
              <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
              <Bar dataKey="value" name="Count" radius={4}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
