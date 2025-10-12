# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PagoPy** is a Payment and Electronic Invoicing System (Sistema de Gestión de Pagos y Facturación Electrónica) for Paraguayan SMEs, integrating with local services like SET (e-Kuatia), SIPAP, and payment gateways (Bancard/Pagopar).

**Architecture**: Nx monorepo with shared workspace configuration
**Package Manager**: pnpm (required - see engines in package.json)

## Quick Start

```bash
# Option 1: Automated setup using helper scripts (recommended for first time)
./scripts/setup.sh           # Complete initial setup

# Option 2: Manual setup
pnpm install                 # Install dependencies
pnpm docker:up               # Start PostgreSQL + Redis
pnpm prisma:migrate          # Run migrations
pnpm prisma:generate         # Generate Prisma client

# Option 3: Single command setup
pnpm setup                   # Shortcut for install + docker + prisma

# Start development
pnpm start                   # Starts everything (Docker + Backend + Web)
# OR
pnpm dev                     # Runs web + backend in parallel
```

**Helper Scripts** (in `scripts/` directory):
- `setup.sh` - Complete initial setup (dependencies, Docker, database)
- `start-dev.sh` / `start-all.sh` - Start all services with single command
- `stop-dev.sh` - Stop all running services
- `health-check.sh` - Verify all services are running correctly

## Technology Stack

### Frontend
- **Web**: Angular 17+ with Standalone Components
  - UI: Angular Material + Tailwind CSS
  - State: RxJS + Services (signals for local state)
  - Forms: Reactive Forms with validators
  - Offline: @angular/service-worker (PWA)
  - HTTP: HttpClient with interceptors
  - Build: Uses Vite-style environment variables (VITE_*)

- **Mobile**: Ionic 7+ with Angular
  - Runtime: Capacitor 5+ for native access
  - Storage: @ionic/storage + SQLite for offline
  - Bluetooth: @capacitor-community/bluetooth-le (for thermal printers)
  - 90-95% code sharing with web app

### Backend
- **Framework**: NestJS (TypeScript)
- **Runtime**: Node.js 20 LTS
- **ORM**: Prisma
- **Validation**: class-validator + class-transformer
- **API Docs**: Swagger (OpenAPI) at `/api/docs`
- **Testing**: Jest + Supertest
- **Background Jobs**: Bull (Redis-based queues)
- **Scheduler**: @nestjs/schedule

### Database
- **Primary**: PostgreSQL 15+
- **ORM**: Prisma with Prisma Migrate
- **Cache**: Redis 7+ (sessions, rate limiting, queues)
- **Local/Offline**: SQLite (mobile app)

### Infrastructure
- **Cloud**: AWS (ECS Fargate, RDS PostgreSQL, ElastiCache Redis, S3, CloudFront)
- **Alternative**: Railway.app or Render for development/staging
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (error tracking), CloudWatch (AWS)

## Project Structure

### Nx Monorepo Layout
```
pago-py/
├── apps/
│   ├── web/                    # Angular Web App
│   │   ├── src/app/
│   │   │   ├── core/           # Singleton services (auth, api, guards)
│   │   │   ├── shared/         # Shared components, directives, pipes
│   │   │   └── features/       # Feature modules (auth, sales, products, dashboard)
│   │   ├── project.json        # Nx project configuration
│   │   ├── .env.example        # Environment variables template
│   │   └── tsconfig.*.json
│   │
│   ├── mobile/                 # Ionic + Angular App
│   │   ├── src/app/
│   │   │   ├── pages/          # Ionic pages
│   │   │   ├── services/       # Services (storage, sync, network, sales)
│   │   │   ├── core/           # Core utilities
│   │   │   ├── models/         # Data models
│   │   │   └── shared/         # Shared components
│   │   ├── capacitor.config.ts
│   │   ├── ionic.config.json
│   │   └── project.json
│   │
│   └── backend/                # NestJS API
│       ├── src/
│       │   ├── auth/           # JWT auth with strategies (jwt.strategy.ts, local.strategy.ts)
│       │   ├── users/          # User management
│       │   ├── sales/          # Sales with DTOs
│       │   ├── invoices/       # SET e-Kuatia integration + pdf.service.ts
│       │   ├── payments/       # SIPAP, Bancard, Pagopar with DTOs
│       │   ├── products/       # Product catalog with DTOs
│       │   ├── customers/      # Customer management
│       │   ├── reports/        # Reporting module
│       │   ├── notifications/  # WhatsApp, Email, SMS
│       │   ├── webhooks/       # Payment gateway webhooks
│       │   ├── prisma/         # PrismaService and module
│       │   ├── common/         # Common utilities
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── prisma/
│       │   ├── schema.prisma   # Prisma schema (User, Customer, Product, Sale, SaleItem, Payment, Invoice, AuditLog)
│       │   └── seed.ts         # Database seeding script
│       ├── .env.example        # Environment variables template
│       ├── project.json        # Nx targets: build, serve, test, prisma-*
│       └── webpack.config.js
│
├── libs/
│   └── shared-models/          # Shared TypeScript models/interfaces
│       └── project.json
│
├── scripts/                    # Helper scripts for setup and development
├── docker-compose.yml          # PostgreSQL + Redis services
├── nx.json                     # Nx workspace config
├── package.json                # Root scripts and dependencies
└── tsconfig.base.json          # Base TypeScript config
```

