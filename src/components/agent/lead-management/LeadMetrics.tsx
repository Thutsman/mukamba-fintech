'use client';

import * as React from 'react';
import { 
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  Target,
  BarChart3,
  Activity
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface StageMetrics {
  stageId: string;
  averageTimeInStage: number; // days
  conversionRate: number; // percentage to next stage
  dropOffRate: number; // percentage that don't progress
  totalValue: number; // sum of budgets in this stage
  leadCount: number;
}

interface LeadMetricsProps {
  stageMetrics: StageMetrics[];
  totalPipelineValue: number;
  totalLeads: number;
}

export const LeadMetrics: React.FC<LeadMetricsProps> = ({
  stageMetrics,
  totalPipelineValue,
  totalLeads
}) => {
  const [timeframe, setTimeframe] = React.useState<'7d' | '30d' | '90d'>('30d');

  // Calculate overall metrics
  const averageLeadScore = stageMetrics.length > 0 
    ? stageMetrics.reduce((sum, stage) => sum + (stage.conversionRate || 0), 0) / stageMetrics.length 
    : 0;

  const totalConversionRate = stageMetrics.length > 0
    ? stageMetrics.reduce((sum, stage) => sum + stage.conversionRate, 0) / stageMetrics.length
    : 0;

  const averageTimeInPipeline = stageMetrics.length > 0
    ? stageMetrics.reduce((sum, stage) => sum + stage.averageTimeInStage, 0) / stageMetrics.length
    : 0;

  const metrics = [
    {
      title: 'Total Pipeline Value',
      value: `R${totalPipelineValue.toLocaleString()}`,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Leads',
      value: totalLeads.toString(),
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Avg Lead Score',
      value: `${Math.round(averageLeadScore)}%`,
      change: '+5.1%',
      changeType: 'positive' as const,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Avg Time in Pipeline',
      value: `${Math.round(averageTimeInPipeline)} days`,
      change: '-2.3%',
      changeType: 'negative' as const,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Pipeline Metrics</h3>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeframe === period
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title} className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <Badge 
                  variant={metric.changeType === 'positive' ? 'default' : 'secondary'}
                  className={`text-xs ${
                    metric.changeType === 'positive' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {metric.changeType === 'positive' ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {metric.change}
                </Badge>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.title}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stage Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Stage Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stageMetrics.map((stage) => (
                <div key={stage.stageId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {stage.stageId.replace('-', ' ')}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {stage.leadCount} leads
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        R{stage.totalValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Conversion Rate</span>
                      <span>{Math.round(stage.conversionRate)}%</span>
                    </div>
                    <Progress value={stage.conversionRate} className="h-2" />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Avg Time: {Math.round(stage.averageTimeInStage)} days</span>
                    <span>Drop-off: {Math.round(stage.dropOffRate)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-600" />
              <span>Pipeline Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Overall Conversion Rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Overall Conversion</span>
                  <span className="font-medium">{Math.round(totalConversionRate)}%</span>
                </div>
                <Progress value={totalConversionRate} className="h-3" />
              </div>

              {/* Pipeline Velocity */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pipeline Velocity</span>
                  <span className="font-medium">{Math.round(averageTimeInPipeline)} days</span>
                </div>
                <div className="text-xs text-gray-500">
                  Average time from first contact to close
                </div>
              </div>

              {/* Lead Quality Score */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Lead Quality</span>
                  <span className="font-medium">{Math.round(averageLeadScore)}%</span>
                </div>
                <div className="text-xs text-gray-500">
                  Based on engagement and conversion probability
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm font-medium text-blue-900 mb-1">
                  Recommendations
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  {averageTimeInPipeline > 14 && (
                    <div>• Follow up with leads in pipeline for more than 14 days</div>
                  )}
                  {totalConversionRate < 20 && (
                    <div>• Focus on improving lead qualification process</div>
                  )}
                  {averageLeadScore < 50 && (
                    <div>• Enhance lead nurturing campaigns</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 