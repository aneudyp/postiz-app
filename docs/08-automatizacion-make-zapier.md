# 08 — Automatización con Make y Zapier

## Concepto: Postiz como Hub Central

La idea clave es usar **Postiz como middleware inteligente** entre tus sistemas (CRM, eCommerce, blog, base de datos) y las redes sociales, eliminando la necesidad de gestionar tokens OAuth de cada plataforma por separado.

```
┌─────────────────┐     ┌─────────┐     ┌───────────────────────────────────┐
│  Tus sistemas   │────▶│  Make/  │────▶│           POSTIZ API              │
│  - CRM          │     │  Zapier │     │  POST /public/v1/posts            │
│  - Shopify      │     └─────────┘     │  (un solo endpoint, todas las     │
│  - WordPress    │                     │   redes sociales)                 │
│  - Google Sheets│                     └──────────────────────────────────┬┘
│  - Airtable     │                                                         │
│  - Notion       │                      ┌──────────────────────────────────▼───┐
└─────────────────┘                      │  Postiz publica en:                  │
                                         │  ✓ Facebook   ✓ Instagram            │
                                         │  ✓ TikTok     ✓ LinkedIn             │
                                         │  ✓ X/Twitter  ✓ YouTube              │
                                         │  ✓ Discord    ✓ Telegram             │
                                         │  ✓ 30+ más...                        │
                                         └──────────────────────────────────────┘
```

**Ventaja principal**: Solo necesitas gestionar **una sola credencial** (API Key de Postiz), no 35 OAuth apps distintas.

---

## Configuración Inicial

### Paso 1: Obtener API Key
1. Login en Postiz → **Settings → API**
2. Copiar la API Key de la organización
3. Guardar en Make/Zapier como credencial HTTP personalizada

### Paso 2: Obtener IDs de Integraciones
```
GET https://tupostiz.com/public/v1/integrations
Authorization: Bearer {API_KEY}
```

Respuesta:
```json
[
  {"id": "abc123", "name": "Página Facebook Empresa", "identifier": "facebook"},
  {"id": "def456", "name": "@miempresa_instagram", "identifier": "instagram"},
  {"id": "ghi789", "name": "Mi Canal YouTube", "identifier": "youtube"},
  {"id": "jkl012", "name": "@miempresa en X", "identifier": "x"}
]
```

Guarda estos IDs en una tabla de referencia.

---

## Casos de Uso con Make

### Caso 1: Publicación Única — Nuevo producto en Shopify

**Trigger**: Nuevo producto creado en Shopify  
**Acción**: Publicar en Facebook + Instagram + X simultáneamente

```
[Shopify: New Product]
        ↓
[Make: HTTP Request]
  URL: POST https://tupostiz.com/public/v1/posts
  Headers:
    Authorization: Bearer {{API_KEY}}
    Content-Type: application/json
  Body:
  {
    "type": "schedule",
    "date": "{{formatDate(now; 'YYYY-MM-DDTHH:mm:ss[Z]')}}",
    "posts": [
      {
        "integration": {"id": "abc123"},
        "value": [{"content": "🚀 Nuevo producto: {{product.title}}\n\n{{product.body_html}}\n\nVer: {{product.url}}"}]
      },
      {
        "integration": {"id": "def456"},
        "value": [{"content": "{{product.title}} ya disponible ✨", "media": [{"url": "{{product.image.src}}", "type": "image"}]}]
      },
      {
        "integration": {"id": "jkl012"},
        "value": [{"content": "💡 {{product.title}} — {{product.url}}"}]
      }
    ]
  }
```

---

### Caso 2: Publicación Masiva — Campaña desde Google Sheets

**Trigger**: Nueva fila en Google Sheets con columnas: Fecha, Contenido, Canales, Imagen  
**Acción**: Crear posts programados en los canales indicados

```
[Google Sheets: New Row]
        ↓
[Make: Iterator] — Divide columna "Canales" (ej: "facebook,instagram,tiktok")
        ↓
[Make: Router] — Un módulo por canal
├── [HTTP: POST Postiz] → Facebook
├── [HTTP: POST Postiz] → Instagram
└── [HTTP: POST Postiz] → TikTok
        ↓
[Make: Log result en Sheets] — Actualiza columna "Estado"
```

