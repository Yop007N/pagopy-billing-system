/**
 * Invoice Model
 * Represents an electronic invoice (e-Kuatia) for Paraguayan SET integration
 * Matches backend Prisma schema
 */

/**
 * Invoice status enum matching Prisma schema
 */
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

/**
 * Invoice interface matching backend Prisma schema
 * Represents an electronic invoice with SET e-Kuatia integration
 */
export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;

  // SET e-Kuatia fields
  timbradoNumber?: string; // Número de timbrado SET
  cdc?: string; // Código de Control (e-Kuatia)
  qrCode?: string; // QR code data
  xmlFile?: string; // Path to XML file
  kude?: string; // KUDE (Código Único de Documento Electrónico)

  // SET response
  setResponse?: Record<string, any>; // Response from SET e-Kuatia
  setApprovedAt?: Date | string;
  sentToCustomerAt?: Date | string;

  // PDF generation
  pdfGenerated: boolean; // Default: false
  pdfUrl?: string; // URL/path to generated PDF file

  // Foreign keys
  saleId: string;

  // Relations
  sale?: InvoiceSale;

  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;

  // Offline sync fields
  _synced?: boolean;
  _localId?: string;
}

/**
 * SET e-Kuatia API response
 */
export interface SetResponse {
  success: boolean;
  message: string;
  cdc?: string;
  kude?: string;
  qrData?: string;
  protocolNumber?: string;
  errors?: SetError[];
  timestamp?: string;
}

/**
 * SET e-Kuatia error details
 */
export interface SetError {
  code: string;
  message: string;
  field?: string;
  severity?: 'error' | 'warning' | 'info';
}

/**
 * Sale information within an invoice
 */
export interface InvoiceSale {
  id: string;
  saleNumber: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  paymentMethod: string;
  saleDate: Date | string;

  // Customer info
  customer?: {
    id: string;
    name: string;
    documentType: string;
    documentId: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
  };

  // Items
  items?: InvoiceSaleItem[];
}

/**
 * Sale item within an invoice
 */
export interface InvoiceSaleItem {
  id: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
  product: {
    id: string;
    code: string;
    name: string;
    description?: string;
  };
}

/**
 * Data Transfer Object for creating a new invoice
 */
export interface CreateInvoiceDto {
  saleId: string;
  timbradoNumber?: string;
  autoSendToSet?: boolean;
}

/**
 * Data Transfer Object for sending invoice to SET
 */
export interface SendToSetDto {
  invoiceId: string;
  force?: boolean; // Force resend even if already sent
}

/**
 * Data Transfer Object for updating invoice
 */
export interface UpdateInvoiceDto {
  status?: InvoiceStatus;
  timbradoNumber?: string;
  cdc?: string;
  kude?: string;
  qrCode?: string;
  xmlFile?: string;
  setResponse?: Record<string, any>;
  pdfUrl?: string;
  pdfGenerated?: boolean;
}

/**
 * Search parameters for invoice queries
 */
export interface InvoiceListFilter {
  status?: InvoiceStatus;
  search?: string;
  saleNumber?: string;
  customerId?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  hasCdc?: boolean;
  pdfGenerated?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'invoiceNumber' | 'createdAt' | 'setApprovedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response for invoice list
 */
export interface InvoicePaginatedResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Share invoice options for mobile app
 */
export interface ShareInvoiceOptions {
  method: 'whatsapp' | 'email' | 'sms' | 'share';
  customerEmail?: string;
  customerPhone?: string;
  message?: string;
  includeXml?: boolean;
}

/**
 * Invoice statistics
 */
export interface InvoiceStats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  pendingSet?: number; // Pending SET approval
  withCdc?: number; // With CDC assigned
}

/**
 * Invoice with full details
 */
export interface InvoiceDetails extends Invoice {
  sale: InvoiceSale;
}

/**
 * Invoice generation response
 */
export interface InvoiceGenerationResponse {
  invoice: Invoice;
  pdfUrl?: string;
  xmlUrl?: string;
  message: string;
}
