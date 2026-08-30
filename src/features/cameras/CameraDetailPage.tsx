import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import L from 'leaflet';
import {
  ArrowLeft,
  Camera as CameraIcon,
  Video,
  Network,
  Copy,
  Check,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Radio,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Layers,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetCameraById } from '@/features/cameras/hooks/use-cameras';
import { CameraFormModal } from '@/features/cameras/components/CameraFormModal';
import { DeleteCameraDialog } from '@/features/cameras/components/DeleteCameraDialog';
import { getCoordinatesForCamera } from '@/features/dashboard/components/WayKambasCameraMap';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function CameraDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: camera, isLoading, isError } = useGetCameraById(id || '');

  const [isPlaying, setIsPlaying] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const miniMapContainerRef = useRef<HTMLDivElement | null>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);

  const coords = camera ? getCoordinatesForCamera(camera) : null;

  useEffect(() => {
    if (!miniMapContainerRef.current || !coords || miniMapInstanceRef.current) return;

    const map = L.map(miniMapContainerRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 17 }
    ).addTo(map);

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 17 }
    ).addTo(map);

    const customIcon = L.divIcon({
      className: 'camera-map-marker-container',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute h-8 w-8 rounded-full bg-emerald-500/40 animate-ping"></span>
          <div class="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
          <span class="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([coords.lat, coords.lng], { icon: customIcon })
      .addTo(map)
      .bindTooltip(`<strong>${camera?.name}</strong><br/>${coords.sector}`, {
        permanent: false,
        direction: 'top',
        offset: [0, -16],
      });

    miniMapInstanceRef.current = map;

    return () => {
      map.remove();
      miniMapInstanceRef.current = null;
    };
  }, [camera, coords]);

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} berhasil disalin!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Memuat detail data kamera...</p>
      </div>
    );
  }

  if (isError || !camera) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Kamera Tidak Ditemukan</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Data perangkat dengan ID &ldquo;{id}&rdquo; tidak terdaftar di sistem.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/cameras')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Daftar Kamera</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/cameras')}
            className="h-9 w-9 shrink-0 rounded-lg"
            title="Kembali"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {camera.name}
              </h1>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                RTSP Stream Live
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              ID: {camera.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditModalOpen(true)}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Data</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Hapus</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Stream Player + Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: RTSP Live Player Preview */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border/80 bg-card shadow-xs overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Video className="h-4 w-4 text-primary" />
                  Live RTSP Stream Monitor
                </CardTitle>
                <CardDescription className="text-xs">
                  Streaming langsung dari endpoint RTSP perangkat di Way Kambas.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-[11px] bg-muted/40">
                1080p @ 30fps
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              {/* Video Player Canvas Box */}
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-border shadow-inner flex items-center justify-center group">
                {/* Simulated CCTV Camera Feed with Wildlife Way Kambas scene */}
                <img
                  src="https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=1200&auto=format&fit=crop&q=80"
                  alt="Way Kambas Wildlife CCTV Feed"
                  className={`h-full w-full object-cover transition-opacity duration-300 ${
                    isPlaying ? 'opacity-90' : 'opacity-30'
                  }`}
                />

                {/* CCTV HUD Overlay */}
                <div className="absolute inset-0 p-4 pointer-events-none flex flex-col justify-between text-white/90 font-mono text-xs select-none">
                  {/* Top HUD */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                      <span className="font-bold text-red-400">REC</span>
                      <span className="text-white/80">| {camera.name}</span>
                    </div>
                    <div className="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px]">
                      {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC
                    </div>
                  </div>

                  {/* Center HUD when paused */}
                  {!isPlaying && (
                    <div className="text-center bg-black/80 backdrop-blur-sm p-4 rounded-xl max-w-xs mx-auto pointer-events-auto">
                      <Pause className="h-8 w-8 mx-auto mb-2 text-amber-400" />
                      <p className="font-sans font-bold text-sm">Stream Dijeda</p>
                      <p className="font-sans text-xs text-white/70 mt-1">
                        Klik tombol putar untuk melanjutkan pemantauan feed live.
                      </p>
                    </div>
                  )}

                  {/* Bottom HUD */}
                  <div className="flex items-center justify-between">
                    <div className="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px]">
                      MAC: {camera.macAddress}
                    </div>
                    <div className="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] text-emerald-400">
                      RTSP ACTIVE
                    </div>
                  </div>
                </div>

                {/* Stream Controls Overlay */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="h-8 gap-1.5 text-xs bg-black/70 hover:bg-black text-white border-white/20 backdrop-blur-sm shadow-md"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        <span>Jeda</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        <span>Putar</span>
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => toast.success('Snapshot tersimpan ke galeri inspeksi!')}
                    className="h-8 text-xs bg-black/70 hover:bg-black text-white border-white/20 backdrop-blur-sm shadow-md"
                  >
                    Ambil Snapshot
                  </Button>
                </div>
              </div>

              {/* RTSP Direct Link Box */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-primary" />
                    RTSP Streaming URI
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(camera.rtspEndpoint, 'rtsp', 'RTSP URL')}
                    className="h-7 text-xs gap-1.5"
                  >
                    {copiedKey === 'rtsp' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>Salin URI</span>
                  </Button>
                </div>
                <code className="block rounded-lg bg-background p-2.5 font-mono text-xs text-foreground border break-all select-all">
                  {camera.rtspEndpoint}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Technical Specs & GitHub Issues Action */}
        <div className="space-y-6">
          {/* Specifications Card */}
          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Spesifikasi Teknis
              </CardTitle>
              <CardDescription className="text-xs">
                Data entitas perangkat (Prisma Device model).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1 text-xs">
              <div className="space-y-3 divide-y divide-border/60">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <CameraIcon className="h-3.5 w-3.5" />
                    Nama Kamera
                  </span>
                  <span className="font-semibold text-foreground">{camera.name}</span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Network className="h-3.5 w-3.5" />
                    MAC Address
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-medium text-foreground">{camera.macAddress}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopy(camera.macAddress, 'mac', 'MAC Address')}
                    >
                      {copiedKey === 'mac' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    Koordinat GPS
                  </span>
                  <span className="font-mono font-medium text-foreground">
                    {camera.latitude != null && camera.longitude != null
                      ? `${Number(camera.latitude).toFixed(4)}, ${Number(camera.longitude).toFixed(4)}`
                      : '- Belum diset -'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Status Sinyal
                  </span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px]">
                    Online (Connected)
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Tanggal Pendaftaran
                  </span>
                  <span className="font-medium text-foreground">
                    {formatDate(camera.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Pembaruan Terakhir
                  </span>
                  <span className="font-medium text-foreground">
                    {formatDate(camera.updatedAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GPS Location & Sector Map Card */}
          <Card className="border-border/80 bg-card shadow-xs overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Lokasi Pos Sektor
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {coords?.lat.toFixed(4)}, {coords?.lng.toFixed(4)}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                {coords?.sector} (Kawasan TN Way Kambas)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div
                ref={miniMapContainerRef}
                className="h-44 w-full bg-slate-950 border-t border-border/60"
              />
            </CardContent>
          </Card>

          {/* GitHub Issue Reporting Card */}
          <Card className="border-border/80 bg-gradient-to-br from-card to-muted/30 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">Lapor Kendala Kamera</CardTitle>
                  <CardDescription className="text-[11px]">
                    Laporkan bug stream atau kerusakan perangkat ke GitHub Issues.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Menemukan kendala transmisi RTSP atau konektivitas pada kamera ini? Buat tiket issue di repositori GitHub project.
              </p>
              <Link to="/issues">
                <Button variant="outline" className="w-full text-xs h-9 gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Buka GitHub Issues</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Camera Modal */}
      <CameraFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        camera={camera}
      />

      {/* Delete Confirmation Alert Dialog */}
      <DeleteCameraDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        camera={camera}
      />
    </div>
  );
}
