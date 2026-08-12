# QA integral del frontend — develop

Fecha: 2026-08-12  
Rama evaluada: `develop`  
Superficies: Next.js web, responsive móvil/PWA y shell Tauri Desktop.

## Arquitectura validada

Desktop no duplica el frontend. Tauri carga la URL pública de Next.js para
reutilizar el mismo BFF, las cookies HTTP-only, RBAC, activación de vendedores y
selector de tema. El HTML local de Desktop se utiliza solamente cuando el
instalador no contiene `MULTILOT_DESKTOP_URL`.

Esta decisión evita mantener dos implementaciones de autenticación o almacenar
tokens de API en el WebView.

## Errores corregidos

### Comprobante térmico de venta

- El ticket anterior mezclaba datos operativos en una sola línea, mostraba el
  estado interno `ACTIVA` y expresaba los importes únicamente como “mil”, lo que
  no dejaba suficientemente claro qué estaba comprando el cliente.
- El comprobante de 80 mm ahora separa datos de la venta, sorteo seleccionado y
  jugadas compradas. Cada fila identifica el número elegido y el valor real en
  córdobas; el pie resume la cantidad de jugadas y el total de la venta.
- Los estados se presentan como `TICKET VÁLIDO` o `TICKET ANULADO`. Un ticket
  anulado advierte expresamente que sus jugadas no participan.
- La fecha de venta incluye año y zona horaria de Managua; el sorteo conserva su
  fecha y hora operativas, y la referencia completa queda disponible para
  soporte y auditoría.
- La altura de la página térmica se calcula según la cantidad de jugadas para
  evitar el gran espacio vacío del PDF anterior sin cortar tickets extensos.
- El documento no carga fuentes, imágenes ni dependencias externas. Todo texto
  procedente de la API se escapa antes de escribir la ventana de impresión.

### Enlace de restablecimiento de contraseña

- La ruta `/restablecer-contrasena` ya admite el enlace seguro nuevo de la API:
  `?email=...#recovery_token=...` y mantiene el OTP como contingencia manual.
- Se encontró una condición de navegación real: el componente inspeccionaba la
  URL una sola vez durante toda su vida. Si el usuario abría un segundo correo
  sobre la misma ruta montada, el frontend podía conservar el token anterior en
  memoria, enviar ese token consumido o invalidado y presentar el enlace nuevo
  como vencido.
- La inspección ahora se repite para cada URL distinta y ante `hashchange` o
  `popstate`. Correo y token se capturan de la misma navegación antes de limpiar
  la barra, y el token anterior se reemplaza en memoria.
- En modo de enlace seguro se muestran únicamente el correo normalizado como
  solo lectura, contraseña y confirmación. El token nunca se representa en el
  DOM ni en campos de formulario.
- El correo y el fragmento se eliminan de la barra y del historial inmediatamente
  mediante `history.replaceState`, sin recarga.
- El usuario puede cambiar explícitamente al OTP incluido en el mismo correo o
  solicitar un enlace y código nuevos. El modo manual mantiene el correo como
  solo lectura.
- La ruta declara `noindex`, `nofollow` y `Referrer-Policy: no-referrer`.
- Los errores del proveedor se reemplazan por mensajes genéricos y accesibles;
  no se expone el detalle de Supabase ni la existencia de una cuenta.
- Tras un cambio exitoso se explica que la API revocó las sesiones anteriores y
  se ofrece `Continuar al inicio de sesión`. La API no devuelve una nueva sesión,
  por lo que el acceso automático no forma parte del contrato seguro actual.
- El despacho de correo dispone de un timeout específico de 30 segundos porque
  el proveedor se ejecuta síncronamente en la API; los demás endpoints conservan
  el límite global de 10 segundos.

### Tema en móvil y WebView

- El selector original estaba oculto por debajo del breakpoint `sm`, por lo que
  teléfonos y ventanas angostas de Desktop no tenían ningún control de tema.
- Se agregó un selector nativo táctil para móvil y se conservó el control
  segmentado en escritorio.
- La lectura y escritura de `localStorage` ahora toleran restricciones del
  navegador/WebView. El cambio visual sigue funcionando aunque la persistencia
  esté bloqueada.
