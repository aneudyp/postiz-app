# 11 — IA y Automatización Interna

## Stack de IA en Postiz

Postiz integra múltiples capas de inteligencia artificial para generación de contenido, asistencia y automatización.

---

## OpenAI Integration

**Ubicación**: `libraries/nestjs-libraries/src/openai/`

**Variable**: `OPENAI_API_KEY`

### Casos de Uso
| Feature | Modelo Sugerido | Descripción |
|---------|----------------|-------------|
| Generación de texto | GPT-4o | Crear posts desde un brief |
| Mejora de contenido | GPT-4o | Reescribir, mejorar tono |
| Generación de imágenes | DALL-E 3 | Imágenes para posts |
| AutoPost con IA | GPT-4o | Reescribir artículos de RSS |
| Trending topics | GPT-4o + búsqueda | Analizar tendencias |

### Control de Créditos
```prisma
model Credits {
  organizationId String
  credits        Int
  type           String  // "ai_images", "videos", etc.
}
```
El sistema descuenta créditos por cada uso de IA, limitando el consumo según el plan.

---

## Mastra AI (Agente Conversacional)

**Ubicación**: `libraries/nestjs-libraries/src/agent/`

**Qué es**: Mastra es un framework de IA para construir agentes con memoria persistente, herramientas y workflows.

### Tablas de Mastra en PostgreSQL
| Tabla | Propósito |
|-------|-----------|
| `mastra_threads` | Conversaciones del agente |
| `mastra_messages` | Mensajes del historial |
| `mastra_resources` | Memoria de trabajo del agente |
| `mastra_traces` | Telemetría de ejecución |
| `mastra_ai_spans` | Spans de OpenTelemetry |
| `mastra_scorers` | Evaluadores de calidad |
| `mastra_workflow_snapshot` | Estado de workflows IA |
| `mastra_evals` | Evaluaciones de performance |

### Chat con Agente
**Ubicación**: `libraries/nestjs-libraries/src/chat/`

El módulo de chat permite a los usuarios tener conversaciones con un agente de IA que tiene acceso a:
- Sus integraciones (qué canales tiene conectados)
- Su historial de posts
- Herramientas para crear y programar posts

---

## MCP (Model Context Protocol)

Postiz implementa el protocolo MCP de Anthropic, permitiendo a agentes externos (como Claude) controlar Postiz.

### Capacidades Expuestas via MCP
- `list_integrations` — Ver canales disponibles
- `create_post` — Crear y programar posts
- `list_posts` — Ver posts en el calendario
- `get_analytics` — Obtener métricas

### Caso de Uso
```
Claude (con MCP) → "Crea un post sobre el nuevo lanzamiento
                   de mi producto para mañana a las 10am
                   en Facebook e Instagram"
                   ↓
Postiz MCP handler → POST /public/v1/posts
                   ↓
Post creado con creationMethod = MCP
```

Posts creados via MCP se identifican con `creationMethod = 'MCP'` en la BD.

---

## AutoPost (Automatización por RSS/URL)

**Ubicación**: `libraries/nestjs-libraries/src/database/prisma/autopost/`

### Flujo de AutoPost
```
1. Admin configura URL de fuente (RSS o página web)
2. Sistema monitorea periódicamente la URL
3. Detecta nuevo contenido (compara con lastUrl)
4. Opcionalmente: usa IA para generar post desde el contenido
5. Opcionalmente: extrae imagen del contenido
6. Publica en los canales configurados
   - onSlot=true: usa el siguiente slot libre de postingTimes
   - onSlot=false: publica inmediatamente
```

### Configuración de AutoPost
```json
{
  "url": "https://tu-blog.com/feed.xml",
  "lastUrl": "https://tu-blog.com/ultimo-post",
  "onSlot": true,
  "syncLast": false,
  "generateContent": true,
  "addPicture": true,
  "integrations": ["canal-id-1", "canal-id-2"],
  "active": true
}
```

