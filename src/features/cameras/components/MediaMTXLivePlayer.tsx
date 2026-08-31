import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
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
  Sparkles,
  Wifi,
  WifiOff,
  Tv,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export type StreamProtocol = 'hls' | 'webrtc' | 'simulation';

interface MediaMTXLivePlayerProps {
  cameraName: string;
  cameraId: string;
  macAddress: string;
  mediamtxEndpoint?: string | null;
  rtspEndpoint?: string | null;
  onOpenEditModal?: () => void;
}

export interface ParsedMediaMTXEndpoints {
  raw: string;
  host: string;
  streamPath: string;
  hlsPlayerUrl: string;
  hlsStreamUrl: string;
  webrtcPlayerUrl: string;
  whepUrl: string;
  rtspUrl: string;
}

/**
 * Helper to parse and derive MediaMTX endpoints across various protocols
 */
export function parseMediaMTXUrl(endpoint?: string | null): ParsedMediaMTXEndpoints | null {
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
      path = parsed.pathname
        .replace(/^\/+/, '')
        .replace(/\/whep$/, '')
        .replace(/\/index\.m3u8$/, '')
        .replace(/\/+$/, '') || 'live';
    } else {
      // Raw format like "195.35.23.135:8554/lab_cam_1" or "lab_cam_1"
      const parts = raw.split('/');
      if (parts[0].includes(':') || parts[0].includes('.')) {
        host = parts[0].split(':')[0];
        path = parts.slice(1).join('/') || 'live';
      } else {
        path = raw;
      }
    }
  } catch {
    path = raw.replace(/^[a-z]+:\/\/[^/]+\//, '').replace(/\/+$/, '');
  }

  // MediaMTX Standard Default Ports:
  // - 8888: HLS Stream (index.m3u8) & Built-in Web Player (HTTP)
  // - 8889: WebRTC / WHEP Server (HTTP)
  // - 8554: RTSP Relay Ingest (TCP)
  const hlsPort = '8888';
  const webrtcPort = '8889';
  const rtspPort = '8554';

  return {
    raw,
    host,
    streamPath: path,
    hlsPlayerUrl: `http://${host}:${hlsPort}/${path}/`,
    hlsStreamUrl: `http://${host}:${hlsPort}/${path}/index.m3u8`,
    webrtcPlayerUrl: `http://${host}:${webrtcPort}/${path}/`,
    whepUrl: `http://${host}:${webrtcPort}/${path}/whep`,
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
  // Default to 'hls' (Port 8888) rendered via HLS.js in native HTML5 Video
  const [protocol, setProtocol] = useState<StreamProtocol>('hls');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'error' | 'offline'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveTimestamp, setLiveTimestamp] = useState<string>('');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
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

  // Synchronize isPlaying with HTML5 Video Element
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  // Synchronize isMuted with HTML5 Video Element
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = isMuted;
  }, [isMuted]);

  // Clean up HLS and WebRTC resources
  const cleanupStreams = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
    }
  }, []);

  // HLS Stream Handler using hls.js (Port 8888)
  const initHlsStream = useCallback(() => {
    if (!parsedEndpoints || !videoRef.current) return;

    cleanupStreams();
    setConnectionState('connecting');
    setErrorMessage(null);

    const video = videoRef.current;
    const hlsUrl = parsedEndpoints.hlsStreamUrl;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 6,
      });
      hlsRef.current = hls;

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setConnectionState('connected');
        if (isPlaying) {
          video.play().catch((err) => console.warn('Autoplay unmuted notice:', err));
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('HLS Network Error, attempting auto recovery...', data);
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('HLS Media Error, attempting recovery...', data);
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal HLS Error:', data);
              hls.destroy();
              setConnectionState('error');
              setErrorMessage('Gagal memuat HLS live stream dari server MediaMTX.');
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Apple Safari HLS playback
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        setConnectionState('connected');
        if (isPlaying) {
          video.play().catch(console.warn);
        }
      });
      video.addEventListener('error', () => {
        setConnectionState('error');
        setErrorMessage('Gagal memutar HLS stream native.');
      });
    } else {
      setConnectionState('error');
      setErrorMessage('Browser tidak mendukung pemutaran HLS live stream.');
    }
  }, [parsedEndpoints, isPlaying, cleanupStreams]);

  // WebRTC WHEP Stream Handler (Port 8889)
  const initWebRTCStream = useCallback(async () => {
    if (!parsedEndpoints || !videoRef.current) return;

    cleanupStreams();
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
          if (isPlaying) {
            videoRef.current.play().catch(console.warn);
          }
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          setConnectionState('connected');
        } else if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
          setConnectionState('error');
          setErrorMessage('Koneksi WebRTC WHEP (port 8889) terputus.');
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const response = await fetch(parsedEndpoints.whepUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });

      if (!response.ok) {
        throw new Error(`MediaMTX WHEP Server status ${response.status} (${response.statusText})`);
      }

      const answerSdp = await response.text();
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });

      setConnectionState('connected');
    } catch (err: unknown) {
      console.warn('WebRTC WHEP connection failed:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menghubungi endpoint WebRTC WHEP.';
      setErrorMessage(msg);
      setConnectionState('error');
    }
  }, [parsedEndpoints, isPlaying, cleanupStreams]);

  // Manage stream lifecycle based on active protocol
  useEffect(() => {
    if (!parsedEndpoints) {
      setConnectionState('offline');
      return;
    }

    if (protocol === 'hls') {
      initHlsStream();
    } else if (protocol === 'webrtc') {
      initWebRTCStream();
    } else if (protocol === 'simulation') {
      cleanupStreams();
      setConnectionState('connected');
      setErrorMessage(null);
    }

    return () => {
      cleanupStreams();
    };
  }, [protocol, parsedEndpoints, initHlsStream, initWebRTCStream, cleanupStreams]);

  // Fullscreen handler
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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Snapshot Capture Feature: Grabs REAL active video frame from the <video> element
  const handleCaptureSnapshot = () => {
    try {
      const video = videoRef.current;

      // When live video is playing
      if (video && video.videoWidth > 0 && video.videoHeight > 0) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          toast.error('Gagal menginisialisasi canvas snapshot');
          return;
        }

        // Draw exact live frame from real video element
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        applyWatermarkAndDownload(canvas, ctx);
        return;
      }

      // If in demo simulation mode or video not yet ready
      if (protocol === 'simulation') {
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

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

      toast.warning('Sedang menunggu video stream aktif sebelum mengambil snapshot.');
    } catch (e) {
      console.error('Snapshot capture error:', e);
      toast.error('Gagal mengambil snapshot frame kamera.');
    }
  };

  const applyWatermarkAndDownload = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    // Top HUD Bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, canvas.width, 48);

    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText('● LIVE CCTV WAY KAMBAS', 20, 32);

    ctx.font = '18px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`| ${cameraName} (${cameraId})`, 280, 32);

    // Bottom HUD Bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(
      `TIMESTAMP: ${liveTimestamp}  |  MAC: ${macAddress}  |  PROTOCOL: ${protocol.toUpperCase()}`,
      20,
      canvas.height - 15
    );

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `CCTV_${cameraName.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
    link.href = dataUrl;
    link.click();

    toast.success(`Snapshot frame kamera berhasil disimpan: ${link.download}`);
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
          Perangkat kamera ini belum memiliki URL endpoint relay MediaMTX. Silakan atur URL relay (contoh: <code className="font-mono text-emerald-400">rtsp://195.35.23.135:8554/lab_cam_1</code>) pada menu edit.
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
      {/* 1. Real HTML5 Video Element (Used for both HLS & WebRTC WHEP with full snapshot support) */}
      {(protocol === 'hls' || protocol === 'webrtc') && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          crossOrigin="anonymous"
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            isPlaying && connectionState === 'connected' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* 2. Simulation Demo Mode Image Feed */}
      {(protocol === 'simulation' || ((protocol === 'hls' || protocol === 'webrtc') && connectionState === 'error')) && (
        <img
          src="https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=1200&auto=format&fit=crop&q=80"
          alt="Way Kambas CCTV Feed"
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            isPlaying ? 'opacity-90' : 'opacity-30'
          }`}
        />
      )}

      {/* Stream Error Overlay */}
      {connectionState === 'error' && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-3">
            <WifiOff className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-white">Stream Video Belum Terhubung</h4>
          <p className="text-xs text-white/70 max-w-md mt-1 mb-4 leading-relaxed">
            {errorMessage || 'Pastikan worker lokal sedang berjalan dan mengirim stream ke server MediaMTX.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                if (protocol === 'hls') initHlsStream();
                else if (protocol === 'webrtc') initWebRTCStream();
              }}
              className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Coba Hubungkan Ulang</span>
            </Button>
            {protocol !== 'hls' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setProtocol('hls')}
                className="h-8 gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                <Tv className="h-3.5 w-3.5" />
                <span>Gunakan HLS (Port 8888)</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Connecting Loading Overlay */}
      {connectionState === 'connecting' && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
          <RefreshCw className="h-7 w-7 animate-spin text-emerald-400" />
          <p className="text-xs font-mono text-white/90">
            {protocol === 'hls' ? 'Memuat HLS Live Stream (Port 8888)...' : 'Menghubungkan WebRTC WHEP (Port 8889)...'}
          </p>
        </div>
      )}

      {/* CCTV HUD Overlay */}
      <div className="absolute inset-0 p-4 pointer-events-none flex flex-col justify-between text-white/90 font-mono text-xs select-none z-20">
        {/* Top HUD */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="hidden sm:flex items-center gap-1 bg-black/70 backdrop-blur-xs border-emerald-500/30 text-emerald-400 text-[10px] font-mono px-2 py-0.5"
            >
              <Radio className="h-3 w-3 animate-pulse" />
              <span>{protocol === 'hls' ? 'HLS LIVE (PORT 8888)' : protocol === 'webrtc' ? 'WHEP LIVE (PORT 8889)' : 'SIMULASI'}</span>
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-mono border border-white/10 text-white/90">
              {liveTimestamp}
            </div>
          </div>
        </div>

        {/* Center Pause Indicator */}
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
              <span className="flex items-center gap-1">
                <Wifi className="h-3 w-3 text-emerald-400" />
                ONLINE • STREAM ACTIVE
              </span>
            </div>
          </div>

          {/* Interactive Protocol Switcher */}
          <div className="pointer-events-auto flex items-center gap-1 bg-black/80 backdrop-blur-md p-1 rounded-lg border border-white/20">
            <button
              onClick={() => setProtocol('hls')}
              className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                protocol === 'hls'
                  ? 'bg-emerald-500 text-white font-bold shadow-xs'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title="HLS Native Player Port 8888 (Mendukung Real Snapshot & Low Bandwidth)"
            >
              HLS (8888)
            </button>
            <button
              onClick={() => setProtocol('webrtc')}
              className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                protocol === 'webrtc'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title="WebRTC WHEP Port 8889 (Ultra-Low Latency)"
            >
              WHEP (8889)
            </button>
            <button
              onClick={() => setProtocol('simulation')}
              className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                protocol === 'simulation'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title="Mode Simulasi Demo"
            >
              Demo
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Controls (Bottom Right) */}
      <div className="absolute bottom-14 right-4 flex items-center gap-1.5 z-30 opacity-90 group-hover:opacity-100 transition-opacity pointer-events-auto">
        {/* Play / Pause Toggle */}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsPlaying(!isPlaying)}
          className="h-8 w-8 p-0 bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md shadow-lg"
          title={isPlaying ? 'Jeda Stream' : 'Putar Stream'}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </Button>

        {/* Audio Mute / Unmute */}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsMuted(!isMuted)}
          className="h-8 w-8 p-0 bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md shadow-lg"
          title={isMuted ? 'Nyalakan Audio' : 'Matikan Audio'}
        >
          {isMuted ? <VolumeX className="h-3.5 w-3.5 text-slate-300" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
        </Button>

        {/* Real Video Snapshot Button */}
        <Button
          size="sm"
          variant="secondary"
          onClick={handleCaptureSnapshot}
          className="h-8 px-2.5 gap-1.5 text-xs bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md shadow-lg font-medium"
          title="Ambil snapshot foto langsung dari frame live stream kamera"
        >
          <CameraIcon className="h-3.5 w-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Snapshot</span>
        </Button>

        {/* Reload / Refresh Stream */}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            if (protocol === 'hls') {
              initHlsStream();
            } else if (protocol === 'webrtc') {
              initWebRTCStream();
            }
            toast.info('Menyegarkan live stream...');
          }}
          className="h-8 w-8 p-0 bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md shadow-lg"
          title="Refresh live stream"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>

        {/* Open Direct Tab */}
        {parsedEndpoints && (
          <a
            href={parsedEndpoints.hlsPlayerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md shadow-lg transition-colors"
            title="Buka MediaMTX Web Player langsung di tab baru"
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
