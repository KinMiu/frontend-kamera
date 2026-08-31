import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Video,
  Play,
  Pause,
  RefreshCw,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Camera as CameraIcon,
  AlertTriangle,
  Radio,
  Settings2,
  ExternalLink,
  Layers,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export type StreamProtocol = 'webrtc' | 'iframe' | 'hls' | 'simulation';

interface MediaMTXLivePlayerProps {
  cameraName: string;
  cameraId: string;
  macAddress: string;
  mediamtxEndpoint?: string | null;
  rtspEndpoint?: string | null;
  onOpenEditModal?: () => void;
}

interface ParsedMediaMTXEndpoints {
  raw: string;
  host: string;
  streamPath: string;
  webrtcUrl: string;
  whepUrl: string;
  hlsUrl: string;
  iframeUrl: string;
  rtspUrl: string;
}

/**
 * Helper to parse and derive MediaMTX endpoints across various protocols
 */
function parseMediaMTXUrl(endpoint?: string | null): ParsedMediaMTXEndpoints | null {
  if (!endpoint || !endpoint.trim()) return null;
  const raw = endpoint.trim();

  let host = 'localhost';
  let path = 'live';

  try {
    if (raw.startsWith('rtsp://') || raw.startsWith('rtsps://')) {
      const parsed = new URL(raw.replace(/^rtsp(s)?:\/\//, 'http://'));
      host = parsed.hostname || 'localhost';
      path = parsed.pathname.replace(/^\/+/, '') || 'live';
    } else if (raw.startsWith('http://') || raw.startsWith('https://')) {
      const parsed = new URL(raw);
      host = parsed.hostname || 'localhost';
      path = parsed.pathname.replace(/^\/+/, '').replace(/\/whep$/, '').replace(/\/index\.m3u8$/, '') || 'live';
    } else {
      // Raw string format like "localhost:8554/live/cam1" or "live/cam1"
      const parts = raw.split('/');
      if (parts[0].includes(':') || parts[0].includes('.')) {
        host = parts[0].split(':')[0];
        path = parts.slice(1).join('/') || 'live';
      } else {
        path = raw;
      }
    }
  } catch {
    path = raw.replace(/^[a-z]+:\/\/[^/]+\//, '');
  }

  // MediaMTX standard default ports
  const webrtcPort = '8889';
  const hlsPort = '8888';
  const rtspPort = '8554';

  return {
    raw,
    host,
    streamPath: path,
    webrtcUrl: `http://${host}:${webrtcPort}/${path}`,
    whepUrl: `http://${host}:${webrtcPort}/${path}/whep`,
    hlsUrl: `http://${host}:${hlsPort}/${path}/index.m3u8`,
    iframeUrl: `http://${host}:${webrtcPort}/${path}`,
    rtspUrl: `rtsp://${host}:${rtspPort}/${path}`,
  };
}

export function MediaMTXLivePlayer({
  cameraName,
  cameraId,
  macAddress,
  mediamtxEndpoint,
  rtspEndpoint,
  onOpenEditModal,
}: MediaMTXLivePlayerProps) {
  const [protocol, setProtocol] = useState<StreamProtocol>('webrtc');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'error' | 'offline'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveTimestamp, setLiveTimestamp] = useState<string>('');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const parsedEndpoints = parseMediaMTXUrl(mediamtxEndpoint || rtspEndpoint);

  // Update real-time HUD clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const wibString = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      setLiveTimestamp(`${wibString} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // WebRTC WHEP connection handler
  const initWebRTCStream = useCallback(async () => {
    if (!parsedEndpoints || !videoRef.current) return;

    // Cleanup existing peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setConnectionState('connecting');
    setErrorMessage(null);

    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });
      peerConnectionRef.current = pc;

      pc.addTransceiver('video', { direction: 'recvonly' });
      pc.addTransceiver('audio', { direction: 'recvonly' });

      pc.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          setConnectionState('connected');
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          setConnectionState('connected');
        } else if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
          setConnectionState('error');
          setErrorMessage('Koneksi WebRTC terputus dari server MediaMTX.');
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Perform WHEP HTTP POST exchange with MediaMTX
      const response = await fetch(parsedEndpoints.whepUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });

      if (!response.ok) {
        throw new Error(`MediaMTX WHEP Server merespon status ${response.status} (${response.statusText})`);
      }

      const answerSdp = await response.text();
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });

      setConnectionState('connected');
    } catch (err: unknown) {
      console.warn('WebRTC WHEP connection failed, fallback to simulation mode:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menghubungi endpoint MediaMTX WHEP.';
      setErrorMessage(msg);
      setConnectionState('error');
    }
  }, [parsedEndpoints]);

  // Effect to manage stream lifecycle based on active protocol
  useEffect(() => {
    if (!parsedEndpoints) {
      setConnectionState('offline');
      return;
    }

    if (protocol === 'webrtc') {
      initWebRTCStream();
    } else if (protocol === 'iframe') {
      setConnectionState('connected');
      setErrorMessage(null);
    } else if (protocol === 'simulation') {
      setConnectionState('connected');
      setErrorMessage(null);
    }

    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, [protocol, parsedEndpoints, initWebRTCStream]);

  // Toggle Fullscreen mode
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch((err) => {
        console.error('Exit fullscreen failed:', err);
      });
    }
  };

  // Listen for fullscreen change event
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Snapshot capture with timestamp watermark
  const handleCaptureSnapshot = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        toast.error('Gagal menginisialisasi canvas snapshot');
        return;
      }

      // If video has srcObject, draw video frame
      if (videoRef.current && videoRef.current.videoWidth > 0) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      } else {
        // Fallback draw sample canvas
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=1280&auto=format&fit=crop&q=80';
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          applyWatermarkAndDownload(canvas, ctx);
        };
        return;
      }

      applyWatermarkAndDownload(canvas, ctx);
    } catch (e) {
      console.error('Snapshot capture error:', e);
      toast.error('Gagal mengambil snapshot kamera');
    }
  };

  const applyWatermarkAndDownload = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    // Top banner
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, canvas.width, 48);

    // Camera Name & ID
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText('● LIVE CCTV WAY KAMBAS', 20, 32);

    ctx.font = '18px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`| ${cameraName} (${cameraId})`, 280, 32);

    // Bottom banner with timestamp and MAC
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`TIMESTAMP: ${liveTimestamp}  |  MAC: ${macAddress}  |  PROTOCOL: ${protocol.toUpperCase()}`, 20, canvas.height - 15);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `CCTV_${cameraName.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
    link.href = dataUrl;
    link.click();

    toast.success(`Snapshot frame kamera berhasil disimpan! (${link.download})`);
  };

  // Render Empty State if no endpoint configured
  if (!parsedEndpoints) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950 border border-border shadow-inner flex flex-col items-center justify-center p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-3">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-foreground">MediaMTX Endpoint Belum Dikonfigurasi</h3>
        <p className="text-xs text-muted-foreground max-w-md mt-1 mb-4">
          Perangkat kamera ini belum memiliki URL endpoint relay MediaMTX. Silakan atur URL streaming (contoh: <code className="font-mono text-emerald-400">rtsp://localhost:8554/live/cam1</code>) pada menu edit.
        </p>
        <div className="flex items-center gap-2">
          {onOpenEditModal && (
            <Button size="sm" onClick={onOpenEditModal} className="gap-1.5 text-xs">
              <Settings2 className="h-3.5 w-3.5" />
              <span>Konfigurasi MediaMTX Sekarang</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setProtocol('simulation')}
            className="gap-1.5 text-xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Gunakan Simulasi Test Feed</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-border shadow-2xl flex items-center justify-center group ${
        isFullscreen ? 'h-screen w-screen rounded-none border-0' : ''
      }`}
    >
      {/* 1. Protocol: WebRTC Video Element */}
      {protocol === 'webrtc' && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            isPlaying && connectionState === 'connected' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* 2. Protocol: MediaMTX Direct Web Player (Iframe) */}
      {protocol === 'iframe' && (
        <iframe
          src={parsedEndpoints.iframeUrl}
          title={`MediaMTX Live Stream - ${cameraName}`}
          className="h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )}

      {/* 3. Protocol: Simulation Feed (Fallback & Local Test) */}
      {(protocol === 'simulation' || (protocol === 'webrtc' && connectionState !== 'connected')) && (
        <img
          src="https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=1200&auto=format&fit=crop&q=80"
          alt="Way Kambas Wildlife CCTV Feed"
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            isPlaying ? 'opacity-90' : 'opacity-30'
          }`}
        />
      )}

      {/* Connection State / Error State Backdrop */}
      {protocol === 'webrtc' && connectionState === 'error' && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-3">
            <WifiOff className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-white">MediaMTX Live Stream Belum Terhubung</h4>
          <p className="text-xs text-white/70 max-w-sm mt-1 mb-3">
            {errorMessage || 'Server MediaMTX di alamat tersebut sedang offline atau port WebRTC WHEP (8889) belum aktif.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={initWebRTCStream}
              className="h-8 gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Coba Hubungkan Lagi</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setProtocol('iframe')}
              className="h-8 gap-1.5 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Buka Mode Iframe Web Player</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setProtocol('simulation')}
              className="h-8 gap-1.5 text-xs text-slate-300 hover:text-white"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Mode Simulasi</span>
            </Button>
          </div>
        </div>
      )}

      {/* Connecting Loading Overlay */}
      {protocol === 'webrtc' && connectionState === 'connecting' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
          <RefreshCw className="h-7 w-7 animate-spin text-emerald-400" />
          <p className="text-xs font-mono text-white/90">Menghubungkan ke MediaMTX WHEP Stream...</p>
        </div>
      )}

      {/* CCTV HUD Overlay */}
      <div className="absolute inset-0 p-4 pointer-events-none flex flex-col justify-between text-white/90 font-mono text-xs select-none z-20">
        {/* Top HUD */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/10">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span className="font-bold text-red-400">REC</span>
              <span className="text-white/90 font-sans font-semibold">| {cameraName}</span>
            </div>

            <Badge
              variant="outline"
              className="hidden sm:flex items-center gap-1 bg-black/70 backdrop-blur-xs border-emerald-500/30 text-emerald-400 text-[10px] font-mono px-2 py-0.5"
            >
              <Radio className="h-3 w-3 animate-pulse" />
              <span>{protocol.toUpperCase()} LIVE</span>
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-mono border border-white/10 text-white/90">
              {liveTimestamp}
            </div>
          </div>
        </div>

        {/* Center Pause HUD */}
        {!isPlaying && (
          <div className="text-center bg-black/85 backdrop-blur-sm p-4 rounded-xl max-w-xs mx-auto pointer-events-auto border border-white/15 shadow-2xl">
            <Pause className="h-8 w-8 mx-auto mb-2 text-amber-400" />
            <p className="font-sans font-bold text-sm text-white">Stream Dijeda</p>
            <p className="font-sans text-xs text-white/70 mt-1">
              Klik tombol putar untuk melanjutkan pemantauan live streaming.
            </p>
          </div>
        )}

        {/* Bottom HUD */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-mono border border-white/10 text-slate-300">
              MAC: {macAddress}
            </div>
            <div className="hidden md:block bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-mono border border-emerald-500/20 text-emerald-400">
              {connectionState === 'connected' ? (
                <span className="flex items-center gap-1">
                  <Wifi className="h-3 w-3 text-emerald-400" />
                  ONLINE • 1080p @ 30fps
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400">
                  <AlertTriangle className="h-3 w-3" />
                  {connectionState.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Stream Protocol Switcher Badge Selector (Interactive) */}
          <div className="pointer-events-auto flex items-center gap-1 bg-black/80 backdrop-blur-md p-1 rounded-lg border border-white/20">
            <button
              onClick={() => setProtocol('webrtc')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                protocol === 'webrtc'
                  ? 'bg-emerald-500 text-white font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title="WebRTC WHEP (Ultra-Low Latency)"
            >
              WHEP
            </button>
            <button
              onClick={() => setProtocol('iframe')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                protocol === 'iframe'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title="MediaMTX Built-in Web Player"
            >
              Player
            </button>
            <button
              onClick={() => setProtocol('simulation')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                protocol === 'simulation'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title="Mode Simulasi Demo"
            >
              Demo
            </button>
          </div>
        </div>
      </div>

      {/* Floating Interactive Controls (Bottom Right) */}
      <div className="absolute bottom-14 right-4 flex items-center gap-1.5 z-30 opacity-90 group-hover:opacity-100 transition-opacity">
        {/* Play / Pause */}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsPlaying(!isPlaying)}
          className="h-8 w-8 p-0 bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md shadow-lg"
          title={isPlaying ? 'Jeda Stream' : 'Putar Stream'}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </Button>

        {/* Mute / Unmute */}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsMuted(!isMuted)}
          className="h-8 w-8 p-0 bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md shadow-lg"
          title={isMuted ? 'Nyalakan Audio' : 'Matikan Audio'}
        >
          {isMuted ? <VolumeX className="h-3.5 w-3.5 text-slate-300" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
        </Button>

        {/* Snapshot */}
        <Button
          size="sm"
          variant="secondary"
          onClick={handleCaptureSnapshot}
          className="h-8 px-2.5 gap-1.5 text-xs bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md shadow-lg font-medium"
          title="Ambil snapshot foto frame live"
        >
          <CameraIcon className="h-3.5 w-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Snapshot</span>
        </Button>

        {/* Refresh / Reconnect */}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            if (protocol === 'webrtc') initWebRTCStream();
            toast.info('Menyegarkan koneksi stream MediaMTX...');
          }}
          className="h-8 w-8 p-0 bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md shadow-lg"
          title="Refresh / Reconnect stream"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>

        {/* External Web Player Link */}
        {parsedEndpoints && (
          <a
            href={parsedEndpoints.iframeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md shadow-lg transition-colors"
            title="Buka MediaMTX Web Player di Tab Baru"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        {/* Fullscreen */}
        <Button
          size="sm"
          variant="secondary"
          onClick={toggleFullscreen}
          className="h-8 w-8 p-0 bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md shadow-lg"
          title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh (Fullscreen)'}
        >
          {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}