## Common Development Commands

**IMPORTANT**: This is an Nx monorepo. Always use `pnpm` (not npm) and prefer `nx` commands over direct Angular/Ionic/NestJS CLI commands.

### Initial Setup
```bash
# Automated setup (recommended)
./scripts/setup.sh

# Or manual setup
pnpm install
pnpm docker:up
pnpm prisma:migrate
pnpm prisma:generate

# Quick setup (shortcut)
pnpm setup
```

### Development Servers
```bash
# Start everything (Docker + Backend + Web)
pnpm start

# Run all apps (web + backend) in parallel
pnpm dev

# Run individual apps
pnpm dev:web          # Web app at http://localhost:4200
pnpm dev:backend      # API at http://localhost:3000
pnpm dev:mobile       # Mobile at http://localhost:8100

# Using nx directly
nx serve web
nx serve backend
nx serve mobile

# Serve with specific configuration
nx serve backend --configuration=production

# Stop all services
pnpm stop
```

### Health Check
```bash
# Verify all services are running
./scripts/health-check.sh
```

This checks:
- Docker (PostgreSQL and Redis)
- Backend API (port 3000)
- Web App (port 4200)
- Mobile App (port 8100)
- Environment variables
- Dependencies

### Building
```bash
# Build all projects
pnpm build

# Build individual projects
pnpm build:web
pnpm build:backend
pnpm build:mobile

# Using nx directly
nx build web --configuration=production
nx build backend --configuration=production

# Build specific project and its dependencies
nx build backend --with-deps
```

### Testing
```bash
# Run all tests
pnpm test

# Test specific project
nx test web
nx test backend
nx test mobile

# Test with coverage
nx test backend --coverage
nx run-many --target=test --all --coverage

# Watch mode
nx test backend --watch

# Run specific test file
nx test backend --testFile=auth.service.spec.ts
```

### Linting & Formatting
```bash
# Lint all projects
pnpm lint

# Lint specific project
nx lint web
nx lint backend

# Format all files
pnpm format

# Check formatting without writing
pnpm format:check

# Lint and format specific project
nx lint backend --fix
```

### Database (Prisma)
```bash
# Generate Prisma Client
pnpm prisma:generate

# Create and apply migration
pnpm prisma:migrate

# Open Prisma Studio (database GUI)
pnpm prisma:studio

# Seed database
pnpm prisma:seed

# Using nx targets directly
nx run backend:prisma-generate
nx run backend:prisma-migrate
nx run backend:prisma-studio
nx run backend:prisma-seed

# Manual Prisma commands (from backend directory)
cd apps/backend
npx prisma migrate dev --name [migration-name]
npx prisma migrate deploy  # For production
npx prisma db push         # Push schema without migration
npx prisma studio
```

### Docker Services
```bash
# Start PostgreSQL and Redis
pnpm docker:up

# Stop services
pnpm docker:down

# Restart services
pnpm docker:restart

# View logs
pnpm docker:logs

# Direct docker-compose commands
docker-compose up -d
docker-compose down
docker-compose ps
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Code Generation (Nx)
```bash
# Generate Angular component (standalone)
nx generate @nx/angular:component --name=my-component --project=web --standalone

# Generate Angular service
nx generate @nx/angular:service --name=my-service --project=web

# Generate NestJS resource (CRUD)
nx generate @nx/nest:resource --name=my-resource --project=backend

# Generate NestJS service
nx generate @nx/nest:service --name=my-service --project=backend

# Generate NestJS module
nx generate @nx/nest:module --name=my-module --project=backend
```

### Mobile-Specific (Ionic/Capacitor)
```bash
# Sync Capacitor after code/dependency changes
cd apps/mobile
npx cap sync

