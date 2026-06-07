# 04 — Base de Datos

## Motor y ORM

| Componente | Tecnología |
|-----------|-----------|
| Motor de BD | PostgreSQL 15+ |
| ORM | Prisma Client JS |
| Schema | `libraries/nestjs-libraries/src/database/prisma/schema.prisma` |
| Migraciones | Prisma Migrate |

---

## Diagrama de Entidades

```
Organization (tenant raíz)
├── UserOrganization ─── User
├── Integration (cuentas sociales)
│   ├── Post
│   │   ├── Comments
│   │   ├── Errors
│   │   └── TagsPosts ─── Tags
│   ├── Plugs
│   ├── OrderItems
│   └── IntegrationsWebhooks ─── Webhooks
├── Subscription
├── Credits
├── Media
├── AutoPost
├── Sets
├── Signatures
├── ThirdParty
├── Notifications
├── Customer ─── Integration
├── OAuthApp ─── OAuthAuthorization ─── User
└── MessagesGroup
    ├── Messages
    └── Orders
        └── OrderItems
```

---

## Modelos Principales

### `Organization` — Tenant Principal
El corazón del multi-tenancy. Cada workspace/cuenta es una organización.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `name` | String | Nombre de la organización |
| `apiKey` | String? | API Key pública para integraciones |
| `paymentId` | String? | ID del cliente en Stripe |
| `streakSince` | DateTime? | Inicio de racha de publicación |
| `allowTrial` | Boolean | Permite período de prueba |
| `isTrailing` | Boolean | Está en período de prueba |
| `shortlink` | Enum | Preferencia de links cortos: ASK/YES/NO |

---

### `User` — Usuario
```prisma
model User {
  id               String    # UUID
  email            String    # Email único por provider
  password         String?   # Hash bcrypt (solo LOCAL)
  providerName     Provider  # LOCAL/GITHUB/GOOGLE/FARCASTER/WALLET/GENERIC
  providerId       String?   # ID externo del provider OAuth
  isSuperAdmin     Boolean   # Superadmin global
  timezone         Int       # Offset timezone en minutos
  activated        Boolean   # Requiere verificación por email
  lastOnline       DateTime  # Tracking de actividad
  ip               String?   # IP de último acceso
  agent            String?   # User-agent navegador
}
```

**Email notification preferences**:
- `sendSuccessEmails`: notificar publicaciones exitosas
- `sendFailureEmails`: notificar errores de publicación
- `sendStreakEmails`: notificar rachas activas

---

### `Integration` — Canal Social Conectado
Representa una cuenta de red social conectada a una organización.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `internalId` | String | ID de la cuenta en la plataforma |
| `providerIdentifier` | String | Slug del provider (facebook, tiktok, etc.) |
| `type` | String | Tipo: page, profile, channel, etc. |
| `token` | String | Access token OAuth |
| `refreshToken` | String? | Refresh token para renovación |
| `tokenExpiration` | DateTime? | Fecha de expiración del token |
| `disabled` | Boolean | Canal deshabilitado |
| `refreshNeeded` | Boolean | Token necesita renovarse |
| `inBetweenSteps` | Boolean | Proceso de conexión incompleto |
| `postingTimes` | String | JSON: horarios óptimos de publicación |
| `additionalSettings` | String? | JSON: configuración extra por provider |

---

### `Post` — Publicación

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `state` | Enum | QUEUE / PUBLISHED / ERROR / DRAFT |
| `publishDate` | DateTime | Fecha y hora de publicación |
| `content` | String | Texto del post |
| `group` | String | ID de grupo (posts relacionados multi-canal) |
| `parentPostId` | String? | Post padre (para hilos) |
| `delay` | Int | Delay en segundos entre posts del grupo |
| `intervalInDays` | Int? | Para posts recurrentes |
| `image` | String? | JSON con imágenes adjuntas |
| `settings` | String? | JSON con configuración específica del provider |
| `creationMethod` | Enum | UNKNOWN/WEB/MCP/API/AUTOPOST/CLI |
| `releaseURL` | String? | URL del release de GitHub asociado |

**Estados del post**:
```
DRAFT → QUEUE → PUBLISHED
                     ↓
                   ERROR (reintento posible)
```

---

