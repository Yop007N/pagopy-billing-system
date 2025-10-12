/**
 * Payment Model for Mobile App
 * Matches backend Prisma schema with mobile-specific extensions
 */

import { PaymentMethod, PaymentStatus } from './sale.model';

/**
 * Payment interface matching backend Prisma schema
 * Represents a payment transaction for a sale
 */
export interface Payment {
  id: string;
  amount: number; // Decimal in DB, number in TypeScript
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  transactionData?: Record<string, any>; // Metadata from payment gateway
  bankReference?: string;
  processorResponse?: Record<string, any>; // Response from Bancard/SIPAP
  paidAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Foreign keys
  saleId: string;

  // Relations
  sale?: {
    id: string;
    saleNumber: string;
    total: number;
    status: string;
  };

  // Offline sync fields
  _synced?: boolean;
  _localId?: string;
}

/**
 * Data Transfer Object for creating a new payment
 */
export interface CreatePaymentDto {
  saleId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  transactionData?: Record<string, any>;
  bankReference?: string;
}

/**
 * Data Transfer Object for updating payment information
 */
export interface UpdatePaymentDto {
  status?: PaymentStatus;
  transactionId?: string;
  transactionData?: Record<string, any>;
  bankReference?: string;
  processorResponse?: Record<string, any>;
  paidAt?: Date | string;
}

/**
 * Payment processor response (Bancard/SIPAP)
 */
export interface PaymentProcessorResponse {
  success: boolean;
  transactionId: string;
  status: PaymentStatus;
  message: string;
  authorizationCode?: string;
  timestamp: Date | string;
  processorData?: Record<string, any>;
}

/**
 * Bancard-specific payment data
 */
export interface BancardPaymentData {
  shopProcessId: string;
  publicKey: string;
  privateKey?: string;
  returnUrl?: string;
  cancelUrl?: string;
  amount: number;
  currency?: string; // Default: 'PYG'
  description?: string;
  buyerEmail?: string;
  buyerPhone?: string;
}

/**
 * SIPAP-specific payment data
 */
export interface SipapPaymentData {
  merchantId: string;
  terminalId?: string;
  amount: number;
  currency?: string; // Default: 'PYG'
  reference: string;
  description?: string;
  customerDocument?: string;
  customerName?: string;
}

/**
 * QR payment data
 */
export interface QrPaymentData {
  qrCode: string;
  provider: 'BANCARD' | 'SIPAP' | 'PAGOPAR' | 'OTHER';
  amount: number;
  reference: string;
  expiresAt?: Date | string;
}

/**
 * Payment verification request
 */
export interface VerifyPaymentDto {
  transactionId: string;
  method: PaymentMethod;
  provider?: string;
}

/**
 * Payment search parameters
 */
export interface PaymentSearchParams {
  saleId?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  transactionId?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'paidAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response for payment list
 */
export interface PaymentListResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Payment statistics
 */
export interface PaymentStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  refunded: number;
  totalAmount: number;
  completedAmount: number;
  byMethod: {
    [key in PaymentMethod]?: {
      count: number;
      amount: number;
    };
  };
}

/**
 * Daily payment statistics
 */
export interface DailyPaymentStats {
  date: string;
  totalPayments: number;
  totalAmount: number;
  completedPayments: number;
  completedAmount: number;
  failedPayments: number;
}

/**
 * Payment refund request
 */
export interface RefundPaymentDto {
  paymentId: string;
  amount?: number; // If partial refund
  reason: string;
  requestedBy?: string;
}

/**
 * Payment refund response
 */
export interface RefundPaymentResponse {
  success: boolean;
  refundId: string;
  originalPaymentId: string;
  refundedAmount: number;
  message: string;
  processorResponse?: Record<string, any>;
}

/**
 * Helper class for payment operations
 */
export class PaymentHelper {
  /**
   * Format payment amount for display (Paraguayan Guaraníes)
   */
  static formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Get payment method display name
   */
  static getMethodDisplayName(method: PaymentMethod): string {
    const names: Record<PaymentMethod, string> = {
      [PaymentMethod.CASH]: 'Efectivo',
      [PaymentMethod.CARD]: 'Tarjeta',
      [PaymentMethod.TRANSFER]: 'Transferencia',
      [PaymentMethod.QR]: 'Código QR',
      [PaymentMethod.BANCARD]: 'Bancard',
      [PaymentMethod.SIPAP]: 'SIPAP'
    };
    return names[method] || method;
  }

  /**
   * Get payment status display name
   */
  static getStatusDisplayName(status: PaymentStatus): string {
    const names: Record<PaymentStatus, string> = {
      [PaymentStatus.PENDING]: 'Pendiente',
      [PaymentStatus.PROCESSING]: 'Procesando',
      [PaymentStatus.COMPLETED]: 'Completado',
      [PaymentStatus.FAILED]: 'Fallido',
      [PaymentStatus.REFUNDED]: 'Reembolsado'
    };
    return names[status] || status;
  }

  /**
   * Get payment status color for UI
   */
  static getStatusColor(status: PaymentStatus): string {
    const colors: Record<PaymentStatus, string> = {
      [PaymentStatus.PENDING]: 'warning',
      [PaymentStatus.PROCESSING]: 'primary',
      [PaymentStatus.COMPLETED]: 'success',
      [PaymentStatus.FAILED]: 'danger',
      [PaymentStatus.REFUNDED]: 'medium'
    };
    return colors[status] || 'medium';
  }

  /**
   * Check if payment requires online processing
   */
  static requiresOnlineProcessing(method: PaymentMethod): boolean {
    return [
      PaymentMethod.CARD,
      PaymentMethod.BANCARD,
      PaymentMethod.SIPAP,
      PaymentMethod.QR
    ].includes(method);
  }

  /**
   * Check if payment can be refunded
   */
  static canBeRefunded(payment: Payment): boolean {
    return payment.status === PaymentStatus.COMPLETED &&
           payment.paidAt !== undefined;
  }

  /**
   * Generate payment reference number
   */
  static generateReference(prefix = 'PAY'): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}
