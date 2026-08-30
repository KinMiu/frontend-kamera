import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { camerasApi } from '@/features/cameras/api/cameras-api';
import { CameraFormData, PaginationParams } from '@/types';
import { toast } from 'sonner';

export const CAMERA_QUERY_KEYS = {
  all: ['cameras'] as const,
  list: (params?: PaginationParams) => ['cameras', 'list', params] as const,
  detail: (id: string) => ['cameras', 'detail', id] as const,
};

export function useGetCameras(params?: PaginationParams) {
  return useQuery({
    queryKey: CAMERA_QUERY_KEYS.list(params),
    queryFn: () => camerasApi.getCameras(params),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useGetCameraById(id: string) {
  return useQuery({
    queryKey: CAMERA_QUERY_KEYS.detail(id),
    queryFn: () => camerasApi.getCameraById(id),
    enabled: Boolean(id),
  });
}

export function useCreateCamera() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CameraFormData) => camerasApi.createCamera(data),
    onSuccess: (newCamera) => {
      queryClient.invalidateQueries({ queryKey: CAMERA_QUERY_KEYS.all });
      toast.success(`Kamera "${newCamera.name}" berhasil ditambahkan!`);
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambahkan kamera: ${error.message}`);
    },
  });
}

export function useUpdateCamera() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CameraFormData> }) =>
      camerasApi.updateCamera(id, data),
    onSuccess: (updatedCamera) => {
      queryClient.invalidateQueries({ queryKey: CAMERA_QUERY_KEYS.all });
      toast.success(`Data kamera "${updatedCamera.name}" berhasil diperbarui!`);
    },
    onError: (error: Error) => {
      toast.error(`Gagal memperbarui data kamera: ${error.message}`);
    },
  });
}

export function useDeleteCamera() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => camerasApi.deleteCamera(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMERA_QUERY_KEYS.all });
      toast.success('Kamera berhasil dihapus dari sistem');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus kamera: ${error.message}`);
    },
  });
}

export function useDeleteMultipleCameras() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => camerasApi.deleteMultipleCameras(ids),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: CAMERA_QUERY_KEYS.all });
      toast.success(`${result.count} kamera berhasil dihapus`);
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus data kamera terpilih: ${error.message}`);
    },
  });
}
