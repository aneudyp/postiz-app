# 09 — Estrategia de Negocio, Precios y Posicionamiento

## Visión del Negocio

Postiz se posiciona como **la alternativa open-source y asequible a Buffer, Hootsuite y Sprout Social**, con el diferenciador de poder auto-hostearlo gratuitamente y escalar a un SaaS completo con marketplace integrado.

---

## Análisis Competitivo

| Feature | Postiz | Buffer | Hootsuite | Sprout Social | Later |
|---------|--------|--------|-----------|---------------|-------|
| Open-source | ✅ | ❌ | ❌ | ❌ | ❌ |
| Self-hosted | ✅ | ❌ | ❌ | ❌ | ❌ |
| Plataformas | 35+ | 8 | 20+ | 9 | 6 |
| Plan más barato | $29 | $6 | $99 | $249 | $18 |
| Marketplace agencias | ✅ | ❌ | ❌ | ❌ | ❌ |
| IA generativa | ✅ | ✅ | ✅ | ✅ | ✅ |
| MCP/Agentes IA | ✅ | ❌ | ❌ | ❌ | ❌ |
| API Pública | ✅ ($29+) | ✅ ($6+) | ✅ | ✅ | ❌ |
| Canales máximos | 100 | 10 | 50 | Variable | 150 |

### Ventajas Competitivas de Postiz
1. **Precio**: $29 vs $249 de Sprout Social para funcionalidades similares.
2. **Open-source**: Los técnicos pueden self-hostear gratis.
3. **35+ plataformas**: Más integraciones que competidores principales.
4. **Marketplace**: Única plataforma con marketplace de publicaciones.
5. **IA integrada**: Generación de contenido, imágenes y videos nativos.
6. **MCP**: Integración con agentes de IA (Claude, etc.).

---

## Segmentos de Mercado

### Segmento 1: Creadores de Contenido / Solopreneurs
**Perfil**: Influencer, podcaster, newsletter creator, freelancer
**Pain**: Gestionar múltiples redes sociales consume 2-4 horas/día
**Solución**: Plan STANDARD o TEAM
**Precio objetivo**: $29-39/mes
**Propuesta de valor**: "Programa una semana de contenido en 30 minutos"

### Segmento 2: Pequeñas y Medianas Empresas (PYME)
**Perfil**: Tienda online, restaurante, consultora, startup
**Pain**: No tienen equipo dedicado a RRSS; el dueño lo hace todo
**Solución**: Plan TEAM con automatizaciones
**Precio objetivo**: $39/mes
**Propuesta de valor**: "Tu social media en piloto automático"

### Segmento 3: Agencias de Marketing Digital
**Perfil**: Agencia que gestiona 5-50 clientes
**Pain**: Herramientas caras + gestión caótica de múltiples clientes
**Solución**: Plan PRO o ULTIMATE + Marketplace de agencias
**Precio objetivo**: $49-99/mes
**Propuesta de valor**: "Gestiona todos tus clientes desde una sola plataforma + marketplace para conseguir nuevos clientes"

### Segmento 4: Empresas Tech / SaaS
**Perfil**: Startup con equipo de marketing pequeño
**Pain**: Automatización de anuncios de features, releases, actualizaciones
**Solución**: Plan PRO + API + AutoPost + GitHub integration
**Precio objetivo**: $49/mes
**Propuesta de valor**: "Automatiza tu presencia social desde el código"

### Segmento 5: Self-Hosters / Developers
**Perfil**: Dev técnico que valora control de datos
**Pain**: No quiere depender de servicios externos
**Solución**: Self-hosted gratuito
**Propuesta de valor**: "Control total de tus datos, gratis para siempre"
**Monetización indirecta**: Contribuyen al open-source, suben el ranking GitHub Stars

---

## Estrategia de Precios Detallada

### Estructura Actual

```
FREE          → Captación / Lead magnet
STANDARD $29  → Conversión inicial (punto de entrada bajo)
TEAM $39      → Upsell por features de equipo
PRO $49       → Agencias pequeñas / power users
ULTIMATE $99  → Agencias grandes / empresas
```

### Estrategia de Descuento Anual
- Anual = ~20% descuento vs mensual
- STANDARD: ahorra $70/año ($278 vs $348)
- ULTIMATE: ahorra $238/año ($950 vs $1,188)

### Recomendaciones de Optimización de Precios

**Subida de precio justificada**:
El mercado objetivo comparará con Buffer ($6-12) para funciones básicas y Hootsuite ($99+) para funciones avanzadas. Postiz puede incrementar precios en el futuro sin perder competitividad:

| Plan | Precio Actual | Precio Sugerido Futuro | Justificación |
|------|-------------|----------------------|---------------|
| STANDARD | $29 | $35 | Sigue siendo más barato que competidores |
| TEAM | $39 | $49 | + valor por features únicas |
| PRO | $49 | $69 | Agencias pagan más por valor |
| ULTIMATE | $99 | $149 | 100 canales es valor enorme |

---

## Funcionalidades por Categoría

### ✅ Funcionalidades Core (Ya implementadas)
- Scheduling multi-plataforma (35+ redes)
- Calendario visual de contenido
- Editor de posts con IA
- Generación de imágenes IA
- Generación de videos IA
- AutoPost desde RSS/URL
- Sets de contenido reutilizable
- Firmas automáticas
- Analytics por canal
- Gestión de equipo (roles)
- Biblioteca de medios
- Webhooks configurables
- API Pública REST
- MCP para agentes de IA
- Marketplace de agencias
- Sistema de mensajería interno
- OAuth Apps propias
- Multi-organización
- Short links (múltiples providers)
- Chrome Extension (para Skool y otros)
- Integración GitHub (releases automáticos)
- Extensión de Chrome
- Integración Mastra AI

