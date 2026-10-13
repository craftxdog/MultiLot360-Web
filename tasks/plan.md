# Plan de certificación de publicación — 2026-10-13

## Objetivo

Certificar el corte actual de MultiLot 360 antes de su publicación: que los
datos y migraciones mantengan el aislamiento por tenant, que cada módulo web
sea usable y legible en móvil, tablet y escritorio, y que API, seguridad,
rendimiento y CI/CD superen gates verificables.

## Alcance y decisiones

- La certificación cubre `multilot-360-web` y `multilot-api360` en sus ramas
  `develop` sincronizadas con `origin/develop` al inicio de la revisión.
- Las pruebas contra datos compartidos serán sólo de lectura. Las pruebas de
  escritura se ejecutarán contra los entornos locales/aislados previstos por
  la suite.
- No se promocionará a producción si `/health/ready`, las migraciones, la
  seguridad, o un flujo crítico no son verificables.
- Los artefactos locales no versionados de la API se preservan fuera de los
  commits de esta certificación.

## Grafo de dependencias

```text
Migraciones y datos -> contexto/aislamiento de tenant -> contratos HTTP
       -> cliente de API y caché -> módulos UI -> recorridos responsive
       -> gates CI/CD y rollback -> publicación
```

## Fases

### 1. Línea base e inventario

- [x] Registrar commits, estado de worktrees, módulos, rutas y pipelines.
- [x] Establecer resultados base de lint, tipos, pruebas y build.

### 2. Datos, migraciones y API

- [x] Verificar el orden y aplicabilidad de las migraciones en una base
      aislada. La inspección de datos remotos queda bloqueada porque el
      proyecto Supabase está inactivo y la API development no resuelve.
- [x] Comprobar aislamiento entre tenants, RBAC, paginación, índices y rutas
      públicas/protegidas de alto riesgo en las suites aisladas.
- [x] Auditar autenticación, CORS, headers, validación de entrada, errores,
      secretos y dependencias. La disponibilidad real sigue siendo un gate
      externo, no una afirmación de aprobación.

### 3. Web, UX y responsive

- [x] Inventariar rutas y estados de carga, vacío, error y permisos por rol.
- [x] Recorrer en navegador los flujos de dashboard, ventas, matriz,
      calendarios/sorteos, turnos, resultados, control, administración,
      facturación y centro de plataforma.
- [x] Validar a 320, 768, 1024 y 1440 px: sin overflow horizontal, cortes,
      controles inaccesibles ni ambigüedad de estado.
- [x] Comprobar consola, red, estructura accesible y teclado contra fixtures
      locales. El rendimiento contra datos reales queda sujeto al gate externo.

### 4. Reparaciones acotadas

- [x] Para cada defecto reproducible, añadir primero una prueba que falle,
      aplicar el cambio más pequeño y verificarlo en navegador.
- [x] Mantener cambios agrupados y documentar riesgos o bloqueos externos.

### 5. Gate de lanzamiento

- [x] Revisar el diff de forma independiente, repetir pruebas completas y
      documentar evidencia, rollback y resultado del gate.
- [ ] Crear commits atómicos y subir sólo cambios certificados conforme a
      Gitflow, sin mezclar artefactos locales ajenos.

## Criterios de salida

1. No hay fallos de lint, tipos, tests, build, migraciones ni contratos API.
2. Las rutas críticas son visualmente correctas y utilizables en los cuatro
   tamaños objetivo, sin errores de consola/red atribuibles al producto.
3. Todo acceso entre tenants y privilegios de plataforma se rechaza o permite
   según el rol; no se exponen secretos, datos cruzados ni errores internos.
4. La aplicación tiene una ruta de health verde y un plan de rollback que el
   pipeline pueda ejecutar.

## Riesgos conocidos al inicio

| Riesgo | Mitigación |
| --- | --- |
| Herramientas no versionadas en la API | No modificarlas, no añadirlas al stage y registrar su presencia. |
| Datos compartidos de clientes | Sólo consultas de lectura; fixtures locales para mutaciones. |
| Configuración externa de producción | Tratarla como gate: evidencia de health y migración o bloqueo explícito. |
| Pantallas densas (matriz/plataforma) | Pruebas reales de overflow y controles a cada breakpoint. |
