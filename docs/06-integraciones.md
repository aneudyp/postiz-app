# 06 — Integraciones con Redes Sociales

## Arquitectura de Integraciones

Cada red social tiene su propio **provider** implementado en:
`libraries/nestjs-libraries/src/integrations/social/`

Todos los providers implementan la interfaz `SocialIntegrationsInterface`:

```typescript
interface SocialIntegrationsInterface {
  identifier: string;         // slug único (ej: "facebook")
  name: string;               // nombre legible
  authenticate(): Promise<void>;
  post(posts: Post[]): Promise<PostResponse[]>;
  analytics?(): Promise<Analytics>;
  // ...otros métodos opcionales
}
```

---

## Plataformas Soportadas

### Grupo 1: Redes Sociales Principales

#### Facebook / Instagram (Meta)
- **Provider**: `facebook.provider.ts`, `instagram.provider.ts`
- **Auth**: OAuth2 via Facebook Login
- **Variables**: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`
- **Capacidades**:
  - Facebook: posts en páginas, imágenes, videos, links
  - Instagram: posts en feed, reels, stories, carruseles
  - Instagram Standalone (`instagram.standalone.provider.ts`): conexión directa sin Facebook
- **Limitaciones API**:
  - Requiere aprobación de Facebook para algunas funciones
  - Rate limit: 200 calls/hora por token de usuario
  - Reels: requieren video en formato MP4, máx. 90 segundos para Reels

#### X / Twitter
- **Provider**: `x.provider.ts`
- **Auth**: OAuth2 con PKCE
- **Variables**: `X_URL`, `X_API_KEY`, `X_API_SECRET`
- **Capacidades**: tweets, hilos, imágenes, videos, polls
- **Limitaciones API**:
  - Plan Free: 1,500 tweets/mes
  - Plan Basic ($100/mes): 50,000 tweets/mes
  - Plan Pro ($5,000/mes): 300,000 tweets/mes

#### LinkedIn
- **Providers**: `linkedin.provider.ts` (perfil), `linkedin.page.provider.ts` (páginas)
- **Variables**: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`
- **Capacidades**: posts de texto, imágenes, videos, artículos, documentos
- **Limitaciones**: 150 calls/día por miembro, 100,000 calls/día por app

#### TikTok
- **Provider**: `tiktok.provider.ts`
- **Variables**: `TIKTOK_CLIENT_ID`, `TIKTOK_CLIENT_SECRET`
- **Capacidades**: videos, foto-posts, carruseles
- **Limitaciones**: Solo videos/fotos (no texto puro), revisión de contenido puede demorar

#### YouTube
- **Provider**: `youtube.provider.ts`
- **Variables**: `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`
- **Capacidades**: subir videos, Community posts
- **Limitaciones**: Cuota de API: 10,000 unidades/día (subir video = 1,600 unidades)

#### Pinterest
- **Provider**: `pinterest.provider.ts`
- **Variables**: `PINTEREST_CLIENT_ID`, `PINTEREST_CLIENT_SECRET`
- **Capacidades**: Crear Pins con imagen/video y link
- **Limitaciones**: 10 Pins/hora, requiere imagen obligatoria

#### Reddit
- **Provider**: `reddit.provider.ts`
- **Variables**: `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`
- **Capacidades**: Posts en subreddits (texto, links, imágenes)
- **Limitaciones**: Límites karma según subreddit, 60 req/min

---

### Grupo 2: Plataformas Alternativas / Descentralizadas

#### Bluesky (AT Protocol)
- **Provider**: `bluesky.provider.ts`
- **Auth**: App Password (no OAuth tradicional)
- **Capacidades**: Posts, imágenes, hilos
- **Sin variables globales**: cada usuario conecta con sus credenciales

#### Mastodon
- **Providers**: `mastodon.provider.ts`, `mastodon.custom.provider.ts`
- **Variables**: `MASTODON_URL`, `MASTODON_CLIENT_ID`, `MASTODON_CLIENT_SECRET`
- **Capacidades**: Toots, imágenes, CW (content warnings)
- **Nota**: Compatible con cualquier instancia ActivityPub

#### Farcaster
- **Provider**: `farcaster.provider.ts`
- **Auth**: Wallet Ethereum
- **Capacidades**: Casts, imágenes, channels

#### Nostr
- **Provider**: `nostr.provider.ts`
- **Auth**: Clave privada Nostr
- **Capacidades**: Notes, zaps

#### Threads (Meta)
- **Provider**: `threads.provider.ts`
- **Variables**: `THREADS_APP_ID`, `THREADS_APP_SECRET`
- **Capacidades**: Posts de texto, imágenes, videos, carruseles

