import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { StorageService } from '../../services/storage.service';
import { SyncService } from '../../services/sync.service';
import { Sale, SalesSummary, CreateSaleDto } from '@pago-py/shared-models';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private api = inject(ApiService);
  private storage = inject(StorageService);
  private sync = inject(SyncService);

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
    return this.api.get<Sale[]>(`/sales?limit=${limit}`);
  }

  /**
   * Create a new sale with offline support
   */
  createSale(data: CreateSaleDto): Observable<Sale> {
    // Check if online
    if (this.sync.getNetworkStatus()) {
      // Online: Send to API
      return this.api.post<Sale>('/sales', data);
    } else {
      // Offline: Store locally and sync later
      return from(this.createSaleOffline(data));
    }
  }

  /**
   * Create sale offline and queue for sync
   */
  private async createSaleOffline(data: CreateSaleDto): Promise<Sale> {
    // Generate temporary ID
    const tempId = `offline_${Date.now()}`;

    // Calculate totals
    let subtotalGravado10 = 0;
    let subtotalGravado5 = 0;
    let exento = 0;

    data.items.forEach(item => {
      const subtotal = item.quantity * item.amount;
      if (item.iva === 10) {
        subtotalGravado10 += subtotal;
      } else if (item.iva === 5) {
        subtotalGravado5 += subtotal;
      } else {
        exento += subtotal;
      }
    });

    const iva10 = subtotalGravado10 * 0.10;
    const iva5 = subtotalGravado5 * 0.05;
    const total = subtotalGravado10 + iva10 + subtotalGravado5 + iva5 + exento;

    // Create temporary sale object
    const tempSale: any = {
      id: tempId,
      ...data,
      subtotalGravado: subtotalGravado10 + subtotalGravado5,
      iva10,
      iva5,
      exento,
      total,
      createdAt: new Date(),
      updatedAt: new Date(),
      synced: false
    };

    // Add to pending sales for sync
    await this.sync.addPendingSale(tempSale);

    return tempSale as Sale;
  }

  /**
   * Get sale by ID
   */
  getSaleById(id: string): Observable<Sale> {
    return this.api.get<Sale>(`/sales/${id}`);
  }

  /**
   * Get all sales
   */
  getAllSales(): Observable<Sale[]> {
    return this.api.get<Sale[]>('/sales');
  }

  /**
   * Get pending sales count
   */
  getPendingSalesCount(): Observable<number> {
    return from(this.sync.getPendingItemsCount());
  }
}