### `Subscription` — Plan de Suscripción

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `subscriptionTier` | Enum | STANDARD/PRO/TEAM/ULTIMATE |
| `period` | Enum | MONTHLY/YEARLY |
| `totalChannels` | Int | Canales permitidos en el plan |
| `isLifetime` | Boolean | Compra de por vida |
| `cancelAt` | DateTime? | Fecha de cancelación programada |

---

### `AutoPost` — Auto-publicación desde RSS/URL

| Campo | Descripción |
|-------|-------------|
| `url` | URL fuente a monitorear |
| `lastUrl` | Último URL procesado |
| `onSlot` | Publicar en el siguiente slot disponible |
| `syncLast` | Sincronizar el último item al activar |
| `generateContent` | Usar IA para generar el post |
| `addPicture` | Adjuntar imagen del feed |
| `integrations` | JSON: canales donde publicar |

---

### `Plugs` — Automatizaciones

Sistema de triggers automáticos: cuando sucede X en el canal, hacer Y.

| Campo | Descripción |
|-------|-------------|
| `plugFunction` | Función/trigger configurada |
| `data` | JSON con parámetros de la automatización |
| `integrationId` | Canal al que aplica |
| `activated` | Si está activa |

---

### `OAuthApp` — Apps OAuth de Terceros

Permite que organizaciones creen sus propias OAuth Apps para que sus usuarios autoricen acceso a Postiz.

```
OAuthApp (credenciales)
├── clientId (único)
├── clientSecret
├── redirectUrl
└── OAuthAuthorization[] (tokens de usuarios autorizados)
```

---

### Tablas de Mastra AI (Agente de IA)

El sistema integra **Mastra**, un framework de IA con sus propias tablas:

| Tabla | Propósito |
|-------|-----------|
| `mastra_messages` | Historial de conversaciones con el agente |
| `mastra_threads` | Hilos de conversación |
| `mastra_resources` | Recursos del agente (memoria) |
| `mastra_traces` | Trazas de ejecución |
| `mastra_ai_spans` | Spans de telemetría |
| `mastra_scorers` | Evaluadores de calidad |
| `mastra_workflow_snapshot` | Estado de workflows de IA |

---

### Tablas del Marketplace

| Tabla | Propósito |
|-------|-----------|
| `MessagesGroup` | Chat entre comprador y vendedor |
| `Messages` | Mensajes individuales |
| `Orders` | Pedidos de publicaciones |
| `OrderItems` | Items de un pedido (canal + precio) |
| `PayoutProblems` | Problemas en pagos/retiros |
| `SocialMediaAgency` | Perfil de agencia en el marketplace |

---

## Enumeraciones Clave

```prisma
enum State        { QUEUE | PUBLISHED | ERROR | DRAFT }
enum Provider     { LOCAL | GITHUB | GOOGLE | FARCASTER | WALLET | GENERIC }
enum Role         { SUPERADMIN | ADMIN | USER }
enum SubscriptionTier { STANDARD | PRO | TEAM | ULTIMATE }
enum Period       { MONTHLY | YEARLY }
enum CreationMethod { UNKNOWN | WEB | MCP | API | AUTOPOST | CLI }
enum OrderStatus  { PENDING | ACCEPTED | CANCELED | COMPLETED }
enum ShortLinkPreference { ASK | YES | NO }
enum AnnouncementColor { INFO | WARNING | ERROR }
```

---

## Índices Importantes

El schema está altamente optimizado con índices estratégicos:
- `Post`: `publishDate`, `state`, `group`, `organizationId`, `integrationId`
- `Integration`: `organizationId`, `providerIdentifier`, `refreshNeeded`, `disabled`
- `User`: `email + providerName` (único), `lastOnline`, `inviteId`
- `Organization`: `apiKey`, `paymentId`, `streakSince`

---

## Migraciones

```bash
# Crear nueva migración
pnpm prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
pnpm prisma migrate deploy

# Generar cliente Prisma
pnpm prisma generate

# Ver estado de migraciones
pnpm prisma migrate status
```

**⚠️ Importante para producción**: El sistema tiene muchos usuarios reales. Cualquier migración que altere columnas existentes requiere revisión cuidadosa para no romper datos existentes.

---

## Conexión y Pool

- URL configurada en `DATABASE_URL`.
- Prisma maneja el connection pool automáticamente.
- Para alta concurrencia, considerar PgBouncer como proxy de conexiones.
- Recomendado: instancia PostgreSQL con al menos 4GB RAM y SSD NVMe.

---

*Última actualización: Junio 2026*
