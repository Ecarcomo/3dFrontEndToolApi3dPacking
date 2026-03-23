import axios from "axios";

const baseURL =
  import.meta.env.VITE_URL_API?.replace(/\/$/, "") || "http://localhost:5501";

const apiKey = import.meta.env.VITE_API_KEY?.trim();

export const httpClient = axios.create({
  baseURL,
  ...(apiKey
    ? { headers: { "x-api-key": apiKey } }
    : {}),
});
