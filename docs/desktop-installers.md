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

## Variable obligatoria

Configura en GitHub Actions > Variables:

- `MULTILOT_DESKTOP_URL`: URL pública que abrirá la app desktop.

Si no existe, el workflow acepta también `NEXT_PUBLIC_APP_URL`.

La URL debe comenzar con `https://` o `http://`. Para producción usa `https://`.

## Crear instaladores desde GitHub Actions

1. Entra a **Actions**.
2. Ejecuta manualmente **Web CI/CD**.
3. Selecciona `target = desktop`.
4. Ejecuta desde la rama `master`.

El workflow genera artefactos descargables:

- `multilot-360-macos-arm64`
- `multilot-360-macos-x64`
- `multilot-360-windows-x64`

## Mostrar enlaces en el login

Cuando ya tengas URLs públicas de release, configura:

- `NEXT_PUBLIC_DESKTOP_MAC_URL`
- `NEXT_PUBLIC_DESKTOP_WINDOWS_URL`

La pantalla de login mostrará botones de descarga para macOS/Windows. Si esas
variables no están configuradas, mantiene la instalación web/PWA como respaldo.

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
