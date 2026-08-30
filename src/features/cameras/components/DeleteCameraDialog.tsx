import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Camera } from '@/types';
import { useDeleteCamera } from '@/features/cameras/hooks/use-cameras';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteCameraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  camera: Camera | null;
}

export function DeleteCameraDialog({
  open,
  onOpenChange,
  camera,
}: DeleteCameraDialogProps) {
  const deleteCamera = useDeleteCamera();

  const handleDelete = async () => {
    if (!camera) return;
    await deleteCamera.mutateAsync(camera.id);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md border-border shadow-2xl">
        <AlertDialogHeader className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto sm:mx-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <AlertDialogTitle className="text-base sm:text-lg font-bold">
              Hapus Perangkat Kamera?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Anda akan menghapus kamera{' '}
              <strong className="text-foreground font-semibold">
                &ldquo;{camera?.name}&rdquo;
              </strong>{' '}
              (MAC: <code className="font-mono text-primary">{camera?.macAddress}</code>).
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0 pt-2">
          <AlertDialogCancel disabled={deleteCamera.isPending}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleteCamera.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteCamera.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <span>Hapus Kamera</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
