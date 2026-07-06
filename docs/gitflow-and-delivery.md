# Gitflow y entrega continua

## Ramas

- `develop`: integración diaria y origen de ramas `feature/*` y `fix/*`.
- `master`: estado publicable; sólo recibe integración ya validada desde
  `develop`.
- Los cambios se agrupan en commits funcionales pequeños. Una publicación debe
  poder reconstruirse únicamente con el repositorio y `bun.lock`.

## Pipeline

`.github/workflows/ci-cd.yml` se ejecuta en PR y push a `develop`/`master`:

1. instalación reproducible con Bun 1.3.11;
2. ESLint;
3. TypeScript;
4. pruebas;
5. build standalone de Next.js.

Un push validado a `master` publica dos etiquetas en GHCR: `latest` y la del
SHA. El contenedor corre sin dependencias de desarrollo y expone el puerto
`8080`.

## Variables de publicación

Configura en GitHub Actions > Variables:

- `NEXT_PUBLIC_APP_URL`: URL pública del frontend.
- `NEXT_PUBLIC_API_URL`: URL HTTPS de la API MultiLot 360.

Si no existen, el pipeline usa valores localhost útiles sólo para comprobar la
construcción. La aplicación mantiene los secretos de sesión en cookies
HTTP-only; no deben agregarse `.env*` al repositorio.

## Comandos locales

```bash
bun install --frozen-lockfile
bun run check:web
docker build -t multilot-360-web .
```