### 🚧 Limitaciones Actuales
- Analytics básicos (no tan profundos como Sprout Social)
- Sin A/B testing nativo de posts
- Sin gestión de comentarios/inbox social
- Sin análisis de sentimiento
- Sin competitor analysis
- Sin integración con Google Ads o Meta Ads directamente
- Extensión Chrome solo disponible para plataformas específicas
- Sin soporte de historias programadas en todas las plataformas
- Sin Preview de cómo se verá el post en cada red

---

## Limitaciones del Modelo Actual

### Técnicas
| Limitación | Impacto | Solución Potencial |
|-----------|---------|-------------------|
| Temporal requiere infraestructura separada | Complejidad de deploy | Ofrecer versión simplificada sin Temporal |
| Cloudflare R2 requerido para producción | Fricción de setup | Soportar más providers (S3, MinIO) |
| Node 22.x específico | Problemas de compatibilidad | Dockerizar todo |
| Sin soporte de Stories en todas las plataformas | Feature gap vs competidores | Priorizar por plataforma |

### De Negocio
| Limitación | Impacto |
|-----------|---------|
| Free plan sin canales | Dificulta conversión orgánica / viral |
| Sin plan Startup/Agency dedicado | Gap entre PRO y ULTIMATE |
| Sin white-label | Agencias no pueden revender fácilmente |
| Marketplace muy nicho | Monetización indirecta limitada |

---

## Mejoras para Subir de Nivel como SaaS

### Prioridad Alta (Quick Wins)
1. **Free plan con 1-2 canales**: Aumentar conversión orgánica; el usuario lo usa, lo recomienda.
2. **Trial de 14 días de TEAM**: Sin tarjeta de crédito; conversión más alta.
3. **Inbox social**: Responder comentarios y DMs desde Postiz (feature muy solicitado).
4. **Analytics avanzados**: Métricas de engagement, reach, mejores horarios.
5. **Preview de posts**: Ver cómo quedará el post antes de publicar.

### Prioridad Media
6. **White-label para agencias**: Ofrecer Postiz bajo el dominio/branding de la agencia.
7. **Plan Agency dedicado**: $149/mes, organizaciones múltiples, gestión centralizada.
8. **A/B Testing de posts**: Publicar 2 versiones y ver cuál funciona mejor.
9. **Content Calendar de equipo**: Comentarios y aprobaciones en posts.
10. **Integración con Canva**: Diseñar y publicar directamente.

### Prioridad Baja (Roadmap largo plazo)
11. **Análisis de sentimiento en comentarios**.
12. **Competitor monitoring**: Ver qué publica la competencia.
13. **Gestión de influencers**: Base de datos de influencers por nicho.
14. **Integración con Meta Ads / Google Ads**: Boost de posts exitosos.
15. **App móvil nativa**: iOS/Android para aprobar posts en movimiento.
16. **Integración con Figma**: Para equipos de diseño.

---

## Modelo de Revenue Streams

### Revenue Actual
1. **Suscripciones SaaS** — Principal fuente de ingresos
2. **Marketplace commission (5%)** — Secundario
3. **Créditos IA adicionales** — Potencial no explotado

### Revenue Potencial
4. **White-label licensing** — $200-500/mes por agencia
5. **Enterprise on-premise** — $1,000-5,000/mes por empresa grande
6. **Consulting/Setup** — $500-2,000 por implementación
7. **Postiz API as a Service** — Cobrar por llamadas API a terceros
8. **Partner program** — Comisión por referidos de otras herramientas

---

## Estrategia de Adquisición

### Canal 1: SEO / Contenido
- Artículos: "Alternativa a Buffer", "Alternativa a Hootsuite"
- Comparativas: Postiz vs competidores
- Guías de automatización con Make/Zapier
- Targeting: creadores de contenido, agencias

### Canal 2: GitHub Stars / Open-Source Community
- Product Hunt launches
- Hacker News "Show HN"
- Dev.to y Hashnode artículos técnicos
- Comunidad de contributors

### Canal 3: Marketplace Propio
- Agencias que usan Postiz lo recomiendan a sus clientes
- Clientes se convierten en usuarios pagos directamente

### Canal 4: Integraciones
- Estar en el directorio de Make.com y Zapier
- Integraciones con herramientas populares (Notion, Airtable)
- MCP en el ecosistema de Claude/Anthropic

### Canal 5: Afiliados
- Programa de afiliados con 20-30% de comisión recurrente
- Ideal para creadores de contenido que hablan de herramientas

---

## KPIs Clave para Medir el Éxito

| KPI | Objetivo Mes 1 | Objetivo Mes 6 | Objetivo Año 1 |
|-----|---------------|----------------|----------------|
| MRR (Monthly Recurring Revenue) | $5,000 | $25,000 | $100,000 |
| Usuarios pagos | 50 | 500 | 2,000 |
| Churn rate mensual | <10% | <5% | <3% |
| GitHub Stars | 1,000 | 5,000 | 15,000 |
| Posts programados/mes | 10,000 | 100,000 | 1M |
| NPS Score | 30+ | 40+ | 50+ |

---

*Última actualización: Junio 2026*
