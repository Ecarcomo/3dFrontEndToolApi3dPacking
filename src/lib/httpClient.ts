import axios from "axios";

const explicitRaw = (import.meta.env.VITE_URL_API ?? "").trim();
const explicit =
  explicitRaw === "" ? undefined : explicitRaw.replace(/\/$/, "");

/** En producción sin VITE_URL_API, las peticiones van al mismo origen (Netlify → functions). */
const baseURL =
  explicit !== undefined
    ? explicit
    : import.meta.env.PROD
      ? undefined
      : "http://localhost:5501";

const apiKey = import.meta.env.VITE_API_KEY?.trim();
const sendApiKeyOnClient =
  Boolean(apiKey) &&
  (explicit !== undefined || import.meta.env.DEV);

export const httpClient = axios.create({
  ...(baseURL !== undefined ? { baseURL } : {}),
  ...(sendApiKeyOnClient ? { headers: { "x-api-key": apiKey } } : {}),
});