**Estructura del Sheet**:
| Fecha | Contenido | Canales | Imagen URL | Estado |
|-------|-----------|---------|-----------|--------|
| 2026-06-10 10:00 | Texto del post | facebook,instagram | https://... | Pendiente |
| 2026-06-11 15:00 | Otro post | tiktok,youtube | https://... | Pendiente |

---

### Caso 3: Publicaciones por Grupos — Segmentación por nicho

**Concepto**: Tienes 3 negocios distintos. Cada uno tiene sus propios canales en Postiz. Automatizas por "grupo" enviando solo a los canales del negocio correspondiente.

```
[Airtable: Record Updated (Status = "Ready to Publish")]
        ↓
[Make: Switch] — según campo "Negocio"
├── Negocio A → IDs: [abc123, def456] (sus canales)
├── Negocio B → IDs: [ghi789, jkl012] (sus canales)
└── Negocio C → IDs: [mno345, pqr678] (sus canales)
        ↓
[Make: HTTP POST /public/v1/posts] — con los IDs del negocio seleccionado
        ↓
[Make: Slack notification] — "Post publicado para {{negocio}}"
```

---

### Caso 4: AutoPost Inteligente — Blog + Redes

**Trigger**: Nueva entrada en WordPress (RSS)  
**Acción**: Generar variantes del post para cada red social

```
[RSS Feed: New Post (WordPress)]
        ↓
[Make: OpenAI] — Generar 3 versiones:
  - Versión corta (Twitter/X): máx 280 chars
  - Versión media (LinkedIn): 300-600 chars  
  - Versión visual (Instagram): caption con emojis
        ↓
[Make: HTTP POST /public/v1/posts] — Publicar las 3 versiones
  con delay: X=ahora, LinkedIn=+2h, Instagram=+4h
```

---

### Caso 5: Publicación Recurrente — Contenido evergreen

**Concepto**: Una base de datos de contenido evergreen que se rota automáticamente.

```
[Make: Schedule — cada lunes 9am]
        ↓
[Airtable: Get Random Record] — donde campo "Usado" = false
        ↓
[HTTP: POST Postiz] — publicar en todos los canales
        ↓
[Airtable: Update Record] — marcar "Usado" = true
        ↓
Si todos están usados → resetear todos a "Usado" = false
```

---

## Automatizaciones con Zapier

### Ejemplo: E-commerce (Shopify → Postiz → Redes)

**Zap 1**: Nuevo pedido → Publicar testimonio automático  
```
Trigger: Shopify - New Order (fulfilled)
Action: Gmail - Get customer review (si existe)
Action: Webhooks - POST to Postiz API
  URL: https://tupostiz.com/public/v1/posts
  Payload: {
    "type": "schedule",
    "date": "{{zap_meta_humanize_datetime}}",
    "posts": [/* canales configurados */]
  }
```

**Zap 2**: Nuevo video en YouTube → Distribuir clip en otras redes  
```
Trigger: YouTube - New Video in Channel
Action: Webhooks - POST to Postiz (Facebook, Instagram, TikTok)
  Content: "🎬 Nuevo video: {{video.title}}\n\nVer completo: {{video.url}}"
```

---

## Automatización Sin Depender de APIs Nativas

### El Problema con APIs Nativas
| Plataforma | Costo de API | Aprobación | Limitaciones |
|-----------|-------------|-----------|-------------|
| Meta (FB/IG) | Gratis (con restricciones) | 4-6 semanas | Rate limits, revisión |
| TikTok | Gratis | 2-4 semanas | Solo Business accounts |
| X/Twitter | $100-5,000/mes | Inmediata | Límite de posts muy bajo |
| LinkedIn | Gratis | 1-2 semanas | Solo Company Pages fácil |
| YouTube | Gratis | Inmediata | 10,000 unidades/día |

