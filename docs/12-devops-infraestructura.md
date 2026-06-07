# 12 — DevOps e Infraestructura

## Requerimientos de Sistema

### Mínimo (Self-hosted básico)
| Componente | Mínimo |
|-----------|--------|
| CPU | 2 vCPU |
| RAM | 4 GB |
| Disco | 20 GB SSD |
| Node.js | 22.x (específicamente >=22.12.0 <23.0.0) |
| PostgreSQL | 14+ |
| Redis | 6+ |

### Recomendado (Producción con tráfico moderado)
| Componente | Recomendado |
|-----------|-------------|
| CPU | 4 vCPU |
| RAM | 8 GB |
| Disco | 50 GB SSD NVMe |
| PostgreSQL | 15+ con 4GB RAM dedicados |
| Redis | 7.x con 1GB RAM |

---

## Arquitectura de Deploy

### Opción 1: Single Server (Más Simple)
```
┌─────────────────────────────────────────┐
│            Servidor Único               │
│                                         │
│  ┌────────┐ ┌─────────────┐            │
│  │Frontend│ │Backend API  │            │
│  │ :4200  │ │   :3000     │            │
│  └────────┘ └─────────────┘            │
│  ┌──────────────┐ ┌──────────┐         │
│  │Orchestrator  │ │Temporal  │         │
│  │    :3002     │ │  :7233   │         │
│  └──────────────┘ └──────────┘         │
│  ┌──────────┐ ┌────────┐              │
│  │PostgreSQL│ │ Redis  │              │
│  │  :5432   │ │ :6379  │              │
│  └──────────┘ └────────┘              │
└─────────────────────────────────────────┘
```

### Opción 2: Docker Compose (Recomendado self-hosted)
```yaml
# Estructura recomendada docker-compose.yml
services:
  frontend:
    build: ./apps/frontend
    ports: ["4200:4200"]
  backend:
    build: ./apps/backend
    ports: ["3000:3000"]
    depends_on: [postgres, redis]
  orchestrator:
    build: ./apps/orchestrator
    depends_on: [temporal, postgres, redis]
  temporal:
    image: temporalio/auto-setup
    ports: ["7233:7233"]
  postgres:
    image: postgres:15
    volumes: [pgdata:/var/lib/postgresql/data]
  redis:
    image: redis:7-alpine
```

### Opción 3: Kubernetes (Producción Enterprise)
```
┌──────────────────────────────────────────────────┐
│                  Kubernetes Cluster               │
│  Namespace: postiz                                │
│                                                   │
│  Deployment: frontend (2 replicas)               │
│  Deployment: backend (3 replicas)                │
│  Deployment: orchestrator (2 replicas)           │
│  StatefulSet: temporal (HA)                      │
│                                                   │
│  External:                                        │
│  - PostgreSQL managed (RDS/CloudSQL/Neon)        │
│  - Redis managed (ElastiCache/Upstash)           │
│  - Storage: Cloudflare R2                        │
└──────────────────────────────────────────────────┘
```

---

## CI/CD Pipeline

**Archivo**: `Jenkins/` (Jenkinsfiles incluidos)

### Pipeline Típico
```
git push → Jenkins/GitHub Actions
    ↓
1. Install deps: pnpm install
2. Lint: pnpm lint (desde root)
3. Build: pnpm build (todos los apps)
4. Test: pnpm test
5. Docker build: imagen por cada app
6. Push a registry
7. Deploy a staging
8. Smoke tests
9. Deploy a producción (manual o automático)
```

### Nx Build System
Postiz usa **Nx** para builds inteligentes:
- Solo reconstruye lo que cambió (affected builds)
- Cache local y remoto de builds
- Paralelización de tareas

```bash
# Build solo lo que cambió respecto a main
pnpm nx affected:build

# Lint solo archivos afectados
pnpm nx affected:lint

# Ver qué cambiaría un deploy
pnpm nx affected:graph
```

---

## Variables de Entorno por Ambiente

### Desarrollo
```env
DATABASE_URL="postgresql://postiz-user:postiz-password@localhost:5432/postiz-db-local"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="dev-secret-not-for-production"
FRONTEND_URL="http://localhost:4200"
NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"
STORAGE_PROVIDER="local"
UPLOAD_DIRECTORY="./uploads"
IS_GENERAL="true"
```

