# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Payment and Electronic Invoicing System** (Sistema de Gestión de Pagos y Facturación Electrónica) for Paraguayan SMEs, integrating with local services like SET (e-Kuatia), SIPAP, and payment gateways (Bancard/Pagopar).

## Technology Stack

### Frontend
- **Web**: Angular 17+ with Standalone Components
  - UI: Angular Material + Tailwind CSS
  - State: RxJS + Services (or NgRx for complex state)
  - Forms: Reactive Forms with validators
  - Offline: @angular/service-worker (PWA)
  - HTTP: HttpClient with interceptors

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
- **API Docs**: Swagger (OpenAPI)
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

### Monorepo Layout (Expected)
```
sistema-facturacion/
├── apps/
│   ├── web/                    # Angular Web App
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── core/       # Singleton services (auth, api, guards)
│   │   │   │   ├── shared/     # Shared components, directives, pipes
│   │   │   │   ├── features/   # Feature modules
│   │   │   │   │   ├── sales/
│   │   │   │   │   ├── invoices/
│   │   │   │   │   ├── payments/
│   │   │   │   │   ├── products/
│   │   │   │   │   └── reports/
│   │   │   │   ├── app.component.ts
│   │   │   │   ├── app.config.ts
│   │   │   │   └── app.routes.ts
│   │   │   └── main.ts
│   │   └── angular.json
│   │
│   ├── mobile/                 # Ionic + Angular App
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── pages/
│   │   │   │   ├── shared/     # Code shared with web
│   │   │   │   └── app.routes.ts
│   │   │   └── main.ts
│   │   ├── capacitor.config.ts
│   │   └── ionic.config.json
│   │
│   └── backend/                # NestJS API
│       ├── src/
│       │   ├── auth/           # JWT authentication
│       │   ├── users/
│       │   ├── sales/
│       │   ├── invoices/       # SET integration (e-Kuatia)
│       │   ├── payments/       # SIPAP, Bancard, Pagopar
│       │   ├── products/
│       │   ├── customers/
│       │   ├── reports/
│       │   ├── notifications/  # WhatsApp, Email, SMS
│       │   ├── webhooks/
│       │   └── common/
│       ├── prisma/
│       │   └── schema.prisma
│       └── main.ts
│
└── libs/                       # Shared libraries (if using Nx)
    └── shared-data-models/     # TypeScript interfaces shared across apps
```

## Common Development Commands

### Web Application (Angular)
```bash
# Install dependencies
npm install

# Start development server
ng serve
# or
npm run start

# Build for production
ng build --configuration=production

# Run tests
ng test

# Run e2e tests
ng e2e

# Generate component (standalone)
ng generate component features/[feature]/[name] --standalone

# Generate service
ng generate service core/api/[name]

# Generate guard
ng generate guard core/guards/[name]

# Add Angular Material
ng add @angular/material

# Add PWA support
ng add @angular/pwa

# Lint
ng lint
```

### Mobile Application (Ionic)
```bash
# Install dependencies
npm install

# Start development with live reload
ionic serve

# Build for production
ionic build --prod

# Sync Capacitor
npx cap sync

# Run on iOS simulator
ionic capacitor run ios

# Run on Android emulator
ionic capacitor run android

# Build iOS
ionic capacitor build ios --prod

# Build Android
ionic capacitor build android --prod

# Open in Xcode (for iOS)
npx cap open ios

# Open in Android Studio
npx cap open android

# Generate APK
cd android && ./gradlew assembleRelease
```

