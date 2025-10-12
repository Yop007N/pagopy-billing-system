import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Sale, SalesSummary, CreateSaleDto, SaleStatus, PaymentMethod, DailySalesStats } from '@pago-py/shared-models';

export interface SalesFilters {
  page?: number;
  limit?: number;
  status?: SaleStatus;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface PaginatedSalesResponse {
  data: Sale[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private api = inject(ApiService);

  /**
   * Get sales summary with today, week, and month totals
   */
  getSummary(): Observable<SalesSummary> {
    return this.api.get<SalesSummary>('/sales/summary');
  }

  /**
   * Get recent sales with optional limit
   */
  getRecentSales(limit = 10): Observable<Sale[]> {
    return this.api.get<Sale[]>('/sales', {
      params: { limit: limit.toString() } as any
    });
  }

  /**
   * Get sales with pagination and filters
   */
  getSales(filters?: SalesFilters): Observable<PaginatedSalesResponse> {
    const params: any = {};

    if (filters) {
      if (filters.page) params.page = filters.page.toString();
      if (filters.limit) params.limit = filters.limit.toString();
      if (filters.status) params.status = filters.status;
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.search) params.search = filters.search;
    }

    return this.api.get<PaginatedSalesResponse>('/sales', { params });
  }

  /**
   * Create a new sale
   */
  createSale(data: CreateSaleDto): Observable<Sale> {
    return this.api.post<Sale>('/sales', data);
  }

  /**
   * Get sale by ID
   */
  getSaleById(id: string): Observable<Sale> {
    return this.api.get<Sale>(`/sales/${id}`);
  }

  /**
   * Get all sales (without pagination)
   */
  getAllSales(): Observable<Sale[]> {
    return this.api.get<Sale[]>('/sales');
  }

  /**
   * Cancel a sale
   */
  cancelSale(id: string): Observable<Sale> {
    return this.api.patch<Sale>(`/sales/${id}/cancel`, {});
  }

  /**
   * Generate invoice PDF for a sale
   * Two-step process:
   * 1. Create invoice from sale
   * 2. Generate PDF for that invoice
   */
  generateInvoice(saleId: string): Observable<{ invoice: any; pdfUrl: string }> {
    // Step 1: Create invoice from sale
    return this.api.post<any>(`/invoices`, { saleId }).pipe(
      // Step 2: Generate PDF for the created invoice
      switchMap((invoice) => {
        return this.api.post<{ pdfUrl: string }>(`/invoices/${invoice.id}/generate-pdf`, {}).pipe(
          map((pdfResponse) => ({
            invoice,
            pdfUrl: pdfResponse.pdfUrl
          }))
        );
      })
    );
  }

  /**
   * Send invoice via WhatsApp
   */
  sendWhatsApp(id: string): Observable<{ success: boolean }> {
    return this.api.post<{ success: boolean }>(`/sales/${id}/send-whatsapp`, {});
  }

  /**
   * Get daily sales statistics
   */
  getDailyStats(days = 7): Observable<DailySalesStats[]> {
    return this.api.get<DailySalesStats[]>('/sales/daily-stats', {
      params: { days: days.toString() } as any
    });
  }
}
