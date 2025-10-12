import { PaymentMethod, PaymentStatus, CustomerType, SaleStatus } from './enums';

export interface SaleItem {
  concept: string;
  amount: number;
  quantity: number;
  subtotal: number;
  iva: number;
}

export interface Sale {
  id: string;
  saleNumber: number;
  userId: string;

  // Items
  items: SaleItem[];

  // Montos
  subtotalGravado: number;
  subtotal?: number; // Alias or calculated field for subtotalGravado
  tax?: number; // Total tax (iva10 + iva5)
  iva10: number;
  iva5: number;
  exento: number;
  total: number;
  discount?: number;

  // Pago
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  payment?: {
    id: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    createdAt: Date;
  };

  // Cliente
  customerType: CustomerType;
  customerId?: string;
  customer?: {
    id: string;
    name: string;
    documentId: string;
    email?: string;
    phone?: string;
  };
  customerRuc?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;

  // Factura
  invoiceNumber?: string;
  timbrado?: string;
  invoiceSent: boolean;
  invoiceSentAt?: Date;

  // PDF
  pdfUrl?: string;
  pdfGenerated: boolean;

  // Notificaciones
  whatsappSent: boolean;
  emailSent: boolean;

  // Estado
  status: SaleStatus;
  notes?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSaleDto {
  items: SaleItem[];
  paymentMethod: PaymentMethod;
  customerType: CustomerType;
  customerRuc?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface UpdateSaleDto {
  paymentStatus?: PaymentStatus;
  status?: SaleStatus;
  invoiceNumber?: string;
  invoiceSent?: boolean;
  pdfUrl?: string;
  pdfGenerated?: boolean;
  whatsappSent?: boolean;
  emailSent?: boolean;
}

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

export interface DailySalesStats {
  date: string;
  count: number;
  total: number;
}
