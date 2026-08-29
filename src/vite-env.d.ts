/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The title of the dashboard application */
  readonly VITE_APP_TITLE?: string;
  /** Short description of the application */
  readonly VITE_APP_DESCRIPTION?: string;
  /** Application version string */
  readonly VITE_APP_VERSION?: string;
  /** Base URL for API requests */
  readonly VITE_API_BASE_URL?: string;
  /** Flag to toggle between mock in-memory DB and live API ('true' | 'false') */
  readonly VITE_ENABLE_MOCK?: string;
  /** Current active environment ('development' | 'staging' | 'production') */
  readonly VITE_APP_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
