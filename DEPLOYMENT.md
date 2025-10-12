# 🚀 Guía de Despliegue Rápido - PagoPy

## Inicio Rápido (Un solo comando)

```bash
# Inicia TODO el stack (Docker + Backend + Frontend)
pnpm start
```

## Comandos Disponibles

### Inicio y Detención

```bash
# Iniciar todo el stack
pnpm start
# o
./scripts/start-dev.sh

# Detener todo
pnpm stop
# o
./scripts/stop-dev.sh
```

### Setup Inicial (Solo primera vez)

```bash
# Instalar dependencias + Docker + Prisma
pnpm setup
```

### Comandos Individuales

```bash
# Docker
pnpm docker:up          # Iniciar PostgreSQL y Redis
pnpm docker:down        # Detener Docker
pnpm docker:restart     # Reiniciar servicios Docker
pnpm docker:logs        # Ver logs de Docker

# Prisma
pnpm prisma:generate    # Generar Prisma Client
pnpm prisma:studio      # Abrir Prisma Studio (GUI de DB)
pnpm prisma:seed        # Poblar base de datos

# Desarrollo
pnpm dev:backend        # Solo backend
pnpm dev:web            # Solo frontend
pnpm dev                # Backend + Frontend (Nx parallel)

# Build
pnpm build              # Build completo
pnpm build:backend      # Solo backend
pnpm build:web          # Solo frontend

# Testing
pnpm test               # Todos los tests
pnpm lint               # Lint completo
```

## 📋 Que hace `pnpm start`

1. ✅ Verifica que Docker esté instalado
2. ✅ Inicia PostgreSQL (puerto 5432)
3. ✅ Inicia Redis (puerto 6381)
4. ✅ Instala dependencias (si es necesario)
5. ✅ Genera Prisma Client
6. ✅ Sincroniza schema de base de datos
7. ✅ Inicia Backend NestJS (puerto 3000)
8. ✅ Inicia Frontend Angular (puerto 4200)

## 🌐 URLs después del despliegue

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:4200 | Aplicación web Angular |
| Backend API | http://localhost:3000/api | API REST |
| Swagger Docs | http://localhost:3000/api/docs | Documentación interactiva |
| Prisma Studio | `pnpm prisma:studio` | GUI base de datos |
| PostgreSQL | localhost:5432 | Base de datos |
| Redis | localhost:6381 | Cache |

## 📝 Logs

Los logs se guardan en la carpeta `logs/`:

```bash
# Ver logs en tiempo real
tail -f logs/backend.log
tail -f logs/frontend.log

# Ver logs de Docker
docker-compose logs -f
```

## 🔧 Troubleshooting

### El backend no inicia
```bash
# Ver logs
cat logs/backend.log

# Verificar PostgreSQL
docker ps | grep postgres
```

### El frontend no compila
```bash
# Ver logs
cat logs/frontend.log

# Limpiar y reiniciar
pnpm stop
rm -rf node_modules/.nx
pnpm start
```

### Puerto ocupado
```bash
# Verificar procesos en puertos
lsof -i :3000  # Backend
lsof -i :4200  # Frontend

# Matar proceso
kill -9 <PID>
```

### Problemas con Docker
```bash
# Reiniciar Docker
pnpm docker:down
pnpm docker:up

# Ver logs
pnpm docker:logs
```

## 🔄 Workflow de Desarrollo

### Primera vez
```bash
git clone <repo>
cd sistema-facturacion-wsl
pnpm setup      # Setup inicial
pnpm start      # Iniciar todo
```

### Dia a dia
```bash
pnpm start      # Iniciar al comenzar
# ... desarrollo ...
pnpm stop       # Detener al terminar
```

### Despues de pull
```bash
pnpm install              # Actualizar dependencias
pnpm prisma:generate      # Actualizar Prisma Client
cd apps/backend && npx prisma db push  # Sync schema
```

## 🐳 Docker Compose (Manual)

Si prefieres controlar Docker manualmente:

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Reiniciar un servicio específico
docker-compose restart postgres
docker-compose restart redis
```

## 🗄️ Base de Datos

### Conexión directa a PostgreSQL
```bash
# Conectar con psql
docker exec -it pago-py-postgres psql -U pagopy -d pago_py_dev

# Backup
docker exec pago-py-postgres pg_dump -U pagopy pago_py_dev > backup.sql

# Restore
cat backup.sql | docker exec -i pago-py-postgres psql -U pagopy -d pago_py_dev
```

### Prisma Studio (GUI)
```bash
pnpm prisma:studio
# Abre en http://localhost:5555
```

## 📦 Dependencias

### Requisitos del Sistema
- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker
- Docker Compose

### Verificar
```bash
node --version    # >= 20.0.0
pnpm --version    # >= 8.0.0
docker --version
```

## 🚨 Notas Importantes

1. **WSL2**: Este proyecto funciona mejor en ubicación nativa de WSL (`~/`)
2. **Ubicación**: Proyecto en `/home/enrique-b/sistema-facturacion-wsl`
3. **TypeScript**: Versión 5.4.5 (compatible con Angular 17)
4. **Puertos**: Asegúrate de que 3000, 4200, 5432 y 6381 estén disponibles

## 📚 Más Información

- [CLAUDE.md](./CLAUDE.md) - Guía completa de desarrollo
- [README.md](./README.md) - Documentación del proyecto
- Backend: [apps/backend/](./apps/backend/)
- Frontend: [apps/web/](./apps/web/)
