# 02 — Estructura del Proyecto

## Visión General del Monorepo

Postiz usa una arquitectura **monorepo con pnpm workspaces** y **Nx** como herramienta de build. Todo el código vive en un solo repositorio con separación clara por apps y librerías compartidas.

```
postiz-app/
├── apps/
│   ├── backend/          # API REST principal (NestJS)
│   ├── orchestrator/     # Workers de background (Temporal + NestJS)
│   ├── frontend/         # UI Web (React + Vite)
│   ├── commands/         # CLI tools
│   ├── extension/        # Extensión de Chrome
│   └── sdk/              # SDK público
├── libraries/
│   ├── nestjs-libraries/     # Lógica de negocio compartida (backend)
│   ├── react-shared-libraries/ # Componentes React compartidos
│   └── helpers/              # Utilidades generales
├── dynamicconfig/        # Configuración dinámica de Temporal
├── Jenkins/              # CI/CD pipelines
├── docs/                 # Esta documentación
├── .env.example          # Variables de entorno de referencia
├── package.json          # Root workspace
└── pnpm-workspace.yaml   # Configuración monorepo
```

---

## Apps

### `apps/backend` — API Principal

El núcleo del sistema. Expone dos conjuntos de rutas:

**Rutas internas** (`/apps/backend/src/api/routes/`):
| Controller | Responsabilidad |
|-----------|----------------|
| `auth.controller` | Login, registro, OAuth providers |
| `posts.controller` | CRUD de posts, scheduling |
| `integrations.controller` | Conexión de cuentas sociales |
| `billing.controller` | Suscripciones y pagos |
| `analytics.controller` | Métricas y estadísticas |
| `media.controller` | Upload y gestión de archivos |
| `webhooks.controller` | Configuración de webhooks salientes |
| `autopost.controller` | Auto-publicación desde RSS/URLs |
| `oauth.controller` | OAuth App para terceros |
| `copilot.controller` | Integración IA/chat |
| `admin.controller` | Panel de administración |
| `users.controller` | Gestión de usuarios |
| `settings.controller` | Configuración de organización |
| `stripe.controller` | Webhooks de Stripe |
| `sets.controller` | Sets de contenido |
| `signature.controller` | Firmas de posts |
| `third-party.controller` | Integraciones de terceros |
| `notifications.controller` | Sistema de notificaciones |

**API Pública** (`/apps/backend/src/public-api/routes/v1/`):
- Endpoints versionados para integración externa (Make, Zapier, etc.)

**Patrón de arquitectura**:
```
Controller → Service → Repository
     ↑              ↑
     └── DTOs  ── Prisma ORM
```

---

### `apps/orchestrator` — Motor de Background Jobs

Basado en **Temporal.io** para workflows durables y tolerantes a fallos.

```
orchestrator/src/
├── activities/    # Unidades atómicas de trabajo (publicar en red social)
├── workflows/     # Orquestación de actividades
├── signals/       # Señales entre workflows
├── app.module.ts
└── main.ts        # Expone health check en puerto 3002
```

**¿Por qué Temporal?**
- Garantiza que un post programado se publique aunque el servidor se reinicie.
- Reintenta actividades fallidas automáticamente.
- Mantiene el estado del workflow en la base de datos.

---

### `apps/frontend` — Interfaz de Usuario

React 18 + Vite + Tailwind CSS 3. Estructura por features:

```
frontend/src/
├── app/
│   ├── (app)/           # Rutas autenticadas
│   ├── (extension)/     # Rutas para extensión de Chrome
│   ├── (provider)/      # Rutas de OAuth callback
│   ├── auth/            # Login/registro
│   ├── layout/          # Layout principal
│   ├── analytics/       # Sección de analytics
│   ├── billing/         # Sección de pagos
│   ├── media/           # Biblioteca de medios
│   ├── settings/        # Configuración
│   ├── calendar/        # Vista de calendario
│   ├── plugs/           # Automatizaciones (plugs)
│   ├── webhooks/        # Gestión de webhooks
│   ├── autopost/        # Configuración de autopost
│   ├── agents/          # Agentes de IA
│   ├── public-api/      # Gestión de API keys
│   └── ...
├── components/
│   ├── ui/              # Componentes base reutilizables
│   ├── post/            # Editor de posts
│   ├── calendar/        # Componentes del calendario
│   ├── media/           # Componentes de medios
│   └── ...
└── app/
    ├── colors.scss      # Paleta de colores
    ├── global.scss      # Estilos globales
    └── tailwind.config.js
```

