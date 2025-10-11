import { InvoiceStatus } from './enums';

export interface Invoice {
  id: string;
  saleId: string;
  userId: string;

  invoiceNumber: string;
  timbrado: string;

  // Datos SET
  cdc?: string; // Código de Control SET
  setResponse?: Record<string, unknown>;

  // Estado
  status: InvoiceStatus;

  // PDF
  pdfUrl?: string;
  xmlUrl?: string;

  // Timestamps
  sentAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvoiceDto {
  saleId: string;
  invoiceNumber: string;
  timbrado: string;
}

export interface UpdateInvoiceDto {
  status?: InvoiceStatus;
  cdc?: string;
  setResponse?: Record<string, unknown>;
  pdfUrl?: string;
  xmlUrl?: string;
  sentAt?: Date;
  approvedAt?: Date;
}
