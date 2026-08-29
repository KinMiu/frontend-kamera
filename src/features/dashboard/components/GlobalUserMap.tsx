import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import {
  MapPin,
  Globe2,
  Users,
  ExternalLink,
  ArrowRight,
  Plus,
  Minus,
  Navigation,
  Compass,
  Layers,
  Map as MapIcon,
  X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetUsers } from '@/features/users/hooks/use-users';
import { initialUsers } from '@/lib/mock-data';
import { User } from '@/types';

// 100% Free, Rich, and Detailed Map Tile Providers (No API Key Required)
const TILE_PROVIDERS = {
  // Ultra-detailed Street Map with all roads, buildings, and POIs
  street: {
    name: 'Jalan & Tempat',
    shortName: 'Jalan',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 16,
      attribution: '&copy; Esri, HERE, Garmin, USGS, NGA',
    },
  },
  // OpenStreetMap Official standard layer with rich street infrastructure
  osm: {
    name: 'OpenStreetMap',
    shortName: 'OSM',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 16,
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  // Topographic & Landmarks Map
  topo: {
    name: 'Topografi',
    shortName: 'Topo',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 16,
      attribution: '&copy; Esri, DeLorme, NAVTEQ, TomTom',
    },
  },
  // High-Resolution Satellite with Street Overlay
  hybrid: {
    name: 'Satelit + Jalan',
    shortName: 'Satelit',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    overlayUrl:
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 16,
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    },
  },
};

