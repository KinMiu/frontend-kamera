import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import {
  Camera as CameraIcon,
  Video,
  Layers,
  Plus,
  Minus,
  Navigation,
  Compass,
  Radio,
  Eye,
  ExternalLink,
  MapPin,
  Sparkles,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetCameras } from '@/features/cameras/hooks/use-cameras';
import { Camera } from '@/types';

// Predefined GPS Coordinates for Way Kambas National Park Camera Points
export const WAY_KAMBAS_LOCATIONS: Record<string, { lat: number; lng: number; sector: string }> = {
  'cam-wk-001': { lat: -5.0425, lng: 105.7289, sector: 'Sektor Way Kanan' },
  'cam-wk-002': { lat: -4.9580, lng: 105.7620, sector: 'Sektor Plang Ijo' },
  'cam-wk-003': { lat: -5.1200, lng: 105.6800, sector: 'Pusat Latihan Gajah (PLG)' },
  'cam-wk-004': { lat: -5.0150, lng: 105.8150, sector: 'Zona Inti Rawa Bunder' },
  'cam-wk-005': { lat: -4.9200, lng: 105.8850, sector: 'Kuala Kambas' },
  'cam-wk-006': { lat: -5.0850, lng: 105.7550, sector: 'Suaka Rhino Sumatera (SRS)' },
  'cam-wk-007': { lat: -5.1600, lng: 105.6500, sector: 'Gerbang Masuk Utama' },
  'cam-wk-008': { lat: -5.0350, lng: 105.7350, sector: 'Menara Pantau Way Kanan' },
};

