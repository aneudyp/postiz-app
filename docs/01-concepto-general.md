# 01 — Concepto General de Postiz

## ¿Qué es Postiz?

Postiz es una plataforma **open-source de gestión y automatización de redes sociales** que permite a individuos, equipos y agencias programar, publicar, analizar y gestionar contenido en más de **35 canales sociales** desde una sola interfaz.

Opera bajo el modelo **SaaS multi-tenant con opción self-hosted**, lo que lo convierte en una solución flexible tanto para usuarios finales como para empresas que desean alojar su propia instancia.

---

## Propósito Central

| Dimensión | Descripción |
|-----------|-------------|
| **Problema que resuelve** | Gestionar múltiples redes sociales desde distintas plataformas nativas es ineficiente, costoso y propenso a errores. |
| **Solución** | Un hub centralizado donde puedes crear, programar, publicar y medir el impacto de todo tu contenido desde un solo lugar. |
| **Diferenciador clave** | Open-source con opción cloud, integración de IA para generación de contenido, marketplace de agencias, soporte para newsletters y comunidades. |

---

## Modelo de Negocio

```
┌────────────────────────────────────────────────────────┐
│                     POSTIZ CLOUD                       │
│  (SaaS administrado por el equipo de Postiz/Gitroom)   │
└────────────────────────────────────────────────────────┘
                          vs
┌────────────────────────────────────────────────────────┐
│                   SELF-HOSTED                          │
│  (El usuario instala y administra su propia instancia) │
└────────────────────────────────────────────────────────┘
```

- **Cloud SaaS**: Suscripción mensual/anual con planes STANDARD, TEAM, PRO, ULTIMATE.
- **Self-hosted**: Gratis, open-source (AGPLv3), el usuario gestiona su propia infraestructura.
- **Marketplace**: Los usuarios pueden vender/comprar publicaciones entre sí (modelo de agencia).

---

## Plataformas Soportadas (35+)

### Redes Sociales Principales
- **Meta**: Facebook (páginas), Instagram (feed, reels, stories)
- **Google**: YouTube (videos, shorts), Google My Business
- **TikTok** (videos, text posts)
- **X / Twitter**
- **LinkedIn** (perfil personal + páginas de empresa)
- **Pinterest**
- **Reddit**

### Plataformas de Nicho / Alternativas
- Bluesky, Mastodon, Nostr, Farcaster (Web3/descentralizado)
- Threads (Meta)
- Dribbble, Dev.to, Hashnode, Medium, WordPress (contenido largo)
- Discord, Slack, Telegram, MeWe
- Lemmy, VK, Twitch
- Kick (streaming)
- Skool, Whop (comunidades de membresía)
- Moltbook

### Newsletters
- Beehiiv, Listmonk

---

## Casos de Uso Principales

1. **Creador de contenido independiente**: Programa semanas de contenido en minutos.
2. **Agencia de marketing**: Gestiona múltiples clientes con separación por organización.
3. **Empresa SaaS/startup**: Automatiza anuncios de productos, releases de GitHub, posts de blog.
4. **Comunidades y newsletters**: Publica simultáneamente en Discord, Telegram, Beehiiv.
5. **Dev personal / empresa tech**: Self-hosted con control total de datos.

---

## Flujo de Trabajo Principal

```
Usuario crea post
      │
      ▼
  Editor de contenido (IA opcional)
      │
      ▼
  Selección de canales (multi-plataforma)
      │
      ▼
  Calendario visual / scheduling
      │
      ▼
  Cola de publicación (Redis + Temporal)
      │
      ▼
  Publicación automática en el horario definido
      │
      ▼
  Analytics & reportes post-publicación
```

---

## Características Clave

| Feature | Descripción |
|---------|-------------|
| **Calendario visual** | Vista mensual/semanal de todos los posts programados |
| **IA generativa** | Genera contenido con OpenAI GPT para posts y descripciones |
| **Generación de imágenes** | Crea imágenes con IA por créditos |
| **Generación de videos** | Genera videos cortos (por suscripción) |
| **AutoPost** | Publica automáticamente desde RSS/URL al detectar nuevo contenido |
| **Sets de contenido** | Grupos de contenido reutilizable |
| **Firmas digitales** | Añade firmas automáticas a posts |
| **Webhooks** | Notificaciones en tiempo real a sistemas externos |
| **API Pública** | Integración con herramientas de terceros |
| **Marketplace** | Compra/venta de publicaciones entre usuarios |
| **Soporte multi-organización** | Multi-tenant con roles y permisos |
| **Extensión de Chrome** | Para integrar plataformas que no tienen API pública |
| **MCP (Model Context Protocol)** | Integración con agentes de IA como Claude |

---

## Stack Tecnológico Resumido

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS 3 |
| Backend | NestJS (Node.js) |
| Orquestación | Temporal.io |
| Base de datos | PostgreSQL + Prisma ORM |
| Cache/Queue | Redis |
| IA | OpenAI API + Mastra AI |
| Storage | Cloudflare R2 / Local |
| Pagos | Stripe |
| Email | Resend |
| Auth | JWT + OAuth2 + Generic SSO |

---

*Última actualización: Junio 2026*
