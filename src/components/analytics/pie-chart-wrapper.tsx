
"use client";

import type { DocumentTypeDistribution, AnalyticsData } from "@/app/analytics/page"; // Assuming types are exported from page or a types file
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell, ResponsiveContainer } from 'recharts';
import { FilePieChart } from 'lucide-react';

interface PieChartWrapperProps {
  data: DocumentTypeDistribution[];
  chartConfig: ChartConfig;
}

export default function PieChartWrapper({ data, chartConfig }: PieChartWrapperProps) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
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
                data={data}
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
                  if (percent * 100 < 5) return null;
                  return (
                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">
                      {`${name} (${(percent * 100).toFixed(0)}%)`}
                    </text>
                  );
                }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