# Open in native IDEs
npx cap open ios
npx cap open android

# Run on devices/emulators
npx cap run ios
npx cap run android

# Build native apps
ionic capacitor build ios --prod
ionic capacitor build android --prod

# Generate APK (from android directory)
cd apps/mobile/android && ./gradlew assembleRelease
```

### Nx Workspace Commands
```bash
# Run command on multiple projects
nx run-many --target=build --projects=web,backend
nx run-many --target=test --all

# Show dependency graph
nx graph

# Show affected projects (based on git changes)
nx affected:graph
nx affected:test
nx affected:build

# Clear Nx cache
nx reset

# Show project details
nx show project web
nx show project backend
```

## Architecture Patterns

### Angular Component Pattern (Standalone)
```typescript
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `...`,
  styles: [`...`]
})
export class ExampleComponent {
  private fb = inject(FormBuilder);
  private service = inject(ExampleService);

  // Use signals for reactive state
  loading = signal(false);
  data = signal<Data[]>([]);
}
```

### NestJS Service Pattern
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExampleService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.example.findMany();
  }
}
```

### State Management
- Use RxJS + Services for simple to moderate state
- Use NgRx for complex global state requirements
- Prefer signals (Angular 16+) for local component state

## Key Integrations

### SET (e-Kuatia) - Electronic Invoicing
- Protocol: SOAP/XML
- Authentication: SET User + Token
- Endpoints: /marangatu/enviarFactura, /marangatu/consultarFactura
- Use @nestjs/axios + xml2js for integration

### SIPAP - Bank Transfer Verification
- Integration with individual banks or Bancard verification
- May require manual confirmation + posterior validation

