# Integración frontend con API multi-tenant

Fecha de auditoría: 2026-08-11
Contrato: `https://dev-api.alphaby.cloud/docs`

## Cambios de contrato incorporados

- La autenticación acepta `tenant` (slug o UUID) en login y refresh.
- La sesión devuelve tenant, membresía y propiedad (`isOwner`).
- Las llamadas privadas envían `x-tenant-id` desde una cookie `httpOnly`.
- El alta pública anterior fue sustituida por `POST /billing/signup`, que crea
  usuario, tenant, propietario, onboarding y suscripción pendiente.
- El tenant puede operar su ciclo financiero mediante `/billing/portal` aun
  cuando el acceso operacional está bloqueado por pago pendiente.
- El control financiero global usa un contexto separado de plataforma y nunca
  depende de permisos RBAC internos de un tenant.

## Matriz implementada

| Capacidad | Endpoint API | Superficie frontend |
| --- | --- | --- |
| Catálogo de planes | `GET /billing/plans` | Alta de empresa con USD/NIO |
| Alta pagada | `POST /billing/signup` | `/signup` |
| Contexto de tenant | `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me` | Login, cookie y encabezado privado |
| Portal de suscripción | `GET /billing/portal` | `/suscripcion` |
| Documento inicial | `POST /billing/portal/invoices/initial` | Acción en portal del propietario |
| Declaración bancaria | `POST /billing/portal/transfers` | Formulario exacto por factura/moneda |
| Evidencia privada | `POST /billing/portal/transfers/:id/evidence` | PDF/JPEG/PNG hasta 10 MiB |
| PayPal opcional | `POST /billing/portal/paypal/checkout` | BFF preparado; la API decide si está habilitado |
| Cola global | `GET /billing/admin/transfers` | `/plataforma` |
| Conciliación | `POST /billing/admin/transfers/:id/review` | Aprobación/rechazo inmutable |

## Reglas de seguridad respetadas

- Los tokens siguen fuera de JavaScript y permanecen en cookies `httpOnly`.
- El selector del tenant no se toma de formularios operativos; se conserva desde
  la sesión autenticada y se envía únicamente desde el servidor.
- Todas las mutaciones BFF validan origen same-origin.
- La aprobación exige evidencia y una referencia confirmada en el banco.
- La interfaz nunca ofrece pagos parciales ni conversión de moneda.
- Los comprobantes no se exponen directamente: se consumen mediante URLs
  firmadas de cinco minutos emitidas por la API.
- El documento actual se denomina "documento comercial de cobro" porque el
  backend declara explícitamente que no es una factura fiscal.

## Frontera actual del backend

El contrato auditado no ofrece CRUD global de tenants, cambio manual de plan,
cancelación de suscripción, emisión de factura fiscal, reversión de pagos ni
creación administrativa directa de una membresía propietaria. Por eso el centro
AlphaBy se limita deliberadamente a:

1. compartir el enlace oficial de alta pagada;
2. observar clientes presentes en el flujo financiero;
3. monitorear todos los estados de transferencias;
4. revisar evidencia y conciliar pagos.

Agregar botones para acciones no publicadas por la API produciría una interfaz
engañosa o insegura. Esas capacidades requieren primero endpoints de plataforma
dedicados, con auditoría y autorización explícitas.
