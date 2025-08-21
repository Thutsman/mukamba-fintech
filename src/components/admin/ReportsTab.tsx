'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Shield,
  DollarSign,
  Home,
  MessageSquare,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  Globe,
  UserCheck,
  Building,
  CreditCard,
  Activity,
  Mail,
  BarChart,
  PieChart,
  LineChart,
  FileText,
  ChevronDown,
  Clock
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart as RechartsAreaChart
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Types
interface ReportCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

// Mock Data
const kycData: ChartData[] = [
  { name: 'Jan', value: 45, approved: 45, pending: 12, rejected: 3 },
  { name: 'Feb', value: 52, approved: 52, pending: 8, rejected: 2 },
  { name: 'Mar', value: 48, approved: 48, pending: 15, rejected: 5 },
  { name: 'Apr', value: 61, approved: 61, pending: 6, rejected: 1 },
  { name: 'May', value: 55, approved: 55, pending: 10, rejected: 4 },
  { name: 'Jun', value: 67, approved: 67, pending: 4, rejected: 2 }
];

const propertyData: ChartData[] = [
  { name: 'Residential', value: 65, fill: '#3B82F6' },
  { name: 'Commercial', value: 25, fill: '#10B981' },
  { name: 'Industrial', value: 10, fill: '#F59E0B' }
];

const escrowData: ChartData[] = [
  { name: 'Jan', value: 125000, amount: 125000, transactions: 45 },
  { name: 'Feb', value: 142000, amount: 142000, transactions: 52 },
  { name: 'Mar', value: 138000, amount: 138000, transactions: 48 },
  { name: 'Apr', value: 156000, amount: 156000, transactions: 61 },
  { name: 'May', value: 148000, amount: 148000, transactions: 55 },
  { name: 'Jun', value: 167000, amount: 167000, transactions: 67 }
];

const userActivityData: ChartData[] = [
  { name: 'Mon', value: 1200, active: 1200, new: 45, verified: 38 },
  { name: 'Tue', value: 1350, active: 1350, new: 52, verified: 42 },
  { name: 'Wed', value: 1280, active: 1280, new: 48, verified: 35 },
  { name: 'Thu', value: 1420, active: 1420, new: 61, verified: 49 },
  { name: 'Fri', value: 1380, active: 1380, new: 55, verified: 44 },
  { name: 'Sat', value: 1150, active: 1150, new: 38, verified: 32 },
  { name: 'Sun', value: 980, active: 980, new: 29, verified: 25 }
];

const messagingData: ChartData[] = [
  { name: 'Week 1', value: 1250, messages: 1250, responses: 1180, avgResponse: 2.3 },
  { name: 'Week 2', value: 1380, messages: 1380, responses: 1320, avgResponse: 2.1 },
  { name: 'Week 3', value: 1420, messages: 1420, responses: 1350, avgResponse: 2.4 },
  { name: 'Week 4', value: 1560, messages: 1560, responses: 1480, avgResponse: 2.0 }
];

const growthData: ChartData[] = [
  { name: 'Jan', value: 850, users: 850, properties: 320, revenue: 45000 },
  { name: 'Feb', value: 920, users: 920, properties: 380, revenue: 52000 },
  { name: 'Mar', value: 1050, users: 1050, properties: 420, revenue: 58000 },
  { name: 'Apr', value: 1180, users: 1180, properties: 480, revenue: 65000 },
  { name: 'May', value: 1320, users: 1320, properties: 520, revenue: 72000 },
  { name: 'Jun', value: 1450, users: 1450, properties: 580, revenue: 82000 }
];

