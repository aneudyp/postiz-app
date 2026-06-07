# 07 — SaaS y Facturación

## Modelo de Suscripción

Postiz opera como SaaS con **5 niveles de plan** gestionados a través de Stripe.

---

## Planes y Precios

| Plan | Mensual | Anual | Canales | Posts/mes | IA | API | Team |
|------|---------|-------|---------|-----------|-----|-----|------|
| **FREE** | $0 | $0 | 2 | 30 | ✗ | ✗ | ✗ |
| **STANDARD** | $29 | $278 | 5 | 400 | ✓ | ✓ | ✗ |
| **TEAM** | $39 | $374 | 10 | Ilimitado | ✓ | ✓ | ✓ |
| **PRO** | $49 | $470 | 30 | Ilimitado | ✓ | ✓ | ✓ |
| **ULTIMATE** | $99 | $950 | 100 | Ilimitado | ✓ | ✓ | ✓ |

### Detalle Completo por Plan

#### FREE
- **2 canales** sociales conectados
- **30 posts/mes** (~1 post/día)
- Sin IA, sin API, sin webhooks

#### STANDARD ($29/mes o $278/año — ahorra ~20%)
- 5 canales sociales
- 400 posts/mes
- Generación de imágenes IA: **20 imágenes/mes**
- Generación de videos: **3 videos/mes**
- API Pública: ✓
- Webhooks: **2**
- Import desde canales: ✓
- Sin miembros de equipo

#### TEAM ($39/mes o $374/año)
- 10 canales sociales
- Posts ilimitados
- Generación de imágenes IA: **100 imágenes/mes**
- Generación de videos: **10 videos/mes**
- API Pública: ✓
- Webhooks: **10**
- Miembros de equipo: ✓
- AutoPost (RSS): ✓
- Generador de imágenes avanzado: ✓
- Featured by Gitroom: ✓
- Community features: ✓

#### PRO ($49/mes o $470/año)
- 30 canales sociales
- Posts ilimitados
- Generación de imágenes IA: **300 imágenes/mes**
- Generación de videos: **30 videos/mes**
- API Pública: ✓
- Webhooks: **30**
- Todo lo de TEAM incluido

#### ULTIMATE ($99/mes o $950/año)
- 100 canales sociales
- Posts ilimitados
- Generación de imágenes IA: **500 imágenes/mes**
- Generación de videos: **60 videos/mes**
- API Pública: ✓
- Webhooks: **10,000**
- Todo lo de PRO incluido

---

## Integración con Stripe

### Variables de Entorno
```env
STRIPE_PUBLISHABLE_KEY="pk_live_..."    # Frontend (público)
STRIPE_SECRET_KEY="sk_live_..."         # Backend (privado)
STRIPE_SIGNING_KEY="whsec_..."          # Webhooks de suscripción
STRIPE_SIGNING_KEY_CONNECT="whsec_..."  # Webhooks del marketplace
FEE_AMOUNT=0.05                         # Comisión del marketplace (5%)
```

### Flujo de Suscripción
```
Usuario selecciona plan
       ↓
Frontend crea sesión de Stripe Checkout
       ↓
Usuario paga con tarjeta (Stripe.js)
       ↓
Stripe envía webhook → /stripe/webhook
       ↓
Backend actualiza Organization.subscription
       ↓
Se ajustan canales permitidos y features
```

### Eventos de Stripe Manejados
| Evento | Acción |
|--------|--------|
| `checkout.session.completed` | Activar suscripción |
| `customer.subscription.updated` | Cambiar plan |
| `customer.subscription.deleted` | Bajar a FREE |
| `invoice.payment_failed` | Notificar usuario |

### Marketplace (Stripe Connect)
- Vendedores conectan su cuenta bancaria via Stripe Connect.
- Compradores pagan; Postiz retiene el `FEE_AMOUNT` (5% por defecto) como comisión.
- Los pagos se capturan al completar la orden.

---

## Sistema de Créditos

Además de la suscripción, hay un sistema de **créditos** para servicios IA:

```prisma
model Credits {
  organizationId String
  credits        Int
  type           String    // "ai_images", "videos", etc.
}
```

- Los créditos se consumen al usar funciones de IA premium.
- Los planes incluyen créditos mensuales según el tier.
- Es posible comprar créditos adicionales (extensible).

---

## Períodos de Prueba

```prisma
model Organization {
  allowTrial   Boolean  // La organización puede activar trial
  isTrailing   Boolean  // Actualmente en período de prueba
}
```

- Los trials se pueden activar manualmente por el admin.
- Durante el trial, el usuario accede a las funciones del plan TEAM.

---

## Lifetime Deals

```prisma
model Subscription {
  isLifetime  Boolean  // Pago único de por vida
}
```

- Soporte para lifetime deals (AppSumo, Product Hunt, etc.).
- Sin renovación periódica; acceso permanente al plan comprado.

---

## Gestión de Canales al Cambiar de Plan

Cuando un usuario hace **downgrade**:

1. Si el nuevo plan tiene **menos canales** que los activos actuales:
   - El sistema automáticamente **deshabilita** los canales excedentes.
   - El usuario puede elegir cuáles mantener activos.

2. Si el plan deja de incluir **miembros de equipo**:
   - Los miembros no-admin son deshabilitados automáticamente.
   - El admin mantiene acceso.

---

## Códigos de Descuento

```prisma
model UsedCodes {
  code    String
  orgId   String
}
```

- Sistema de códigos promocionales por organización.
- Los códigos usados se registran para evitar reutilización.

---

## Facturación para Self-Hosted

En instalaciones self-hosted:
- **No se requiere Stripe** para funcionar.
- Se puede operar sin pagos configurando solo lo necesario.
- Si se quiere monetizar una instancia propia, se configuran las variables de Stripe con cuentas propias.
- El operador de la instancia recibe directamente los pagos.

---

*Última actualización: Junio 2026*
