import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import { getHealth, postPack } from "../services/packingService";
import type { BauleraInput, PackRequest, PackResponse } from "../types/packing";

export type HealthState = "unknown" | "ok" | "error";

export interface PackingContextValue {
  /** Dimensiones del contenedor enviadas en el último POST (request). */
  requestContainer: BauleraInput | null;
  packResponse: PackResponse | null;
  packLoading: boolean;
  packError: string | null;
  health: HealthState;
  healthMessage: string | null;
  checkHealth: () => Promise<void>;
  submitPack: (body: PackRequest) => Promise<void>;
  clearPack: () => void;
}

const PackingContext = createContext<PackingContextValue | null>(null);

/** Hook colocado junto al provider para compartir el tipo de contexto. */
// eslint-disable-next-line react-refresh/only-export-components -- ver comentario anterior
export function usePacking(): PackingContextValue {
  const ctx = useContext(PackingContext);
  if (!ctx) {
    throw new Error("usePacking debe usarse dentro de PackingProvider");
  }
  return ctx;
}

function formatPackError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined;
    if (data?.message) return String(data.message);
    if (data?.error) return String(data.error);
    return err.message || "Error de red";
  }
  if (err instanceof Error) return err.message;
  return "Error desconocido";
}

export function PackingProvider({ children }: { children: ReactNode }) {
  const [requestContainer, setRequestContainer] = useState<BauleraInput | null>(null);
  const [packResponse, setPackResponse] = useState<PackResponse | null>(null);
  const [packLoading, setPackLoading] = useState(false);
  const [packError, setPackError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthState>("unknown");
  const [healthMessage, setHealthMessage] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const res = await getHealth();
      if (res.status === "ok") {
        setHealth("ok");
        setHealthMessage(null);
      } else {
        setHealth("error");
        setHealthMessage(`Respuesta inesperada: ${res.status}`);
      }
    } catch (e) {
      setHealth("error");
      setHealthMessage(formatPackError(e));
    }
  }, []);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  const submitPack = useCallback(async (body: PackRequest) => {
    setPackLoading(true);
    setPackError(null);
    try {
      const res = await postPack(body);
      setRequestContainer(body.baulera);
      setPackResponse(res);
    } catch (e) {
      const msg = formatPackError(e);
      setPackError(msg);
      throw e;
    } finally {
      setPackLoading(false);
    }
  }, []);

  const clearPack = useCallback(() => {
    setRequestContainer(null);
    setPackResponse(null);
    setPackError(null);
  }, []);

  const value = useMemo<PackingContextValue>(
    () => ({
      requestContainer,
      packResponse,
      packLoading,
      packError,
      health,
      healthMessage,
      checkHealth,
      submitPack,
      clearPack,
    }),
    [
      requestContainer,
      packResponse,
      packLoading,
      packError,
      health,
      healthMessage,
      checkHealth,
      submitPack,
      clearPack,
    ]
  );

  return <PackingContext.Provider value={value}>{children}</PackingContext.Provider>;
}
