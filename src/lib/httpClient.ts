import axios from "axios";

const baseURL =
  import.meta.env.VITE_URL_API?.replace(/\/$/, "") || "http://localhost:5501";

export const httpClient = axios.create({ baseURL });