---

### Grupo 3: Comunidades y Mensajería

#### Discord
- **Provider**: `discord.provider.ts`
- **Variables**: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_BOT_TOKEN_ID`
- **Capacidades**: Mensajes en canales, embeds con imágenes

#### Slack
- **Provider**: `slack.provider.ts`
- **Variables**: `SLACK_ID`, `SLACK_SECRET`, `SLACK_SIGNING_SECRET`
- **Capacidades**: Mensajes en canales, bloques de contenido

#### Telegram
- **Provider**: `telegram.provider.ts`
- **Auth**: Bot token
- **Capacidades**: Posts en canales/grupos, imágenes, videos

#### Google My Business (GMB)
- **Provider**: `gmb.provider.ts`
- **Auth**: Google OAuth
- **Capacidades**: Posts en perfil de negocio (eventos, ofertas, novedades)

---

### Grupo 4: Plataformas de Contenido Largo

#### WordPress
- **Provider**: `wordpress.provider.ts`
- **Auth**: API Key o usuario/contraseña
- **Capacidades**: Crear borradores o publicar artículos

#### Medium
- **Provider**: `medium.provider.ts`
- **Auth**: Integration Token
- **Capacidades**: Crear drafts y publicar stories

#### Dev.to
- **Provider**: `dev.to.provider.ts`
- **Auth**: API Key
- **Capacidades**: Publicar artículos con Markdown

#### Hashnode
- **Provider**: `hashnode.provider.ts`
- **Auth**: API Key personal
- **Capacidades**: Publicar en blog de Hashnode

---

### Grupo 5: Comunidades de Membresía

#### Skool
- **Provider**: `skool.provider.ts`
- **Auth**: Via extensión de Chrome (cookies de sesión)
- **Nota**: No tiene API pública oficial. Requiere `EXTENSION_ID`

#### Whop
- **Provider**: `whop.provider.ts`
- **Auth**: API Key de Whop

---

### Grupo 6: Plataformas Adicionales

| Plataforma | Provider | Nota |
|-----------|---------|------|
| **Dribbble** | `dribbble.provider.ts` | Portfolio/shots de diseño |
| **GitHub** | (integrado) | Releases automáticos |
| **Twitch** | `twitch.provider.ts` | Anuncios en canal |
| **Kick** | `kick.provider.ts` | Streaming alternativo |
| **VK** | `vk.provider.ts` | Red social rusa |
| **MeWe** | `mewe.provider.ts` | Red social alternativa |
| **Lemmy** | `lemmy.provider.ts` | Reddit descentralizado |
| **Moltbook** | `moltbook.provider.ts` | |

---

### Grupo 7: Newsletters

| Plataforma | Provider | Variables |
|-----------|---------|-----------|
| **Beehiiv** | `newsletter/providers/` | `BEEHIIVE_API_KEY`, `BEEHIIVE_PUBLICATION_ID` |
| **Listmonk** | `listmonk.provider.ts` | `LISTMONK_DOMAIN`, `LISTMONK_USER`, `LISTMONK_API_KEY`, `LISTMONK_LIST_ID` |

---

## Proceso de Conexión de un Canal

```
1. Usuario hace clic en "Conectar canal"
         ↓
2. Backend redirige a OAuth del provider
         ↓
3. Usuario autoriza en la plataforma
         ↓
4. Callback regresa con código de autorización
         ↓
5. Backend intercambia código por access_token + refresh_token
         ↓
6. Se crea registro en tabla Integration
         ↓
7. Canal aparece disponible para publicar
```

---

## Flujo de Publicación

```
Post en estado QUEUE
         ↓
Temporal Workflow detecta publishDate
         ↓
Activity: obtener Integration y tokens
         ↓
Activity: llamar al provider.post()
         ↓
[Éxito] → Post.state = PUBLISHED
[Error]  → Post.state = ERROR, registro en Errors, notificación email
```

---

## Extensión de Chrome

Para plataformas sin API pública (Skool, futuras plataformas):

1. El usuario instala la extensión con ID `EXTENSION_ID`.
2. La extensión comparte cookies de sesión del navegador.
3. El backend usa estas cookies para publicar como el usuario.
4. **Limitación**: Requiere que el usuario tenga el navegador activo con sesión iniciada.

---

## 3rd Party Services de IA

### HeyGen (`3rdparties/heygen/`)
- Generación de videos con avatares de IA.
- Se integra como fuente de contenido para publicar.

### ReelFarm (`3rdparties/reelfarm/`)
- Generación de reels y videos cortos con IA.

---

*Última actualización: Junio 2026*
