/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_URL_API?: string;
  /** Si se define, se envía en todas las peticiones a la API como `x-api-key`. */
  readonly VITE_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
