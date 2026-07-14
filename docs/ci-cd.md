# CI/CD de MultiLot 360 Web

Este repositorio usa Gitflow simple con dos ramas principales:

- `develop`: integración diaria y ambiente de desarrollo.
- `master`: publicación estable y producción.

El workflow principal vive en `.github/workflows/ci-cd.yml`.

## Qué valida el pipeline

Cada PR o push hacia `develop` y `master` ejecuta:

1. política de rama;
2. instalación reproducible con Bun `1.3.11`;
3. ESLint;
4. TypeScript;
5. pruebas unitarias;
6. build de Next.js.

Si cualquiera de esos pasos falla, no se publica imagen ni despliegue.

## Reglas de rama

- Los PR sólo pueden apuntar a `develop` o `master`.
- `master` debe estar sincronizada con `develop` antes de publicar artefactos de producción.
- Un despliegue manual a producción sólo puede ejecutarse desde `master`.
- El workflow cancela ejecuciones anteriores de la misma rama para evitar publicaciones antiguas.

## Publicación de imagen

En cada push válido a `develop` o `master`, GitHub construye la imagen Docker y
la publica en GHCR. Dokploy no compila; sólo hace pull/deploy de la imagen ya
construida.

Etiquetas:

- `develop`:
  - `development`
  - `development-<short-sha>`
  - `sha-<short-sha>`
- `master`:
  - `production`
  - `production-<short-sha>`
  - `latest`
  - `sha-<short-sha>`

La imagen usa el `Dockerfile` del repositorio, genera el standalone de Next.js y
copia `public/` para que los assets del login y desktop estén disponibles en el
contenedor.

## Despliegue Dokploy

La estrategia es intencionalmente ligera para VPS pequeño:

1. GitHub valida el código.
2. GitHub construye y publica la imagen en GHCR.
3. GitHub llama a Dokploy por API o webhook secreto.
4. Dokploy sólo descarga la imagen y reinicia el servicio.

Configura dos GitHub Environments:

- `development`
- `production`

En cada environment define estas variables:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL` — debe incluir el prefijo real de la API, por ejemplo
  `https://api.tudominio.com/api/v1`.
- `DOKPLOY_URL` — por ejemplo `https://dokploy.alphaby.cloud`.
- `DOKPLOY_APPLICATION_ID` — ID de la aplicación Dokploy de ese ambiente.

En cada environment define estos secrets:

- `DOKPLOY_API_TOKEN` — token creado en Dokploy Profile Settings.

Como alternativa, si prefieres webhook en vez de API, puedes omitir
`DOKPLOY_API_TOKEN` y definir:

- `DOKPLOY_WEBHOOK_URL` — URL secreta del webhook de Deployments en Dokploy.

Producción es estricta: si no existe token o webhook, el workflow falla antes de
publicar un despliegue incompleto. Development publica la imagen igualmente y
omite sólo el deploy cuando todavía no exista una app/webhook dev configurado.

Para GHCR privado, registra `ghcr.io` en Dokploy y usa un token GitHub con
permiso `read:packages`. Si el paquete GHCR es público, Dokploy puede hacer pull
sin credenciales.

En `production`, activa aprobación manual en GitHub si quieres que nadie publique
sin revisión.

## Ejecución manual

Desde GitHub Actions puedes ejecutar `Web CI/CD` manualmente con:

- `verify`: sólo validaciones.
- `development`: validaciones + imagen + deploy a Dokploy development. Debe correr desde `develop`.
- `production`: validaciones + imagen + deploy a Dokploy production. Debe correr desde `master`.
- `desktop`: validaciones + instaladores macOS/Windows + publicación en GitHub Releases. Debe correr desde `master`.

## Instaladores desktop

El job `desktop-installers` usa Tauri 2 y genera:

- macOS Apple Silicon;
- macOS Intel;
- Windows x64.

Luego `desktop-release` normaliza los nombres y publica/actualiza un release con:

- `MultiLot-360-macOS-arm64.dmg`
- `MultiLot-360-macOS-x64.dmg`
- `MultiLot-360-Windows-x64-Setup.exe`

URL de conexión:

- input manual `desktop_url`, o variable `MULTILOT_DESKTOP_URL`, o
  `NEXT_PUBLIC_APP_URL`;
- si todas están vacías, la app muestra una pantalla de conexión al iniciar.

Más detalle: [`docs/desktop-installers.md`](./desktop-installers.md).

Guía Dokploy: [`docs/dokploy-deployment.md`](./dokploy-deployment.md).

## Comandos locales equivalentes

```bash
bun install --frozen-lockfile
bun run lint:web
bun run typecheck:web
bun run test:web
bun run build:web
docker build -t multilot-360-web .
```

## Protección recomendada en GitHub

Configura branch protection para `develop` y `master`:

- exigir PR antes de merge;
- exigir que `Web CI/CD / Lint, types, tests and build` pase;
- exigir historial lineal;
- bloquear force push;
- bloquear eliminación de rama;
- para `master`, exigir aprobación antes de deploy en environment `production`.