// Reusable ReportCard Component
const ReportCard: React.FC<ReportCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  trend, 
  trendDirection = 'neutral' 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, y: -2 }}
    transition={{ type: 'spring', stiffness: 300 }}
    className="group cursor-pointer"
  >
    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{value}</h3>
              {trend && (
                <Badge 
                  className={`text-xs ${
                    trendDirection === 'up' 
                      ? 'bg-green-100 text-green-700' 
                      : trendDirection === 'down'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <TrendingUp className={`w-3 h-3 mr-1 ${
                    trendDirection === 'down' ? 'rotate-180' : ''
                  }`} />
                  {trend}
                </Badge>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1 truncate">{title}</p>
            <p className="text-xs text-slate-500 truncate">{subtitle}</p>
          </div>
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${color} flex-shrink-0`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Chart Components
const KYCChart: React.FC = () => (
  <ResponsiveContainer width="100%" height={250}>
    <RechartsBarChart data={kycData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="approved" fill="#10B981" name="Approved" />
      <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
      <Bar dataKey="rejected" fill="#EF4444" name="Rejected" />
    </RechartsBarChart>
  </ResponsiveContainer>
);

const PropertyChart: React.FC = () => (
  <ResponsiveContainer width="100%" height={250}>
    <RechartsPieChart>
      <Pie
        data={propertyData}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
      >
        {propertyData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.fill} />
        ))}
      </Pie>
      <Tooltip />
    </RechartsPieChart>
  </ResponsiveContainer>
);

const EscrowChart: React.FC = () => (
  <ResponsiveContainer width="100%" height={250}>
    <RechartsAreaChart data={escrowData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis yAxisId="left" />
      <YAxis yAxisId="right" orientation="right" />
      <Tooltip />
      <Legend />
      <Area 
        yAxisId="left" 
        type="monotone" 
        dataKey="amount" 
        stroke="#3B82F6" 
        fill="#3B82F6" 
        fillOpacity={0.3}
        name="Amount ($)"
      />
      <Line 
        yAxisId="right" 
        type="monotone" 
        dataKey="transactions" 
        stroke="#EF4444" 
        name="Transactions"
      />
    </RechartsAreaChart>
  </ResponsiveContainer>
);

const UserActivityChart: React.FC = () => (
  <ResponsiveContainer width="100%" height={250}>
    <RechartsLineChart data={userActivityData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="active" stroke="#3B82F6" name="Active Users" />
      <Line type="monotone" dataKey="new" stroke="#10B981" name="New Users" />
      <Line type="monotone" dataKey="verified" stroke="#F59E0B" name="Verified" />
    </RechartsLineChart>
  </ResponsiveContainer>
);

const MessagingChart: React.FC = () => (
  <ResponsiveContainer width="100%" height={250}>
    <RechartsBarChart data={messagingData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis yAxisId="left" />
      <YAxis yAxisId="right" orientation="right" />
      <Tooltip />
      <Legend />
      <Bar yAxisId="left" dataKey="messages" fill="#3B82F6" name="Messages" />
      <Bar yAxisId="left" dataKey="responses" fill="#10B981" name="Responses" />
      <Line yAxisId="right" type="monotone" dataKey="avgResponse" stroke="#EF4444" name="Avg Response (hrs)" />
    </RechartsBarChart>
  </ResponsiveContainer>
);

const GrowthChart: React.FC = () => (
  <ResponsiveContainer width="100%" height={250}>
    <RechartsLineChart data={growthData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis yAxisId="left" />
      <YAxis yAxisId="right" orientation="right" />
      <Tooltip />
      <Legend />
      <Line yAxisId="left" type="monotone" dataKey="users" stroke="#3B82F6" name="Users" />
      <Line yAxisId="left" type="monotone" dataKey="properties" stroke="#10B981" name="Properties" />
      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#F59E0B" name="Revenue ($)" />
    </RechartsLineChart>
  </ResponsiveContainer>
);

// Main ReportsTab Component
export const ReportsTab: React.FC = () => {
  const [dateRange, setDateRange] = React.useState('30d');
  const [userRole, setUserRole] = React.useState('all');
  const [country, setCountry] = React.useState('all');

  const handleExportReport = () => {
    console.log('Exporting report with filters:', { dateRange, userRole, country });
    // TODO: Implement export functionality
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Reports & Analytics</h2>
          <p className="text-sm sm:text-base text-slate-600">Comprehensive insights into platform performance and user activity</p>
        </div>
        <Button 
          onClick={handleExportReport}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/10 text-sm sm:text-base"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user-role">User Role</Label>
              <Select value={userRole} onValueChange={setUserRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="buyers">Buyers</SelectItem>
                  <SelectItem value="sellers">Sellers</SelectItem>
                  <SelectItem value="agents">Agents</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="ZW">Zimbabwe</SelectItem>
                  <SelectItem value="ZA">South Africa</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KYC Summary Section */}
      <section>
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          KYC Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <ReportCard
            title="Total Verifications"
            value="1,247"
            subtitle="This month"
            icon={UserCheck}
            color="bg-blue-500"
            trend="+12.5%"
            trendDirection="up"
          />
          <ReportCard
            title="Approval Rate"
            value="94.2%"
            subtitle="vs 91.8% last month"
            icon={Shield}
            color="bg-green-500"
            trend="+2.4%"
            trendDirection="up"
          />
          <ReportCard
            title="Pending Reviews"
            value="23"
            subtitle="Average 2.1 days"
            icon={Calendar}
            color="bg-amber-500"
            trend="-15.2%"
            trendDirection="down"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>KYC Verification Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <KYCChart />
          </CardContent>
        </Card>
      </section>

      {/* Property Metrics Section */}
      <section>
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Building className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          Property Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <ReportCard
            title="Total Properties"
            value="892"
            subtitle="Active listings"
            icon={Home}
            color="bg-emerald-500"
            trend="+8.3%"
            trendDirection="up"
          />
          <ReportCard
            title="Rent-to-Buy"
            value="67%"
            subtitle="Of total properties"
            icon={CreditCard}
            color="bg-purple-500"
            trend="+5.1%"
            trendDirection="up"
          />
          <ReportCard
            title="Avg. Price"
            value="$245K"
            subtitle="Median listing price"
            icon={DollarSign}
            color="bg-blue-500"
            trend="+12.3%"
            trendDirection="up"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Property Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyChart />
          </CardContent>
        </Card>
      </section>

      {/* Escrow Overview Section */}
      <section>
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          Escrow Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <ReportCard
            title="Total Escrow"
            value="$2.4M"
            subtitle="Current balance"
            icon={DollarSign}
            color="bg-green-500"
            trend="+18.7%"
            trendDirection="up"
          />
          <ReportCard
            title="Active Transactions"
            value="156"
            subtitle="In progress"
            icon={Activity}
            color="bg-blue-500"
            trend="+23.1%"
            trendDirection="up"
          />
          <ReportCard
            title="Avg. Transaction"
            value="$15.4K"
            subtitle="Per deal"
            icon={BarChart}
            color="bg-purple-500"
            trend="+8.9%"
            trendDirection="up"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Escrow Volume & Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <EscrowChart />
          </CardContent>
        </Card>
      </section>

      {/* User Activity Section */}
      <section>
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          User Activity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <ReportCard
            title="Daily Active Users"
            value="1,350"
            subtitle="Average this week"
            icon={Users}
            color="bg-blue-500"
            trend="+15.2%"
            trendDirection="up"
          />
          <ReportCard
            title="New Registrations"
            value="45"
            subtitle="Today"
            icon={UserCheck}
            color="bg-green-500"
            trend="+22.1%"
            trendDirection="up"
          />
          <ReportCard
            title="Verified Users"
            value="1,059"
            subtitle="Total verified"
            icon={Shield}
            color="bg-emerald-500"
            trend="+8.7%"
            trendDirection="up"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Weekly User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <UserActivityChart />
          </CardContent>
        </Card>
      </section>

      {/* Messaging Engagement Section */}
      <section>
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          Messaging Engagement
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <ReportCard
            title="Total Messages"
            value="5,610"
            subtitle="This month"
            icon={MessageSquare}
            color="bg-purple-500"
            trend="+28.3%"
            trendDirection="up"
          />
          <ReportCard
            title="Response Rate"
            value="94.8%"
            subtitle="Within 24 hours"
            icon={Mail}
            color="bg-green-500"
            trend="+3.2%"
            trendDirection="up"
          />
          <ReportCard
            title="Avg. Response Time"
            value="2.1h"
            subtitle="To first response"
            icon={Calendar}
            color="bg-blue-500"
            trend="-12.5%"
            trendDirection="down"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Messaging Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <MessagingChart />
          </CardContent>
        </Card>
      </section>

      {/* Platform Growth Section */}
      <section>
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          Platform Growth
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <ReportCard
            title="Total Users"
            value="1,450"
            subtitle="Registered users"
            icon={Users}
            color="bg-emerald-500"
            trend="+18.9%"
            trendDirection="up"
          />
          <ReportCard
            title="Monthly Revenue"
            value="$82K"
            subtitle="Platform fees"
            icon={DollarSign}
            color="bg-green-500"
            trend="+25.4%"
            trendDirection="up"
          />
          <ReportCard
            title="Properties Listed"
            value="580"
            subtitle="Active listings"
            icon={Home}
            color="bg-blue-500"
            trend="+12.7%"
            trendDirection="up"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Platform Growth Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <GrowthChart />
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