- El placeholder previo a hidratación reserva el mismo espacio responsive y no
  provoca un salto de layout.

### Renovación de invitaciones

- La interfaz deshabilitaba el reenvío para `EXPIRADO` y `REVOCADO`, aunque el
  endpoint existente permite emitir un código nuevo para una cuenta inactiva.
- Los estados `EXPIRADO` y `REVOCADO` muestran la acción explícita `Renovar`.
- `PENDIENTE` conserva `Reenviar`; `USADO` permanece inhabilitado.
- Las mutaciones siguen pasando por el BFF same-origin y no exponen mensajes del
  proveedor de correo.

### Fallback de Desktop

- La pantalla podía fallar completamente si `localStorage` lanzaba una
  excepción.
- El mensaje indicaba que solo se aceptaba HTTPS, mientras que la lógica también
  aceptaba HTTP para desarrollo local.
- La validación ahora acepta únicamente HTTP/HTTPS, rechaza URLs con
  credenciales embebidas y no impide navegar cuando el almacenamiento está
  bloqueado.
- El fallback ahora declara su icono y evita una solicitud `favicon.ico` 404.
- La lógica fue extraída a un módulo puro con pruebas automatizadas.

### Contexto de build para Dokploy

- Docker enviaba también `apps/desktop/src-tauri/target` y los esquemas
  generados de Tauri aunque la imagen desplegada solo contiene Next.js.
- El contexto de build bajó de 948.72 MB a aproximadamente 47.4 kB al excluir
  esos artefactos.
- La imagen standalone final pesa 79,518,579 bytes (aprox. 75.8 MiB) y ejecuta
  Next.js como el usuario no privilegiado `nextjs` con UID 1001.

## Flujos de seguridad verificados

- `/api/auth/password-reset` forma parte del build productivo.
- `/api/auth/seller-access/confirm` forma parte del build productivo.
- `/api/sellers/access-code/resend` forma parte del build productivo.
- La activación con `actionToken` limpia la URL mediante `replaceState`, no
  registra el token y muestra únicamente contraseña/confirmación.
- El modo manual conserva correo, código y contraseña.
- `/activar-vendedor` entrega `Referrer-Policy: no-referrer` y
  `X-Robots-Tag: noindex, nofollow`.
- No se detectaron errores React #418 ni advertencias de hidratación durante la
  navegación pública evaluada.

## Problemas de lógica todavía abiertos

### Historial de invitaciones no equivale a identidades vigentes

`GET /identity-access/sellers/invitations` devuelve registros históricos. Una
misma identidad puede aparecer simultáneamente como usada, expirada y revocada.
El frontend no recibe `sellerActive`, `userActive` ni una marca `isLatest` en
cada invitación.

Consecuencias:

- los contadores pueden representar códigos históricos y no personas;
- una invitación antigua expirada puede mostrar `Renovar` aunque una invitación
  posterior ya haya activado la cuenta;
- el endpoint de renovación rechazará correctamente esa cuenta activa, pero la
  interfaz no puede anticiparlo con el contrato actual;
- deduplicar únicamente la página visible sería incorrecto porque la invitación
  vigente puede estar en otra página.

Corrección recomendada para la API: devolver una vista de último estado por
`sellerId`, agregar `isLatest` y estado activo, o crear un endpoint agregado de
identidades/invitaciones vigentes. El historial completo debe conservarse para
auditoría, no utilizarse como tablero de estado actual.

### Integración multi-tenant y facturación SaaS

- Login y refresh aceptan tenant opcional y mantienen el contexto seleccionado.
- El BFF propaga `x-tenant-id` y conserva la membresía activa sin exponer tokens
  en el navegador.
- El alta pública consume el catálogo real y el flujo `/billing/signup`.
- Los propietarios pendientes entran a su portal de suscripción, documentos y
  declaraciones bancarias.
- El rol de plataforma dispone del Centro AlphaBy para solicitudes, clientes,
  planes, accesos y conciliación global, independientemente de los permisos
  operativos del tenant.
- Los roles de vendedor permanecen aislados de facturación y plataforma.

### Readiness de ambientes