### Producción
```env
DATABASE_URL="postgresql://user:pass@prod-host:5432/postiz"
REDIS_URL="redis://:password@redis-host:6379"
JWT_SECRET="<64+ chars random string>"
FRONTEND_URL="https://tudominio.com"
NEXT_PUBLIC_BACKEND_URL="https://api.tudominio.com"
BACKEND_INTERNAL_URL="http://backend-internal:3000"
STORAGE_PROVIDER="cloudflare"
CLOUDFLARE_ACCOUNT_ID="..."
CLOUDFLARE_ACCESS_KEY="..."
CLOUDFLARE_SECRET_ACCESS_KEY="..."
CLOUDFLARE_BUCKETNAME="..."
CLOUDFLARE_BUCKET_URL="..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
RESEND_API_KEY="..."
SENTRY_DSN="..."
```

---

## Gestión de Migraciones en Producción

### Procedimiento Seguro
```bash
# 1. Backup de la BD antes de migrar
pg_dump -h host -U user postiz > backup_$(date +%Y%m%d).sql

# 2. Aplicar migración (zero-downtime si es posible)
pnpm prisma migrate deploy

# 3. Verificar migración
pnpm prisma migrate status

# 4. Si falla → rollback
psql -h host -U user postiz < backup_$(date +%Y%m%d).sql
```

### Migraciones Destructivas
Si necesitas eliminar/renombrar columnas usadas en producción:
1. Añadir nueva columna (sin eliminar la vieja)
2. Migrar datos de vieja → nueva
3. Actualizar el código para usar la nueva
4. Deploy del código
5. Eliminar la columna vieja en una migración posterior

---

## Monitoring y Alertas

### Health Checks
| Servicio | Endpoint | Qué verifica |
|---------|---------|-------------|
| Backend | `GET /health` | DB + Redis conectados |
| Orchestrator | `GET /health` | Temporal conectado |
| Frontend | `GET /` | Página carga |

### Métricas Recomendadas (Grafana + Prometheus)
- **Backend**: Response time P50/P95/P99, Error rate, Request rate
- **Database**: Query time, Connection pool usage, Slow queries
- **Redis**: Hit rate, Memory usage, Connected clients
- **Temporal**: Workflow success rate, Activity failures, Queue depth
- **Negocio**: Posts publicados/hora, Errores de publicación, Usuarios activos

### Alertas Críticas
| Alerta | Umbral | Canal |
|--------|--------|-------|
| Error rate > 5% | 5 min | PagerDuty |
| DB connections > 80% | 5 min | Slack |
| Temporal queue > 1000 | 15 min | Slack |
| Disk > 80% | 30 min | Email |
| Memory > 90% | 5 min | PagerDuty |

---

## Escalabilidad

### Cuellos de Botella Comunes

**1. Base de Datos**
- Solución: Read replicas para queries de analytics
- Herramienta: PgBouncer para connection pooling
- Opción cloud: Neon.tech (PostgreSQL serverless)

**2. Publicación de Posts (Orchestrator)**
- Cada post se procesa en Temporal
- Escalar: Aumentar workers de Temporal
- Límite real: Rate limits de las APIs de redes sociales

**3. Upload de Media**
- Delegado a Cloudflare R2
- Virtualmente ilimitado
- Costo: $0.015/GB almacenado

**4. Redis**
- Usado para pub/sub y cache
- Solución: Redis Cluster para alta disponibilidad
- Opción cloud: Upstash (serverless Redis)

---

## Costs de Infraestructura Estimados

### Self-hosted en VPS (Mínimo viable)
| Recurso | Proveedor | Costo/mes |
|---------|----------|-----------|
| VPS 4vCPU/8GB | Hetzner/DigitalOcean | $25-40 |
| PostgreSQL backup | Cualquier provider | $5 |
| Cloudflare R2 | Cloudflare | $0-15 |
| **Total** | | **$30-60/mes** |

### Cloud Managed (Producción)
| Recurso | Proveedor | Costo/mes |
|---------|----------|-----------|
| App servers (2x) | AWS EC2 / GCP | $50-100 |
| PostgreSQL | RDS / CloudSQL | $50-150 |
| Redis | ElastiCache / Memorystore | $30-80 |
| Cloudflare R2 storage | Cloudflare | $0-50 |
| CDN/DNS | Cloudflare | $0-20 |
| **Total** | | **$130-400/mes** |

---

## Seguridad de Infraestructura

### Red
- Backend y Orchestrator: No expuestos públicamente (solo via proxy)
- PostgreSQL: Solo accesible desde red interna
- Redis: Solo accesible desde red interna
- HTTPS: Obligatorio para frontend y API pública

### Secretos
- Usar gestores de secretos: AWS Secrets Manager, HashiCorp Vault, o Doppler
- Nunca hardcodear credenciales en el código
- Rotar JWT_SECRET periódicamente

### Actualizaciones
- Actualizar dependencias de Node.js mensualmente
- Seguir las releases de Postiz para patches de seguridad
- Monitorear CVEs de dependencias con `pnpm audit`

---

*Última actualización: Junio 2026*
