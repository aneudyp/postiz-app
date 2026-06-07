# 05 — API

## Arquitectura de la API

Postiz expone **dos APIs diferenciadas**:

```
┌────────────────────────────────────────────────┐
│  API Interna (puerto 3000)                     │
│  Base: http://localhost:3000                   │
│  Auth: JWT Bearer Token                        │
│  Uso: Aplicación frontend                      │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│  API Pública (puerto 3000)                     │
│  Base: http://localhost:3000/public/v1         │
│  Auth: API Key por organización                │
│  Uso: Integraciones externas (Make, Zapier)    │
└────────────────────────────────────────────────┘
```

---

## API Interna — Endpoints por Módulo

### Autenticación (`/auth`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/login` | Login con email/contraseña |
| POST | `/auth/register` | Registro de nuevo usuario + organización |
| POST | `/auth/forgot` | Solicitar reset de contraseña |
| POST | `/auth/reset` | Establecer nueva contraseña |
| GET | `/auth/providers` | Listar providers OAuth disponibles |
| GET | `/auth/{provider}/callback` | Callback OAuth (GitHub, Google, etc.) |

### Posts (`/posts`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/posts` | Listar posts por rango de fechas |
| POST | `/posts` | Crear nuevo post (único o multi-canal) |
| PUT | `/posts/:id` | Actualizar post existente |
| DELETE | `/posts/:id` | Eliminar post |
| POST | `/posts/:id/publish` | Publicar manualmente |
| GET | `/posts/:id` | Obtener detalles de un post |

### Integraciones (`/integrations`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/integrations` | Listar canales conectados |
| POST | `/integrations` | Conectar nuevo canal |
| DELETE | `/integrations/:id` | Desconectar canal |
| PUT | `/integrations/:id` | Actualizar configuración del canal |
| GET | `/integrations/:id/analytics` | Analytics del canal |

### Analytics (`/analytics`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/analytics` | Resumen general de métricas |
| GET | `/analytics/:integrationId` | Métricas por canal |
| GET | `/analytics/trending` | Contenido trending |

### Media (`/media`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/media` | Listar archivos de la biblioteca |
| POST | `/media` | Subir archivo (imagen/video) |
| DELETE | `/media/:id` | Eliminar archivo |
| PUT | `/media/:id` | Actualizar metadata |

### Billing (`/billing`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/billing` | Estado de suscripción actual |
| POST | `/billing/subscribe` | Iniciar suscripción |
| POST | `/billing/cancel` | Cancelar suscripción |
| GET | `/billing/plans` | Listar planes disponibles |
| POST | `/billing/upgrade` | Cambiar de plan |

### AutoPost (`/autopost`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/autopost` | Listar configuraciones de autopost |
| POST | `/autopost` | Crear nueva regla de autopost |
| PUT | `/autopost/:id` | Actualizar regla |
| DELETE | `/autopost/:id` | Eliminar regla |

### Webhooks (`/webhooks`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/webhooks` | Listar webhooks configurados |
| POST | `/webhooks` | Crear webhook |
| PUT | `/webhooks/:id` | Actualizar webhook |
| DELETE | `/webhooks/:id` | Eliminar webhook |

### Otros módulos
- `/users` — Gestión de perfil y usuarios del equipo
- `/settings` — Configuración de la organización
- `/notifications` — Sistema de notificaciones in-app
- `/sets` — Sets de contenido reutilizables
- `/signatures` — Firmas de posts
- `/oauth-app` — Gestión de OAuth Apps propias
- `/third-party` — Integraciones de terceros
- `/copilot` — Chat con agente de IA

---

## API Pública (v1) — Para Integraciones Externas

**Base URL**: `https://tudominio.com/public/v1`

**Autenticación**: Header `Authorization: Bearer {API_KEY}`

La API Key se encuentra en: Configuración → API Key

### Endpoints Disponibles

#### Posts
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/posts` | Listar posts programados |
| POST | `/posts` | Crear post programado |
| DELETE | `/posts/:id` | Cancelar post |

**Body de creación de post**:
```json
{
  "type": "now",                    // "now" | "schedule" | "draft"
  "date": "2026-06-10T15:00:00Z",  // solo si type="schedule"
  "shortLink": true,                // acortar links
  "posts": [
    {
      "integration": {
        "id": "integration-uuid"
      },
      "value": [
        {
          "content": "Texto del post #hashtag",
          "media": [
            {
              "url": "https://...",
              "type": "image"
            }
          ],
          "settings": {}             // configuración específica del provider
        }
      ]
    }
  ]
}
```

#### Integraciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/integrations` | Listar canales conectados con sus IDs |

Respuesta:
```json
[
  {
    "id": "uuid",
    "name": "Mi Página de Facebook",
    "identifier": "facebook",
    "picture": "https://...",
    "disabled": false
  }
]
```

---

## Webhooks Salientes

Postiz puede notificar a sistemas externos cuando ocurren eventos.

### Configuración
1. Ir a **Settings → Webhooks**
2. Crear un webhook con URL de destino
3. Asociar el webhook a uno o varios canales

### Eventos Notificados
- Post publicado exitosamente
- Error en publicación
- Post actualizado
- Integración desconectada

### Formato del Payload
```json
{
  "event": "post.published",
  "timestamp": "2026-06-10T15:00:00Z",
  "data": {
    "postId": "uuid",
    "integrationId": "uuid",
    "platform": "facebook",
    "content": "...",
    "publishedAt": "2026-06-10T15:00:00Z"
  }
}
```

---

## MCP (Model Context Protocol)

Postiz soporta el protocolo MCP, que permite a agentes de IA como **Claude** crear y gestionar posts directamente.

- Posts creados vía MCP se registran con `creationMethod = MCP`.
- El SDK expone herramientas como `create_post`, `list_integrations`, etc.
- Útil para automatización con IA sin pasar por la UI.

---

## Rate Limiting

| Tipo | Límite | Configurable |
|------|--------|-------------|
| API Pública | 30 req/hora (default) | Sí, `API_LIMIT` env var |
| API Interna | Sin límite estricto | No |

---

## Autenticación con API Key

```bash
# Ejemplo con curl
curl -H "Authorization: Bearer tu_api_key_aqui" \
     https://tudominio.com/public/v1/integrations

# Crear post con curl
curl -X POST \
     -H "Authorization: Bearer tu_api_key_aqui" \
     -H "Content-Type: application/json" \
     -d '{"type":"schedule","date":"2026-06-11T10:00:00Z","posts":[...]}' \
     https://tudominio.com/public/v1/posts
```

---

## Integración con Make / Zapier

Ver documento **08-automatizacion-make-zapier.md** para guía completa.

**Módulos HTTP disponibles para Make/Zapier**:
1. `GET /public/v1/integrations` — Obtener lista de canales
2. `POST /public/v1/posts` — Crear post programado
3. `DELETE /public/v1/posts/:id` — Cancelar post

Estos tres endpoints son suficientes para construir automatizaciones completas sin depender de las APIs nativas de cada red social.

---

*Última actualización: Junio 2026*
