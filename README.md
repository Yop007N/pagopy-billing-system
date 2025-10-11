# PagoPy - Sistema de Gestión de Pagos y Facturación Electrónica

Sistema SaaS para MIPYMEs paraguayas que permite gestionar ventas, cobros y generar facturas electrónicas válidas integradas con SET (e-Kuatia).

## 🚀 Stack Tecnológico

- **Frontend Web**: Angular 17+ (Standalone Components)
- **Frontend Mobile**: Ionic 7+ con Capacitor
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL 15+ + Prisma ORM
- **Cache/Queues**: Redis + Bull
- **Monorepo**: Nx
- **Package Manager**: pnpm

## 📋 Requisitos Previos

- Node.js 20 LTS o superior
- pnpm 8.x o superior
- Docker y Docker Compose
- Git

## 🛠️ Instalación

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

## 🏃 Desarrollo

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

## 📁 Estructura del Proyecto

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

## 🔧 Configuración de Docker

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

## 📚 Documentación

- [CLAUDE.md](./CLAUDE.md) - Guía completa para Claude Code
- [Stack Tecnológico PDF](./Stack%20Tecnológico%20-%20Sistema%20de%20Pagos%20y%20Facturación.pdf) - Especificación técnica detallada

## 🧪 Testing

```bash
# Ejecutar todos los tests
pnpm test

# Tests con coverage
nx run-many --target=test --all --coverage

# Tests de un proyecto específico
nx test backend
nx test web
```

## 📦 Build

```bash
# Build de todos los proyectos
pnpm build

# Build de proyectos específicos
pnpm build:web
pnpm build:backend
pnpm build:mobile
```

## 🚢 Deployment

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

## 🔐 Variables de Entorno

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

## 🤝 Contribución

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

## 📄 Licencia

UNLICENSED - Uso privado

## 👥 Equipo

PagoPy Team

---

**Estado del Proyecto**: 🚧 En Desarrollo (MVP Fase 1)
