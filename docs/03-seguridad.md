# 03 — Seguridad

## Modelo de Autenticación

### Proveedores de Login Soportados

| Provider | Descripción |
|---------|-------------|
| `LOCAL` | Email + contraseña con hash seguro |
| `GITHUB` | OAuth2 con GitHub |
| `GOOGLE` | OAuth2 con Google |
| `FARCASTER` | Autenticación Web3 (firma de wallet) |
| `WALLET` | Firma con wallet Ethereum |
| `GENERIC` | SSO genérico (Authentik, Keycloak, etc.) |

### JWT (JSON Web Tokens)
- Todos los endpoints autenticados usan JWT Bearer tokens.
- El secreto se configura con `JWT_SECRET` (variable de entorno).
- Se recomienda usar una cadena aleatoria larga y única por instancia.

### OAuth Genérico (SSO Empresarial)
```env
POSTIZ_GENERIC_OAUTH=true
POSTIZ_OAUTH_URL=https://auth.example.com
POSTIZ_OAUTH_AUTH_URL=...
POSTIZ_OAUTH_TOKEN_URL=...
POSTIZ_OAUTH_USERINFO_URL=...
POSTIZ_OAUTH_CLIENT_ID=...
POSTIZ_OAUTH_CLIENT_SECRET=...
```
Compatible con cualquier proveedor OIDC (Authentik, Keycloak, Okta, Auth0).

---

## Control de Acceso (RBAC)

### Roles de Usuario

| Rol | Permisos |
|-----|---------|
| `SUPERADMIN` | Control total sobre toda la instancia |
| `ADMIN` | Control total sobre su organización |
| `USER` | Acceso básico a las funcionalidades de su organización |

### Aislamiento Multi-Tenant

- Cada **Organization** es un tenant independiente.
- Todas las consultas a la base de datos filtran por `organizationId`.
- Un usuario puede pertenecer a múltiples organizaciones con roles diferentes en cada una.
- El modelo `UserOrganization` controla las membresías y puede ser `disabled`.

---

## Seguridad de APIs

### API Interna
- Autenticada mediante JWT en cada request.
- Guards de NestJS validan el token y el rol antes de cada endpoint.

### API Pública (para terceros)
- Autenticada mediante **API Key** por organización.
- Almacenada en `Organization.apiKey`.
- Rate limiting configurable: `API_LIMIT=30` (peticiones por hora por defecto).
- La IP del servidor debe estar en whitelist del proveedor (ej: Cloudflare).

### OAuth Apps (para desarrolladores)
- Las organizaciones pueden crear sus propias OAuth Apps.
- Sistema completo de `clientId` / `clientSecret` / `redirectUrl`.
- Flujo estándar de autorización OAuth2 con códigos de autorización.
- Los tokens de acceso se almacenan en `OAuthAuthorization`.

---

## Seguridad de Tokens de Redes Sociales

### Almacenamiento
- Los tokens OAuth de cada red social se almacenan en la tabla `Integration`.
- Campos: `token`, `refreshToken`, `tokenExpiration`.
- Los tokens se renuevan automáticamente cuando están por expirar (`refreshNeeded = true`).

### Rotación Automática
- El sistema detecta tokens expirados y los refresca.
- Si un refresh falla, `refreshNeeded` se marca como `true` y se notifica al usuario.
- El campo `disabled` deshabilita la integración si hay problemas de autenticación.

---

## Seguridad de Pagos

- Integración con **Stripe** para procesamiento de pagos.
- Los datos de tarjeta nunca pasan por los servidores de Postiz (Stripe.js + webhooks).
- Variables requeridas:
  - `STRIPE_PUBLISHABLE_KEY` (frontend)
  - `STRIPE_SECRET_KEY` (backend)
  - `STRIPE_SIGNING_KEY` (webhooks de suscripción)
  - `STRIPE_SIGNING_KEY_CONNECT` (webhooks de marketplace)
- Verificación de firma en cada webhook de Stripe para prevenir falsificaciones.

---

## Almacenamiento de Archivos

### Cloudflare R2 (Recomendado para producción)
- Bucket privado con acceso mediante API Key.
- URLs públicas a través de Cloudflare CDN.
- Variables: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ACCESS_KEY`, `CLOUDFLARE_SECRET_ACCESS_KEY`, `CLOUDFLARE_BUCKETNAME`.

### Local (Para self-hosted / desarrollo)
- `STORAGE_PROVIDER=local`
- Archivos guardados en el directorio configurado en `UPLOAD_DIRECTORY`.
- **Riesgo**: No hay CDN ni redundancia. Solo para desarrollo o instancias pequeñas.

---

## Monitoreo y Errores

### Sentry
- Integración con Sentry para tracking de errores en producción.
- Disponible tanto para backend como para orchestrator.
- Activado mediante variable de entorno `SENTRY_DSN`.

### Registro de Errores en BD
- La tabla `Errors` registra cada fallo de publicación con:
  - Mensaje de error
  - Plataforma afectada
  - Cuerpo completo de la respuesta de la API
  - Post asociado

---

## Registro de Actividad

### User Activity Tracking
- `User.lastOnline`: última vez que el usuario estuvo activo.
- `User.ip`: IP del último acceso.
- `User.agent`: User-agent del navegador.
- `User.lastReadNotifications`: control de notificaciones leídas.

---

## Configuraciones de Seguridad Adicionales

| Variable | Descripción |
|---------|-------------|
| `DISABLE_REGISTRATION=true` | Bloquea nuevos registros (solo admins pueden invitar) |
| `NOT_SECURED=false` | **Nunca activar en producción.** Desactiva verificaciones de seguridad. |
| `DISALLOW_PLUS` | Bloquea emails con `+` (anti-alias abuse) |

---

## Recomendaciones de Seguridad para Producción

1. **JWT_SECRET**: Usar al menos 64 caracteres aleatorios generados con `openssl rand -hex 32`.
2. **Base de datos**: Nunca exponer PostgreSQL públicamente; usar red interna o VPN.
3. **Redis**: Proteger con contraseña y firewall; solo accesible desde backend/orchestrator.
4. **HTTPS obligatorio**: Siempre usar HTTPS en producción; configurar certificados SSL.
5. **Cloudflare**: Usar como proxy para el frontend para protección DDoS.
6. **Variables de entorno**: Nunca commitear `.env` al repositorio.
7. **Rate limiting**: Configurar `API_LIMIT` según el uso esperado.
8. **Actualizaciones**: Seguir las releases del repo para parches de seguridad.

---

*Última actualización: Junio 2026*
