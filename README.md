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
