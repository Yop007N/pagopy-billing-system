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
  iva10: number;
  iva5: number;
  exento: number;
  total: number;

  // Pago
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;

  // Cliente
  customerType: CustomerType;
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
}
