# Certificación prepublicación del frontend — 2026-10-13

Rama objetivo: `develop`.

## Dictamen

El cambio está certificado para integrarse en `develop` con datos de prueba
locales. **No está certificado para promocionarse a `master` ni para desplegar
producción todavía.** La diferencia es deliberada: la interfaz y su contrato
local están verificados, pero el entorno development real no estuvo disponible
para comprobar datos migrados, readiness y los flujos con las credenciales de
QA.

No se hicieron escrituras contra sistemas compartidos ni se usaron las
credenciales proporcionadas para automatizar pruebas.

## Evidencia ejecutada

| Área | Evidencia | Resultado |
| --- | --- | --- |
| Calidad integrada | `bun run check:frontend` | Aprobado: lint, TypeScript, 1 prueba del cliente API, 154 pruebas web, 4 del shell Desktop, formato Rust y build. |
| Empaquetado | `bun run build:web` | Aprobado con 45 rutas. |
| Navegador responsive | Chromium local con fixtures | 68/68 recorridos aprobados: 17 rutas por 320×844, 768×1024, 1024×900 y 1440×960. |
| Reglas visuales | Inspección DOM de los 68 recorridos | Sin overflow de documento, controles fuera de viewport, errores de consola/página ni jerarquía `h1` inválida. |
| Calendario y matriz | Interacción real a 320 px | El rango se aplica, el panel queda dentro del viewport; la matriz conserva únicamente su scroll horizontal intencional. |
| Popovers de fechas | 20 aperturas reales en 6 módulos y 4 viewports | Sin desborde horizontal o vertical; cuando no cabe, el propio panel usa scroll interno. |
| Dependencias | `bun install --frozen-lockfile --ignore-scripts` | Aprobado. |

El build usa explícitamente `next build --webpack`. Después de actualizar a
Next 16.3.8, Turbopack falló en este host al crear un proceso auxiliar durante
el procesamiento CSS (`Operation not permitted` al bindear un puerto). Webpack
es el fallback oficialmente soportado por Next 16 y generó el artefacto
optimizado sin alterar el comportamiento de rutas. El script `build` y el CI
usan ahora esa ruta reproducible.

## Correcciones UI/UX verificadas

- Las pestañas de turnos preservan sus nombres accesibles completos y usan
  etiquetas compactas sólo visualmente en móvil.
- Filtros de premios, reportes, facturación, matriz y estación de venta usan
  contenedores que pueden encogerse (`min-w-0`) sin invadir la columna vecina.
- La matriz reduce sus mínimos en tamaños densos y mantiene el desplazamiento
  horizontal sólo dentro de su contenedor de datos.
- El selector de rango de fechas se porta a la raíz del documento y calcula una
  posición limitada por el viewport. Se alinea al campo cuando hay espacio,
  cambia arriba cuando conviene y limita su propia altura con scroll interno;
  con ello ningún campo cercano a un borde expulsa el calendario del viewport.

## Seguridad y dependencias

- Se actualizó Next.js y `eslint-config-next` a 16.3.8 y se actualizaron
  dependencias transitivas corregibles mediante el lockfile y `overrides`.
- La auditoría actual reporta una alerta alta: `braces <= 3.0.3`, transitiva de
  `eslint-config-next`. No existe una versión corregida publicada para esa
  rama según el registro consultado. Es una dependencia de herramientas de
  build, no está presente en la imagen standalone de runtime; aun así, un gate
  que exija cero alertas altas debe mantener la promoción bloqueada hasta que
  el proveedor publique el arreglo o seguridad acepte formalmente el riesgo.
- Las mutaciones del BFF continúan validando origen same-origin, y los tests
  de autenticación, recuperación e invitación permanecen verdes.

## Límites de la certificación

| Gate externo | Estado | Acción necesaria |
| --- | --- | --- |
| API development `dev-api.alphaby.cloud` | No resolvió DNS desde el entorno de certificación. | Recuperar DNS/red y ejecutar el smoke autorizado contra `health/ready` y flujos de QA. |
| Datos migrados en Supabase | Proyecto conectado marcado como inactivo; no se alteró su estado. | Reactivar o facilitar un entorno activo de sólo lectura y comparar migraciones, conteos y aislamiento. |
| Alerta alta de desarrollo `braces` | Pendiente de proveedor/aceptación. | Actualizar cuando exista parche o registrar aceptación de riesgo con fecha y responsable. |
| Impresión directa Bluetooth | No es capacidad web estándar. | Para PT-210 y similares, implementar/validar un puente nativo del cliente Desktop con el driver del sistema; el navegador sólo puede abrir el diálogo de impresión. |

## Publicación y rollback

Una vez cumplidos los gates externos, el orden seguro es:

1. Push de los commits certificados a `develop` y esperar el workflow `Web
   CI/CD` verde.
2. Ejecutar smoke autenticado y lectura de datos contra development.
3. Crear una release desde `develop`, volver a validar el SHA y promover a
   `master` con la aprobación de production.
4. Si hay regresión, revertir el commit de corrección, redeployar la etiqueta
   inmutable anterior y comprobar `/login` y el healthcheck configurado.

No hay migración de datos asociada a estas correcciones de frontend.
