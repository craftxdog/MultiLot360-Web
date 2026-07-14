# Frontend de autenticación

## Alcance de esta primera vertical

Esta entrega ordena autenticación y deja la base compartida para los siguientes
módulos. No intenta migrar todavía ventas, sorteos, vendedores ni tablas; esos
módulos deben pasar por la misma frontera HTTP de forma incremental.

## Flujo implementado

1. Login, registro inicial y activación de vendedor usan Server Actions.
2. Zod valida antes de llamar a la API.
3. La API devuelve `accessToken` y `refreshToken`; ambos se guardan como cookies
   `HttpOnly`, `SameSite=Lax` y `Secure` en producción.
4. `proxy.ts` hace una comprobación optimista del JWT. Solo llama a
   `POST /auth/refresh` si el access token falta, es inválido o vencerá en menos
   de 60 segundos.
5. El proxy actualiza también las cookies de la petición para que el mismo
   render de Next.js reciba la sesión renovada.
6. El DAL consulta `GET /auth/me`. Un `401/403` representa una sesión inválida;
   un fallo de red o un `5xx` se propaga y no expulsa al usuario silenciosamente.
7. El usuario normalizado se hidrata en TanStack Query. Sidebar y topbar leen la
   misma clave de caché y no repiten `/auth/me`.
8. `GET /api/auth/session` permite revalidar la identidad desde el navegador sin
   exponer los tokens y puede renovar la sesión desde un Route Handler.

## Estructura

```text
packages/api-client/                 Cliente HTTP compartible con desktop
apps/web/src/lib/api/                Adaptadores HTTP web y endpoints
apps/web/src/lib/auth/               Cookies, JWT y sesión server-only
apps/web/src/features/auth/
  actions/                           Mutaciones server-first
  hooks/                             Hooks de consumo
  queries/                           Query keys y query options
  schemas/                           Contratos de formularios
  server/                            DAL y refresh coordinado
  services/                          Contrato con multilot-api360
  types/                             DTO API y modelo normalizado
```

## Decisiones de UI

- Se usa Hedvig Letters Sans/Serif, la tipografía actual de Midday.
- Bynana UI se integra mediante `BlurFade` detrás de un wrapper local. Así la
  dependencia no se dispersa por el producto y puede cambiarse sin reescribir
  las pantallas.
- SVAR se mantiene para componentes complejos de datos (DataGrid y, si aplica,
  calendarios). No se usa en autenticación porque no resuelve ese flujo.
- Las animaciones respetan `prefers-reduced-motion`. Se retiró la animación por
  palabra con temporizador permanente del login.

## Contrato real de la API

El frontend se verificó contra `multilot-api360`:

- `POST /auth/login`
- `POST /auth/signup`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/password/reset/request`
- `POST /auth/password/reset/confirm`
- `POST /identity-access/sellers/access-code/confirm`

`GET /auth/me` devuelve `roleId` y `roleName` planos, mientras login devuelve un
rol anidado. `normalizeAuthMe` elimina esa diferencia para el resto de la UI.

El reset público vive en el login/ruta `/forgot-password` y usa únicamente los
endpoints públicos de recuperación:

- `POST /auth/password/reset/request` pide el código por correo y conserva una
  respuesta genérica para evitar enumeración de cuentas.
- `POST /auth/password/reset/confirm` valida correo + código + nueva contraseña
  y revoca sesiones refresh.

No se mezcla con el reset administrativo. El reset admin sigue protegido en
`POST /auth/password/reset/admin` y se consume desde `/api/sellers/password-reset`
con Bearer/cookies de administrador.

## Comandos

```bash
bun run dev:web
bun run check:web
```

La app web corre en `http://localhost:8080` y espera la API configurada en
`apps/web/.env.local`.

## Base para desktop

El repositorio ya incluye `apps/desktop` con Tauri 2. La primera versión desktop
carga la URL publicada de la web para conservar el mismo BFF, cookies
HTTP-only, permisos y validaciones de sesión. El login muestra el bloque
“MultiLot 360 para escritorio” con el icono oficial y enlaces estables hacia el
último GitHub Release:

- `MultiLot-360-macOS-arm64.dmg`
- `MultiLot-360-macOS-x64.dmg`
- `MultiLot-360-Windows-x64-Setup.exe`

Si necesitas otro origen de descarga, configura
`NEXT_PUBLIC_DESKTOP_RELEASE_URL` o sobrescribe un instalador específico con
`NEXT_PUBLIC_DESKTOP_MAC_ARM_URL`, `NEXT_PUBLIC_DESKTOP_MAC_INTEL_URL`,
`NEXT_PUBLIC_DESKTOP_MAC_X64_URL`, `NEXT_PUBLIC_DESKTOP_MAC_URL` o
`NEXT_PUBLIC_DESKTOP_WINDOWS_URL`.

Si en el futuro se implementan flujos nativos que consuman la API directamente,
los tokens deben guardarse en el almacén seguro de Tauri; no deben copiar las
cookies web ni usar `localStorage`.
