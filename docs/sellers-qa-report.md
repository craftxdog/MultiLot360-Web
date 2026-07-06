# QA del módulo de vendedores

Fecha: 2026-06-29

## Resultado

| Área | Resultado | Evidencia |
| --- | --- | --- |
| ESLint | Correcto | Sin errores ni advertencias |
| TypeScript | Correcto | `tsc --noEmit` |
| Pruebas frontend | Correcto | 18 pruebas aprobadas |
| Build Next.js | Correcto | Compilación de producción y 13 rutas generadas |
| API de correo | Correcto y aplicado | 6 pruebas Jest, formato y `nest build` aprobados |
| Escritorio | Correcto | SVAR Grid, acciones visibles, filtros y vista de flujo |
| Móvil | Correcto | Tarjetas adaptativas, navegación y controles accesibles |
| Activación profunda | Correcto | Correo y OTP precargados; query sensible eliminada tras hidratar |
| Temas | Correcto | Autenticación, vendedores, sorteos y componentes compartidos en claro y oscuro |

## Casos comprobados

1. Carga de invitaciones reales con sesión administrativa.
2. Resumen global y estados normalizados.
3. Cambio entre tabla y flujo sin recargar el Server Component.
4. Filtro por nombre persistido en URL y actualización mediante TanStack Query.
5. Formulario de invitación con errores por campo sin enviar datos.
6. Drawer de detalle y acciones deshabilitadas cuando la invitación ya fue utilizada.
7. Vista móvil a 390 × 844.
8. Ruta pública `/activar-vendedor?email=...&code=...` con componente OTP de Bynana.
9. No se crearon invitaciones, no se reenviaron correos y no se revocaron registros durante QA.
10. Última página parcial: 11-12 de 12, enlaces conservando filtros y controles anterior/siguiente.
11. Sesión vencida: limpia cookies y llega al login sin bucle de redirecciones.
12. Grid sin selección accidental, sin desbordamiento horizontal del documento y con filas de 64 px.

## Hallazgos de API

- `GET /api/v1/health/ready` responde HTTP 200, pero el cuerpo reporta `status: error` porque Redis no está disponible. Readiness debería devolver un estado HTTP no exitoso cuando una dependencia obligatoria falla, o marcar Redis como opcional de forma explícita.
- Una consulta filtrada de invitaciones tardó aproximadamente 2.1 s en el entorno local contra la base remota. El BFF ya eliminó una llamada redundante a `/auth/me`, pero la API todavía resuelve usuario, rol, permisos y módulos en cada petición protegida.
- El resumen necesita un endpoint agregado (`GET /identity-access/sellers/overview`) para evitar inferir métricas desde páginas de invitaciones cuando existan más de 100 registros.

## Cambio de correo aplicado

La mejora se aplicó directamente en `multilot-api360` y se validó sobre el estado actual del repositorio. Incluye:

- `APP_WEB_URL` validada por entorno.
- Enlace seguro hacia `/activar-vendedor` con correo y OTP.
- Asuntos profesionales con ortografía corregida.
- Plantillas HTML y texto para invitación y reenvío.
- Pruebas de renderizado, envío, formato y build del API.