- Development: `https://dev-api.alphaby.cloud/api/v1/health/ready` respondió
  `200`; configuración, PostgreSQL y Redis aparecen saludables.
- Producción: `https://api.alphaby.cloud/api/v1/health` respondió `200`, pero
  `/api/v1/health/ready` respondió `503` por base de datos no disponible.
- Producción tampoco expone todavía `GET /api/v1/billing/plans`, aunque el SHA
  publicado de la API sí contiene esa ruta. Esto indica que Dokploy está
  sirviendo una imagen/configuración anterior o una aplicación distinta.

La promoción del frontend SaaS no debe declararse completa hasta corregir la
conexión PostgreSQL de producción, confirmar que Dokploy usa la etiqueta
`ghcr.io/craftxdog/multilot-api360:production` y repetir los smoke tests.

### Observaciones del contrato de recuperación de la API

La revisión fue de solo lectura; no se modificó la API.

- Cada nueva ejecución de `generateLink({ type: "recovery" })` invalida el token
  y OTP anteriores. Solo deben probarse los datos del correo más reciente.
- La confirmación segura actualiza primero la contraseña y luego intenta revocar
  todas las sesiones. Si la revocación falla, la API puede devolver `502` aunque
  la contraseña ya haya cambiado y el token haya quedado consumido. Conviene que
  el backend haga ese cierre reintentable/idempotente o publique un código de
  resultado estable que permita distinguir ese estado parcial sin filtrar datos
  sensibles.
- La clasificación de token inválido depende de coincidencias amplias sobre el
  texto del error del proveedor (`token`, `otp`, `expired`). Es frágil ante
  cambios de mensajes de Supabase o errores de red; debe preferirse un código o
  tipo estructurado.
- El endpoint de confirmación devuelve únicamente el resultado del cambio y la
  revocación, no tokens de sesión. Por diseño el usuario debe iniciar sesión con
  la contraseña nueva; cualquier inicio automático requeriría un contrato de API
  distinto y sería incompatible con la revocación global actual.

## Evidencia QA

| Validación | Resultado |
| --- | --- |
| ESLint web | Aprobado |
| TypeScript web | Aprobado |
| Pruebas cliente API compartido | 1 aprobada, 0 fallidas |
| Pruebas web | 152 aprobadas, 0 fallidas |
| Pruebas shell Desktop | 4 aprobadas, 0 fallidas |
| Pruebas API enfocadas en recuperación (solo lectura) | 25 aprobadas, 0 fallidas |
| `cargo fmt --check` | Aprobado |
| Build productivo Next.js | Aprobado, 45 páginas generadas |
| Unit tests API | 245 aprobadas, 0 fallidas |
| E2E API | 1 aprobada, 1 suite externa omitida por diseño |
| SQL multi-tenant y billing en PostgreSQL 16 efímero | 2 suites aprobadas |
| Build NestJS | Aprobado |
| Workflows GitHub Actions (`actionlint`) | Web y API aprobados |
| Build Docker frontend | Aprobado, contexto aprox. 47.4 kB e imagen 79.5 MB |
| Smoke Docker | Saludable; UID 1001; rutas públicas 200 |
| BFF password reset en Docker | Ruta presente; body inválido validado con 400, no 404 |
| Build Tauri macOS arm64 | Aprobado, DMG generado sin warnings de código |
| Swagger local | 90 operaciones renderizadas, sin errores de consola |
| Tema móvil 390×844 | Cambio y persistencia aprobados |
| Tema escritorio 1440×900 | Tres opciones visibles y cambio aprobado |
| Activación móvil 390×844 | Sin overflow, URL limpiada, login visible |
| Fallback Desktop 390×720 | Sin overflow; URL inválida controlada |
| Navegación fallback Desktop → web | Aprobada |
| React hydration #418 | No reproducido |
| Segundo enlace seguro sobre la misma ruta | Token nuevo capturado, URL limpia y modo seguro restaurado |

El build local generó `MultiLot 360_0.1.0_aarch64.dmg`. La notarización se omite
en local porque no se cargan credenciales de Apple; el workflow de release es el
responsable de firma/notarización cuando dichas credenciales estén configuradas.
Windows continúa cubierto por la matriz de CI, ya que NSIS debe construirse en
un runner Windows.
