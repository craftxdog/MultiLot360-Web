# Instaladores desktop macOS/Windows

MultiLot 360 Desktop usa Tauri 2 como shell nativa ligera. La app carga la URL
publicada del sistema web, por lo que mantiene el mismo login, cookies seguras,
BFF y permisos que el navegador.

## Por qué Tauri

- instaladores más livianos que Electron;
- usa WebView nativo de macOS/Windows;
- no duplica la lógica de autenticación;
- permite empaquetar DMG y NSIS desde GitHub Actions.

## Estructura

```text
apps/desktop/
  package.json
  src/index.html                # fallback local si falta URL
  src-tauri/
    Cargo.toml
    tauri.conf.json
    src/lib.rs                  # abre MULTILOT_DESKTOP_URL
```

## URL de conexión

La app puede construirse de dos formas:

- con URL pública embebida, usando el input manual `desktop_url` o la variable
  de repositorio `MULTILOT_DESKTOP_URL`;
- sin URL embebida, mostrando una pantalla de conexión en el primer inicio para
  que el usuario escriba la URL pública de su MultiLot 360.

Si `desktop_url` y `MULTILOT_DESKTOP_URL` están vacías, el workflow acepta
`NEXT_PUBLIC_APP_URL`. Si todo está vacío, el release sigue siendo válido y
usa la pantalla de conexión local.

La URL debe comenzar con `https://` o `http://`. Para producción usa `https://`.

## Crear instaladores desde GitHub Actions

1. Entra a **Actions**.
2. Ejecuta manualmente **Web CI/CD**.
3. Selecciona `target = desktop`.
4. Opcionalmente indica:
   - `desktop_url`: URL pública que abrirá la app al iniciar;
   - `release_tag`: por defecto `desktop-v0.1.0`;
   - `release_name`: por defecto `MultiLot 360 Desktop v0.1.0`.
5. Ejecuta desde la rama `master`.

El workflow genera artefactos por plataforma y luego publica/actualiza un
GitHub Release con nombres estables:

- `MultiLot-360-macOS-arm64.dmg`
- `MultiLot-360-macOS-x64.dmg`
- `MultiLot-360-Windows-x64-Setup.exe`

## Mostrar enlaces en el login

El login apunta por defecto a:

```text
https://github.com/craftxdog/MultiLot360-Web/releases/latest/download
```

Puedes cambiar la base con:

- `NEXT_PUBLIC_DESKTOP_RELEASE_URL`

O sobrescribir un instalador específico con:

- `NEXT_PUBLIC_DESKTOP_MAC_ARM_URL`
- `NEXT_PUBLIC_DESKTOP_MAC_INTEL_URL`
- `NEXT_PUBLIC_DESKTOP_MAC_X64_URL`
- `NEXT_PUBLIC_DESKTOP_MAC_URL`
- `NEXT_PUBLIC_DESKTOP_WINDOWS_URL`

La pantalla de login siempre muestra los instaladores macOS/Windows y mantiene
la instalación web/PWA como respaldo para navegadores compatibles.

## Desarrollo local

Requiere Rust y dependencias nativas de Tauri:

```bash
bun install --frozen-lockfile
MULTILOT_DESKTOP_URL=http://localhost:8080 bun run dev:desktop
```

Para compilar localmente:

```bash
MULTILOT_DESKTOP_URL=https://tu-dominio.com bun run build:desktop
```

Nota: este entorno local actual no tiene `cargo`/`rustc`; por eso la validación
real de instaladores queda preparada en GitHub Actions, donde el workflow instala
Rust automáticamente.