### Backend (NestJS)
```bash
# Install dependencies
npm install

# Start development
npm run start:dev

# Build
npm run build

# Start production
npm run start:prod

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Run test coverage
npm run test:cov

# Generate resource (CRUD)
nest generate resource [name]

# Generate service
nest generate service [name]

# Generate module
nest generate module [name]

# Prisma commands
npx prisma migrate dev --name [migration-name]
npx prisma generate
npx prisma studio
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

Key models in Prisma schema:
- **User**: Authentication, RUC, timbrado
- **Sale**: Transactions with items, totals, payment info
- **Invoice**: Electronic invoice with SET reference
- **Customer**: Business/Consumer customer data
- **Product**: Product catalog
- **Payment**: Payment tracking and reconciliation

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
- Web: Playwright
- Mobile: Detox (for React Native) or Appium
- API: Supertest

### Test Commands
```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run e2e
npm run test:e2e
```

## Deployment

### Web (Angular)
- **Production**: Vercel (recommended, free tier available)
- **Alternative**: AWS S3 + CloudFront, Firebase Hosting, Netlify
- Build: `ng build --configuration=production`
- Output: `dist/web/browser/`

### Mobile (Ionic)
- **iOS**: Build → Xcode → App Store
- **Android**: Build → Android Studio → Play Store
- Commands in "Common Development Commands" section above

### Backend (NestJS)
- **Production**: AWS ECS Fargate
- **Alternative**: Railway.app, Render
- Use Docker multi-stage builds
- Database: AWS RDS PostgreSQL (Multi-AZ for production)
- Cache: AWS ElastiCache Redis

### CI/CD
- Platform: GitHub Actions
- Workflow: Test → Build → Deploy
- Environments: Development (local), Staging (AWS), Production (AWS)

## Code Quality

### Linting
- ESLint + Prettier
- Angular ESLint: `@angular-eslint/schematics`
- Run: `ng lint` or `npm run lint`

### Git Hooks
- Husky for pre-commit hooks
- lint-staged for staged files
- Conventional Commits for commit messages

### Code Style
- Use Prettier for formatting
- Follow Angular Style Guide
- Use TypeScript strict mode
- Prefer composition over inheritance

## Performance Considerations

### Frontend
- Use OnPush change detection strategy
- Implement virtual scrolling for long lists
- Lazy load feature modules
- Optimize images and assets
- Use Angular CDK for complex UI components

### Backend
- Use Redis caching strategically
- Implement database indexes on frequently queried fields
- Use Bull queues for background jobs (invoice submission, notifications)
- Connection pooling for database

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
- Node.js 20 LTS
- npm or pnpm (pnpm recommended for speed)
- Angular CLI: `npm install -g @angular/cli`
- Ionic CLI: `npm install -g @ionic/cli`
- NestJS CLI: `npm install -g @nestjs/cli`
- Docker & Docker Compose (for local PostgreSQL/Redis)
- VS Code (recommended IDE)

### VS Code Extensions
- Angular Language Service
- Prettier
- ESLint
- Prisma
- Docker
- GitLens

## Important Notes

### TypeScript Configuration
- Use strict mode in all projects
- Enable `strictNullChecks`, `strictPropertyInitialization`
- Share common tsconfig settings

### Environment Variables
- Never commit `.env` files
- Use `.env.example` as template
- Manage secrets with AWS Secrets Manager or similar

### Component Communication
- Parent → Child: @Input()
- Child → Parent: @Output() + EventEmitter
- Unrelated components: Service with Subject/BehaviorSubject
- Global state: NgRx Store (if needed)

### RxJS Best Practices
- Always unsubscribe (use async pipe or takeUntil)
- Prefer async pipe in templates
- Use shareReplay for expensive observables
- Avoid nested subscriptions

### NestJS Best Practices
- Use DTOs for validation (class-validator)
- Implement proper error handling with exception filters
- Use pipes for transformation
- Use guards for authorization
- Use interceptors for cross-cutting concerns

## Troubleshooting

### Common Issues

**Angular app not loading:**
- Check console for errors
- Verify API_URL environment variable
- Check CORS configuration in backend

**Mobile app not building:**
- Run `npx cap sync` after code changes
- Check Capacitor configuration
- Verify iOS/Android SDK installations

**Backend connection issues:**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Run `npx prisma generate`

**Tests failing:**
- Clear Jest cache: `jest --clearCache`
- Update snapshots: `npm test -- -u`
- Check mock implementations

## Resources

- [Angular Documentation](https://angular.dev)
- [Ionic Documentation](https://ionicframework.com/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [RxJS Documentation](https://rxjs.dev)
- [Capacitor Documentation](https://capacitorjs.com)
