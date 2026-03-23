import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import type { BauleraInput } from "../types/packing";
import type { CatalogItemPreset } from "../types/catalog";

/**
 * Datos de demostración (equivalente a lo que podría devolver un GET real).
 * Centralizados aquí para no mezclarlos con la UI.
 */
/** Presets de contenedor; los `name` conservan el texto comercial (p. ej. "Baulera …"). */
export const MOCK_CONTAINERS: BauleraInput[] = [
  {
    name: "Baulera 60x300x300 1200kg",
    width: 0.6,
    height: 3.0,
    depth: 3.0,
    weightLimit: 1200,
  },
  {
    name: "Baulera 100x300x300 2000kg",
    width: 1.0,
    height: 3.0,
    depth: 3.0,
    weightLimit: 2000,
  },
  {
    name: "Baulera 500x300x300 10000kg",
    width: 5.0,
    height: 3.0,
    depth: 3.0,
    weightLimit: 10000,
  },
  {
    name: "Camion 200x210x600 3000kg",
    width: 2.0,
    height: 2.1,
    depth: 6.0,
    weightLimit: 3000,
  },
];

export const MOCK_CATALOG_ITEMS: CatalogItemPreset[] = [
  {
    name: "sillon 3 cuerpos - 300x80x80 50kg",
    width: 3.0,
    height: 0.8,
    depth: 0.8,
    weight: 50,
  },
  {
    name: "mesa de luz - 40x50x40 10kg",
    width: 0.4,
    height: 0.5,
    depth: 0.4,
    weight: 10,
  },
  {
    name: "caja - 30x10x30 2kg",
    width: 0.3,
    height: 0.1,
    depth: 0.3,
    weight: 2,
  },
];

const MOCK_DELAY_MS = 70;

const MOCK_CONTAINERS_URL = "mock://catalog/containers";
const MOCK_ITEMS_URL = "mock://catalog/items-preset";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveMockResponse<T>(
  config: InternalAxiosRequestConfig,
  data: T
): Promise<AxiosResponse<T>> {
  await sleep(MOCK_DELAY_MS);
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: { "x-mock-catalog": "true" },
    config,
  };
}

/**
 * Simula GET de contenedores disponibles (axios + adapter local; no hay red).
 */
export async function fetchMockContainers(): Promise<BauleraInput[]> {
  const { data } = await axios.get<{ containers: BauleraInput[] }>(
    MOCK_CONTAINERS_URL,
    {
      adapter: (config) =>
        resolveMockResponse(config, { containers: [...MOCK_CONTAINERS] }),
    }
  );
  return data.containers;
}

/**
 * Simula GET del catálogo de ítems por defecto.
 */
export async function fetchMockCatalogItems(): Promise<CatalogItemPreset[]> {
  const { data } = await axios.get<{ items: CatalogItemPreset[] }>(
    MOCK_ITEMS_URL,
    {
      adapter: (config) =>
        resolveMockResponse(config, { items: [...MOCK_CATALOG_ITEMS] }),
    }
  );
  return data.items;
}
