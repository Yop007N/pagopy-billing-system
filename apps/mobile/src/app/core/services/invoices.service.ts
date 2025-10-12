import { Injectable, inject } from '@angular/core';
import { Observable, from, of, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { ApiService } from '../../services/api.service';
import { StorageService } from '../../services/storage.service';
import { NetworkService } from './network.service';
import {
  Invoice,
  InvoiceStatus,
  CreateInvoiceDto,
  SendToSetDto,
  InvoiceListFilter,
  InvoicePaginatedResponse,
  ShareInvoiceOptions,
  InvoiceStats
} from '../../models/invoice.model';

/**
 * InvoicesService
 * Manages electronic invoices with SET e-Kuatia integration
 */
@Injectable({
  providedIn: 'root'
})
export class InvoicesService {
  private api = inject(ApiService);
  private storage = inject(StorageService);
  private network = inject(NetworkService);

  // Cache
  private readonly CACHE_KEY = 'invoices_cache';
  private readonly CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
  private invoicesCache$ = new BehaviorSubject<Invoice[]>([]);
  private statsCache$ = new BehaviorSubject<InvoiceStats | null>(null);

  constructor() {
    this.loadCachedInvoices();
  }

  /**
   * Load cached invoices from storage
   */
  private async loadCachedInvoices(): Promise<void> {
    try {
      const cached = await this.storage.get(this.CACHE_KEY);
      if (cached && cached.data && cached.timestamp) {
        const age = Date.now() - cached.timestamp;
        if (age < this.CACHE_EXPIRY) {
          this.invoicesCache$.next(cached.data);
        }
      }
    } catch (error) {
      console.error('Error loading cached invoices:', error);
    }
  }

  /**
   * Save invoices to cache
   */
  private async cacheInvoices(invoices: Invoice[]): Promise<void> {
    try {
      await this.storage.set(this.CACHE_KEY, {
        data: invoices,
        timestamp: Date.now()
      });
      this.invoicesCache$.next(invoices);
    } catch (error) {
      console.error('Error caching invoices:', error);
    }
  }

  /**
   * Get invoices with filters and pagination
   */
  getInvoices(filter?: InvoiceListFilter): Observable<InvoicePaginatedResponse> {
    const params = this.buildFilterParams(filter);

    return this.api.get<InvoicePaginatedResponse>(`/invoices${params}`).pipe(
      tap(response => {
        // Cache first page without filters
        if (!filter || (!filter.status && !filter.search && filter.page === 1)) {
          this.cacheInvoices(response.invoices);
        }
      }),
      catchError(error => {
        console.error('Error fetching invoices:', error);
        // Return cached data if offline
        if (!this.network.isOnline()) {
          const cached = this.invoicesCache$.value;
          return of({
            invoices: cached,
            total: cached.length,
            page: 1,
            limit: cached.length,
            totalPages: 1
          });
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Get invoice by ID
   */
  getInvoiceById(id: string): Observable<Invoice> {
    return this.api.get<Invoice>(`/invoices/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching invoice:', error);
        // Try to find in cache
        const cached = this.invoicesCache$.value.find(inv => inv.id === id);
        if (cached) {
          return of(cached);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Create invoice from sale
   */
  createInvoice(dto: CreateInvoiceDto): Observable<Invoice> {
    return this.api.post<Invoice>('/invoices', dto).pipe(
      tap(invoice => {
        // Add to cache
        const current = this.invoicesCache$.value;
        this.cacheInvoices([invoice, ...current]);
      })
    );
  }

  /**
   * Send invoice to SET e-Kuatia
   */
  sendToSet(dto: SendToSetDto): Observable<Invoice> {
    return this.api.post<Invoice>(`/invoices/${dto.invoiceId}/send-to-set`, { force: dto.force }).pipe(
      tap(invoice => {
        // Update in cache
        this.updateInvoiceInCache(invoice);
      })
    );
  }

  /**
   * Check invoice status in SET
   */
  checkSetStatus(invoiceId: string): Observable<Invoice> {
    return this.api.get<Invoice>(`/invoices/${invoiceId}/check-status`).pipe(
      tap(invoice => {
        this.updateInvoiceInCache(invoice);
      })
    );
  }

  /**
   * Generate PDF for invoice
   */
  generatePdf(invoiceId: string): Observable<{ pdfUrl: string }> {
    return this.api.post<{ pdfUrl: string }>(`/invoices/${invoiceId}/generate-pdf`, {});
  }

  /**
   * Download PDF
   */
  downloadPdf(invoiceId: string): Observable<Blob> {
    return this.api.get<Blob>(`/invoices/${invoiceId}/pdf`);
  }

  /**
   * Share invoice via WhatsApp, Email, or native share
   */
  async shareInvoice(invoice: Invoice, options: ShareInvoiceOptions): Promise<void> {
    try {
      // First ensure PDF is generated
      let pdfUrl = invoice.pdfUrl;
      if (!pdfUrl) {
        const response = await this.generatePdf(invoice.id).toPromise();
        pdfUrl = response?.pdfUrl || '';
      }

      if (!pdfUrl) {
        throw new Error('No se pudo generar el PDF');
      }

      // Download PDF to device
      const blob = await this.downloadPdf(invoice.id).toPromise();
      if (!blob) {
        throw new Error('No se pudo descargar el PDF');
      }

      // Convert blob to base64
      const base64 = await this.blobToBase64(blob);

      // Save to device
      const fileName = `factura_${invoice.invoiceNumber}.pdf`;
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache
      });

      // Share based on method
      switch (options.method) {
        case 'whatsapp':
          await this.shareViaWhatsApp(invoice, savedFile.uri, options.customerPhone);
          break;
        case 'email':
          await this.shareViaEmail(invoice, savedFile.uri, options.customerEmail);
          break;
        case 'share':
          await this.shareViaSystem(invoice, savedFile.uri);
          break;
      }
    } catch (error) {
      console.error('Error sharing invoice:', error);
      throw error;
    }
  }

  /**
   * Share via WhatsApp
   */
  private async shareViaWhatsApp(invoice: Invoice, fileUri: string, phone?: string): Promise<void> {
    const message = `Factura N° ${invoice.invoiceNumber}\n` +
      `Total: Gs. ${invoice.sale?.total.toLocaleString('es-PY')}\n` +
      `CDC: ${invoice.cdc || 'Pendiente'}`;

    const whatsappUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    // Note: File sharing via WhatsApp requires native handling
    // This opens WhatsApp with the message, user must share file manually
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Share via Email
   */
  private async shareViaEmail(invoice: Invoice, fileUri: string, email?: string): Promise<void> {
    const subject = `Factura N° ${invoice.invoiceNumber}`;
    const body = `Estimado cliente,\n\n` +
      `Adjunto encontrará la factura electrónica N° ${invoice.invoiceNumber}\n` +
      `Total: Gs. ${invoice.sale?.total.toLocaleString('es-PY')}\n` +
      `CDC: ${invoice.cdc || 'Pendiente'}\n\n` +
      `Gracias por su compra.`;

    const mailtoUrl = `mailto:${email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  }

  /**
   * Share via system share sheet
   */
  private async shareViaSystem(invoice: Invoice, fileUri: string): Promise<void> {
    await Share.share({
      title: `Factura N° ${invoice.invoiceNumber}`,
      text: `Factura electrónica - Total: Gs. ${invoice.sale?.total.toLocaleString('es-PY')}`,
      url: fileUri,
      dialogTitle: 'Compartir factura'
    });
  }

  /**
   * Get invoice statistics
   */
  getStats(): Observable<InvoiceStats> {
    // Return cached if available
    const cached = this.statsCache$.value;
    if (cached) {
      return of(cached);
    }

    return this.api.get<InvoiceStats>('/invoices/stats').pipe(
      tap(stats => this.statsCache$.next(stats))
    );
  }

  /**
   * Cancel invoice
   */
  cancelInvoice(invoiceId: string, reason: string): Observable<Invoice> {
    return this.api.post<Invoice>(`/invoices/${invoiceId}/cancel`, { reason }).pipe(
      tap(invoice => {
        this.updateInvoiceInCache(invoice);
      })
    );
  }

  /**
   * Resend invoice to customer
   */
  resendToCustomer(invoiceId: string, email: string, phone?: string): Observable<{ success: boolean }> {
    return this.api.post<{ success: boolean }>(`/invoices/${invoiceId}/resend`, { email, phone });
  }

  /**
   * Get cached invoices observable
   */
  getCachedInvoices(): Observable<Invoice[]> {
    return this.invoicesCache$.asObservable();
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    await this.storage.remove(this.CACHE_KEY);
    this.invoicesCache$.next([]);
    this.statsCache$.next(null);
  }

  // Helper methods

  /**
   * Build filter params for API
   */
  private buildFilterParams(filter?: InvoiceListFilter): string {
    if (!filter) return '';

    const params = new URLSearchParams();

    if (filter.status) params.append('status', filter.status);
    if (filter.search) params.append('search', filter.search);
    if (filter.dateFrom) params.append('dateFrom', filter.dateFrom.toISOString());
    if (filter.dateTo) params.append('dateTo', filter.dateTo.toISOString());
    if (filter.page) params.append('page', filter.page.toString());
    if (filter.limit) params.append('limit', filter.limit.toString());

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Update invoice in cache
   */
  private updateInvoiceInCache(invoice: Invoice): void {
    const current = this.invoicesCache$.value;
    const index = current.findIndex(inv => inv.id === invoice.id);

    if (index >= 0) {
      current[index] = invoice;
    } else {
      current.unshift(invoice);
    }

    this.cacheInvoices(current);
  }

  /**
   * Convert blob to base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Get status badge color
   */
  getStatusColor(status: InvoiceStatus): string {
    switch (status) {
      case InvoiceStatus.APPROVED:
        return 'success';
      case InvoiceStatus.PENDING:
        return 'warning';
      case InvoiceStatus.REJECTED:
        return 'danger';
      case InvoiceStatus.CANCELLED:
        return 'medium';
      case InvoiceStatus.DRAFT:
        return 'light';
      default:
        return 'medium';
    }
  }

  /**
   * Get status label
   */
  getStatusLabel(status: InvoiceStatus): string {
    switch (status) {
      case InvoiceStatus.APPROVED:
        return 'Aprobada';
      case InvoiceStatus.PENDING:
        return 'Pendiente';
      case InvoiceStatus.REJECTED:
        return 'Rechazada';
      case InvoiceStatus.CANCELLED:
        return 'Cancelada';
      case InvoiceStatus.DRAFT:
        return 'Borrador';
      default:
        return status;
    }
  }
}
