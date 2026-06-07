# Postiz — Documentación para Agentes y Equipos

> Documentación técnica y estratégica completa de **Postiz**, plataforma open-source de gestión y automatización de redes sociales.
>
> Generada: Junio 2026

---

## Índice de Documentos

| # | Documento | Descripción |
|---|-----------|-------------|
| 01 | [Concepto General](./01-concepto-general.md) | Qué es Postiz, propósito, plataformas soportadas, flujo de trabajo |
| 02 | [Estructura del Proyecto](./02-estructura-proyecto.md) | Monorepo, apps, libraries, convenciones de código |
| 03 | [Seguridad](./03-seguridad.md) | Auth, JWT, RBAC, tokens sociales, Stripe, recomendaciones |
| 04 | [Base de Datos](./04-base-de-datos.md) | Schema Prisma, modelos, relaciones, migraciones |
| 05 | [API](./05-api.md) | API interna, API pública, webhooks, MCP, rate limiting |
| 06 | [Integraciones](./06-integraciones.md) | 35+ providers de redes sociales, flujos de publicación |
| 07 | [SaaS y Facturación](./07-saas-facturacion.md) | Planes, precios, Stripe, créditos, marketplace |
| 08 | [Automatización Make/Zapier](./08-automatizacion-make-zapier.md) | Cómo automatizar publicaciones sin APIs nativas |
| 09 | [Estrategia de Negocio](./09-estrategia-negocio.md) | Mercado, competidores, precios, limitaciones, KPIs |
| 10 | [Mejoras SaaS](./10-mejoras-saas.md) | Roadmap de mejoras técnicas y de producto |
| 11 | [IA y Automatización](./11-ia-y-automatizacion.md) | OpenAI, Mastra, MCP, AutoPost, Plugs, Trending |
| 12 | [DevOps e Infraestructura](./12-devops-infraestructura.md) | Deploy, CI/CD, monitoreo, costos, escalabilidad |

---

## Resumen Ejecutivo

**Postiz** es una plataforma de gestión de redes sociales open-source que permite:
- Programar publicaciones en **35+ plataformas** simultáneamente
- Gestionar equipos y clientes con roles y organizaciones múltiples
- Automatizar contenido con IA (texto, imágenes, videos)
- Integrarse con herramientas de automatización (Make, Zapier) via API REST
- Operar como SaaS ($29-99/mes) o self-hosted (gratis)

### Stack Tecnológico
```
Frontend:     React 18 + Vite + Tailwind CSS 3
Backend:      NestJS (Node.js 22)
Orquestación: Temporal.io
Base de datos: PostgreSQL + Prisma ORM
Cache/Queue:  Redis
IA:           OpenAI + Mastra AI
Storage:      Cloudflare R2
Pagos:        Stripe
Email:        Resend
```

### Planes y Precios
```
FREE:     $0/mes    — Sin canales
STANDARD: $29/mes   — 5 canales, 400 posts/mes
TEAM:     $39/mes   — 10 canales, ilimitado, team features
PRO:      $49/mes   — 30 canales, todo incluido
ULTIMATE: $99/mes   — 100 canales, webhooks ilimitados
```

---

## Para Agentes de IA

Si eres un agente de IA trabajando en este proyecto, sigue estas reglas:

### Backend
- Patrón obligatorio: `Controller → Service → Repository`
- Lógica de negocio va en `libraries/nestjs-libraries/src/`
- Los controladores van en `apps/backend/src/api/routes/`

### Frontend
- Siempre usar `useFetch` hook de `/libraries/helpers/src/utils/custom.fetch.tsx`
- Cada hook SWR en su propia función (no anidados)
- Componentes UI en `/apps/frontend/src/components/ui/`
- No instalar librerías NPM para UI; escribir componentes nativos
- Tailwind CSS 3: no usar variables `--color-custom*` (deprecadas)

### Base de Datos
- Schema en `libraries/nestjs-libraries/src/database/prisma/schema.prisma`
- El sistema tiene usuarios en producción: toda migración requiere análisis de impacto
- Usar soft delete (`deletedAt`) para datos críticos

### Package Manager
- Solo **pnpm** — nunca npm o yarn
- Lint solo desde el directorio root

---

*Documentación generada automáticamente analizando el código fuente del proyecto.*
