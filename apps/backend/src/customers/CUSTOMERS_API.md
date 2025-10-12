# Customers Module - API Documentation

## Overview

The Customers module provides complete CRUD operations for managing customers in the PagoPy system. It supports both individual (INDIVIDUAL) and business (BUSINESS) customers with document validation for RUC, CI, and Passport types.

## Files Created/Modified

### DTOs
- `apps/backend/src/customers/dto/create-customer.dto.ts` - Create customer validation
- `apps/backend/src/customers/dto/update-customer.dto.ts` - Update customer validation
- `apps/backend/src/customers/dto/index.ts` - DTO exports

### Core Files
- `apps/backend/src/customers/customers.service.ts` - Business logic implementation
- `apps/backend/src/customers/customers.controller.ts` - REST API endpoints
- `apps/backend/src/customers/customers.module.ts` - Module configuration (no changes needed, PrismaModule is global)

## Features Implemented

### Service Methods
1. **create(createCustomerDto)** - Create new customer with document uniqueness validation
2. **findAll(filters)** - Get all customers with pagination, search, and filters
3. **findOne(id)** - Get customer by ID with recent sales
4. **findByDocument(documentId)** - Get customer by document ID
5. **update(id, updateCustomerDto)** - Update customer with validation
6. **remove(id)** - Soft delete (deactivate) customer
7. **restore(id)** - Restore deactivated customer
8. **getStats()** - Get customer statistics

### Validations
- Document ID uniqueness (RUC, CI, Passport)
- Email uniqueness (optional field)
- Customer type: INDIVIDUAL or BUSINESS
- Document type: RUC, CI, or PASSPORT
- Email format validation
- Phone number format validation
- Name length validation (2-200 characters)

## API Endpoints

All endpoints require JWT authentication (Bearer token).

### 1. Create Customer
**POST** `/customers`

**Request Body:**
```json
{
  "type": "INDIVIDUAL",
  "documentType": "CI",
  "documentId": "4567890-1",
  "name": "Juan Pérez",
  "email": "juan.perez@example.com",
  "phone": "+595981234567",
  "address": "Av. Mariscal López 1234, Asunción",
  "city": "Asunción",
  "country": "Paraguay"
}
```

**Response (201):**
```json
{
  "message": "Customer created successfully",
  "data": {
    "id": "clxxx1234567890",
    "type": "INDIVIDUAL",
    "documentType": "CI",
    "documentId": "4567890-1",
    "name": "Juan Pérez",
    "email": "juan.perez@example.com",
    "phone": "+595981234567",
    "address": "Av. Mariscal López 1234, Asunción",
    "city": "Asunción",
    "country": "Paraguay",
    "isActive": true,
    "createdAt": "2025-10-11T12:00:00.000Z",
    "updatedAt": "2025-10-11T12:00:00.000Z"
  }
}
```

**Error Responses:**
- **400** - Invalid data
- **409** - Customer with this document ID already exists
- **401** - Unauthorized

---

### 2. Get All Customers (with pagination and filters)
**GET** `/customers?page=1&limit=50&search=Juan&type=INDIVIDUAL&isActive=true`

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 50, max: 100) - Items per page
- `search` (optional) - Search by name, document ID, email, or phone
- `type` (optional) - Filter by INDIVIDUAL or BUSINESS
- `isActive` (optional, default: true) - Filter by active status

**Response (200):**
```json
{
  "data": [
    {
      "id": "clxxx1234567890",
      "type": "INDIVIDUAL",
      "documentType": "CI",
      "documentId": "4567890-1",
      "name": "Juan Pérez",
      "email": "juan.perez@example.com",
      "phone": "+595981234567",
      "address": "Av. Mariscal López 1234, Asunción",
      "city": "Asunción",
      "country": "Paraguay",
      "isActive": true,
      "createdAt": "2025-10-11T12:00:00.000Z",
      "updatedAt": "2025-10-11T12:00:00.000Z",
      "_count": {
        "sales": 15
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "totalPages": 3
  }
}
```

---

### 3. Get Customer Statistics
**GET** `/customers/stats`

**Response (200):**
```json
{
  "data": {
    "total": 250,
    "active": 235,
    "inactive": 15,
    "byType": {
      "individual": 180,
      "business": 70
    }
  }
}
```

---

### 4. Get Customer by Document ID
**GET** `/customers/document/:documentId`

**Example:** `/customers/document/4567890-1`

**Response (200):**
```json
{
  "data": {
    "id": "clxxx1234567890",
    "type": "INDIVIDUAL",
    "documentType": "CI",
    "documentId": "4567890-1",
    "name": "Juan Pérez",
    "email": "juan.perez@example.com",
    "phone": "+595981234567",
    "address": "Av. Mariscal López 1234, Asunción",
    "city": "Asunción",
    "country": "Paraguay",
    "isActive": true,
    "createdAt": "2025-10-11T12:00:00.000Z",
    "updatedAt": "2025-10-11T12:00:00.000Z",
    "_count": {
      "sales": 15
    }
  }
}
```

**Error Responses:**
- **404** - Customer not found

---

### 5. Get Customer by ID
**GET** `/customers/:id`