**Reglas de desarrollo frontend**:
- Siempre usar `useFetch` hook para peticiones HTTP.
- Cada llamada SWR debe estar en un hook separado.
- No instalar librerías de NPM para componentes UI; escribir nativos.
- Usar variables de Tailwind, no `--color-custom*` (deprecado).

---

### `apps/extension` — Extensión de Chrome

Permite conectar plataformas que no tienen API pública oficial (ej: Skool) usando cookies del navegador del usuario.

---

### `apps/sdk` — SDK Público

SDK para que desarrolladores externos integren Postiz en sus propias aplicaciones.

---

## Libraries

### `libraries/nestjs-libraries` — Núcleo del Backend

La mayoría de la lógica de negocio del servidor vive aquí, no en `apps/backend`.

```
nestjs-libraries/src/
├── database/prisma/
│   ├── schema.prisma           # Schema completo de la BD
│   ├── organizations/          # Servicio de organizaciones
│   ├── posts/                  # Servicio de posts
│   ├── integrations/           # Servicio de integraciones
│   ├── subscriptions/          # Servicio de suscripciones + pricing
│   ├── users/                  # Servicio de usuarios
│   ├── media/                  # Servicio de medios
│   ├── autopost/               # Auto-publicación
│   ├── webhooks/               # Webhooks
│   ├── oauth/                  # OAuth Apps
│   └── ...
├── integrations/social/        # Providers de redes sociales (35+)
├── dtos/                       # Data Transfer Objects
├── services/                   # Servicios transversales
│   ├── email.service.ts
│   └── make.is.ts
├── openai/                     # Integración OpenAI
├── redis/                      # Redis pub/sub y cache
├── short-linking/              # Acortadores de URL
├── newsletter/providers/       # Beehiiv, Listmonk
├── 3rdparties/                 # HeyGen, ReelFarm
├── agent/                      # Agente de IA (Mastra)
├── chat/                       # Sistema de chat
└── sentry/                     # Monitoreo de errores
```

### `libraries/helpers` — Utilidades Compartidas

```
helpers/src/
└── utils/
    └── custom.fetch.tsx    # Hook useFetch (SWR) para el frontend
```

### `libraries/react-shared-libraries` — Componentes React Compartidos

Componentes React reutilizables entre el frontend y otros consumidores.

---

## Puertos y Servicios

| Servicio | Puerto por defecto |
|---------|-------------------|
| Frontend | 4200 |
| Backend API | 3000 |
| Orchestrator | 3002 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| Temporal | 7233 |

---

## Variables de Entorno Críticas

| Variable | Descripción |
|---------|-------------|
| `DATABASE_URL` | Conexión PostgreSQL |
| `REDIS_URL` | Conexión Redis |
| `JWT_SECRET` | Secreto para tokens JWT |
| `FRONTEND_URL` | URL pública del frontend |
| `NEXT_PUBLIC_BACKEND_URL` | URL pública del backend |
| `CLOUDFLARE_*` | Credenciales Cloudflare R2 para storage |
| `STRIPE_*` | Credenciales Stripe para pagos |
| `OPENAI_API_KEY` | API key de OpenAI para IA |
| `RESEND_API_KEY` | API key de Resend para emails |

---

## Convenciones de Desarrollo

### Backend
```
Controller (HTTP layer)
    ↓
Service (lógica de negocio)
    ↓
Repository (acceso a datos / Prisma)
```

En casos complejos:
```
Controller → Manager → Service → Repository
```

### Frontend
- Componentes: `/apps/frontend/src/components/`
- Rutas: `/apps/frontend/src/app/`
- UI base: `/apps/frontend/src/components/ui/`
- Fetching: siempre con `useFetch` + SWR en hooks separados

---

*Última actualización: Junio 2026*
