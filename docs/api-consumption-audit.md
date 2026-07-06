# Auditoría de consumo API

Fecha: 2026-07-06 (America/Managua)

Fuente backend revisada: `craftxdog/MultiLot-360`, rama `master`, commit
`f2115c2`. Se contrastaron `docs/api.md`, controladores, DTO, casos de uso y
repositorios; cuando la documentación y el código difieren, esta auditoría toma
el código como contrato efectivo.

## Arquitectura validada

El navegador sólo consume rutas same-origin bajo `/api/*`. Cada Route Handler
recupera/refresca la sesión HTTP-only, valida parámetros y cuerpos con Zod,
comprueba el `Origin` en mutaciones y reenvía el Bearer token a la API NestJS.
Los componentes usan TanStack Query para datos remotos y Zustand únicamente
para estado efímero de interacción.

## Cobertura por módulo

| Módulo | API real | Adaptador frontend | Consumidor de UI |
| --- | --- | --- | --- |
| Auth | `POST /auth/signup`, `/login`, `/refresh`, `/logout`, `/password/reset/request`, `/password/reset/confirm`; `GET /auth/me` | Server Actions, `authService`, `/api/auth/session` | Formularios de acceso/recuperación, layout, avatar y realtime |
| Reset ADMIN | `POST /auth/password/reset/admin` | `POST /api/sellers/password-reset` | Herramienta administrativa visible y panel contextual de vendedor activo |
| Vendedores | `GET /identity-access/sellers`; invitaciones, confirmación, reenvío y revocación | `/api/sellers/directory`, `/api/sellers/*`, `sellersService` | Directorio de vendedores activos/inactivos separado del flujo de onboarding |
| Roles | módulos, lista/detalle/alta de roles, reemplazo de permisos y asignación de rol | `/api/access/*`, `accessControlService` | Matriz RBAC, creación de rol y asignación a usuario en `/roles` |
| Notificaciones | bandeja, contador, lectura individual y lectura total | `/api/notifications/*`, `notificationsService` | Campana personal, contador y bandeja protegida por `notificaciones.*` |
| Sorteos/turnos | 10 endpoints de configuraciones, turnos activos y transiciones | `/api/draws/*`, `drawsService` | Configuraciones, turnos, formularios y acciones de estado |
| Control numérico | 5 endpoints de límites y 4 de bloqueos | `/api/number-control/*`, `numberControlService` | Listas, detalle, creación, edición, expiración y desbloqueo |
| Ventas | 6 endpoints de venta y política de anulación | `/api/sales/*`, `salesService` | Estación, historial, detalle, anulación y política |
| Matriz | `GET /sales-matrix` | `GET /api/sales-matrix`, `salesMatrixService` | Matriz `00..99`, filtros y resumen |
| Resultados | lista, creación, detalle y ventas ganadoras | `/api/operations/results/*`, `operationsService` | Lista, alta y drawer con detalle/ganadores |
| Premios | lista, pago y detalle por venta | `/api/operations/prizes/*`, `operationsService` | Lista, confirmación y comprobante en drawer |
| Cortes | lista, creación, detalle y resumen | `/api/operations/cuts/*`, `operationsService` | Lista, alta y drawer con totales/vendedores |
| Reportes | overview y desglose por vendedores | `/api/operations/reports/*`, `operationsService` | Indicadores y tabla comparativa |
| Auditoría | lista y detalle | `/api/operations/audit/*`, `operationsService` | Lista y drawer con payload completo |
| Parámetros | lista, detalle y upsert | `/api/parameters/*`, `parametersService` | Catálogo, resumen y editor que refresca el detalle antes de editar |

Los endpoints `overview` de sorteos, control numérico, ventas, vendedores y
parámetros son proyecciones BFF calculadas en paralelo sobre listas protegidas;
no inventan un contrato que el backend no expone.

## Mejoras aplicadas

- `browserHttp` fuerza `credentials: same-origin`, `cache: no-store`, soporta
  respuestas `204` y conserva arrays de errores de validación.
- Todas las rutas de página sensibles vuelven a autorizar el permiso en el
  servidor; ocultar el enlace de navegación no es la barrera de seguridad.
- El detalle de auditoría valida `eventId` como UUID y los errores de red nunca
  intentan construir una respuesta HTTP con estado `0`.
- Los endpoints de detalle de resultados, ganadores, premios, cortes, resumen,
  auditoría y parámetros ya tienen consumidores reales de UI.
- El dashboard dejó de usar cifras de demostración y consulta únicamente los
  módulos permitidos para la sesión. Sus gráficas SVG no añaden una librería:
  el administrador ve totales globales y comparativa; el vendedor sólo su
  `sellerId`.
- El reset administrativo refleja el contrato del backend: rol `ADMIN`, módulo
  `USUARIOS`, permiso `usuarios.update`, usuario objetivo activo/enlazado.
- Las ventas aceptan `prizeMiles` desde `0.01` hasta `999999`, máximo dos
  decimales, igual que `SaleItemDto`; la suma de duplicados se redondea a dos
  posiciones para evitar deriva de coma flotante.
- La fecha generada de la matriz usa zona `America/Managua` y composición
  determinista, por lo que SSR y cliente producen exactamente el mismo texto.
- El menú móvil se monta mediante portal sobre `document.body` con safe-area y
  capas globales; ya no queda atrapado bajo el `backdrop-blur` del topbar.
- Se retiraron `next-themes`, Google Fonts y `bynana-ui`. El tema propio no
  inyecta scripts desde componentes cliente y el build no depende de red.

## Hallazgo de seguridad backend

Los controladores `GET /reports/overview` y `GET /reports/sellers` autorizan
`ventas.read`, pero el caso de uso no fuerza por sí mismo el vendedor de la
sesión. El BFF corrige la exposición: sólo un rol `ADMIN` conserva el filtro
global; cualquier otra sesión recibe obligatoriamente su `seller.id`. Conviene
replicar esta regla en la API para proteger también consumidores distintos del
frontend web.

## Evidencia

- ESLint: correcto.
- TypeScript: correcto.
- Pruebas: 86 casos, incluyendo cobertura de servicios/BFF por módulo.
- Build Next.js 16.2.9: correcto, 37 páginas generadas y manifiesto completo de
  Route Handlers.
- Navegador autenticado a 390 x 844: menú abre/cierra/navega, avatar muestra
  identidad/rol/estado/opciones y reset ADMIN visible. Build final a 390 x 844:
  cero errores de consola y `scrollWidth === clientWidth`.
- API real: `/health/ready` respondió HTTP 200; configuración y base de datos
  están `ok`. Redis está degradado/no disponible, por lo que realtime puede
  aparecer reconectando. `/auth/me` sin Bearer respondió 401 correctamente.

No se ejecutó un cambio real de contraseña durante QA.