**Response (200):**
```json
{
  "data": {
    "id": "clxxx1234567890",
    "type": "INDIVIDUAL",
    "documentType": "CI",
    "documentId": "4567890-1",
    "name": "Juan Pérez",
    "email": "juan.perez@example.com",
    "phone": "+595981234567",
    "address": "Av. Mariscal López 1234, Asunción",
    "city": "Asunción",
    "country": "Paraguay",
    "isActive": true,
    "createdAt": "2025-10-11T12:00:00.000Z",
    "updatedAt": "2025-10-11T12:00:00.000Z",
    "sales": [
      {
        "id": "clyyy1234567890",
        "saleNumber": "VE-2025-001",
        "total": "150000",
        "status": "COMPLETED",
        "saleDate": "2025-10-10T15:30:00.000Z"
      }
    ],
    "_count": {
      "sales": 15
    }
  }
}
```

**Error Responses:**
- **404** - Customer not found

---

### 6. Update Customer
**PUT** `/customers/:id`

**Request Body (all fields optional):**
```json
{
  "name": "Juan Carlos Pérez",
  "email": "jc.perez@example.com",
  "phone": "+595981234568",
  "address": "Nueva dirección 5678",
  "city": "Fernando de la Mora",
  "isActive": true
}
```

**Response (200):**
```json
{
  "message": "Customer updated successfully",
  "data": {
    "id": "clxxx1234567890",
    "type": "INDIVIDUAL",
    "documentType": "CI",
    "documentId": "4567890-1",
    "name": "Juan Carlos Pérez",
    "email": "jc.perez@example.com",
    "phone": "+595981234568",
    "address": "Nueva dirección 5678",
    "city": "Fernando de la Mora",
    "country": "Paraguay",
    "isActive": true,
    "createdAt": "2025-10-11T12:00:00.000Z",
    "updatedAt": "2025-10-11T13:30:00.000Z"
  }
}
```

**Error Responses:**
- **404** - Customer not found
- **400** - Invalid data
- **409** - Document ID or email already exists

---

### 7. Delete Customer (Soft Delete)
**DELETE** `/customers/:id`

**Response (200):**
```json
{
  "message": "Customer deactivated successfully",
  "data": {
    "id": "clxxx1234567890",
    "isActive": false,
    ...
  }
}
```

**Error Responses:**
- **404** - Customer not found

---

### 8. Restore Customer
**PATCH** `/customers/:id/restore`

**Response (200):**
```json
{
  "message": "Customer restored successfully",
  "data": {
    "id": "clxxx1234567890",
    "isActive": true,
    ...
  }
}
```

**Error Responses:**
- **404** - Customer not found
- **400** - Customer is already active

---

## Usage Examples

### cURL Examples

#### Create Customer
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INDIVIDUAL",
    "documentType": "CI",
    "documentId": "4567890-1",
    "name": "Juan Pérez",
    "email": "juan.perez@example.com",
    "phone": "+595981234567",
    "city": "Asunción"
  }'
```

#### Get All Customers
```bash
curl -X GET "http://localhost:3000/api/customers?page=1&limit=20&search=Juan" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Customer by ID
```bash
curl -X GET http://localhost:3000/api/customers/clxxx1234567890 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update Customer
```bash
curl -X PUT http://localhost:3000/api/customers/clxxx1234567890 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Carlos Pérez",
    "phone": "+595981234568"
  }'
```

#### Delete Customer
```bash
curl -X DELETE http://localhost:3000/api/customers/clxxx1234567890 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Validation Rules

### Required Fields
- `type` (INDIVIDUAL or BUSINESS)
- `documentType` (string, max 20 chars)
- `documentId` (string, 3-50 chars, must be unique)
- `name` (string, 2-200 chars)

### Optional Fields
- `email` (valid email format, max 100 chars)
- `phone` (string, max 20 chars, only digits, spaces, +, -, (, ))
- `address` (string, max 500 chars)
- `city` (string, max 100 chars)
- `country` (string, max 100 chars, default: "Paraguay")

### Uniqueness Constraints
- `documentId` must be unique across all customers
- `email` must be unique among active customers (if provided)

---

## Error Handling

The API returns standard HTTP status codes:

- **200** - Success
- **201** - Created
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (missing or invalid JWT)
- **404** - Not Found
- **409** - Conflict (duplicate document ID or email)
- **500** - Internal Server Error

Error response format:
```json
{
  "statusCode": 409,
  "message": "Customer with document ID 4567890-1 already exists",
  "error": "Conflict"
}
```

---

## Integration with Other Modules

The Customers module integrates with:
- **Sales Module** - Customers are linked to sales transactions
- **Invoices Module** - Customer information is used for invoice generation
- **Auth Module** - All endpoints are protected with JWT authentication

---

## Next Steps

To use this module:

1. Ensure the backend server is running
2. Obtain a JWT token via the `/auth/login` endpoint
3. Use the token in the Authorization header for all requests
4. The Swagger documentation is available at `http://localhost:3000/api` (when server is running)

---

## Testing

Example test scenarios:

1. **Create a customer** with valid data
2. **Try to create a duplicate** with the same documentId (should fail with 409)
3. **Search for customers** by name or document ID
4. **Filter customers** by type (INDIVIDUAL/BUSINESS)
5. **Update customer** information
6. **Soft delete** and then **restore** a customer
7. **Get statistics** to verify counts

---

## Notes

- All endpoints require JWT authentication
- The module uses soft delete (isActive flag) instead of hard deletes
- Pagination defaults to 50 items per page with a maximum of 100
- Search is case-insensitive and searches across name, documentId, email, and phone
- The `findOne` endpoint includes the last 10 sales for the customer
