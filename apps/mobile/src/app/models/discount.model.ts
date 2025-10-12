/**
 * Discount and Promotions models for mobile app
 * Includes coupons, promotions, and discount conditions
 */

/**
 * Discount types
 */
export enum DiscountType {
  PERCENTAGE = 'percentage',        // Percentage discount (e.g., 10% off)
  FIXED_AMOUNT = 'fixed_amount',    // Fixed amount off (e.g., 10,000 Gs off)
  BUY_X_GET_Y = 'buy_x_get_y',      // Buy X get Y free (e.g., 2x1, 3x2)
  FREE_SHIPPING = 'free_shipping'   // Free shipping/delivery
}

/**
 * Discount status
 */
export enum DiscountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  SCHEDULED = 'scheduled'
}

/**
 * Discount applicability
 */
export enum DiscountApplicability {
  ALL_PRODUCTS = 'all_products',
  SPECIFIC_PRODUCTS = 'specific_products',
  SPECIFIC_CATEGORIES = 'specific_categories',
  MINIMUM_PURCHASE = 'minimum_purchase',
  SPECIFIC_CUSTOMERS = 'specific_customers'
}

/**
 * Discount condition interface
 */
export interface DiscountCondition {
  type: DiscountApplicability;
  value: any; // Can be product IDs, category IDs, minimum amount, customer IDs
  label?: string; // Human-readable description
}

/**
 * Main Discount interface
 */
export interface Discount {
  id: string;
  userId: string;
  name: string;
  description?: string;
  code?: string; // Optional coupon code
  type: DiscountType;
  value: number; // Percentage (0-100) or fixed amount in Gs
  status: DiscountStatus;

  // Applicability
  applicability: DiscountApplicability;
  conditions: DiscountCondition[];

  // For Buy X Get Y
  buyQuantity?: number; // Buy X
  getQuantity?: number; // Get Y free

  // Limits
  minimumPurchaseAmount?: number; // Minimum purchase to apply discount
  maximumDiscountAmount?: number; // Maximum discount amount (for percentage discounts)
  usageLimit?: number; // Total usage limit (null = unlimited)
  usageLimitPerCustomer?: number; // Per customer limit
  currentUsageCount: number; // Current usage count

  // Date restrictions
  startDate: Date | string;
  endDate?: Date | string; // null = no end date

  // Metadata
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Offline-specific fields
  localId?: string;
  synced?: boolean;
  lastSyncedAt?: Date | string;
}

/**
 * Create discount DTO
 */
export interface CreateDiscountDto {
  name: string;
  description?: string;
  code?: string;
  type: DiscountType;
  value: number;
  applicability: DiscountApplicability;
  conditions?: DiscountCondition[];
  buyQuantity?: number;
  getQuantity?: number;
  minimumPurchaseAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  startDate: Date | string;
  endDate?: Date | string;
  isActive?: boolean;
}

/**
 * Update discount DTO
 */
export interface UpdateDiscountDto {
  name?: string;
  description?: string;
  code?: string;
  type?: DiscountType;
  value?: number;
  applicability?: DiscountApplicability;
  conditions?: DiscountCondition[];
  buyQuantity?: number;
  getQuantity?: number;
  minimumPurchaseAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  startDate?: Date | string;
  endDate?: Date | string;
  isActive?: boolean;
  status?: DiscountStatus;
}

/**
 * Coupon interface (represents a customer's coupon)
 */
export interface Coupon {
  id: string;
  discountId: string;
  customerId?: string; // null = available for all
  code: string;
  isUsed: boolean;
  usedAt?: Date | string;
  usedBy?: string; // User ID who used it
  expiresAt?: Date | string;
  qrCode?: string; // QR code data
  createdAt: Date | string;
}

/**
 * Discount validation result
 */
export interface DiscountValidationResult {
  isValid: boolean;
  discount?: Discount;
  errors: string[];
  warnings: string[];
  calculatedAmount?: number; // Calculated discount amount
}

/**
 * Discount application result (what gets applied to a sale)
 */
export interface DiscountApplication {
  discountId: string;
  discountName: string;
  discountType: DiscountType;
  originalAmount: number; // Original sale amount
  discountAmount: number; // Amount discounted
  finalAmount: number; // Final amount after discount
  code?: string; // Coupon code if used
  appliedAt: Date | string;
}

/**
 * Discount search/filter params
 */
export interface DiscountSearchParams {
  query?: string;
  type?: DiscountType;
  status?: DiscountStatus;
  isActive?: boolean;
  hasCode?: boolean; // Filter by whether discount has a coupon code
  startDate?: Date | string;
  endDate?: Date | string;
  limit?: number;
  offset?: number;
}

/**
 * Discount statistics
 */
export interface DiscountStats {
  totalDiscounts: number;
  activeDiscounts: number;
  expiredDiscounts: number;
  totalUsage: number;
  totalSavings: number; // Total amount saved by customers
  mostUsedDiscount?: Discount;
}

/**
 * Offline discount for local storage
 */
export interface OfflineDiscount extends Discount {
  localId: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  syncAttempts: number;
  lastSyncAttempt?: Date | string;
  errorMessage?: string;
  serverId?: string; // ID from server after successful sync
}

/**
 * Discount cache metadata
 */
export interface DiscountCacheMetadata {
  lastUpdate: string;
  totalDiscounts: number;
  version: number;
}

/**
 * Helper type for discount calculation context
 */
export interface DiscountCalculationContext {
  subtotal: number;
  items: {
    productId?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    categoryId?: string;
  }[];
  customerId?: string;
  customerType?: string;
}
