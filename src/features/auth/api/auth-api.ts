import { env } from '@/config/env';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const authApi = {
  getStoredUser() {
    try {
      const raw = localStorage.getItem('auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },

  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
  },

  setAuthSession(data: AuthResponse) {
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('auth_token', data.access_token);
    }
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    if (data.user) {
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    }
    window.dispatchEvent(new Event('auth_state_change'));
  },

  clearAuthSession() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    window.dispatchEvent(new Event('auth_state_change'));
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (env.apiKey) {
        headers[env.apiKeyHeader] = env.apiKey;
      }

      const res = await fetch(`${env.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        let errMsg = 'Email atau password tidak sesuai';
        if (Array.isArray(errData.message)) {
          errMsg = errData.message.join(', ');
        } else if (typeof errData.message === 'string') {
          errMsg = errData.message;
        }
        throw new Error(errMsg);
      }

      const data: AuthResponse = await res.json();
      this.setAuthSession(data);
      return data;
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Tidak dapat terhubung ke server backend (Port 3001). Pastikan backend aktif.');
      }
      throw err;
    }
  },

  async refreshToken(): Promise<{ access_token: string; refresh_token: string } | null> {
    const refresh_token = this.getRefreshToken();
    if (!refresh_token) return null;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (env.apiKey) {
        headers[env.apiKeyHeader] = env.apiKey;
      }

      const res = await fetch(`${env.apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ refreshToken: refresh_token }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('auth_token', data.access_token);
        }
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        window.dispatchEvent(new Event('auth_state_change'));
        return data;
      } else {
        this.clearAuthSession();
        return null;
      }
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    const token = this.getAccessToken();
    if (token) {
      try {
        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`,
        };
        if (env.apiKey) {
          headers[env.apiKeyHeader] = env.apiKey;
        }

        await fetch(`${env.apiBaseUrl}/auth/logout`, {
          method: 'POST',
          headers,
        });
      } catch (e) {
        console.warn('Logout API request failed:', e);
      }
    }
    this.clearAuthSession();
  },
};