---

## Plugs (Automatizaciones de Integración)

**Ubicación**: `libraries/nestjs-libraries/src/database/prisma/autopost/`

Los "Plugs" son automatizaciones que conectan eventos de una integración con acciones automáticas.

### Estructura
```prisma
model Plugs {
  organizationId String
  plugFunction   String      // nombre del trigger
  data           String      // JSON con configuración
  integrationId  String      // canal al que aplica
  activated      Boolean
}
```

### Casos de Uso de Plugs
- Cuando se publica en Twitter → repostear en LinkedIn automáticamente
- Cuando hay nuevo episodio de podcast → publicar clip en TikTok
- GitHub release → publicar en todas las redes

---

## Generación de Videos con IA

**Variable**: `generate_videos` en pricing (varía por plan)

### Providers Integrados
1. **HeyGen** (`3rdparties/heygen/`): Avatares de IA hablando a cámara
2. **ReelFarm** (`3rdparties/reelfarm/`): Reels automáticos
3. **OpenAI Sora**: (potencial integración futura)

### Créditos por Plan
| Plan | Videos/mes |
|------|-----------|
| FREE | 0 |
| STANDARD | 3 |
| TEAM | 10 |
| PRO | 30 |
| ULTIMATE | 60 |

---

## Trending Content

**Ubicación**: Tabla `Trending` en la BD

```prisma
model Trending {
  trendingList String    // JSON con lista de tendencias
  language     String?   // Idioma del trending
  hash         String    // Hash para detectar cambios
  date         DateTime  // Fecha del snapshot
}
```

- Se actualiza periódicamente vía Temporal workflows
- Permite mostrar contenido trending por idioma
- Integrado con el editor de posts para sugerencias

---

## Popular Posts (Inspiración de Contenido)

```prisma
model PopularPosts {
  category String    // Categoría del contenido
  topic    String    // Tema específico
  content  String    // Texto del post
  hook     String    // Hook inicial del post
}
```

Base de datos curada de posts exitosos por categoría/tema para inspirar a los usuarios.

---

## Short Link Services (Acortadores)

**Ubicación**: `libraries/nestjs-libraries/src/short-linking/`

Múltiples providers de acortamiento de URLs:

| Provider | Variables | Tipo |
|---------|-----------|------|
| **Dub** | `DUB_TOKEN`, `DUB_API_ENDPOINT` | Self-hosted o cloud |
| **Short.io** | `SHORT_IO_SECRET_KEY` | Cloud |
| **Kutt** | `KUTT_API_KEY`, `KUTT_API_ENDPOINT` | Self-hosted o cloud |
| **LinkDrip** | `LINK_DRIP_API_KEY` | Cloud |

La preferencia por organización se configura en `Organization.shortlink` (ASK/YES/NO).

---

## Email Automation

**Provider**: Resend (`RESEND_API_KEY`)

**Ubicación**: `libraries/nestjs-libraries/src/emails/`

### Emails Automáticos
| Trigger | Email enviado |
|---------|--------------|
| Registro exitoso | Bienvenida + activación (si requerida) |
| Post publicado | Confirmación de publicación |
| Post con error | Notificación de error con detalles |
| Racha activa | "¡Llevas X días publicando!" |
| Invitación a equipo | Email de invitación con link |
| Reset de contraseña | Link seguro de reset |

### Preferencias de Email por Usuario
```prisma
model User {
  sendSuccessEmails  Boolean  @default(true)
  sendFailureEmails  Boolean  @default(true)
  sendStreakEmails   Boolean  @default(true)
}
```

---

## Sistema de Notificaciones In-App

```prisma
model Notifications {
  organizationId String
  content        String
  link           String?   // Link de acción opcional
  deletedAt      DateTime? // Soft delete
}
```

- Las notificaciones se muestran en la UI en tiempo real.
- `User.lastReadNotifications` controla el badge de no leídas.

---

*Última actualización: Junio 2026*
