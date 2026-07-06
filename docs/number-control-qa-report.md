# QA — Control numérico

## Automatización

- TypeScript estricto: aprobado.
- ESLint y reglas de React Compiler: aprobado.
- Suite Bun: 42 pruebas aprobadas.
- Cobertura contractual de los 9 endpoints del módulo mediante el BFF.
- Validación de esquemas para lotes, rangos de fechas y alcance exclusivo fecha/turno.
- Validación de origen para mutaciones.
- Navegación principal sin duplicados.

## QA visual

- Escritorio 1280 px: tablas, filtros, estadísticas y acciones sin desbordamiento horizontal.
- Móvil 390 × 844: estadísticas 2 × 2, filtros apilados y tarjetas operativas sin desbordamiento.
- Tema oscuro y tema claro comprobados.
- Cero errores o advertencias de consola durante las vistas verificadas.

## Seguridad funcional

- Renderizado y acciones condicionados por permisos independientes.
- El backend conserva la autorización definitiva por módulo y permiso.
- Mutaciones protegidas contra solicitudes cross-origin.
- IDs y payloads validados con Zod en el BFF.
- Confirmación explícita antes de finalizar una regla o liberar un bloqueo.
