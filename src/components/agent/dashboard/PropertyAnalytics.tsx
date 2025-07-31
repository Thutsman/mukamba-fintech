'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface PropertyAnalytics {
  viewTrends: {
    date: string;
    views: number;
    inquiries: number;
  }[];
  popularFeatures: {
    feature: string;
    count: number;
  }[];
  priceAnalysis: {
    propertyType: string;
    yourPrice: number;
    marketAverage: number;
  }[];
  performanceMetrics: {
    metric: string;
    value: number;
    change: number;
  }[];
}

interface PropertyAnalyticsProps {
  data: PropertyAnalytics;
}

export const PropertyAnalytics: React.FC<PropertyAnalyticsProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* View Trends Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Property View Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.viewTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="inquiries"
                    stroke="#16a34a"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Popular Features */}
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.popularFeatures}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="feature" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Price Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Price Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.priceAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="propertyType" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="yourPrice" fill="#3b82f6" name="Your Price" />
                  <Bar dataKey="marketAverage" fill="#16a34a" name="Market Average" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <Badge
                variant="secondary"
                className={metric.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
              >
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};