export function getCoordinatesForCamera(camera: Camera, index = 0): { lat: number; lng: number; sector: string } {
  // If camera has saved coordinates from database, use them directly
  if (
    camera.latitude != null &&
    camera.longitude != null &&
    !isNaN(Number(camera.latitude)) &&
    !isNaN(Number(camera.longitude))
  ) {
    const lat = Number(camera.latitude);
    const lng = Number(camera.longitude);
    return {
      lat,
      lng,
      sector: `Koordinat GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    };
  }

  if (WAY_KAMBAS_LOCATIONS[camera.id]) {
    return WAY_KAMBAS_LOCATIONS[camera.id];
  }
  // Generate deterministic offset around Way Kambas center for cameras without saved coordinates
  const hash = (camera.id + camera.name).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const latOffset = ((hash % 100) / 500) - 0.1;
  const lngOffset = (((hash * 13) % 100) / 450) - 0.1;
  return {
    lat: -5.05 + latOffset,
    lng: 105.75 + lngOffset,
    sector: `Pos Sektor #${index + 1}`,
  };
}

// Free Detailed Map Tile Providers
const TILE_PROVIDERS = {
  satellite: {
    name: 'Satelit + Wilayah',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    overlayUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
  },
  topo: {
    name: 'Topografi & Hutan',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, DeLorme, TomTom',
  },
  street: {
    name: 'Peta Jalan & Pos',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, HERE, Garmin',
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
};

export function WayKambasCameraMap() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const overlayLayerRef = useRef<L.TileLayer | null>(null);

  const { data: camerasResponse } = useGetCameras({ page: 1, pageSize: 50 });
  const cameras: Camera[] = camerasResponse?.data || [];

  const [activeLayer, setActiveLayer] = useState<'satellite' | 'topo' | 'street' | 'osm'>('satellite');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  // Center of Taman Nasional Way Kambas
  const TNWK_CENTER: [number, number] = [-5.05, 105.76];

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const config = TILE_PROVIDERS[activeLayer];

      const map = L.map(mapContainerRef.current, {
        center: TNWK_CENTER,
        zoom: 11,
        minZoom: 9,
        maxZoom: 17,
        zoomControl: false,
        attributionControl: false,
      });

      const baseTile = L.tileLayer(config.url, {
        maxZoom: 17,
        attribution: config.attribution,
      }).addTo(map);
      tileLayerRef.current = baseTile;

      if ('overlayUrl' in config && config.overlayUrl) {
        const overlay = L.tileLayer(config.overlayUrl, { maxZoom: 17 }).addTo(map);
        overlayLayerRef.current = overlay;
      }

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;

      mapInstanceRef.current = map;
    }

    return () => {
      // Clean up when unmounting
    };
  }, []);

  // Update base tile when activeLayer changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const map = mapInstanceRef.current;
    const config = TILE_PROVIDERS[activeLayer];

    tileLayerRef.current.remove();
    if (overlayLayerRef.current) {
      overlayLayerRef.current.remove();
      overlayLayerRef.current = null;
    }

    const newBase = L.tileLayer(config.url, {
      maxZoom: 17,
      attribution: config.attribution,
    }).addTo(map);
    tileLayerRef.current = newBase;

    if ('overlayUrl' in config && config.overlayUrl) {
      const newOverlay = L.tileLayer(config.overlayUrl, { maxZoom: 17 }).addTo(map);
      overlayLayerRef.current = newOverlay;
    }
  }, [activeLayer]);

  // Render camera markers on the map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    cameras.forEach((camera, index) => {
      const { lat, lng, sector } = getCoordinatesForCamera(camera, index);

      // Create custom pulse icon
      const customIcon = L.divIcon({
        className: 'camera-map-marker-container',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <span class="absolute h-8 w-8 rounded-full bg-emerald-500/30 animate-ping"></span>
            <div class="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 border-2 border-white transition-transform hover:scale-125">
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

      const marker = L.marker([lat, lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedCamera(camera);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1 });
        }
      });

      // Tooltip preview
      marker.bindTooltip(
        `<strong>${camera.name}</strong><br/><span style="font-size:11px;color:#10b981;">● RTSP Active</span> - ${sector}`,
        { direction: 'top', offset: [0, -18], className: 'camera-map-tooltip' }
      );

      markersGroup.addLayer(marker);
    });
  }, [cameras]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    mapInstanceRef.current?.flyTo(TNWK_CENTER, 11, { duration: 1.2 });
    setSelectedCamera(null);
  };

  const handleFocusCamera = (camera: Camera, index: number) => {
    const coords = getCoordinatesForCamera(camera, index);
    setSelectedCamera(camera);
    mapInstanceRef.current?.flyTo([coords.lat, coords.lng], 14, { duration: 1 });
  };

  return (
    <Card className="border-border/80 bg-card shadow-xs overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Peta Sebaran Kamera (TN Way Kambas)
            </CardTitle>
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
              {cameras.length} Titik Terpasang
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Visualisasi geolokasi dan status RTSP live stream kamera di kawasan konservasi.
          </CardDescription>
        </div>

        {/* Map Layer Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-muted/40 p-1 rounded-lg border text-xs">
          {(['satellite', 'topo', 'street', 'osm'] as const).map((layerKey) => (
            <button
              key={layerKey}
              type="button"
              onClick={() => setActiveLayer(layerKey)}
              className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors ${
                activeLayer === layerKey
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {TILE_PROVIDERS[layerKey].name}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0 relative">
        {/* Leaflet Map Canvas */}
        <div
          ref={mapContainerRef}
          className="h-[380px] sm:h-[420px] w-full z-10 bg-slate-950"
        />

        {/* Floating Custom Map Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 shadow-lg bg-background/90 backdrop-blur-md p-1.5 rounded-xl border border-border/80">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="h-8 w-8 rounded-lg"
            title="Perbesar Peta"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="h-8 w-8 rounded-lg"
            title="Perkecil Peta"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleResetView}
            className="h-8 w-8 rounded-lg text-primary"
            title="Pusatkan ke TN Way Kambas"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>

        {/* Floating Quick Camera Selector Pill Bar (Bottom) */}
        <div className="absolute bottom-4 left-4 right-4 z-20 overflow-x-auto pb-1 flex items-center gap-2 pointer-events-auto select-none">
          <div className="bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border/80 text-[11px] font-bold text-muted-foreground flex items-center gap-1.5 shrink-0 shadow-md">
            <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
            <span>Pilih Titik:</span>
          </div>

          {cameras.map((cam, idx) => {
            const isSelected = selectedCamera?.id === cam.id;
            const { sector } = getCoordinatesForCamera(cam, idx);
            return (
              <button
                key={cam.id}
                type="button"
                onClick={() => handleFocusCamera(cam, idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 border backdrop-blur-md shadow-md transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-primary/25 font-semibold scale-105'
                    : 'bg-background/90 text-foreground border-border hover:bg-accent'
                }`}
              >
                <CameraIcon className="h-3.5 w-3.5" />
                <span className="truncate max-w-[140px]">{cam.name}</span>
                <span className="text-[10px] opacity-75 hidden sm:inline">({sector})</span>
              </button>
            );
          })}
        </div>

        {/* Selected Camera Drawer Popup Overlay */}
        {selectedCamera && (
          <div className="absolute top-4 left-4 z-20 max-w-sm rounded-xl border border-border/80 bg-background/95 backdrop-blur-md p-4 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Video className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground leading-tight">
                    {selectedCamera.name}
                  </h4>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    MAC: {selectedCamera.macAddress}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedCamera(null)}
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
            </div>

            <div className="rounded-lg bg-muted/40 p-2.5 font-mono text-[11px] text-muted-foreground border truncate">
              <span className="text-primary">URI:</span> {selectedCamera.rtspEndpoint}
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-background/50 px-2 py-1 rounded-md border">
              <span className="flex items-center gap-1 font-sans">
                <MapPin className="h-3 w-3 text-primary" />
                {getCoordinatesForCamera(selectedCamera).sector}
              </span>
              <span className="font-mono text-[10px]">
                {getCoordinatesForCamera(selectedCamera).lat.toFixed(4)}, {getCoordinatesForCamera(selectedCamera).lng.toFixed(4)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                Stream Aktif
              </Badge>

              <Button
                size="sm"
                onClick={() => navigate(`/cameras/${selectedCamera.id}`)}
                className="text-xs h-7 gap-1"
              >
                <Eye className="h-3 w-3" />
                <span>Buka Detail</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
