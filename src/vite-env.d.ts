/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_URL_API?: string;
  /** Si se define, se envía en todas las peticiones a la API como `x-api-key`. */
  readonly VITE_API_KEY?: string;
  /**
   * Máximo de cálculos de espacio exitosos (persistido en localStorage).
   * Vacío o inválido = sin límite.
   */
  readonly VITE_PACK_CALC_MAX_USES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
