/**
 * Sale Model for Mobile App
 * Matches backend Prisma schema with mobile-specific extensions
 */

/**
 * Payment method enum matching Prisma schema
 */
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  QR = 'QR',
  BANCARD = 'BANCARD',
  SIPAP = 'SIPAP'
}

/**
 * Payment status enum matching Prisma schema
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

/**
 * Sale status enum matching Prisma schema
 */
export enum SaleStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

/**
 * Sale Item interface matching backend Prisma schema
 * Represents a line item in a sale
 */
export interface SaleItem {
  id: string;
  quantity: number;
  unitPrice: number; // Decimal in DB, number in TypeScript
  taxRate: number; // Decimal in DB, number in TypeScript
  subtotal: number; // Decimal in DB, number in TypeScript
  tax: number; // Decimal in DB, number in TypeScript
  total: number; // Decimal in DB, number in TypeScript
  createdAt: Date | string;
  updatedAt: Date | string;

  // Foreign keys
  saleId: string;
  productId: string;

  // Relations
  product?: {
    id: string;
    code: string;
    name: string;
    description?: string;
    price: number;
    taxRate: number;
  };
}

/**
 * Sale interface matching backend Prisma schema
 * Represents a complete sale transaction
 */
export interface Sale {
  id: string;
  saleNumber: string;
  status: SaleStatus;
  subtotal: number; // Decimal in DB, number in TypeScript
  tax: number; // Decimal in DB, number in TypeScript
  discount: number; // Decimal in DB, number in TypeScript, default: 0
  total: number; // Decimal in DB, number in TypeScript
  paymentMethod: PaymentMethod;
  notes?: string;
  saleDate: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Foreign keys
  userId: string;
  customerId?: string;

  // Relations
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    razonSocial: string;
  };
  customer?: {
    id: string;
    name: string;
    documentType: string;
    documentId: string;
    email?: string;
    phone?: string;
  };
  items?: SaleItem[];
  payment?: {
    id: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    createdAt: Date | string;
  };
  invoice?: {
    id: string;
    invoiceNumber: string;
    status: string;
    timbradoNumber?: string;
    cdc?: string;
    pdfUrl?: string;
  };

  // Offline sync fields
  _synced?: boolean;
  _localId?: string;
  _action?: 'create' | 'update' | 'delete';
}

/**
 * Data Transfer Object for creating a new sale item
 */
export interface CreateSaleItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

/**
 * Data Transfer Object for creating a new sale
 */
export interface CreateSaleDto {
  items: CreateSaleItemDto[];
  paymentMethod: PaymentMethod;
  customerId?: string;
  discount?: number;
  notes?: string;
  saleDate?: Date | string;
}

/**
 * Data Transfer Object for updating sale information
 */
export interface UpdateSaleDto {
  status?: SaleStatus;
  discount?: number;
  notes?: string;
  paymentMethod?: PaymentMethod;
}

/**
 * Sale with calculated fields for display
 */
export interface SaleWithCalculations extends Sale {
  itemCount: number;
  customerName?: string;
  hasPendingPayment: boolean;
  hasInvoice: boolean;
}

/**
 * Sales summary statistics
 */
export interface SalesSummary {
  today: {
    count: number;
    total: number;
  };
  week: {
    count: number;
    total: number;
  };
  month: {
    count: number;
    total: number;
  };
  allTime: {
    count: number;
    total: number;
  };
}

/**
 * Daily sales statistics
 */
export interface DailySalesStats {
  date: string;
  count: number;
  total: number;
  avgTicket: number;
}

/**
 * Search parameters for sale queries
 */
export interface SaleSearchParams {
  search?: string;
  status?: SaleStatus;
  paymentMethod?: PaymentMethod;
  customerId?: string;
  userId?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortBy?: 'saleNumber' | 'saleDate' | 'total' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response for sale list
 */
export interface SaleListResponse {
  sales: Sale[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Sale details with full relations
 */
export interface SaleDetails extends Sale {
  items: SaleItem[];
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    razonSocial: string;
    ruc: string;
    timbrado: string;
  };
  customer?: {
    id: string;
    name: string;
    documentType: string;
    documentId: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  payment?: {
    id: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    bankReference?: string;
    paidAt?: Date | string;
  };
  invoice?: {
    id: string;
    invoiceNumber: string;
    status: string;
    timbradoNumber?: string;
    cdc?: string;
    kude?: string;
    qrCode?: string;
    pdfUrl?: string;
    setApprovedAt?: Date | string;
  };
}

/**
 * Sale creation response
 */
export interface SaleCreateResponse {
  sale: Sale;
  saleNumber: string;
  message: string;
}

/**
 * Helper functions for sale calculations
 */
export class SaleCalculations {
  /**
   * Calculate subtotal from items
   */
  static calculateSubtotal(items: CreateSaleItemDto[]): number {
    return items.reduce((sum, item) => {
      return sum + (item.unitPrice * item.quantity);
    }, 0);
  }

  /**
   * Calculate total tax from items
   */
  static calculateTax(items: CreateSaleItemDto[]): number {
    return items.reduce((sum, item) => {
      const itemSubtotal = item.unitPrice * item.quantity;
      const itemTax = itemSubtotal * (item.taxRate / 100);
      return sum + itemTax;
    }, 0);
  }

  /**
   * Calculate total from subtotal, tax, and discount
   */
  static calculateTotal(subtotal: number, tax: number, discount = 0): number {
    return subtotal + tax - discount;
  }

  /**
   * Calculate item subtotal
   */
  static calculateItemSubtotal(quantity: number, unitPrice: number): number {
    return quantity * unitPrice;
  }

  /**
   * Calculate item tax
   */
  static calculateItemTax(subtotal: number, taxRate: number): number {
    return subtotal * (taxRate / 100);
  }

  /**
   * Calculate item total
   */
  static calculateItemTotal(subtotal: number, tax: number): number {
    return subtotal + tax;
  }

  /**
   * Format currency for display (Paraguayan Guaraníes)
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Round to 2 decimal places
   */
  static roundToTwo(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }
}
