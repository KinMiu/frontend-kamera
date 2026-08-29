/**
 * Centralized and type-safe environment configuration.
 * Provides fallback defaults and convenience helper properties.
 */
export const env = {
  /** Application display title */
  appTitle: import.meta.env.VITE_APP_TITLE || 'Nexus Admin',

  /** Application description */
  appDescription:
    import.meta.env.VITE_APP_DESCRIPTION ||
    'Modern & Production-Ready Admin Dashboard Template',

  /** Application release version */
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',

  /** Base URL for API requests */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',

  /** Whether the app should use mock data or real backend APIs */
  enableMock: import.meta.env.VITE_ENABLE_MOCK !== 'false',

  /** Current deployment environment name */
  appEnv:
    import.meta.env.VITE_APP_ENV ||
    (import.meta.env.DEV ? 'development' : 'production'),

  /** Helper booleans */
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;

export type AppEnvConfig = typeof env;
