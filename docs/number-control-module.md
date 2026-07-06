# Módulo de control numérico

## Decisión de producto

La ruta canónica es `/control-numerico`. Límites y bloqueos comparten navegación, resumen y filtros, pero conservan vistas y permisos independientes:

- `limits`: reglas de exposición por número, vendedor, sorteo y vigencia.
- `blocked`: excepciones por fecha o turno que pueden liberarse.

`/limites` y `/numeros-bloqueados` siguen disponibles como redirecciones compatibles. El menú principal muestra una sola entrada para evitar duplicidad.

## Cobertura de API

### Number limits

- `GET /number-limits`
- `POST /number-limits`
- `GET /number-limits/:limitId`
- `PATCH /number-limits/:limitId`
- `PATCH /number-limits/:limitId/expire`

### Blocked numbers

- `GET /blocked-numbers`
- `POST /blocked-numbers`
- `GET /blocked-numbers/:blockId`
- `DELETE /blocked-numbers/:blockId`

El navegador solo consume `/api/number-control/*`. Los Route Handlers validan origen, esquema y sesión antes de enviar la petición autenticada a la API. Los tokens nunca llegan al JavaScript del cliente.

## Organización frontend

- `server/`: cliente privado hacia la API y política de Route Handlers.
- `services/`: transporte browser hacia el BFF.
- `queries/` y `hooks/`: estado remoto con TanStack Query.
- `store/`: únicamente drawers y confirmaciones efímeras con Zustand.
- `schemas/`: contratos Zod compartidos por formularios y BFF.
- `components/`: workspace, filtros, tablas responsive, drawers y selector visual 00–99.

La selección masiva permite crear hasta 100 reglas o bloqueos en una sola operación. Las listas conservan filtros durante la paginación y usan `placeholderData` para evitar saltos visuales.
