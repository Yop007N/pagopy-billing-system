/**
 * Customer Model for Mobile App
 * Matches backend Prisma schema and API responses
 */

/**
 * Customer type enum matching Prisma schema
 */
export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS'
}

/**
 * Customer interface matching backend Prisma schema
 * Represents a customer with Paraguayan document requirements
 */
export interface Customer {
  id: string;
  type: CustomerType;
  documentType: string; // 'RUC', 'CI', 'Pasaporte'
  documentId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string; // Default: 'Paraguay'
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Mobile-specific optional fields
  taxId?: string; // RUC for businesses (alias for documentId when type is RUC)
  creditLimit?: number;
  notes?: string;

  // Offline sync fields
  _synced?: boolean;
  _localId?: string;
  _action?: 'create' | 'update' | 'delete';
}

/**
 * Data Transfer Object for creating a new customer
 */
export interface CreateCustomerDto {
  type: CustomerType;
  documentType: string;
  documentId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  creditLimit?: number;
  notes?: string;
}

/**
 * Data Transfer Object for updating customer information
 */
export interface UpdateCustomerDto {
  type?: CustomerType;
  documentType?: string;
  documentId?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  creditLimit?: number;
  notes?: string;
  isActive?: boolean;
}

/**
 * Search parameters for customer queries
 */
export interface CustomerSearchParams {
  search?: string;
  type?: CustomerType;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Paginated response for customer list
 */
export interface CustomerListResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Customer with sales statistics
 */
export interface CustomerWithStats extends Customer {
  totalPurchases?: number;
  totalSpent?: number;
  lastPurchaseDate?: Date | string;
  averageTicket?: number;
}
