# Módulo Draws

## Alcance

El workspace de sorteos y turnos tiene una única entrada principal:

- `/turnos`: operación en vivo, historial y configuraciones.
- `/sorteos`: ruta de compatibilidad que redirige a `/turnos?view=configurations`.

Ambas páginas comparten el feature `apps/web/src/features/draws`, conservan filtros y paginación en la URL y solo muestran vistas o acciones autorizadas por los permisos del usuario.

## Endpoints cubiertos

| Operación | BFF web | API Draws | Permiso |
| --- | --- | --- | --- |
| Listar configuraciones | `GET /api/draws/configurations` | `GET /draws/configurations` | `sorteos.read` |
| Crear configuración | `POST /api/draws/configurations` | `POST /draws/configurations` | `sorteos.create` |
| Consultar configuración | `GET /api/draws/configurations/:id` | `GET /draws/configurations/:id` | `sorteos.read` |
| Editar configuración | `PATCH /api/draws/configurations/:id` | `PATCH /draws/configurations/:id` | `sorteos.update` |
| Listar turnos activos | `GET /api/draws/shifts/active` | `GET /draws/shifts/active` | `turnos.read` |
| Listar historial | `GET /api/draws/shifts` | `GET /draws/shifts` | `turnos.read` |
| Crear turno | `POST /api/draws/shifts` | `POST /draws/shifts` | `turnos.create` |
| Bloquear turno | `PATCH /api/draws/shifts/:id/block` | `PATCH /draws/shifts/:id/block` | `turnos.update` |
| Reabrir turno | `PATCH /api/draws/shifts/:id/reopen` | `PATCH /draws/shifts/:id/reopen` | `turnos.update` |
| Cerrar turno | `PATCH /api/draws/shifts/:id/close` | `PATCH /draws/shifts/:id/close` | `turnos.update` |

`GET /api/draws/overview` es una composición del BFF para los indicadores del workspace. Obtiene totales reales por estado y configuraciones activas sin duplicar esa coordinación en la interfaz.

## Flujo de datos

1. El Server Component valida el permiso de entrada y precarga la vista solicitada.
2. El servidor obtiene el access token desde la sesión HTTP-only y consulta la API.
3. TanStack Query hidrata el resultado en el cliente con claves estables por filtros y página.
4. La navegación actualiza `view`, `page`, `limit`, `date`, `status` y `active` en la URL.
5. Las mutaciones pasan por el BFF, validan origen y payload, y luego invalidan el namespace `draws`.
6. Zustand conserva únicamente estado efímero de interfaz: drawers, selección y confirmación pendiente.

## Decisiones de seguridad

- El navegador nunca recibe ni administra el JWT de la API.
- Todas las mutaciones del BFF requieren una petición del mismo origen.
- Payloads, query strings e identificadores UUID se validan con Zod antes de llegar a la API.
- La página, las pestañas y cada acción aplican permisos; la API mantiene la autorización definitiva.
- Las respuestas autenticadas usan `private, no-store` y no quedan en cachés compartidas.
- Bloquear, reabrir y cerrar requieren confirmación explícita y respetan las transiciones válidas del turno.

## Interfaz y rendimiento

- Grid SVAR en escritorio y tarjetas semánticas en móvil.
- Tablero de activos con cierre programado, tiempo en estado, progreso y sincronización en vivo.
- Paginación server-side basada en `meta.pagination` de la API.
- Tema claro y oscuro mediante tokens, sin colores rígidos de una sola apariencia.
- Animación limitada al indicador de pestaña y drawer; ambas respetan `prefers-reduced-motion`.
- `keepPreviousData` evita saltos al paginar y el listado activo refresca cada 30 segundos solo en primer plano.
- La precarga SSR reduce el estado vacío inicial y evita solicitudes duplicadas.
