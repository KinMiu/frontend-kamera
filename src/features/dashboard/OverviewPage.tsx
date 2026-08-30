import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Camera as CameraIcon,
  Video,
  AlertCircle,
  Activity,
  TrendingUp,
  RefreshCw,
  Plus,
  ArrowRight,
  Radio,
  Network,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  monthlyActivityData,
  cameraStatusDistributionData,
  recentActivities,
} from '@/lib/mock-data';
import { useGetCameras } from '@/features/cameras/hooks/use-cameras';
import { useGetGitHubIssues } from '@/features/issues/hooks/use-github-issues';
import { WayKambasCameraMap } from '@/features/dashboard/components/WayKambasCameraMap';
import { toast } from 'sonner';

export function OverviewPage() {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: camerasResponse, refetch: refetchCameras } = useGetCameras({ page: 1, pageSize: 5 });
  const { data: issuesData, refetch: refetchIssues } = useGetGitHubIssues({ state: 'open' });

  const cameras = camerasResponse?.data || [];
  const openIssues = issuesData?.issues || [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchCameras(), refetchIssues()]);
    setIsRefreshing(false);
    toast.success('Dashboard metrics refreshed');
  };

  const getMetricIcon = (iconName: string) => {
    switch (iconName) {
      case 'Camera':
        return <CameraIcon className="h-5 w-5 text-blue-500" />;
      case 'Video':
        return <Video className="h-5 w-5 text-emerald-500" />;
      case 'AlertCircle':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'Activity':
        return <Activity className="h-5 w-5 text-purple-500" />;
      default:
        return <CameraIcon className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Dashboard Kamera Way Kambas
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Aktif
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Pemantauan perangkat kamera pengawasan dan pelacakan issue pengembangan sistem.
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
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/cameras')}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Kelola Kamera</span>
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
                <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {metric.change}
                </span>
                <span className="text-muted-foreground">{metric.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts & Quick Overview Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Area Chart: RTSP Activity Stream (2 cols) */}
        <Card className="lg:col-span-2 border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
            <div className="space-y-1">
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                Aktivitas Stream & Snapshot Kamera
                <Badge variant="outline" className="text-[10px] font-normal py-0">
                  Realtime
                </Badge>
              </CardTitle>
              <CardDescription>
                Trafik tangkapan gambar dan aktivitas RTSP stream mingguan.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyActivityData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCaptures" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
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
                                  {entry.value} event
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
                    dataKey="captures"
                    name="Snapshot Frame"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCaptures)"
                  />
                  <Area
                    type="monotone"
                    dataKey="detections"
                    name="Deteksi Objek"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDetections)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Chart Legend */}
            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground border-t border-border/60 pt-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="font-medium">Snapshot Frame</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="font-medium">Deteksi Objek</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart: Camera Status Distribution (1 col) */}
        <Card className="border-border/80 bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-bold">
              Distribusi Status Kamera
            </CardTitle>
            <CardDescription>Kondisi operasional kamera pengawasan.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center pt-0">
            <div className="h-[200px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cameraStatusDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {cameraStatusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-foreground">100%</span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Online
                </span>
              </div>
            </div>

            {/* Status Legend */}
            <div className="w-full space-y-2 mt-2 pt-3 border-t border-border/60">
              {cameraStatusDistributionData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{item.value} unit</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Camera Distribution Map (TN Way Kambas) */}
      <WayKambasCameraMap />

      {/* Second Row: Latest Registered Cameras & Active GitHub Issues */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Latest Cameras Widget */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CameraIcon className="h-4 w-4 text-primary" />
                Daftar Kamera Terdaftar
              </CardTitle>
              <CardDescription className="text-xs">
                Perangkat kamera pemantauan terkini.
              </CardDescription>
            </div>
            <Link to="/cameras">
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-primary">
                <span>Lihat Semua</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="divide-y divide-border/60">
              {cameras.slice(0, 4).map((cam) => (
                <div
                  key={cam.id}
                  onClick={() => navigate(`/cameras/${cam.id}`)}
                  className="flex items-center justify-between py-2.5 hover:bg-accent/40 px-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Video className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-foreground truncate">{cam.name}</p>
                      <p className="text-[11px] font-mono text-muted-foreground truncate">{cam.macAddress}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    Online
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active GitHub Issues Widget */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                GitHub Issues Aktif
              </CardTitle>
              <CardDescription className="text-xs">
                Tiket issue terbuka di repositori KinMiu/frontend-kamera.
              </CardDescription>
            </div>
            <Link to="/issues">
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-primary">
                <span>Buka Issues</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="divide-y divide-border/60">
              {openIssues.slice(0, 4).map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => navigate('/issues')}
                  className="flex items-start justify-between py-2.5 hover:bg-accent/40 px-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-2.5 overflow-hidden">
                    <span className="font-mono text-xs text-primary font-bold mt-0.5">#{issue.number}</span>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-foreground truncate">{issue.title}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span>oleh {issue.user.login}</span>
                        {issue.labels?.slice(0, 1).map((l) => (
                          <span key={l.id} className="text-[10px] px-1.5 py-0.2 rounded bg-muted">
                            {l.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
