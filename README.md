<div align="center">

# PagoPy - Sistema de Gestión de Pagos y Facturación Electrónica

[![License](https://img.shields.io/badge/license-Private-red.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Angular](https://img.shields.io/badge/Angular-17+-DD0031?logo=angular&logoColor=white)](https://angular.io/)
[![NestJS](https://img.shields.io/badge/NestJS-10+-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**Sistema SaaS moderno para MIPYMEs paraguayas**

Gestión integral de ventas, cobros y facturación electrónica válida (SET e-Kuatia)

[Características](#características-principales) •
[Instalación](#quick-start) •
[Documentación](#documentación) •
[Stack Tecnológico](#stack-tecnológico)

</div>

---

## Preview

> **Proyecto en desarrollo activo** - Screenshots y demo en vivo próximamente

## Características Principales

- **Facturación Electrónica**: Integración completa con SET (Sistema de e-Kuatia)
- **Múltiples Métodos de Pago**: Bancard, Pagopar, SIPAP, efectivo, tarjetas
- **Multi-plataforma**: Web (PWA), iOS y Android con 90%+ código compartido
- **Modo Offline**: Sincronización automática cuando recupera conexión
- **Reportes Avanzados**: Análisis de ventas, inventario y finanzas en tiempo real
- **Impresión Térmica**: Compatible con impresoras Bluetooth para tickets
- **Seguridad Empresarial**: JWT, bcrypt, rate limiting, auditoría completa
- **API REST**: Documentación OpenAPI (Swagger) completa

## Stack Tecnológico

- **Frontend Web**: Angular 17+ (Standalone Components)
- **Frontend Mobile**: Ionic 7+ con Capacitor
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL 15+ + Prisma ORM
- **Cache/Queues**: Redis + Bull
- **Monorepo**: Nx
- **Package Manager**: pnpm

## Requisitos Previos

- Node.js 20 LTS o superior
- pnpm 8.x o superior
- Docker y Docker Compose
- Git

## Quick Start

La forma más rápida de comenzar es usando nuestros scripts automatizados:

### Configuración Inicial (Primera vez)

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd sistema-facturacion

# 2. Ejecutar el script de setup (hace todo automáticamente)
./scripts/setup.sh
```

Este script:
- Instala todas las dependencias
- Inicia Docker (PostgreSQL + Redis)
- Configura archivos .env
- Ejecuta migraciones de base de datos
- Opcionalmente carga datos de prueba

### Iniciar Desarrollo

```bash
# Opción 1: Iniciar todas las aplicaciones (Backend + Web + Mobile)
./scripts/start-all.sh

# Opción 2: Usar el comando npm directo (solo Backend + Web)
pnpm dev
```

### Verificar Estado del Sistema

```bash
# Verificar que todos los servicios están funcionando
./scripts/health-check.sh
```

Este script verifica:
- Docker (PostgreSQL y Redis)
- Backend API (puerto 3000)
- Web App (puerto 4200)
- Mobile App (puerto 8100)
- Variables de entorno
- Dependencias instaladas

## Instalación Manual

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd sistema-facturacion
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Levantar servicios (PostgreSQL y Redis)

```bash
pnpm docker:up
```

### 4. Configurar variables de entorno

Copiar los archivos `.env.example` y configurar:

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Editar apps/backend/.env con tus credenciales
```

### 5. Ejecutar migraciones de Prisma

```bash
pnpm prisma:migrate
pnpm prisma:generate
```

## Desarrollo

### Ejecutar todas las aplicaciones

```bash
pnpm dev
```

### Ejecutar aplicaciones individuales

```bash
# Frontend Web (Angular)
pnpm dev:web
# http://localhost:4200

# Backend API (NestJS)
pnpm dev:backend
# http://localhost:3000

# Mobile App (Ionic)
pnpm dev:mobile
# http://localhost:8100
```

### Otros comandos útiles

```bash
# Ejecutar tests
pnpm test

# Ejecutar linter
pnpm lint

# Formatear código
pnpm format

# Ver logs de Docker
pnpm docker:logs

# Abrir Prisma Studio
pnpm prisma:studio
```

## Estructura del Proyecto

```
pago-py/
├── apps/
│   ├── web/                 # Angular Web Application
│   ├── mobile/              # Ionic Mobile Application
│   └── backend/             # NestJS API
├── libs/
│   └── shared-models/       # Shared TypeScript models
├── docker-compose.yml       # Docker services configuration
├── nx.json                  # Nx workspace configuration
└── package.json             # Root package.json
```

## Configuración de Docker

El proyecto incluye PostgreSQL y Redis en Docker:

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f
```

**Credenciales por defecto (desarrollo)**:
- PostgreSQL: `pagopy` / `pagopy_dev_password` / `pago_py_dev`
- Redis: Sin contraseña (localhost:6379)

## Documentación

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía de despliegue

## Testing

```bash
# Ejecutar todos los tests
pnpm test

# Tests con coverage
nx run-many --target=test --all --coverage

# Tests de un proyecto específico
nx test backend
nx test web
```

## Build

```bash
# Build de todos los proyectos
pnpm build

# Build de proyectos específicos
pnpm build:web
pnpm build:backend
pnpm build:mobile
```

## Deployment

### Web (Angular)

```bash
pnpm build:web
# Deploy dist/apps/web a Vercel, Netlify, etc.
```

### Backend (NestJS)

```bash
pnpm build:backend
# Deploy dist/apps/backend a Railway, Render, AWS, etc.
```

### Mobile (Ionic)

```bash
# iOS
cd apps/mobile
ionic capacitor build ios

# Android
ionic capacitor build android
```

## Variables de Entorno

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://pagopy:pagopy_dev_password@localhost:5432/pago_py_dev"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# SET e-Kuatia
SET_API_URL="https://marangatu.set.gov.py/api"
SET_USERNAME="your-set-username"
SET_PASSWORD="your-set-password"

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"

# Redis
REDIS_URL="redis://localhost:6379"
```

### Web (.env)

```env
# Backend API URL
VITE_API_URL=http://localhost:3000

# Application Environment
VITE_ENV=development
```

## Scripts Útiles

El proyecto incluye varios scripts en el directorio `scripts/` para facilitar el desarrollo:

### setup.sh
Configuración inicial completa del proyecto. Ejecutar solo una vez.

```bash
./scripts/setup.sh
```

### start-all.sh
Inicia todas las aplicaciones (backend, web, mobile) usando tmux o concurrently.

```bash
./scripts/start-all.sh
```

### health-check.sh
Verifica el estado de todos los servicios y muestra un reporte detallado.

```bash
./scripts/health-check.sh
```

## Troubleshooting

### Docker no inicia

**Problema**: "Docker daemon is not running"

**Solución**:
```bash
# En Windows/Mac: Abrir Docker Desktop
# En Linux:
sudo systemctl start docker
```

### PostgreSQL no se conecta

**Problema**: "Connection refused" al conectar a PostgreSQL

**Soluciones**:
1. Verificar que el contenedor esté corriendo:
   ```bash
   docker ps | grep pago-py-postgres
   ```

2. Verificar logs del contenedor:
   ```bash
   docker logs pago-py-postgres
   ```

3. Reiniciar servicios de Docker:
   ```bash
   pnpm docker:down
   pnpm docker:up
   ```

### Prisma Client no generado

**Problema**: "Cannot find module '@prisma/client'"

**Solución**:
```bash
pnpm prisma:generate
```

### Puerto en uso

**Problema**: "Port 3000/4200/8100 is already in use"

**Soluciones**:
1. Encontrar el proceso usando el puerto:
   ```bash
   # Linux/Mac
   lsof -i :3000

   # Windows
   netstat -ano | findstr :3000
   ```

2. Matar el proceso o cambiar el puerto en la configuración

### Migraciones fallan

**Problema**: Error al ejecutar `pnpm prisma:migrate`

**Soluciones**:
1. Verificar que PostgreSQL esté corriendo
2. Verificar DATABASE_URL en `.env`
3. Resetear la base de datos (¡CUIDADO: Elimina todos los datos!):
   ```bash
   pnpm docker:down
   docker volume rm sistema-facturacion_postgres_data
   pnpm docker:up
   pnpm prisma:migrate
   ```

### Dependencias desactualizadas

**Problema**: Errores al ejecutar la aplicación después de cambiar de rama

**Solución**:
```bash
# Reinstalar dependencias
pnpm install

# Regenerar Prisma Client
pnpm prisma:generate
```

### Backend no responde

**Problema**: Backend inicia pero no responde a requests

**Soluciones**:
1. Verificar logs:
   ```bash
   # Ver logs en tiempo real
   pnpm dev:backend
   ```

2. Verificar variables de entorno en `apps/backend/.env`
3. Verificar que PostgreSQL y Redis estén corriendo:
   ```bash
   ./scripts/health-check.sh
   ```

### Web app muestra error de CORS

**Problema**: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solución**:
1. Verificar que el backend esté corriendo
2. Verificar `CORS_ORIGIN` en `apps/backend/.env`:
   ```env
   CORS_ORIGIN=http://localhost:4200
   ```

### Mobile app no carga

**Problema**: La app mobile no muestra contenido

**Soluciones**:
1. Verificar que el backend esté corriendo
2. En dispositivo físico, usar la IP local en lugar de localhost
3. Limpiar y rebuildar:
   ```bash
   cd apps/mobile
   npx cap sync
   ```

## Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

### Conventional Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Formateo de código
- `refactor:` Refactorización
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

## Sobre el Proyecto

PagoPy nace como solución a la necesidad de las pequeñas y medianas empresas paraguayas de cumplir con la normativa fiscal (SET e-Kuatia) de manera simple y accesible. El sistema está diseñado con arquitectura moderna, escalable y preparada para crecer con el negocio.

### Arquitectura

Este proyecto implementa:
- **Monorepo Nx**: Gestión unificada de múltiples aplicaciones
- **Clean Architecture**: Separación de responsabilidades y fácil testing
- **Offline-First**: La app mobile funciona sin conexión
- **API-First**: Backend RESTful completamente documentado
- **Progressive Web App**: Web app instalable y con soporte offline

### Aprendizajes Clave

- Integración con APIs gubernamentales (SET Paraguay)
- Arquitectura de microservicios con NestJS
- Manejo de sincronización offline-online
- Generación de PDF/XML para facturación electrónica
- Implementación de pasarelas de pago
- Gestión de estados complejos en Angular

## Licencia

UNLICENSED - Proyecto privado de portafolio

## Autor

**Enrique B.**

Este proyecto forma parte de mi portafolio profesional de desarrollo full-stack, demostrando capacidades en:
- Frontend moderno (Angular + Ionic)
- Backend robusto (NestJS + PostgreSQL)
- Desarrollo móvil multiplataforma
- Arquitectura de sistemas complejos
- Seguridad y buenas prácticas

---

<div align="center">

**Estado del Proyecto**: En Desarrollo Activo (MVP Fase 1)

Desarrollado para la comunidad MIPYME de Paraguay

</div>