### La Solución: Postiz como Abstracción
Con **Postiz + Make/Zapier**, tú:
1. Solo gestionas la API Key de Postiz (un solo lugar).
2. No necesitas registrar apps en cada red social para TU automatización.
3. Postiz ya tiene las apps registradas y los tokens por usuario.
4. Si una red social cambia su API, Postiz actualiza el provider; tu automatización no cambia.

---

## Arquitectura de Make Recomendada

```
┌─────────────────────────────────────────────────┐
│              MAKE SCENARIO MASTER               │
│                                                 │
│  1. [Data Source] — Airtable/Sheets/CRM         │
│  2. [Filter] — Verificar si está listo          │
│  3. [Router] — Por tipo de contenido            │
│     ├── Tipo: Imagen → añadir media[]           │
│     ├── Tipo: Video → añadir video URL          │
│     └── Tipo: Texto → solo content              │
│  4. [Builder] — Construir payload Postiz        │
│  5. [HTTP] — POST /public/v1/posts              │
│  6. [Error Handler] — Si falla, notificar Slack │
│  7. [Update Source] — Marcar como publicado     │
└─────────────────────────────────────────────────┘
```

---

## Limitaciones y Costos por Plataforma

### Limitaciones de la API de Postiz
| Límite | Valor | Nota |
|--------|-------|------|
| Rate limit API pública | 30 req/hora (default) | Configurable con `API_LIMIT` |
| Plan STANDARD | 400 posts/mes | ~13 posts/día |
| Plan TEAM+ | Posts ilimitados | Recomendado para automatización |

### Limitaciones de Redes Sociales (via Postiz)
| Red Social | Limitación Principal | Costo API |
|-----------|---------------------|-----------|
| **Facebook Pages** | 200 calls/hora/token | Gratis |
| **Instagram** | 200 calls/hora/token, max 25 posts/día | Gratis |
| **X/Twitter** | 50 posts/día (Basic), 1,500/mes (Free) | $0-5,000/mes |
| **LinkedIn** | 150 calls/día/miembro | Gratis |
| **TikTok** | Rate limits por tipo de contenido | Gratis |
| **YouTube** | 10,000 unidades/día | Gratis |
| **Pinterest** | 10 pins/hora | Gratis |
| **Reddit** | 60 req/min | Gratis |

### Costos de Make.com (Operaciones)
| Plan Make | Ops/mes | Costo | Recomendado para |
|-----------|---------|-------|-----------------|
| Free | 1,000 | $0 | Pruebas |
| Core | 10,000 | $9/mes | 1-3 automatizaciones simples |
| Pro | 150,000 | $16/mes | Negocio pequeño |
| Teams | 1,500,000 | $29/mes | Agencia/empresa |

### Costos de Zapier
| Plan Zapier | Tasks/mes | Costo |
|-------------|-----------|-------|
| Free | 100 | $0 |
| Starter | 750 | $19.99/mes |
| Professional | 2,000 | $49/mes |
| Team | 50,000 | $299/mes |

---

## Recomendación de Stack para Máxima Automatización

```
Postiz TEAM o PRO ($39-49/mes)
  + Make Pro ($16/mes)
  = ~$55-65/mes

Capacidades:
✓ Publicaciones ilimitadas
✓ 10-30 canales sociales
✓ AutoPost desde RSS (nativo en Postiz)
✓ Automatización desde CRM/Sheets/Notion
✓ Webhooks para feedback loops
✓ Sin límites de posts/mes
```

---

## Template de Payload Postiz para Make/Zapier

```json
{
  "type": "schedule",
  "date": "2026-06-10T15:00:00Z",
  "shortLink": false,
  "posts": [
    {
      "integration": {
        "id": "ID_DEL_CANAL"
      },
      "value": [
        {
          "content": "Texto del post aquí",
          "media": [
            {
              "url": "https://url-de-imagen.com/imagen.jpg",
              "type": "image"
            }
          ],
          "settings": {}
        }
      ]
    }
  ]
}
```

**Para publicar ahora mismo**: Cambiar `"type": "now"` y omitir `"date"`.  
**Para guardar como borrador**: Cambiar `"type": "draft"`.  
**Para múltiples canales**: Añadir más objetos al array `"posts"`.

---

*Última actualización: Junio 2026*