export function GlobalUserMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const overlayLayerRef = useRef<L.TileLayer | null>(null);

  const { data: usersResponse } = useGetUsers({ page: 1, pageSize: 100 });
  const allUsers: User[] = usersResponse?.data || initialUsers;

  const [currentZoom, setCurrentZoom] = useState<number>(5);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeLayerType, setActiveLayerType] = useState<'street' | 'osm' | 'topo' | 'hybrid'>('street');

  // Initialize and manage Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const config = TILE_PROVIDERS[activeLayerType];

      const map = L.map(mapContainerRef.current, {
        center: [-2.5489, 118.0149],
        zoom: 5,
        minZoom: 4,
        maxZoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      const tileLayer = L.tileLayer(config.url, config.options).addTo(map);
      const markersLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      tileLayerRef.current = tileLayer;
      markersLayerRef.current = markersLayer;

      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });
    }

    // ResizeObserver to automatically invalidate and fix map rendering on layout/sidebar changes
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update tile layer when activeLayerType changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const config = TILE_PROVIDERS[activeLayerType];

    // Update main base layer
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(config.url);
    }

    // Handle satellite hybrid overlay
    if (activeLayerType === 'hybrid') {
      if (!overlayLayerRef.current) {
        overlayLayerRef.current = L.tileLayer(TILE_PROVIDERS.hybrid.overlayUrl, {
          maxZoom: 16,
        }).addTo(mapInstanceRef.current);
      }
    } else {
      if (overlayLayerRef.current) {
        mapInstanceRef.current.removeLayer(overlayLayerRef.current);
        overlayLayerRef.current = null;
      }
    }
  }, [activeLayerType]);

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    allUsers.forEach((user) => {
      const lat = user.latitude ?? -6.2255;
      const lng = user.longitude ?? 106.8097;

      // Clean, high-visibility glowing location pin marker
      const markerHtml = `
        <div class="user-map-pin-container group" style="position: relative; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <span style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(37, 99, 235, 0.45); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <div style="width: 22px; height: 22px; border-radius: 9999px; background: #1d4ed8; border: 2px solid #ffffff; box-shadow: 0 3px 12px rgba(29, 78, 216, 0.7); display: flex; align-items: center; justify-content: center; color: #ffffff; transition: transform 0.2s ease;">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-leaflet-user-pin',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedUser(user);
        setSelectedUserId(user.id);
        mapInstanceRef.current?.flyTo([lat, lng], Math.max(13, mapInstanceRef.current.getZoom()), {
          duration: 1.2,
        });
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [allUsers]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleFocusUser = (user: User) => {
    setSelectedUser(user);
    setSelectedUserId(user.id);
    const lat = user.latitude ?? -6.2255;
    const lng = user.longitude ?? 106.8097;
    mapInstanceRef.current?.flyTo([lat, lng], 14, {
      duration: 1.5,
    });
  };

  const handleResetCenter = () => {
    setSelectedUser(null);
    setSelectedUserId(null);
    mapInstanceRef.current?.flyTo([-2.5489, 118.0149], 5, {
      duration: 1.5,
    });
  };

  return (
    <Card className="border-border/80 bg-card shadow-xs overflow-hidden transition-all">
      {/* Responsive Header Bar */}
      <CardHeader className="border-b border-border/80 bg-muted/20 p-3 sm:p-4 pb-3 sm:pb-3.5">
        <div className="flex flex-col gap-3">
          {/* Top Row: Title, Badge, and Layer/Zoom Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Globe2 className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center flex-wrap gap-1.5">
                  <CardTitle className="text-sm sm:text-base font-bold truncate">
                    Peta Lokasi Pengguna
                  </CardTitle>
                  <Badge variant="secondary" className="text-[10px] sm:text-[11px] font-normal shrink-0">
                    {allUsers.length} Terpetakan
                  </Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground line-clamp-1">
                  Peta interaktif Indonesia. Klik marker untuk melihat detail.
                </CardDescription>
              </div>
            </div>

            {/* Layer Style Switcher & Zoom Indicator */}
            <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto">
              <div className="inline-flex rounded-lg border border-border bg-background/80 p-0.5 text-xs overflow-x-auto max-w-full">
                <button
                  type="button"
                  onClick={() => setActiveLayerType('street')}
                  className={`px-2 py-0.75 sm:px-2.5 sm:py-1 rounded-md transition-colors text-[11px] sm:text-xs font-medium shrink-0 ${
                    activeLayerType === 'street'
                      ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Peta jalan lengkap dengan nama jalan, gedung, dan tempat"
                >
                  <span className="hidden sm:inline">Jalan & Tempat</span>
                  <span className="sm:hidden">Jalan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLayerType('osm')}
                  className={`px-2 py-0.75 sm:px-2.5 sm:py-1 rounded-md transition-colors text-[11px] sm:text-xs font-medium shrink-0 ${
                    activeLayerType === 'osm'
                      ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="OpenStreetMap Standard"
                >
                  OSM
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLayerType('hybrid')}
                  className={`px-2 py-0.75 sm:px-2.5 sm:py-1 rounded-md transition-colors text-[11px] sm:text-xs font-medium shrink-0 ${
                    activeLayerType === 'hybrid'
                      ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Foto Satelit dengan Label Nama Jalan"
                >
                  <span className="hidden sm:inline">Satelit + Jalan</span>
                  <span className="sm:hidden">Satelit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLayerType('topo')}
                  className={`px-2 py-0.75 sm:px-2.5 sm:py-1 rounded-md transition-colors text-[11px] sm:text-xs font-medium shrink-0 ${
                    activeLayerType === 'topo'
                      ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Peta Topografi & Kontur"
                >
                  <span className="hidden sm:inline">Topografi</span>
                  <span className="sm:hidden">Topo</span>
                </button>
              </div>

              <span className="text-[11px] sm:text-xs font-mono text-muted-foreground bg-muted/60 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-border/60 shrink-0">
                {currentZoom}x
              </span>
            </div>
          </div>

          {/* User Quick Navigation Pills (Touch Friendly & Responsive Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none touch-pan-x">
            <span className="text-[11px] text-muted-foreground font-semibold shrink-0 flex items-center gap-1">
              <Users className="h-3 w-3 text-primary" />
              <span className="hidden xs:inline">Lompat:</span>
            </span>
            <button
              type="button"
              onClick={handleResetCenter}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all border ${
                selectedUserId === null
                  ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'border-border bg-card/80 text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              🇮🇩 Seluruh Indonesia
            </button>
            {allUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleFocusUser(user)}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all border ${
                  selectedUserId === user.id
                    ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'border-border bg-card/80 text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {user.name}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative">
        {/* Responsive Real Leaflet Map Container */}
        <div className="relative h-[360px] sm:h-[440px] md:h-[480px] w-full overflow-hidden bg-slate-950">
          <div ref={mapContainerRef} className="h-full w-full z-0" />

          {/* Floating Zoom & Center Controls */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex flex-col gap-1 rounded-xl border border-border/80 bg-background/90 p-1 backdrop-blur-md shadow-lg">
            <button
              type="button"
              onClick={handleZoomIn}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-foreground hover:bg-accent transition-colors"
              title="Zoom In"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-foreground hover:bg-accent transition-colors"
              title="Zoom Out"
            >
              <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <div className="my-0.5 h-px w-full bg-border" />
            <button
              type="button"
              onClick={handleResetCenter}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-foreground hover:bg-accent hover:text-primary transition-colors"
              title="Reset Peta Indonesia"
            >
              <Navigation className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>

          {/* Responsive Selected User Floating Popover Card / Bottom Sheet */}
          {selectedUser && (
            <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-auto z-10 sm:max-w-sm rounded-2xl border border-border/90 bg-background/95 p-3.5 sm:p-4 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 space-y-2.5 sm:space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-border/80 pb-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-foreground text-xs sm:text-sm leading-tight truncate">
                    {selectedUser.name}
                  </h4>
                  <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground truncate block">
                    {selectedUser.department} • {selectedUser.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-muted-foreground hover:text-foreground text-xs p-1 rounded-md hover:bg-muted shrink-0"
                  title="Tutup"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-start gap-1.5 text-foreground font-medium text-[11px] sm:text-xs">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{selectedUser.address || 'Alamat Terdaftar'}</span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-muted-foreground pl-5 font-mono">
                  {(selectedUser.latitude ?? -6.2255).toFixed(4)}°, {(selectedUser.longitude ?? 106.8097).toFixed(4)}°
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <Button
                  asChild
                  size="sm"
                  className="h-7 sm:h-8 gap-1 text-[11px] sm:text-xs font-semibold rounded-lg"
                >
                  <Link to={`/users/${selectedUser.id}`}>
                    <span>Lihat Detail</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedUser.latitude ?? -6.2255},${selectedUser.longitude ?? 106.8097}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 h-7 sm:h-8 rounded-lg border border-border text-[11px] sm:text-xs font-medium text-foreground hover:bg-accent transition-colors"
                >
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  <span>Google Maps</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
