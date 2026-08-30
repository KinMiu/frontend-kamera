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
import { Camera as CameraIcon, Network, Video, Loader2 } from 'lucide-react';

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
    },
  });

  useEffect(() => {
    if (open) {
      if (camera) {
        setValue('name', camera.name);
        setValue('macAddress', camera.macAddress);
        setValue('rtspEndpoint', camera.rtspEndpoint);
      } else {
        reset({
          name: '',
          macAddress: '',
          rtspEndpoint: '',
        });
      }
    }
  }, [open, camera, setValue, reset]);

  const onSubmit = async (values: CameraFormValues) => {
    const payload: CameraFormData = {
      name: values.name,
      macAddress: values.macAddress,
      rtspEndpoint: values.rtspEndpoint,
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
                  ? 'Perbarui informasi endpoint RTSP dan nama perangkat kamera.'
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
              RTSP Stream Endpoint <span className="text-destructive">*</span>
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
