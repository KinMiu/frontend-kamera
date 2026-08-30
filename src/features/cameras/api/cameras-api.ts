import { Camera, CameraFormData, PaginatedResponse, PaginationParams } from '@/types';
import { initialCameras } from '@/lib/mock-data';
import { env } from '@/config/env';
import { authApi } from '@/features/auth/api/auth-api';

const STORAGE_KEY = 'waykambas_cameras_db';

function getStoredCameras(): Camera[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCameras));
      return initialCameras;
    }
    return JSON.parse(raw);
  } catch {
    return initialCameras;
  }
}

function saveStoredCameras(cameras: Camera[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cameras));
  } catch (error) {
    console.error('Failed to persist cameras to localStorage:', error);
  }
}

async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = authApi.getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Attempt token refresh
    const refreshed = await authApi.refreshToken();
    if (refreshed?.access_token) {
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${refreshed.access_token}`,
      };
      response = await fetch(url, { ...options, headers: retryHeaders });
    }
  }

  return response;
}

export const camerasApi = {
  async getCameras(params: PaginationParams = { page: 1, pageSize: 10 }): Promise<PaginatedResponse<Camera>> {
    if (!env.enableMock) {
      try {
        const res = await authenticatedFetch(`${env.apiBaseUrl}/devices`);
        if (res.ok) {
          const raw = await res.json();
          const items: Camera[] = Array.isArray(raw)
            ? raw
            : Array.isArray(raw.data)
            ? raw.data
            : [];

          let filtered = items;
          if (params.search) {
            const q = params.search.toLowerCase();
            filtered = filtered.filter(
              (c) =>
                c.name.toLowerCase().includes(q) ||
                c.macAddress.toLowerCase().includes(q) ||
                c.rtspEndpoint.toLowerCase().includes(q)
            );
          }

          if (params.sortBy) {
            filtered.sort((a, b) => {
              const key = params.sortBy as keyof Camera;
              const valA = String(a[key] ?? '').toLowerCase();
              const valB = String(b[key] ?? '').toLowerCase();
              return params.sortOrder === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
            });
          }

          const page = params.page || 1;
          const pageSize = params.pageSize || 10;
          const startIdx = (page - 1) * pageSize;
          const paginatedData = filtered.slice(startIdx, startIdx + pageSize);

          return {
            data: paginatedData,
            total: filtered.length,
            page,
            pageSize,
            totalPages: Math.ceil(filtered.length / pageSize) || 1,
          };
        }
      } catch (e) {
        console.warn('Backend API request failed, falling back to local storage:', e);
      }
    }

    // Fallback: local memory
    await new Promise((resolve) => setTimeout(resolve, 200));
    let cameras = getStoredCameras();

    if (params.search) {
      const q = params.search.toLowerCase();
      cameras = cameras.filter(
        (cam) =>
          cam.name.toLowerCase().includes(q) ||
          cam.macAddress.toLowerCase().includes(q) ||
          cam.rtspEndpoint.toLowerCase().includes(q)
      );
    }

    if (params.sortBy) {
      cameras.sort((a, b) => {
        const key = params.sortBy as keyof Camera;
        const valA = String(a[key] ?? '').toLowerCase();
        const valB = String(b[key] ?? '').toLowerCase();
        return params.sortOrder === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
      });
    }

    const total = cameras.length;
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIdx = (page - 1) * pageSize;

    return {
      data: cameras.slice(startIdx, startIdx + pageSize),
      total,
      page,
      pageSize,
      totalPages,
    };
  },

  async getCameraById(id: string): Promise<Camera> {
    if (!env.enableMock) {
      try {
        const res = await authenticatedFetch(`${env.apiBaseUrl}/devices/${id}`);
        if (res.ok) {
          const raw = await res.json();
          return raw.data || raw;
        }
      } catch (e) {
        console.warn('Backend API getById failed, falling back to local DB:', e);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
    const cameras = getStoredCameras();
    const found = cameras.find((c) => c.id === id);
    if (!found) {
      throw new Error(`Camera with ID ${id} not found`);
    }
    return found;
  },

  async createCamera(payload: CameraFormData): Promise<Camera> {
    if (!env.enableMock) {
      try {
        const res = await authenticatedFetch(`${env.apiBaseUrl}/devices`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const raw = await res.json();
          return raw.data || raw;
        }
      } catch (e) {
        console.warn('Backend API create failed, saving to local DB:', e);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
    const cameras = getStoredCameras();
    const newCamera: Camera = {
      id: `cam-wk-${Date.now().toString().slice(-4)}`,
      name: payload.name.trim(),
      macAddress: payload.macAddress.trim(),
      rtspEndpoint: payload.rtspEndpoint.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'usr-admin-1',
    };

    saveStoredCameras([newCamera, ...cameras]);
    return newCamera;
  },

  async updateCamera(id: string, payload: Partial<CameraFormData>): Promise<Camera> {
    if (!env.enableMock) {
      try {
        const res = await authenticatedFetch(`${env.apiBaseUrl}/devices/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const raw = await res.json();
          return raw.data || raw;
        }
      } catch (e) {
        console.warn('Backend API update failed, updating local DB:', e);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
    const cameras = getStoredCameras();
    const index = cameras.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Camera with ID ${id} not found`);
    }

    const updatedCamera: Camera = {
      ...cameras[index],
      ...(payload.name ? { name: payload.name.trim() } : {}),
      ...(payload.macAddress ? { macAddress: payload.macAddress.trim() } : {}),
      ...(payload.rtspEndpoint ? { rtspEndpoint: payload.rtspEndpoint.trim() } : {}),
      updatedAt: new Date().toISOString(),
    };

    cameras[index] = updatedCamera;
    saveStoredCameras(cameras);
    return updatedCamera;
  },

  async deleteCamera(id: string): Promise<{ success: boolean; id: string }> {
    if (!env.enableMock) {
      try {
        const res = await authenticatedFetch(`${env.apiBaseUrl}/devices/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          return { success: true, id };
        }
      } catch (e) {
        console.warn('Backend API delete failed, deleting from local DB:', e);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
    const cameras = getStoredCameras();
    const filtered = cameras.filter((c) => c.id !== id);
    saveStoredCameras(filtered);
    return { success: true, id };
  },

  async deleteMultipleCameras(ids: string[]): Promise<{ success: boolean; count: number }> {
    for (const id of ids) {
      await this.deleteCamera(id);
    }
    return { success: true, count: ids.length };
  },
};
