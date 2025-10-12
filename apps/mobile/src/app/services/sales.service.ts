import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { SyncService } from './sync.service';
import { NetworkService } from './network.service';
import { CreateSaleDto, OfflineSale } from '../models/offline-sale.model';
import { firstValueFrom } from 'rxjs';

export interface Sale {
  id?: string;
  localId?: string;
  customerName: string;
  customerDocument?: string;
  total: number;
  paymentMethod: string;
  createdAt: Date | string;
  syncStatus?: 'pending' | 'syncing' | 'synced' | 'error';
  items: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private salesSignal = signal<Sale[]>([]);
  readonly sales = this.salesSignal.asReadonly();

  private loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  constructor(
    private api: ApiService,
    private sync: SyncService,
    private network: NetworkService
  ) {
    this.initializeSales();
  }

  private async initializeSales(): Promise<void> {
    await this.loadSales();
  }

  /**
   * Create a new sale - offline-first approach
   * Always saves locally first, then syncs when online
   */
  async createSale(saleData: CreateSaleDto): Promise<{ localId: string; success: boolean }> {
    try {
      // Always save to offline storage first
      const localId = await this.sync.addOfflineSale(saleData);

      // Add to local sales list immediately for UI feedback
      const newSale: Sale = {
        localId,
        customerName: saleData.customerName,
        customerDocument: saleData.customerDocument,
        total: saleData.total,
        paymentMethod: saleData.paymentMethod,
        createdAt: new Date(),
        syncStatus: 'pending',
        items: saleData.items
      };

      this.salesSignal.update(sales => [newSale, ...sales]);

      // If online, sync will happen automatically via SyncService
      // If offline, it will sync when connection is restored

      return { localId, success: true };
    } catch (error) {
      console.error('Failed to create sale:', error);
      throw error;
    }
  }

  /**
   * Load sales - combines online and offline data
   */
  async loadSales(): Promise<void> {
    this.loadingSignal.set(true);

    try {
      // Load offline sales first
      const offlineSales = await this.sync.getOfflineSales();

      // Convert offline sales to Sale format
      const localSales: Sale[] = offlineSales.map(offline => ({
        localId: offline.localId,
        id: offline.serverId,
        customerName: offline.saleData.customerName,
        customerDocument: offline.saleData.customerDocument,
        total: offline.saleData.total,
        paymentMethod: offline.saleData.paymentMethod,
        createdAt: offline.createdAt,
        syncStatus: offline.syncStatus,
        items: offline.saleData.items
      }));

      // If online, fetch from server
      if (this.network.getCurrentStatus()) {
        try {
          const serverSales = await firstValueFrom(
            this.api.get<any[]>('/sales')
          );

          // Filter out sales that are already in offline storage
          const offlineServerIds = new Set(
            offlineSales
              .filter(s => s.serverId)
              .map(s => s.serverId)
          );

          const uniqueServerSales: Sale[] = serverSales
            .filter(sale => !offlineServerIds.has(sale.id))
            .map(sale => ({
              id: sale.id,
              customerName: sale.customerName || sale.customer?.name || 'Cliente',
              customerDocument: sale.customerDocument || sale.customer?.document,
              total: sale.total,
              paymentMethod: sale.paymentMethod,
              createdAt: sale.createdAt,
              syncStatus: 'synced',
              items: sale.items || []
            }));

          // Combine local and server sales
          this.salesSignal.set([...localSales, ...uniqueServerSales]);
        } catch (error) {
          console.error('Failed to load sales from server:', error);
          // Still show offline sales even if server request fails
          this.salesSignal.set(localSales);
        }
      } else {
        // Offline - only show local sales
        this.salesSignal.set(localSales);
      }
    } catch (error) {
      console.error('Failed to load sales:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Get a single sale by ID (local or server)
   */
  async getSale(id: string): Promise<Sale | null> {
    // Check if it's a local ID
    if (id.startsWith('offline_')) {
      const offlineSales = await this.sync.getOfflineSales();
      const offlineSale = offlineSales.find(s => s.localId === id);

      if (offlineSale) {
        return {
          localId: offlineSale.localId,
          id: offlineSale.serverId,
          customerName: offlineSale.saleData.customerName,
          customerDocument: offlineSale.saleData.customerDocument,
          total: offlineSale.saleData.total,
          paymentMethod: offlineSale.saleData.paymentMethod,
          createdAt: offlineSale.createdAt,
          syncStatus: offlineSale.syncStatus,
          items: offlineSale.saleData.items
        };
      }
    }

    // Try to fetch from server if online
    if (this.network.getCurrentStatus()) {
      try {
        const sale = await firstValueFrom(
          this.api.get<any>(`/sales/${id}`)
        );

        return {
          id: sale.id,
          customerName: sale.customerName || sale.customer?.name || 'Cliente',
          customerDocument: sale.customerDocument || sale.customer?.document,
          total: sale.total,
          paymentMethod: sale.paymentMethod,
          createdAt: sale.createdAt,
          syncStatus: 'synced',
          items: sale.items || []
        };
      } catch (error) {
        console.error('Failed to fetch sale from server:', error);
        return null;
      }
    }

    return null;
  }

  /**
   * Delete an offline sale
   */
  async deleteOfflineSale(localId: string): Promise<void> {
    await this.sync.deleteOfflineSale(localId);

    // Remove from local list
    this.salesSignal.update(sales =>
      sales.filter(sale => sale.localId !== localId)
    );
  }

  /**
   * Retry syncing a failed sale
   */
  async retrySync(localId: string): Promise<void> {
    await this.sync.retryFailedSale(localId);

    // Update status in local list
    this.salesSignal.update(sales =>
      sales.map(sale =>
        sale.localId === localId
          ? { ...sale, syncStatus: 'pending' as const }
          : sale
      )
    );
  }

  /**
   * Manual refresh
   */
  async refresh(): Promise<void> {
    await this.loadSales();
  }

  /**
   * Get pending sales count
   */
  async getPendingSalesCount(): Promise<number> {
    return this.sync.getPendingItemsCount();
  }

  /**
   * Get all sales (from signal)
   */
  getSales(): Sale[] {
    return this.salesSignal();
  }

  /**
   * Filter sales by sync status
   */
  getSalesByStatus(status: 'pending' | 'syncing' | 'synced' | 'error'): Sale[] {
    return this.salesSignal().filter(sale => sale.syncStatus === status);
  }
}
