/**
 * Database models for local SQLite storage
 */

export interface LocalProduct {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  stock: number;
  taxRate: number;
  category?: string;
  barcode?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string;
}

export interface LocalCustomer {
  id: string;
  name: string;
  documentType: 'RUC' | 'CI' | 'PASSPORT' | 'OTHER';
  documentNumber: string;
  customerType: 'INDIVIDUAL' | 'BUSINESS';
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string;
}

export interface LocalSale {
  id: string;
  localId: string;
  saleNumber?: string;
  customerId?: string;
  customerName: string;
  customerDocument?: string;
  items: LocalSaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'qr';
  paymentStatus: 'pending' | 'completed' | 'failed';
  notes?: string;
  status: 'draft' | 'completed' | 'cancelled';
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  syncAttempts: number;
  lastSyncAttempt?: string;
  errorMessage?: string;
  serverId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface LocalSaleItem {
  id: string;
  saleId: string;
  productId?: string;
  productName: string;
  productCode?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
}

export interface LocalInvoice {
  id: string;
  localId: string;
  saleId: string;
  invoiceNumber?: string;
  timbradoNumber?: string;
  cdc?: string;
  kude?: string;
  qrCode?: string;
  xmlData?: string;
  pdfUrl?: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'cancelled';
  issuedAt?: string;
  expiresAt?: string;
  setResponse?: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncLog {
  id: string;
  entityType: 'sale' | 'product' | 'customer' | 'invoice';
  entityId: string;
  operation: 'create' | 'update' | 'delete' | 'sync';
  status: 'pending' | 'processing' | 'success' | 'error';
  direction: 'upload' | 'download';
  errorMessage?: string;
  requestData?: string;
  responseData?: string;
  duration?: number;
  timestamp: string;
  syncedAt?: string;
}

export interface DatabaseInfo {
  version: number;
  lastMigration?: string;
  recordCounts: {
    products: number;
    customers: number;
    sales: number;
    invoices: number;
    syncLogs: number;
  };
  lastSync?: string;
  databaseSize?: number;
}
