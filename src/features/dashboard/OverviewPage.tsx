import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Camera as CameraIcon,
  Video,
  Radio,
  MapPin,
  RefreshCw,
  Plus,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Server,
  Signal,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
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
import { useGetCameras } from '@/features/cameras/hooks/use-cameras';
import { WayKambasCameraMap, getCoordinatesForCamera } from '@/features/dashboard/components/WayKambasCameraMap';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function OverviewPage() {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch all real registered cameras from backend (up to 100 devices)
  const { data: camerasResponse, isLoading, refetch: refetchCameras } = useGetCameras({
    page: 1,
    pageSize: 100,
  });

  const cameras = camerasResponse?.data || [];
  const totalCameras = camerasResponse?.total ?? cameras.length;

  // Compute real metrics from backend camera dataset
  const metrics = useMemo(() => {
    const withMediaMtx = cameras.filter((c) => !!c.mediamtxEndpoint && c.mediamtxEndpoint.trim() !== '');
    const withCoordinates = cameras.filter(
      (c) => c.latitude != null && c.longitude != null && !isNaN(Number(c.latitude)) && !isNaN(Number(c.longitude))
    );
    const withRtsp = cameras.filter((c) => !!c.rtspEndpoint && c.rtspEndpoint.trim() !== '');

    const relayPercentage = totalCameras > 0 ? Math.round((withMediaMtx.length / totalCameras) * 100) : 0;
    const gpsPercentage = totalCameras > 0 ? Math.round((withCoordinates.length / totalCameras) * 100) : 0;

    return {
      total: totalCameras,
      withMediaMtx: withMediaMtx.length,
      withoutMediaMtx: totalCameras - withMediaMtx.length,
      withCoordinates: withCoordinates.length,
      withoutCoordinates: totalCameras - withCoordinates.length,
      withRtsp: withRtsp.length,
      relayPercentage,
      gpsPercentage,
    };
  }, [cameras, totalCameras]);

  // Compute camera distribution across Way Kambas sectors from real coordinates/names
  const sectorData = useMemo(() => {
    const counts: Record<string, number> = {
      'Way Kanan': 0,
      'Plang Ijo': 0,
      'PLG Gajah': 0,
      'Rawa Bunder': 0,
      'Kuala Kambas': 0,
      'SRS Badak': 0,
      'Gerbang Utama': 0,
      'Sektor Lain': 0,
    };

    cameras.forEach((cam, idx) => {
      const coords = getCoordinatesForCamera(cam, idx);
      const s = (coords.sector || '').toLowerCase() + (cam.name || '').toLowerCase();
      if (s.includes('way kanan')) counts['Way Kanan']++;
      else if (s.includes('plang ijo')) counts['Plang Ijo']++;
      else if (s.includes('gajah') || s.includes('plg')) counts['PLG Gajah']++;
      else if (s.includes('rawa bunder')) counts['Rawa Bunder']++;
      else if (s.includes('kuala')) counts['Kuala Kambas']++;
      else if (s.includes('rhino') || s.includes('srs') || s.includes('badak')) counts['SRS Badak']++;
      else if (s.includes('gerbang')) counts['Gerbang Utama']++;
      else counts['Sektor Lain']++;
    });

    return Object.entries(counts)
      .filter(([_, value]) => value > 0 || cameras.length === 0)
      .map(([name, count]) => ({
        name,
        count,
      }));
  }, [cameras]);

  // Donut chart status data
  const statusDistributionData = useMemo(() => {
    return [
      {
        name: 'MediaMTX Relay Siap',
        value: metrics.withMediaMtx,
        color: '#10b981',
      },
      {
        name: 'RTSP Standby (Belum Relay)',
        value: metrics.withoutMediaMtx,
        color: '#3b82f6',
      },
      {
        name: 'Koordinat GPS Belum Diset',
        value: metrics.withoutCoordinates,
        color: '#f59e0b',
      },
    ].filter((item) => item.value > 0 || cameras.length === 0);
  }, [metrics, cameras.length]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchCameras();
    setIsRefreshing(false);
    toast.success('Data kamera berhasil diperbarui');
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
            Pemantauan real-time perangkat kamera pengawasan satwa & kawasan Taman Nasional Way Kambas.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/cameras')}
            className="h-9 gap-1.5 text-xs font-medium bg-primary text-primary-foreground shadow-sm shadow-primary/25"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Kelola Kamera</span>
          </Button>
        </div>
      </div>

      {/* Real KPI Summary Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Kamera */}
        <Card className="border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Kamera Terdaftar
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <CameraIcon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {isLoading ? '...' : `${metrics.total} Unit`}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
              <span>Tersimpan di Database</span>
            </div>
          </CardContent>
        </Card>

        {/* MediaMTX Stream Relay */}
        <Card className="border-border/80 bg-card hover:border-emerald-500/40 transition-all shadow-xs group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              MediaMTX Stream Relay
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Video className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {isLoading ? '...' : `${metrics.withMediaMtx} Stream`}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Signal className="h-3.5 w-3.5" />
              <span>{metrics.relayPercentage}% Siap WebRTC/Live</span>
            </div>
          </CardContent>
        </Card>

        {/* Koordinat GPS Terpetakan */}
        <Card className="border-border/80 bg-card hover:border-purple-500/40 transition-all shadow-xs group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Koordinat Terpetakan
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <MapPin className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {isLoading ? '...' : `${metrics.withCoordinates} Titik`}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium">
              <Layers className="h-3.5 w-3.5" />
              <span>{metrics.gpsPercentage}% Terplot di Peta TNWK</span>
            </div>
          </CardContent>
        </Card>

        {/* RTSP Fisik Terkonfigurasi */}
        <Card className="border-border/80 bg-card hover:border-amber-500/40 transition-all shadow-xs group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              RTSP Kamera Fisik
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Radio className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {isLoading ? '...' : `${metrics.withRtsp} Endpoint`}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Server className="h-3.5 w-3.5 text-amber-500" />
              <span>RTSP Port 554</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts: Real Distribution by Sector & Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bar Chart: Real Distribution across TN Way Kambas Sectors (2 cols) */}
        <Card className="lg:col-span-2 border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-2">
            <div className="space-y-1">
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Sebaran Kamera Berdasarkan Sektor Kawasan
              </CardTitle>
              <CardDescription className="text-xs">
                Jumlah titik kamera pengawasan aktif di masing-masing sektor TN Way Kambas.
              </CardDescription>
            </div>
            <Badge variant="outline" className="w-fit text-[11px] font-medium bg-muted/40">
              {cameras.length} Total Perangkat
            </Badge>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="h-[270px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sectorData}
                  margin={{ top: 15, right: 15, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    tick={{ fontSize: 11, fill: '#888888' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#888888' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-border/80 bg-popover p-3 text-xs shadow-xl space-y-1">
                            <p className="font-bold text-foreground">{label}</p>
                            <p className="text-primary font-semibold">
                              {payload[0].value} Unit Kamera
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Kamera"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart: Status & Relay Readiness Distribution (1 col) */}
        <Card className="border-border/80 bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              Kesiapan Stream Kamera
            </CardTitle>
            <CardDescription className="text-xs">
              Distribusi status relay MediaMTX dan kelengkapan GPS.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center pt-0">
            <div className="h-[190px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-foreground">
                  {metrics.relayPercentage}%
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  MediaMTX Ready
                </span>
              </div>
            </div>

            {/* Status Legend */}
            <div className="w-full space-y-2 mt-2 pt-3 border-t border-border/60">
              {statusDistributionData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground truncate">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground shrink-0">{item.value} unit</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Camera Distribution Map (TN Way Kambas) */}
      <WayKambasCameraMap />

      {/* Real Registered Camera List & System Sync Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Latest Registered Cameras (2 cols) */}
        <Card className="lg:col-span-2 border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CameraIcon className="h-4 w-4 text-primary" />
                Daftar Kamera Terdaftar Terkini
              </CardTitle>
              <CardDescription className="text-xs">
                Perangkat kamera pemantauan yang terdaftar di database server.
              </CardDescription>
            </div>
            <Link to="/cameras">
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-primary hover:bg-primary/10">
                <span>Lihat Semua ({totalCameras})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {cameras.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs space-y-2">
                <CameraIcon className="h-8 w-8 mx-auto opacity-30" />
                <p>Belum ada kamera terdaftar.</p>
                <Button size="sm" variant="outline" onClick={() => navigate('/cameras')}>
                  Tambah Kamera Sekarang
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {cameras.slice(0, 5).map((cam) => {
                  const hasMediaMtx = !!cam.mediamtxEndpoint && cam.mediamtxEndpoint.trim() !== '';
                  const hasCoords = cam.latitude != null && cam.longitude != null;

                  return (
                    <div
                      key={cam.id}
                      onClick={() => navigate(`/cameras/${cam.id}`)}
                      className="flex items-center justify-between py-3 hover:bg-accent/40 px-2 rounded-lg transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <Video className="h-4 w-4" />
                        </div>
                        <div className="overflow-hidden space-y-0.5">
                          <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {cam.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                            <span>MAC: {cam.macAddress}</span>
                            {hasCoords && (
                              <span className="hidden sm:inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-sans">
                                • GPS Aktif
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {hasMediaMtx ? (
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                            MediaMTX Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                            RTSP Fisik
                          </Badge>
                        )}
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Architecture & Stream Relay Gateway Status (1 col) */}
        <Card className="border-border/80 bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3 space-y-0">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              Status Infrastruktur Relay
            </CardTitle>
            <CardDescription className="text-xs">
              Status sinkronisasi worker lokal & MediaMTX gateway.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Signal className="h-3.5 w-3.5 text-emerald-500" />
                  MQTT Event Broker
                </span>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                  Online (Port 1883)
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 text-blue-500" />
                  MediaMTX Server
                </span>
                <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                  Active (Port 8554 / 8889)
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Global API Key Security
                </span>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                  Enforced (x-api-key)
                </Badge>
              </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-semibold text-foreground">Relay Otomatis Real-Time</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Setiap kamera yang ditambahkan di dashboard akan otomatis dipublish melalui broker MQTT ke worker lokal untuk membuka relay RTSP ke MediaMTX.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
