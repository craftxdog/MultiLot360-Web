# Tareas de certificación — 2026-10-13

## Tarea 1: Línea base e inventario

**Aceptación:** commits, módulos, datos/migraciones y pipelines identificados;
los artefactos ajenos quedan fuera del alcance.

**Verificación:** estados Git y scripts de los dos repositorios registrados.

**Estado:** completada; los artefactos no versionados de la API permanecen
fuera del stage.

## Tarea 2: Certificación de datos, API y seguridad

**Aceptación:** las migraciones pasan en aislamiento, el acceso multi-tenant y
RBAC se prueban, y no queda ningún hallazgo crítico/alto explotable sin
mitigación o gate.

**Verificación:** pruebas de base, suites API, auditoría de dependencias,
health y revisión de configuración.

**Estado:** completada en aislamiento. La revisión de datos reales y readiness
de development está bloqueada externamente y no se sustituye con fixtures.

## Tarea 3: Certificación visual y de interacción

**Aceptación:** cada ruta operativa y de administración se comprueba con datos
reales/fixtures en los cuatro breakpoints sin overflow, errores de consola ni
interacciones inaccesibles.

**Verificación:** Playwright/navegador, pruebas de teclado, red y capturas.

**Estado:** completada: 68 recorridos (17 rutas por 4 viewports), sin overflow,
controles fuera de límites ni errores de producto.

## Tarea 4: Correcciones y regresión

**Aceptación:** cada defecto reproducible tiene prueba de regresión y cambio
mínimo; se valida en ejecución.

**Verificación:** pruebas focalizadas más suites y build completos.

**Estado:** completada: tabs de turnos, filtros densos y calendario móvil
quedaron cubiertos por regresión y verificados en navegador.

## Tarea 5: Publicación controlada

**Aceptación:** documentación, revisión independiente, rollback y gates CI/CD
verificados antes de cualquier promoción.

**Verificación:** CI verde, health listo y commits atómicos sin archivos ajenos.

**Estado:** pendiente de revisión final, commits y push a `develop`. La
promoción a `master`/producción permanece bloqueada hasta recuperar evidencia
del entorno real y resolver o aceptar formalmente la alerta alta de desarrollo
transitiva del frontend.