### Payment Gateways
- **Bancard**: REST API (https://vpos.infonet.com.py)
- **Pagopar**: REST API (https://api.pagopar.com)
- Implement webhooks for payment confirmations

### WhatsApp Business API
- Recommended: Twilio WhatsApp API
- Use for sending invoices and payment notifications

## Database Schema Overview

Located in `apps/backend/prisma/schema.prisma`. Key models:

- **User**: Authentication, roles (ADMIN, SELLER, CASHIER, VIEWER)
- **Customer**: CustomerType (INDIVIDUAL, BUSINESS), documentType/documentId (RUC, CI, Passport)
- **Product**: Catalog with code, price, cost, stock, taxRate (10% IVA default)
- **Sale**: saleNumber, status, subtotal, tax, discount, total, paymentMethod
- **SaleItem**: Sale line items with quantity, prices, taxes (Cascade delete with Sale)
- **Payment**: Links to Sale, tracks method, status, transactionId, processorResponse (Bancard/SIPAP)
- **Invoice**: Links to Sale, timbradoNumber, CDC, KUDE, QR, XML, SET response, PDF generation
- **AuditLog**: Entity-level audit trail (CREATE, UPDATE, DELETE actions)

**Enums**: PaymentMethod, PaymentStatus, CustomerType, UserRole, InvoiceStatus, SaleStatus

## Security

### Authentication
- JWT tokens (Access + Refresh)
- Access tokens in memory (not localStorage)
- Refresh tokens in HttpOnly cookies
- Use @nestjs/jwt

### Authorization
- NestJS Guards for route protection
- Roles: ADMIN, VENDEDOR, CONTADOR
- Granular permissions per resource

### Encryption
- Passwords: bcrypt (cost factor 12)
- Sensitive data: crypto (AES-256)
- TLS mandatory in production

### Rate Limiting
- Use @nestjs/throttler
- Auth: 5 attempts/15 min
- API: 100 requests/min per IP

## Testing Strategy

### Unit Tests
- Framework: Jest (both Angular and NestJS)
- Target: > 80% coverage
- Focus on services, guards, pipes

### E2E Tests
- Web: Playwright or Cypress
- Mobile: Appium or Detox
- API: Supertest

### Test Commands (Nx)
```bash
# Run all tests
pnpm test
nx run-many --target=test --all

# Run tests with coverage
nx test backend --coverage
nx run-many --target=test --all --coverage

# Run specific test file
nx test backend --testFile=sales.service.spec.ts

# Watch mode
nx test web --watch

# CI configuration (coverage + no watch)
nx test backend --configuration=ci
```

## Deployment

### Web (Angular)
- **Production**: Vercel (recommended, free tier available)
- **Alternative**: AWS S3 + CloudFront, Firebase Hosting, Netlify
- Build: `pnpm build:web` or `nx build web --configuration=production`
- Output: `dist/apps/web`

### Mobile (Ionic)
- **iOS**: Build → Xcode → App Store Connect
- **Android**: Build → Android Studio → Play Console
- See "Mobile-Specific (Ionic/Capacitor)" commands above

### Backend (NestJS)
- **Production**: AWS ECS Fargate, Railway.app, Render
- Build: `pnpm build:backend` or `nx build backend --configuration=production`
- Output: `dist/apps/backend`
- Database: AWS RDS PostgreSQL (Multi-AZ for production)
- Cache: AWS ElastiCache Redis
- Use Docker multi-stage builds (see docker-compose.yml as reference)

### CI/CD
- Platform: GitHub Actions (recommended)
- Workflow: Lint → Test → Build → Deploy
- Nx caching speeds up CI significantly
- Use `nx affected` commands to only test/build changed projects
- Environments: Development (local), Staging (AWS), Production (AWS)

## Code Quality

### Linting
- ESLint + Prettier configured workspace-wide
- Configuration: `.eslintrc.json` (root), `.prettierrc`
- Run: `pnpm lint` or `nx lint [project]`
- Auto-fix: `nx lint backend --fix`

### Formatting
- Prettier configuration in `.prettierrc`
- Format all: `pnpm format`
- Check only: `pnpm format:check`
- Nx formats: `nx format:write` or `nx format:check`

### Code Style
- Follow Angular Style Guide for Angular projects
- Use TypeScript strict mode (configured in tsconfig.base.json)
- Prefer composition over inheritance
- Use Conventional Commits for commit messages (feat:, fix:, docs:, etc.)

### Git Workflow
- Consider using Husky for pre-commit hooks
- Consider lint-staged for staged files
- Conventional Commits recommended: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`

## Performance Considerations

### Nx Optimization
- Nx caching automatically caches build/test/lint results
- Use `nx affected` commands in CI to only build/test changed projects
- Run `nx graph` to visualize project dependencies
- Use `nx reset` to clear cache if needed

### Frontend
- Use OnPush change detection strategy
- Implement virtual scrolling for long lists (Angular CDK)
- Lazy load feature modules/routes
- Optimize images and assets
- Use Angular signals for reactive state (Angular 16+)

### Backend
- Use Redis caching strategically
- Database indexes already configured in Prisma schema (@@index)
- Use Bull queues for background jobs (invoice submission, notifications)
- Prisma connection pooling configured automatically

## Offline Support

### Web (PWA)
- Service Workers via @angular/pwa
- Cache API responses and assets
- Sync queue for offline transactions

### Mobile
- SQLite for local storage
- Custom sync logic with PostgreSQL
- Queue pending operations for sync when online

## Development Environment

### Required Tools
- **Node.js 20 LTS** (enforced in package.json engines)
- **pnpm 8.x+** (enforced in package.json - DO NOT use npm or yarn)
- **Docker & Docker Compose** (for PostgreSQL and Redis)
- **Nx CLI** (optional global install): `pnpm add -g nx`
- Git

### Optional Global Tools (Not Required)
- Angular CLI: `pnpm add -g @angular/cli`
- Ionic CLI: `pnpm add -g @ionic/cli`
- NestJS CLI: `pnpm add -g @nestjs/cli`

Note: These are optional because Nx handles most operations. Use Nx commands instead.

### Recommended IDE
- VS Code

### VS Code Extensions
- **Nx Console** (essential for Nx monorepos)
- Angular Language Service
- Prettier - Code formatter
- ESLint
- Prisma
- Docker
- GitLens
- Ionic (for mobile development)

## Important Notes

### Nx Monorepo Workflow
- This is an Nx monorepo - always use `pnpm` and `nx` commands
- Each app has a `project.json` file defining its Nx targets (build, serve, test, lint)
- Use `nx graph` to understand project dependencies
- Use `nx affected` commands to only run tasks on changed projects
- Shared code goes in `libs/` directory
- TypeScript path mappings configured in `tsconfig.base.json`

### TypeScript Configuration
- Strict mode enabled in `tsconfig.base.json`
- All projects extend base config
- Path mappings for libs configured at workspace level

### Environment Variables

**Backend** (`apps/backend/.env`):
```env
# Application
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:4200

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pagopy_db?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=30d

# SET e-Kuatia
SET_API_URL=https://ekuatia.set.gov.py/api
SET_API_KEY=your-set-api-key
SET_API_SECRET=your-set-api-secret
SET_ENVIRONMENT=TEST
SET_TIMBRADO=your-timbrado-number
SET_RUC=your-business-ruc

# SIPAP
SIPAP_API_URL=https://api.sipap.gov.py
SIPAP_MERCHANT_ID=your-merchant-id
SIPAP_API_KEY=your-sipap-api-key

# Bancard
BANCARD_API_URL=https://vpos.infonet.com.py
BANCARD_PUBLIC_KEY=your-bancard-public-key
BANCARD_PRIVATE_KEY=your-bancard-private-key
BANCARD_ENVIRONMENT=STAGING

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+595981234567

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Storage
STORAGE_TYPE=LOCAL
STORAGE_PATH=./uploads
```

**Web** (`apps/web/.env`):
```env
# Backend API URL (Note: Uses VITE_ prefix for Angular with Vite)
VITE_API_URL=http://localhost:3000

# Environment
VITE_ENV=development
VITE_APP_NAME=PagoPy
VITE_DEBUG=true

# Feature Flags
VITE_FEATURE_OFFLINE_MODE=true
VITE_FEATURE_PWA=true
VITE_FEATURE_NOTIFICATIONS=true
```

**Template files**: See `apps/backend/.env.example` and `apps/web/.env.example` for complete configuration

**Docker defaults**:
- PostgreSQL: `postgres` / `postgres` / `pagopy_db`
- Redis: No password (localhost:6379)

### Component Communication (Angular)
- Parent → Child: `@Input()`
- Child → Parent: `@Output()` + EventEmitter
- Unrelated components: Service with `Subject`/`BehaviorSubject`
- Global state: Services or NgRx Store (if needed)
- Prefer signals (Angular 16+) for local component state

### RxJS Best Practices
- Always unsubscribe (use `async` pipe or `takeUntil`)
- Prefer `async` pipe in templates
- Use `shareReplay` for expensive observables
- Avoid nested subscriptions

### NestJS Best Practices
- Use DTOs with `class-validator` and `class-transformer`
- DTOs already created in `dto/` folders for modules
- Implement error handling with exception filters
- Use pipes for transformation
- Use guards for authorization (JWT strategy in `auth/strategies/`)
- Use interceptors for cross-cutting concerns
- PrismaService is in `src/prisma/` module

## Troubleshooting

### Common Issues

**Nx cache issues:**
- Clear cache: `nx reset`
- Rebuild all: `pnpm build`

**Angular app not loading:**
- Check console for errors
- Verify VITE_API_URL environment variable in `apps/web/.env`
- Check CORS configuration in backend (apps/backend/src/main.ts)
- Ensure backend is running: `pnpm dev:backend`

**Mobile app not building:**
- Run `npx cap sync` after code/dependency changes
- Check `capacitor.config.ts`
- Verify iOS/Android SDK installations
- For iOS: Check Xcode version
- For Android: Check Android Studio and SDK

**Backend connection issues:**
- Ensure Docker services are running: `pnpm docker:up` or `docker-compose ps`
- Verify PostgreSQL is accessible: `docker-compose logs postgres`
- Check `DATABASE_URL` in `apps/backend/.env`
- Run `pnpm prisma:generate` after schema changes
- Test connection: `pnpm prisma:studio`

**Prisma issues:**
- Regenerate client: `pnpm prisma:generate`
- Reset database: `cd apps/backend && npx prisma migrate reset`
- Check migrations: `cd apps/backend && npx prisma migrate status`

**Tests failing:**
- Clear Jest cache: `nx reset` (clears all Nx caches including Jest)
- Update snapshots: `nx test [project] -- -u`
- Check mock implementations
- Ensure test database is configured if needed

**pnpm install fails:**
- Delete `node_modules` and `pnpm-lock.yaml`
- Run `pnpm install` again
- Ensure Node.js 20 LTS is installed: `node --version`

**Module resolution issues:**
- Check `tsconfig.base.json` for path mappings
- Restart TypeScript server in IDE
- Rebuild: `nx build [project]`

**Services not starting:**
- Use health check: `./scripts/health-check.sh`
- Check logs in `logs/` directory
- Verify ports are not in use: `lsof -i :3000` / `lsof -i :4200`

## Resources

- [Nx Documentation](https://nx.dev) - **Essential for understanding monorepo commands**
- [Angular Documentation](https://angular.dev)
- [Ionic Documentation](https://ionicframework.com/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [RxJS Documentation](https://rxjs.dev)
- [Capacitor Documentation](https://capacitorjs.com)
- [pnpm Documentation](https://pnpm.io)
