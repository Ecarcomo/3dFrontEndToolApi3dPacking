import { httpClient } from "../lib/httpClient";
import type { PackRequest, PackResponse } from "../types/packing";

export interface HealthResponse {
  status: string;
}

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await httpClient.get<HealthResponse>("/health");
  return data;
}

export async function postPack(body: PackRequest): Promise<PackResponse> {
  const { data } = await httpClient.post<PackResponse>("/api/pack", body, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
}
