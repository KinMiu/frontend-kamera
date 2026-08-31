import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, CameraFormData } from '@/types';
import { useCreateCamera, useUpdateCamera } from '@/features/cameras/hooks/use-cameras';
import { Camera as CameraIcon, Network, Video, Loader2, MapPin, Sparkles } from 'lucide-react';

const PRESET_LOCATIONS = [
  { name: 'Pos Plang Ijo', lat: -5.0456, lng: 105.7890 },
  { name: 'Pusat Latihan Gajah (PLG)', lat: -4.9250, lng: 105.7830 },
  { name: 'Pos Way Kanan', lat: -5.0120, lng: 105.8150 },
  { name: 'Pos Rawa Bunder', lat: -4.9850, lng: 105.7500 },
  { name: 'Kuala Kambas', lat: -4.9200, lng: 105.8850 },
];

const cameraSchema = z.object({
  name: z
    .string()
    .min(3, 'Nama kamera minimal 3 karakter')
    .max(80, 'Nama kamera maksimal 80 karakter'),
  macAddress: z
    .string()
    .min(1, 'MAC Address wajib diisi')
    .regex(
      /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
      'Format MAC Address tidak valid (contoh: 00:1A:2B:3C:4D:5E)'
    ),
  rtspEndpoint: z
    .string()
    .min(1, 'RTSP Endpoint wajib diisi')
    .refine(
      (val) => val.startsWith('rtsp://') || val.startsWith('http://') || val.startsWith('https://'),
      'RTSP Endpoint harus diawali dengan rtsp://, http://, atau https://'
    ),
  mediamtxEndpoint: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.startsWith('rtsp://') || val.startsWith('rtsps://') || val.startsWith('http://') || val.startsWith('https://'),
      'MediaMTX RTSP Endpoint harus diawali dengan rtsp://, rtsps://, http://, atau https://'
    ),
  latitude: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= -90 && Number(val) <= 90),
      'Latitude harus berupa angka antara -90 dan 90'
    ),
  longitude: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= -180 && Number(val) <= 180),
      'Longitude harus berupa angka antara -180 dan 180'
    ),
});

type CameraFormValues = z.infer<typeof cameraSchema>;

interface CameraFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  camera?: Camera | null;
}

