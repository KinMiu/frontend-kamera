import React, { useState } from 'react';
import {
  MapPin,
  ExternalLink,
  Copy,
  Plus,
  Minus,
  Navigation,
  Compass,
  Check,
  Building,
  Globe2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface UserLocationMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
  userName: string;
  userAvatar?: string;
  className?: string;
}

export function UserLocationMap({
  latitude,
  longitude,
  address,
  city,
  country,
  userName,
  userAvatar,
  className = '',
}: UserLocationMapProps) {
  // Zoom delta factor for bounding box
  const [zoomLevel, setZoomLevel] = useState<number>(0.015);
  const [copied, setCopied] = useState(false);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.max(0.003, prev / 1.8));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.min(0.12, prev * 1.8));
  };

  const handleResetCenter = () => {
    setZoomLevel(0.015);
    toast.info('Map centered on user location');
  };

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    setCopied(true);
    toast.success('Coordinates copied to clipboard', {
      description: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Compute OpenStreetMap bounding box based on lat/lng and zoom level
  const bbox = `${longitude - zoomLevel * 1.6}%2C${latitude - zoomLevel}%2C${
    longitude + zoomLevel * 1.6
  }%2C${latitude + zoomLevel}`;

  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;

  const fullAddressString = [address, city, country].filter(Boolean).join(', ');

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all ${className}`}
    >
      {/* Interactive Map Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 bg-muted/30 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              Geographic Location & Map
            </h3>
            <p className="text-xs text-muted-foreground">
              {city && country ? `${city}, ${country}` : 'User location coordinates'}
            </p>
          </div>
        </div>

        {/* Action badges & Links */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCoords}
            className="h-8 gap-1.5 text-xs font-mono rounded-lg px-2.5 border-border bg-background/80 hover:bg-accent"
            title="Copy coordinates"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
          </Button>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background/80 px-2.5 text-xs font-medium text-foreground hover:bg-accent hover:text-primary transition-colors shadow-2xs"
          >
            <MapPin className="h-3.5 w-3.5 text-red-500" />
            <span>Google Maps</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </a>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="relative h-80 w-full overflow-hidden bg-slate-950">
        {/* OpenStreetMap Iframe with Theme Adaptive Filters */}
        <iframe
          title={`Map location for ${userName}`}
          src={mapEmbedUrl}
          className="h-full w-full border-0 pointer-events-auto filter dark:invert dark:hue-rotate-180 dark:contrast-85 dark:brightness-95"
          loading="lazy"
        />

        {/* Floating Controls (Zoom + Recenter) */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 rounded-xl border border-border/80 bg-background/90 p-1 backdrop-blur-md shadow-md">
          <button
            type="button"
            onClick={handleZoomIn}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="my-0.5 h-px w-full bg-border" />
          <button
            type="button"
            onClick={handleResetCenter}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
            title="Reset center"
          >
            <Navigation className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Floating User Location Badge Card (Bottom Left) */}
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-10 max-w-sm rounded-xl border border-border/80 bg-background/95 p-3 backdrop-blur-md shadow-lg space-y-2">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 border border-primary/20 shrink-0">
              {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                {userName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-foreground truncate">{userName}</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 text-primary shrink-0" />
                {fullAddressString || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Address Details Footer Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-card/60 text-xs border-t border-border/80">
        <div className="flex items-start gap-2.5">
          <Building className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="text-muted-foreground block text-[11px]">Street Address</span>
            <span className="font-semibold text-foreground">
              {address || 'Not specified'}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Globe2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="text-muted-foreground block text-[11px]">City & Region</span>
            <span className="font-semibold text-foreground">
              {city && country ? `${city}, ${country}` : city || country || 'Worldwide'}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="text-muted-foreground block text-[11px]">Global Coordinates</span>
            <span className="font-mono font-semibold text-foreground">
              {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
