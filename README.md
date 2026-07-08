# MultiLot 360 Web

Frontend operativo de MultiLot 360, organizado como workspace para compartir
contratos con el futuro cliente de escritorio.

## Desarrollo local

```bash
bun install
bun run dev:web
```

Abre [http://localhost:8080](http://localhost:8080). La configuración local vive
en `apps/web/.env.local`.

## Validación

```bash
bun run check:web
```

Este comando ejecuta ESLint, TypeScript, pruebas y build de producción.

## Arquitectura

La primera vertical refactorizada es autenticación. Su estructura, flujo de
sesión, contrato de API y decisiones para web/desktop están documentados en
[docs/frontend-authentication.md](docs/frontend-authentication.md).

La matriz completa de endpoints, adaptadores BFF, consumidores de UI y
evidencia de verificación está en
[docs/api-consumption-audit.md](docs/api-consumption-audit.md).

## Entrega y despliegue

El repositorio usa Gitflow con `develop` como rama de integración y `master`
como rama publicable. La automatización valida cada push/PR y, al publicar en
`master`, construye una imagen standalone de Next.js en GitHub Container
Registry. Consulta [docs/gitflow-and-delivery.md](docs/gitflow-and-delivery.md).

## Desktop

`apps/desktop` prepara instaladores macOS/Windows con Tauri 2. El workflow
manual `desktop` genera artefactos descargables desde `master`. Consulta
[docs/desktop-installers.md](docs/desktop-installers.md).
