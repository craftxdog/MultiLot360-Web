# QA — Ventas

## Automatización

- ESLint y reglas de React Compiler: aprobado.
- TypeScript estricto: aprobado.
- Pruebas Bun del frontend aprobadas, incluyendo selección automática del turno y montos individuales pendientes.
- Cobertura contractual de las 6 operaciones públicas de Sales API y el resumen BFF.
- Pruebas de tickets múltiples, normalización, política de anulación, filtros y same-origin.
- Pruebas de entrada exclusivamente numérica, fijado automático por pares, remanente incompleto y acumulación de números repetidos.

## QA funcional

- Selección de turno y vendedor.
- Captura normal y modo opcional de varios números, ambos con teclado exclusivamente numérico.
- Fijado automático por cada dos dígitos, sin comas, espacios ni controles adicionales.
- Monto fijo opcional; sin monto fijo, cada jugada exige completar su importe individual.
- Navegación de teclado número → monto → siguiente pendiente, con retorno automático a la captura.
- Vendedor fijado a su identidad y turno vigente; administrador con venta propia condicionada a perfil de vendedor o representación explícita.
- Cronómetro de corte para los turnos operativos de 11 a. m., 3 p. m. y 9 p. m.
- Confirmación no intrusiva tras registrar; el detalle se consulta desde Historial.
- Agregado de un lote completo mediante una sola actualización de Zustand.
- Ticket fijo en escritorio y dock inferior editable en móvil.
- Eliminación y edición dentro de un panel con altura acotada, sin volver al final de la página.
- Ticket conservado ante errores de negocio.
- Historial responsive con detalle y anulación condicionada por permisos/estado.

## QA visual

- Escritorio: captura compacta y ticket lateral fijo sin matriz de 100 controles.
- Móvil: resumen secundario oculto durante la venta, captura fijada y ticket siempre accesible desde el dock inferior.
- Tema claro y oscuro mediante tokens del sistema.
- Cero errores o advertencias de consola en las vistas comprobadas.

## Seguridad

- Tokens fuera del JavaScript del navegador.
- Mutaciones protegidas contra solicitudes cross-origin.
- RBAC reflejado en navegación, acciones y selección de vendedor.
- La API vuelve a verificar vendedor, propiedad, turno, bloqueo, límite y ventana de anulación.
- La cobertura backend de Sales, límites y bloqueos mantiene 28 pruebas aprobadas en sus tres suites de casos de uso.
- Los montos decimales permanecen bloqueados por el contrato `Int` de la API y requieren migración antes de pruebas transaccionales reales.
