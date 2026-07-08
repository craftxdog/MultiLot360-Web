# CI/CD de MultiLot 360 Web

Este repositorio usa Gitflow simple con dos ramas principales:

- `develop`: integración diaria y previews.
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

En cada push válido a `master`, el workflow publica una imagen Docker en GHCR:

- `latest`
- `sha-<commit>`

La imagen usa el `Dockerfile` del repositorio y vuelve a ejecutar `bun run check:web` dentro del build para asegurar que el artefacto sea reproducible.

## Despliegue Vercel

El despliegue Vercel está configurado como opcional y seguro:

- `develop` despliega preview si existen los secrets.
- `master` despliega producción si existen los secrets.
- si faltan secrets, el job se marca como omitido con un aviso y no rompe las validaciones.

Secrets requeridos en GitHub Actions:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Variables recomendadas:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL`

Usa environments de GitHub:

- `preview`
- `production`

En `production`, activa aprobación manual en GitHub si quieres que nadie publique sin revisión.

## Ejecución manual

Desde GitHub Actions puedes ejecutar `Web CI/CD` manualmente con:

- `verify`: sólo validaciones.
- `preview`: validaciones + despliegue preview.
- `production`: validaciones + imagen + despliegue producción. Debe correr desde `master`.
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
