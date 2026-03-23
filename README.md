# Herramienta frontend 3D — API de empaquetado

Aplicación web (React + Vite + TypeScript) para configurar contenedores y artículos, consultar el estado del microservicio de empaquetado 3D y visualizar el resultado en una escena **Three.js** (React Three Fiber).

## Características

- Panel para seleccionar contenedor, cantidades, peso y volumen; integración con catálogo mock y llamadas al API real.
- Comprobación de salud del backend (`GET /health`).
- Cálculo de empaquetado (`POST /api/pack`) con tipos definidos en `src/types/packing.ts`.
- Vista 3D del empaquetado con cotas y referencias de orientación.
- Límite opcional de usos exitosos de “Calcular espacio” vía `VITE_PACK_CALC_MAX_USES` (persistido en `localStorage`).
- Despliegue preparado para **Netlify** con **serverless functions** que hacen de proxy hacia el microservicio (la clave API puede quedar solo en el servidor).

## Requisitos

- Node.js 18+ (recomendado LTS)
- npm

## Puesta en marcha

```bash
git clone <url-del-repo>
cd 3dFrontEndToolApi3dPacking
npm install
cp .env.example .env
# Ajusta .env según tu entorno
npm run dev
```

La app suele quedar en `http://localhost:5173` (Vite). El microservicio de empaquetado debe estar accesible en la URL configurada (por defecto `http://localhost:5501` en `.env.example`).

## Variables de entorno (desarrollo — `.env`)

| Variable | Descripción |
|----------|-------------|
| `VITE_URL_API` | Base URL del microservicio **sin** `/api` al final. Ej.: `http://localhost:5501`. |
| `VITE_API_KEY` | Opcional. Si existe, se envía como header `x-api-key` cuando el cliente llama **directo** al backend (desarrollo o URL explícita). |
| `VITE_PACK_CALC_MAX_USES` | Opcional. Número entero > 0 para limitar cuántas veces se puede completar con éxito “Calcular espacio”. Vacío = sin límite. |

Vite solo inyecta variables con prefijo `VITE_` en el bundle del navegador.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo Vite. |
| `npm run build` | TypeScript (`tsc -b`) + build de producción en `dist/`. |
| `npm run preview` | Sirve la carpeta `dist` localmente. |
| `npm run lint` | ESLint. |

## Contrato HTTP con el microservicio

El cliente usa `src/lib/httpClient.ts` y `src/services/packingService.ts`:

- `GET /health` — estado del servicio.
- `POST /api/pack` — cuerpo JSON según `PackRequest` (`baulera`, `items`, etc.); respuesta `PackResponse`.

## Despliegue en Netlify

El repositorio incluye `netlify.toml`:

- **Build:** `npm run build`
- **Publicar:** `dist`
- **Functions:** `netlify/functions/`
- Redirecciones: `/health` y `/api/pack` hacia las functions; el resto a `index.html` (SPA).

### Variables en Netlify (panel del sitio)

| Variable | Descripción |
|----------|-------------|
| `PACKING_API_BASE` | URL pública del microservicio real, sin barra final. |
| `PACKING_API_KEY` | Opcional. Se añade en servidor como `x-api-key` hacia el backend. |

Para usar el proxy de Netlify, **no** definas `VITE_URL_API` en el entorno de build (o déjala vacía): en producción el front llamará al mismo origen y Netlify enrutará a las functions.

### Conectar GitHub → Netlify

1. Sube el código a GitHub.
2. En [Netlify](https://app.netlify.com): **Add new site** → **Import an existing project** → conecta el repositorio.
3. Confirma comando de build y directorio de publicación (ya definidos en `netlify.toml`).
4. Añade `PACKING_API_BASE` (y `PACKING_API_KEY` si aplica) en **Site configuration → Environment variables**.
5. Despliega el sitio.

### Probar functions en local

Con la [CLI de Netlify](https://docs.netlify.com/cli/get-started/):

```bash
npx netlify dev
```

La carpeta `.netlify` es estado local del CLI; suele ignorarse en Git (no afecta al deploy desde GitHub).

## Estructura del código (resumen)

```
src/
  components/     # Panel, escena 3D, UI
  context/        # PackingContext — estado y acciones de empaquetado
  lib/            # httpClient, límite de usos del cálculo
  services/       # packingService, mock del catálogo
  types/          # Tipos TypeScript del pack y catálogo
netlify/functions/
  packing-health.mjs
  packing-pack.mjs
```

## Licencia

Privado — consulta con el propietario del repositorio.
