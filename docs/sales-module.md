# Módulo de ventas

## Alcance

La ruta `/ventas` concentra dos vistas:

- `sell`: estación de captura rápida para tickets de hasta 100 números.
- `history`: consulta paginada, detalle y anulación de ventas.

La estación tiene un flujo normal y un modo opcional **Varios números**. Ambos aceptan únicamente dígitos. En modo normal se introduce un número de dos dígitos y se agrega; en modo múltiple, cada dos dígitos quedan fijados automáticamente en el ticket y el campo se limpia para continuar. Una secuencia pegada como `021532` fija `02`, `15` y `32` sin comas ni separadores. Si un número se fija varias veces, el frontend acumula el monto igual que el caso de uso de la API.

El modo múltiple permite activar o desactivar **Monto fijo**. Con monto fijo, cada número hereda el importe seleccionado. Sin monto fijo, cada número queda pendiente y debe completarse individualmente en la lista; el registro permanece inhabilitado hasta que todos los importes sean válidos.

En el flujo sin monto fijo, al completar los dos dígitos el foco pasa automáticamente al importe de esa jugada. `Enter` avanza al siguiente importe pendiente o vuelve al campo numérico, permitiendo operar el ciclo número → monto → número sin tocar la pantalla.

Los vendedores no eligen turno ni identidad: la aplicación fija su propio perfil y el siguiente turno vendible del día. La operación usa exclusivamente los horarios 11:00 a. m., 3:00 p. m. y 9:00 p. m. y muestra un cronómetro hasta el corte configurado. Un administrador puede utilizar su perfil de vendedor asociado o seleccionar otro vendedor habilitado.

En escritorio, el ticket permanece fijado junto a la captura. En móvil, un dock inferior muestra cantidad y total en todo momento y abre el ticket editable sin mover al operador hasta el final de la página.

## Cobertura completa de Sales API

- `GET /sales`
- `POST /sales`
- `GET /sales/:saleId`
- `PATCH /sales/:saleId/void`
- `GET /sales/settings/void-policy`
- `PATCH /sales/settings/void-policy`

El navegador consume `/api/sales/*`. Los Route Handlers validan sesión, origen, IDs y payloads antes de llamar a la API con el token almacenado en cookies `httpOnly`.

## Reglas efectivas

La creación es atómica y la API conserva la autoridad final:

1. El vendedor debe existir y estar activo.
2. El vendedor normal solo puede vender para sí mismo; un administrador puede seleccionar vendedor.
3. El turno debe existir y permanecer `ABIERTO`.
4. Cada número se normaliza a dos dígitos.
5. Un bloqueo por turno o por la fecha del turno rechaza la jugada.
6. El límite aplicable prioriza sorteo específico sobre predeterminado y vendedor específico sobre global.
7. El acumulado usa únicamente ventas activas del mismo día y alcance de límite.
8. Una anulación requiere venta propia o administrador, turno abierto y ventana vigente.

Ante un rechazo `422`, el ticket permanece intacto para que el operador pueda corregirlo.

Al completar una venta, la estación se limpia y muestra una confirmación breve. El detalle no se abre automáticamente; permanece disponible desde Historial.

## Contrato pendiente para montos decimales

La API actual valida `prizeMiles` con `@IsInt()` y PostgreSQL usa columnas `Int` para detalle, total, límites y pagos. Por tanto, montos como `3.5` o `1.2` requieren una migración coordinada de `multilot-api360`; habilitarlos únicamente en el navegador produciría ventas rechazadas y cálculos inconsistentes. El frontend mantiene pasos enteros hasta que dicho contrato sea actualizado.

## Arquitectura frontend

- `server/`: API privada y normalización de errores operativos.
- `services/`: transporte browser hacia el BFF.
- `queries/` y `hooks/`: caché, listas, detalles, métricas y mutaciones con TanStack Query.
- `store/`: borrador del ticket y estado efímero de drawers/diálogos con Zustand.
- `schemas/`: contratos Zod alineados con DTOs.
- `components/`: estación, captura masiva, ticket responsive, historial y configuración administrativa.

No se duplican en el cliente los cálculos de acumulado porque una prevalidación local podría quedar obsoleta frente a ventas concurrentes. La base de datos vuelve a comprobar todas las restricciones dentro de la misma transacción.
