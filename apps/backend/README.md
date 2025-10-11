# Backend - Sistema de Facturación PagoPy

Backend API for electronic invoicing system for Paraguay.

## Technology Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **Integrations**:
  - SET e-Kuatia (Electronic Invoicing)
  - SIPAP (Mobile Payments)
  - Bancard (Card Payments)
  - Twilio (SMS/WhatsApp)

## Project Structure

```
src/
├── auth/              # Authentication & Authorization
├── users/             # User management
├── sales/             # Sales management
├── invoices/          # Electronic invoices (SET integration)
├── payments/          # Payment processing (Bancard/SIPAP)
├── products/          # Product catalog
├── customers/         # Customer management
├── reports/           # Reports & analytics
├── notifications/     # Email/SMS/WhatsApp notifications
├── webhooks/          # Payment gateway webhooks
├── common/            # Shared utilities
│   ├── decorators/    # Custom decorators
│   ├── filters/       # Exception filters
│   ├── guards/        # Auth guards
│   ├── interceptors/  # Request/response interceptors
│   └── pipes/         # Validation pipes
├── app.module.ts
└── main.ts
```

## Setup Instructions

### 1. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Configure the following variables:
- Database connection (PostgreSQL)
- JWT secrets
- SET credentials
- Payment gateway credentials (Bancard/SIPAP)
- Twilio credentials
- SMTP settings

### 2. Database Setup

Run Prisma migrations:

```bash
pnpm prisma migrate dev
```

Generate Prisma client:

```bash
pnpm prisma generate
```

### 3. Run Development Server

```bash
pnpm nx serve backend
```

The API will be available at `http://localhost:3000`

Swagger documentation: `http://localhost:3000/api/docs`

## Available Scripts

- `pnpm nx serve backend` - Start development server
- `pnpm nx build backend` - Build for production
- `pnpm nx test backend` - Run unit tests
- `pnpm nx lint backend` - Lint code
- `pnpm prisma studio` - Open Prisma Studio (database GUI)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token

### Sales
- `GET /api/sales` - List sales
- `POST /api/sales` - Create sale
- `GET /api/sales/:id` - Get sale details
- `POST /api/sales/:id/complete` - Complete sale

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Generate invoice
- `POST /api/invoices/:id/send-to-set` - Send to SET
- `GET /api/invoices/:id/pdf` - Download PDF

### Payments
- `POST /api/payments/process` - Process payment
- `GET /api/payments/:id` - Get payment status
- `POST /api/payments/:id/refund` - Refund payment

## Integrations

### SET e-Kuatia
Electronic invoicing system required by Paraguay tax authority.

Configuration in `.env`:
```
SET_API_URL=https://ekuatia.set.gov.py/api
SET_API_KEY=your-api-key
SET_TIMBRADO=your-timbrado-number
```

### Bancard
Credit/debit card payment gateway.

Configuration in `.env`:
```
BANCARD_API_URL=https://vpos.infonet.com.py
BANCARD_PUBLIC_KEY=your-public-key
BANCARD_PRIVATE_KEY=your-private-key
```

### SIPAP
Mobile payment system for Paraguay.

Configuration in `.env`:
```
SIPAP_API_URL=https://api.sipap.gov.py
SIPAP_MERCHANT_ID=your-merchant-id
SIPAP_API_KEY=your-api-key
```

## Security

- JWT authentication for all protected routes
- Rate limiting (100 requests/minute)
- Input validation with class-validator
- CORS enabled for frontend
- Webhook signature verification

## Database Schema

Key entities:
- **User**: System users with roles
- **Customer**: Business/individual customers
- **Product**: Product catalog
- **Sale**: Sales transactions
- **SaleItem**: Sale line items
- **Payment**: Payment records
- **Invoice**: Electronic invoices
- **AuditLog**: Audit trail

## Development Guidelines

1. All API endpoints must have Swagger documentation
2. Use DTOs for request/response validation
3. Implement proper error handling
4. Write unit tests for services
5. Follow NestJS best practices
6. Use Prisma for database operations

## License

Proprietary - PagoPy
