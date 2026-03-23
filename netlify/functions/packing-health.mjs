function upstreamBase() {
  const raw = process.env.PACKING_API_BASE?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

export const handler = async () => {
  const base = upstreamBase();
  if (!base) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "PACKING_API_BASE no configurada en Netlify" }),
    };
  }

  const headers = { Accept: "application/json" };
  const key = process.env.PACKING_API_KEY?.trim();
  if (key) headers["x-api-key"] = key;

  try {
    const res = await fetch(`${base}/health`, { headers });
    const text = await res.text();
    const contentType = res.headers.get("content-type") || "application/json";
    return {
      statusCode: res.status,
      headers: { "Content-Type": contentType },
      body: text,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al contactar la API";
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: message }),
    };
  }
};
