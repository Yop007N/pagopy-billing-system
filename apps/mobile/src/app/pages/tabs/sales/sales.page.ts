/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonChip,
  IonBadge,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonMenuButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  chevronForwardOutline,
  cloudDoneOutline,
  cloudOfflineOutline,
  syncOutline,
  timeOutline,
  filterOutline,
  searchOutline
} from 'ionicons/icons';
import { SalesService, Sale } from '../../../services/sales.service';
import { NetworkService } from '../../../core/services/network.service';
import { SyncService } from '../../../services/sync.service';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.page.html',
  styleUrls: ['./sales.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonChip,
    IonBadge,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSelect,
    IonSelectOption,
    IonButtons,
    IonMenuButton
  ]
})
export class SalesPage implements OnInit {
  // Signals for reactive state
  allSales = signal<Sale[]>([]);
  displayedSales = signal<Sale[]>([]);
  loading = signal<boolean>(false);
  searchTerm = signal<string>('');
  selectedFilter = signal<'all' | 'pending' | 'synced' | 'error'>('all');
  selectedPaymentMethod = signal<string>('all');

  // Pagination
  pageSize = 20;
  currentPage = signal<number>(1);

  // Network and sync status
  isOnline = this.network.isOnline;
  syncStatus = this.sync.syncStatus;

  // Computed filtered sales
  filteredSales = computed(() => {
    let sales = this.allSales();

    // Filter by sync status
    const filter = this.selectedFilter();
    if (filter !== 'all') {
      sales = sales.filter(sale => sale.syncStatus === filter);
    }

    // Filter by payment method
    const paymentMethod = this.selectedPaymentMethod();
    if (paymentMethod !== 'all') {
      sales = sales.filter(sale => sale.paymentMethod === paymentMethod);
    }

    // Filter by search term
    const search = this.searchTerm().toLowerCase();
    if (search) {
      sales = sales.filter(sale =>
        sale.customerName.toLowerCase().includes(search) ||
        sale.customerDocument?.toLowerCase().includes(search) ||
        sale.total.toString().includes(search)
      );
    }

    return sales;
  });

  // Stats computed
  stats = computed(() => {
    const all = this.allSales();
    return {
      total: all.length,
      synced: all.filter(s => s.syncStatus === 'synced').length,
      pending: all.filter(s => s.syncStatus === 'pending' || s.syncStatus === 'syncing').length,
      error: all.filter(s => s.syncStatus === 'error').length
    };
  });

  constructor(
    private router: Router,
    private salesService: SalesService,
    private network: NetworkService,
    private sync: SyncService
  ) {
    addIcons({
      addOutline,
      chevronForwardOutline,
      cloudDoneOutline,
      cloudOfflineOutline,
      syncOutline,
      timeOutline,
      filterOutline,
      searchOutline
    });
  }

  ngOnInit() {
    this.loadSales();
  }

  async loadSales() {
    this.loading.set(true);

    try {
      await this.salesService.loadSales();
      const sales = this.salesService.getSales();
      this.allSales.set(sales);
      this.updateDisplayedSales();
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      this.loading.set(false);
    }
  }

  updateDisplayedSales() {
    const filtered = this.filteredSales();
    const page = this.currentPage();
    const displayed = filtered.slice(0, page * this.pageSize);
    this.displayedSales.set(displayed);
  }

  async handleRefresh(event: any) {
    await this.loadSales();
    event.target.complete();
  }

  onSearchChange(event: any) {
    this.searchTerm.set(event.target.value || '');
    this.currentPage.set(1);
    this.updateDisplayedSales();
  }

  onFilterChange(event: any) {
    this.selectedFilter.set(event.detail.value);
    this.currentPage.set(1);
    this.updateDisplayedSales();
  }

  onPaymentMethodChange(event: any) {
    this.selectedPaymentMethod.set(event.detail.value);
    this.currentPage.set(1);
    this.updateDisplayedSales();
  }

  onInfiniteScroll(event: any) {
    const currentDisplayed = this.displayedSales().length;
    const totalFiltered = this.filteredSales().length;

    if (currentDisplayed < totalFiltered) {
      this.currentPage.update(p => p + 1);
      this.updateDisplayedSales();
    }

    event.target.complete();

    // Disable infinite scroll when all items are loaded
    if (currentDisplayed >= totalFiltered) {
      event.target.disabled = true;
    }
  }

  goToSaleDetail(sale: Sale) {
    const id = sale.id || sale.localId;
    if (id) {
      this.router.navigate(['/sales/detail', id]);
    }
  }

  goToNewSale() {
    this.router.navigate(['/sales/new']);
  }

  async triggerSync() {
    if (!this.isOnline()) {
      alert('No hay conexión a internet');
      return;
    }

    try {
      await this.sync.manualSync();
      await this.loadSales();
    } catch (error: any) {
      alert(error.message || 'Error al sincronizar');
    }
  }

  getSyncStatusIcon(status: Sale['syncStatus']): string {
    switch (status) {
      case 'synced': return 'cloud-done-outline';
      case 'syncing': return 'sync-outline';
      case 'error': return 'cloud-offline-outline';
      default: return 'time-outline';
    }
  }

  getSyncStatusColor(status: Sale['syncStatus']): string {
    switch (status) {
      case 'synced': return 'success';
      case 'syncing': return 'primary';
      case 'error': return 'danger';
      default: return 'warning';
    }
  }

  getSyncStatusText(status: Sale['syncStatus']): string {
    switch (status) {
      case 'synced': return 'Sincronizado';
      case 'syncing': return 'Sincronizando...';
      case 'error': return 'Error';
      default: return 'Pendiente';
    }
  }

  formatPaymentMethod(method: string): string {
    const methods: Record<string, string> = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      qr: 'QR'
    };
    return methods[method] || method;
  }

  // TrackBy function for ngFor optimization
  trackBySaleId(index: number, sale: Sale): string {
    return sale.id || sale.localId || index.toString();
  }
}
