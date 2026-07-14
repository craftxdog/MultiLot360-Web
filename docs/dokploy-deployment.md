# Despliegue con Dokploy

## Objetivo

El VPS no debe compilar. GitHub Actions hace validaciones, construye la imagen
Docker y la publica en GHCR. Dokploy sólo descarga la imagen y reinicia el
servicio.

```text
develop ──▶ GHCR:development ──▶ Dokploy development
master  ──▶ GHCR:production  ──▶ Dokploy production
```

Si aún no existe la aplicación dev en Dokploy, `develop` sigue validando y
publicando la imagen `development`; el paso de deploy queda omitido hasta que se
configure `DOKPLOY_WEBHOOK_URL` o `DOKPLOY_API_TOKEN` en el GitHub Environment
`development`.

## Configuración en Dokploy

Crea una aplicación por ambiente:

- `multilot-360-web-development`
- `multilot-360-web-production`

En cada aplicación usa imagen Docker externa:

- Development: `ghcr.io/craftxdog/multilot360-web:development`
- Production: `ghcr.io/craftxdog/multilot360-web:production`

Puerto interno del contenedor:

- `3000`

El servicio de producción actual en Dokploy ya tiene el dominio
`multilot360.alphaby.cloud` apuntando a ese puerto interno.

Si GHCR está privado, registra `ghcr.io` en Dokploy con:

- Registry URL: `ghcr.io`
- Username: tu usuario GitHub
- Password: token GitHub con `read:packages`

El servicio de producción que compartiste en Dokploy contiene este
`applicationId`:

```text
084v2EFwWkfkmDl1sUtbW
```

Úsalo como `DOKPLOY_APPLICATION_ID` del environment `production` si ese servicio
es el definitivo.

## GitHub Environments

Crea dos environments:

- `development`
- `production`

Variables por environment:

```text
NEXT_PUBLIC_APP_URL=https://app-dev.tudominio.com
NEXT_PUBLIC_API_URL=https://api-dev.tudominio.com/api/v1
DOKPLOY_URL=https://dokploy.alphaby.cloud
DOKPLOY_APPLICATION_ID=<application-id-del-ambiente>
```

Secrets por environment, opción recomendada:

```text
DOKPLOY_API_TOKEN=<token-generado-en-dokploy>
```

Alternativa con webhook:

```text
DOKPLOY_WEBHOOK_URL=<url-secreta-del-webhook-deployments>
```

No guardes el token de Dokploy ni el webhook en archivos `.env`, README o docs
con valores reales. GitHub los debe cifrar como secrets.

## Valores públicos actuales

Production quedó configurado en GitHub con:

```text
NEXT_PUBLIC_APP_URL=https://multilot360.alphaby.cloud
NEXT_PUBLIC_API_URL=https://api.alphaby.cloud/api/v1
DOKPLOY_URL=https://dokploy.alphaby.cloud
DOKPLOY_APPLICATION_ID=084v2EFwWkfkmDl1sUtbW
```

Development quedó preparado con dominio y API dev separados:

```text
NEXT_PUBLIC_APP_URL=https://dev-multilot360.alphaby.cloud
NEXT_PUBLIC_API_URL=https://api-dev.alphaby.cloud/api/v1
```

No apuntes `development` a `https://api.alphaby.cloud/api/v1`: evita mezclar
pruebas de `develop` con datos productivos. Cuando exista la aplicación dev en
Dokploy, agrega su webhook como secret `DOKPLOY_WEBHOOK_URL` en el GitHub
Environment `development`.

## Producción

Para lanzamiento controlado:

1. fusiona y valida en `develop`;
2. sincroniza `master` con el mismo commit;
3. GitHub valida que `master` y `develop` estén sincronizadas;
4. GitHub construye `ghcr.io/craftzdog/multilot360-web:production`;
5. GitHub dispara Dokploy production.

Activa aprobación requerida en el GitHub Environment `production` si quieres una
pausa manual antes del deploy final.

## Smoke básico después del deploy

```bash
curl -I https://multilot360.alphaby.cloud/login
curl -I https://multilot360.alphaby.cloud/forgot-password
```

En la UI:

1. abre `/login`;
2. usa “Olvidé mi contraseña”;
3. confirma que `/forgot-password` muestra el correo prellenado si venías del
   login;
4. solicita el código y verifica en la API/correo que se usa el endpoint público
   `/auth/password/reset/request`.