export function CameraFormModal({ open, onOpenChange, camera }: CameraFormModalProps) {
  const isEditing = Boolean(camera);
  const createCamera = useCreateCamera();
  const updateCamera = useUpdateCamera();

  const isSubmitting = createCamera.isPending || updateCamera.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CameraFormValues>({
    resolver: zodResolver(cameraSchema),
    defaultValues: {
      name: '',
      macAddress: '',
      rtspEndpoint: '',
      mediamtxEndpoint: '',
      latitude: '',
      longitude: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (camera) {
        setValue('name', camera.name);
        setValue('macAddress', camera.macAddress);
        setValue('rtspEndpoint', camera.rtspEndpoint);
        setValue('mediamtxEndpoint', camera.mediamtxEndpoint ?? '');
        setValue('latitude', camera.latitude != null ? String(camera.latitude) : '');
        setValue('longitude', camera.longitude != null ? String(camera.longitude) : '');
      } else {
        reset({
          name: '',
          macAddress: '',
          rtspEndpoint: '',
          mediamtxEndpoint: '',
          latitude: '',
          longitude: '',
        });
      }
    }
  }, [open, camera, setValue, reset]);

  const applyPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    setValue('latitude', String(preset.lat), { shouldValidate: true });
    setValue('longitude', String(preset.lng), { shouldValidate: true });
  };

  const onSubmit = async (values: CameraFormValues) => {
    const parsedLat = values.latitude && values.latitude.trim() !== '' ? Number(values.latitude) : null;
    const parsedLong = values.longitude && values.longitude.trim() !== '' ? Number(values.longitude) : null;

    const payload: CameraFormData = {
      name: values.name,
      macAddress: values.macAddress,
      rtspEndpoint: values.rtspEndpoint,
      mediamtxEndpoint: values.mediamtxEndpoint && values.mediamtxEndpoint.trim() !== '' ? values.mediamtxEndpoint.trim() : null,
      latitude: parsedLat,
      longitude: parsedLong,
    };

    if (isEditing && camera) {
      await updateCamera.mutateAsync({ id: camera.id, data: payload });
    } else {
      await createCamera.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border shadow-2xl p-6">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CameraIcon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {isEditing ? 'Edit Data Kamera' : 'Tambah Kamera Baru'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isEditing
                  ? 'Perbarui informasi endpoint RTSP, nama, dan titik koordinat kamera.'
                  : 'Daftarkan perangkat kamera pengawasan baru ke dalam sistem.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Camera Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <CameraIcon className="h-3.5 w-3.5 text-muted-foreground" />
              Nama Perangkat Kamera <span className="text-destructive">*</span>
            </label>
            <Input
              {...register('name')}
              placeholder="Contoh: Kamera Pos Way Kanan 01"
              className="h-10 text-sm"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* MAC Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Network className="h-3.5 w-3.5 text-muted-foreground" />
              Alamat MAC (MAC Address) <span className="text-destructive">*</span>
            </label>
            <Input
              {...register('macAddress')}
              placeholder="Contoh: 00:1A:2B:3C:4D:5E"
              className="h-10 font-mono text-sm uppercase"
              disabled={isSubmitting}
            />
            {errors.macAddress && (
              <p className="text-xs text-destructive font-medium">{errors.macAddress.message}</p>
            )}
          </div>

          {/* RTSP Endpoint */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5 text-muted-foreground" />
              RTSP Stream Endpoint (Kamera Fisik) <span className="text-destructive">*</span>
            </label>
            <Input
              {...register('rtspEndpoint')}
              placeholder="Contoh: rtsp://192.168.10.101:554/stream1"
              className="h-10 font-mono text-xs"
              disabled={isSubmitting}
            />
            {errors.rtspEndpoint && (
              <p className="text-xs text-destructive font-medium">
                {errors.rtspEndpoint.message}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Format umum: <code className="text-primary">rtsp://[ip-address]:554/[channel]</code>
            </p>
          </div>

          {/* MediaMTX Bypass RTSP Endpoint */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5 text-emerald-500" />
                RTSP Bypass URL (MediaMTX)
              </label>
              <span className="text-[10px] text-muted-foreground">Opsional</span>
            </div>
            <Input
              {...register('mediamtxEndpoint')}
              placeholder="Contoh: rtsp://localhost:8554/live/stream1"
              className="h-10 font-mono text-xs"
              disabled={isSubmitting}
            />
            {errors.mediamtxEndpoint && (
              <p className="text-xs text-destructive font-medium">
                {errors.mediamtxEndpoint.message}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Stream RTSP yang di-bypass/relay melalui MediaMTX server
            </p>
          </div>

          {/* GPS Coordinates (Latitude & Longitude) */}
          <div className="space-y-2 rounded-xl border border-border/80 bg-muted/20 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Titik Koordinat GPS (Way Kambas)
              </span>
              <span className="text-[10px] text-muted-foreground">Opsional</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Latitude (Lintang)
                </label>
                <Input
                  {...register('latitude')}
                  placeholder="-5.0456"
                  className="h-9 font-mono text-xs bg-background"
                  disabled={isSubmitting}
                />
                {errors.latitude && (
                  <p className="text-[10px] text-destructive">{errors.latitude.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Longitude (Bujur)
                </label>
                <Input
                  {...register('longitude')}
                  placeholder="105.7890"
                  className="h-9 font-mono text-xs bg-background"
                  disabled={isSubmitting}
                />
                {errors.longitude && (
                  <p className="text-[10px] text-destructive">{errors.longitude.message}</p>
                )}
              </div>
            </div>

            {/* Quick Preset Coordinates */}
            <div className="pt-1">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1.5">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Pilih Preset Lokasi Cepat:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_LOCATIONS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    disabled={isSubmitting}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-background border hover:border-primary hover:text-primary transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isEditing ? 'Simpan Perubahan' : 'Daftarkan Kamera'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
