# QA del módulo Draws

## Cobertura automática

- Contratos Zod: fechas reales, rangos, horarios, UUID y actualización no vacía.
- Servicios: correspondencia de los 10 métodos con su verbo, ruta y body del BFF.
- URL del workspace: serialización, normalización de filtros y paginación.
- Seguridad: aceptación de mismo origen y rechazo de origen ausente o diferente.
- Reglas de transición: acciones disponibles según estado y permiso.
- Store Zustand: apertura, cierre y limpieza del estado efímero.

Comandos de cierre:

```bash
bun test src
bun run typecheck
bun run lint
bun run build
```

## Verificación visual

Se validó una sesión hidratada de QA sin ejecutar mutaciones reales:

- Escritorio de 1280 px: tabla visible, dos configuraciones, acciones y drawer de edición con cuatro campos.
- Tema oscuro: fondo, texto, superficies, bordes y grid usan los tokens del tema; no aparece desbordamiento horizontal.
- Móvil de 390 px: los indicadores forman una cuadrícula 2×2, los turnos pasan a una columna y no hay desbordamiento horizontal.
- Tablero activo: los contadores de cierre y tiempo en estado avanzan cada segundo y se detienen cuando la pestaña deja de estar visible.
- Navegación: existe una sola entrada principal, `Turnos`; la ruta histórica de sorteos redirige a la pestaña de configuraciones.
- Consola: cero errores y cero advertencias durante el recorrido.

## Criterios funcionales revisados

- El total y el número de páginas vienen de la metadata de la API, no del tamaño de la página actual.
- Cambiar filtros o límite vuelve a la página 1.
- Cambiar de vista conserva únicamente los filtros compatibles.
- Los controles anterior/siguiente respetan `hasPreviousPage` y `hasNextPage`.
- Una acción completada invalida listas, detalle y overview para no dejar datos obsoletos.
- El detalle de configuración usa su endpoint individual antes de editar.
- Los estados de carga, vacío y error no bloquean el resto del workspace.

No se dispararon operaciones de bloqueo, reapertura, cierre, creación o edición contra datos productivos durante QA.
