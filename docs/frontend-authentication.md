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
- `POST /identity-access/sellers/access-code/confirm`

`GET /auth/me` devuelve `roleId` y `roleName` planos, mientras login devuelve un
rol anidado. `normalizeAuthMe` elimina esa diferencia para el resto de la UI.

La API todavía no expone forgot/reset password. La ruta web lo explica y no
simula un formulario que nunca podría completarse.

## Comandos

```bash
bun run dev:web
bun run check:web
```

La app web corre en `http://localhost:8080` y espera la API configurada en
`apps/web/.env.local`.

## Base para desktop

El repositorio ya es un workspace y el cliente HTTP vive en `packages/` para
que un futuro `apps/desktop` (Tauri 2, como Midday) reutilice contratos y manejo
de errores. El almacenamiento de tokens del cliente nativo debe implementarse
con el almacén seguro de Tauri; no debe copiar las cookies web ni usar
`localStorage`.
