import React, { useState } from 'react';
import {
  DollarSign,
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Download,
  Calendar,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  metricCardsData,
  monthlyRevenueData,
  weeklyRevenueData,
  salesCategoryData,
  deviceDistributionData,
  recentActivities,
} from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { GlobalUserMap } from '@/features/dashboard/components/GlobalUserMap';
import { toast } from 'sonner';

export function OverviewPage() {
  const [timeRange, setTimeRange] = useState<'monthly' | 'weekly'>('monthly');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const revenueData = timeRange === 'monthly' ? monthlyRevenueData : weeklyRevenueData;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Dashboard metrics refreshed');
    }, 600);
  };

  const handleExport = () => {
    toast.success('Analytics report exported as CSV');
  };

  const getMetricIcon = (iconName: string) => {
    switch (iconName) {
      case 'DollarSign':
        return <DollarSign className="h-5 w-5 text-blue-500" />;
      case 'Users':
        return <Users className="h-5 w-5 text-indigo-500" />;
      case 'CreditCard':
        return <CreditCard className="h-5 w-5 text-violet-500" />;
      case 'TrendingUp':
        return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      default:
        return <DollarSign className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Dashboard Overview
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live System
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Welcome back, here is what&apos;s happening with your business today.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleExport}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCardsData.map((metric) => (
          <Card
            key={metric.id}
            className="relative overflow-hidden border-border/80 bg-card hover:border-primary/40 transition-all hover:shadow-lg group"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {metric.title}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 group-hover:bg-primary/10 transition-colors">
                {getMetricIcon(metric.icon)}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {metric.value}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`inline-flex items-center gap-0.5 font-semibold ${
                    metric.isPositive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {metric.isPositive ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {metric.change}
                </span>
                <span className="text-muted-foreground">{metric.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Area / Line Chart: Revenue Analytics (2 cols) */}
        <Card className="lg:col-span-2 border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
            <div className="space-y-1">
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                Revenue & Profit Stream
                <Badge variant="outline" className="text-[10px] font-normal py-0">
                  Realtime
                </Badge>
              </CardTitle>
              <CardDescription>
                Gross revenue versus operational expenditures and net profit.
              </CardDescription>
            </div>

            {/* Timeframe switch */}
            <div className="flex items-center rounded-lg border bg-muted/50 p-1 text-xs">
              <button
                type="button"
                onClick={() => setTimeRange('monthly')}
                className={`rounded-md px-3 py-1 font-medium transition-colors ${
                  timeRange === 'monthly'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('weekly')}
                className={`rounded-md px-3 py-1 font-medium transition-colors ${
                  timeRange === 'weekly'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Weekly
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#888888' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#888888' }}
                    tickFormatter={(val) => `$${val / 1000}k`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-border/80 bg-popover p-3 text-xs shadow-xl space-y-1.5">
                            <p className="font-bold text-foreground">{label}</p>
                            {payload.map((entry, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between gap-4"
                              >
                                <span
                                  className="flex items-center gap-1.5 font-medium"
                                  style={{ color: entry.color }}
                                >
                                  <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  {entry.name}:
                                </span>
                                <span className="font-bold text-foreground">
                                  {formatCurrency(Number(entry.value))}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="Net Profit"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Chart Legend */}
            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground border-t border-border/60 pt-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="font-medium">Gross Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="font-medium">Net Profit</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart: Device & Traffic Distribution (1 col) */}
        <Card className="border-border/80 bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-bold">
              Traffic Distribution
            </CardTitle>
            <CardDescription>Audience breakdown by device category.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center pt-0">
            <div className="h-[220px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {deviceDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-popover px-2.5 py-1.5 text-xs shadow-lg font-medium">
                            <span style={{ color: data.color }}>{data.name}: </span>
                            <span className="font-bold">{data.value}%</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-foreground">58%</span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Desktop
                </span>
              </div>
            </div>

            {/* Custom List Legend */}
            <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-border/60">
              {deviceDistributionData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                  <span className="ml-auto font-semibold text-foreground">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Team Distribution Map */}
      <GlobalUserMap />

      {/* Second Row: Bar Chart & Recent Activity Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bar Chart: Sales Performance vs Targets (2 cols) */}
        <Card className="lg:col-span-2 border-border/80 bg-card shadow-xs">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="space-y-1">
                <CardTitle className="text-base sm:text-lg font-bold">
                  Sales by Product Category
                </CardTitle>
                <CardDescription>
                  Actual revenue generation vs monthly quota targets.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="w-fit text-xs">
                Q3 Performance
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesCategoryData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#888888' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#888888' }}
                    tickFormatter={(val) => `$${val / 1000}k`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border bg-popover p-3 text-xs shadow-xl space-y-1">
                            <p className="font-bold text-foreground">{label}</p>
                            {payload.map((entry, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-4"
                              >
                                <span className="text-muted-foreground">{entry.name}:</span>
                                <span className="font-bold" style={{ color: entry.color }}>
                                  {formatCurrency(Number(entry.value))}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="sales" name="Actual Sales" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="target" name="Target Quota" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed / Mini Table (1 col) */}
        <Card className="border-border/80 bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-bold">
                Recent Activities
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-primary hover:text-primary/80"
                onClick={() => toast.info('Navigating to full audit log')}
              >
                View all
              </Button>
            </div>
            <CardDescription>Latest team and financial events.</CardDescription>
          </CardHeader>

          <CardContent className="flex-1 space-y-4 pt-1">
            <div className="space-y-3.5">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 text-xs group rounded-lg p-2 transition-colors hover:bg-accent/50"
                >
                  <Avatar className="h-8 w-8 shrink-0 mt-0.5 border border-border">
                    <AvatarImage src={act.userAvatar} />
                    <AvatarFallback className="text-[10px]">
                      {act.userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-0.5 overflow-hidden">
                    <p className="leading-snug text-foreground">
                      <span className="font-semibold">{act.userName}</span>{' '}
                      <span className="text-muted-foreground">{act.action}</span>{' '}
                      <span className="font-medium text-foreground">{act.target}</span>
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{act.timestamp}</span>
                      {act.amount && (
                        <span
                          className={`font-semibold ${
                            act.amount.startsWith('+')
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {act.amount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
