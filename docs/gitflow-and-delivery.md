# Gitflow y entrega continua

## Ramas

- `develop`: integración diaria y origen de ramas `feature/*` y `fix/*`.
- `master`: estado publicable; sólo recibe integración ya validada desde
  `develop`.
- Los cambios se agrupan en commits funcionales pequeños. Una publicación debe
  poder reconstruirse únicamente con el repositorio y `bun.lock`.

## Pipeline

`.github/workflows/ci-cd.yml` se ejecuta en PR y push a `develop`/`master`:

1. reglas de rama y sincronización de producción;
2. instalación reproducible con Bun 1.3.11;
3. ESLint;
4. TypeScript;
5. pruebas;
6. build standalone de Next.js.

Un push validado a `develop` publica la imagen `development` en GHCR y dispara
Dokploy development si ese environment ya tiene webhook/token configurado. Un
push validado a `master` publica `production`/`latest` y dispara Dokploy
production. El contenedor corre sin dependencias de desarrollo y expone el
puerto `3000` para coincidir con el dominio actual configurado en Dokploy.

GitHub hace el trabajo pesado de CI/CD y build. Dokploy queda como runtime/deploy
target para no compilar dentro del VPS pequeño:

- `develop` → GitHub Environment `development` → GHCR tag `development`.
- `master` → GitHub Environment `production` → GHCR tags `production` y
  `latest`.
- Dokploy se dispara por API token o por webhook secreto.
- la ejecución manual `desktop` genera instaladores macOS/Windows con Tauri 2 y
  publica/actualiza el GitHub Release de escritorio.

Más detalle: [`docs/ci-cd.md`](./ci-cd.md).
Configuración Dokploy: [`docs/dokploy-deployment.md`](./dokploy-deployment.md).

## Variables de publicación

Configura en GitHub Actions > Variables:

- `NEXT_PUBLIC_APP_URL`: URL pública del frontend.
- `NEXT_PUBLIC_API_URL`: URL HTTPS de la API MultiLot 360 con prefijo, por
  ejemplo `https://api.tudominio.com/api/v1`.
- `DOKPLOY_URL`: URL de tu panel Dokploy.
- `DOKPLOY_APPLICATION_ID`: ID de la aplicación Dokploy de ese ambiente.

Configura en GitHub Actions > Secrets por environment:

- `DOKPLOY_API_TOKEN`: recomendado; permite llamar
  `POST /api/application.deploy`.
- `DOKPLOY_WEBHOOK_URL`: alternativa si prefieres usar el webhook de Dokploy.

Las variables públicas de Next se inyectan al construir la imagen en GitHub. No
deben corregirse luego en Dokploy porque `NEXT_PUBLIC_*` queda embebido en el
bundle. La aplicación mantiene los secretos de sesión en cookies HTTP-only; no
deben agregarse `.env*` al repositorio.

## Comandos locales

```bash
bun install --frozen-lockfile
bun run check:web
docker build -t multilot-360-web .
```
