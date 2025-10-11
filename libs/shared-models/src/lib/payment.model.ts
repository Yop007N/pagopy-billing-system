import { PaymentMethod, PaymentStatus } from './enums';

export interface Payment {
  id: string;
  saleId: string;

  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;

  // Datos específicos del método
  transactionId?: string; // Para SIPAP/Bancard
  referenceNumber?: string;
  metadata?: Record<string, unknown>;

  // Timestamps
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentDto {
  saleId: string;
  method: PaymentMethod;
  amount: number;
  transactionId?: string;
  referenceNumber?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdatePaymentDto {
  status?: PaymentStatus;
  transactionId?: string;
  referenceNumber?: string;
  metadata?: Record<string, unknown>;
  processedAt?: Date;
}
