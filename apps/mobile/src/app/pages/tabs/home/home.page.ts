/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, OnInit, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonRefresher,
  IonRefresherContent,
  IonBadge,
  IonChip,
  IonLabel,
  IonSpinner,
  IonList,
  IonItem
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  statsChartOutline,
  cashOutline,
  documentTextOutline,
  cloudDoneOutline,
  cloudOfflineOutline,
  syncOutline,
  timeOutline,
  cartOutline,
  peopleOutline,
  cubeOutline
} from 'ionicons/icons';
import { SalesService, Sale } from '../../../services/sales.service';
import { NetworkService } from '../../../core/services/network.service';
import { SyncService } from '../../../services/sync.service';

interface DashboardStats {
  todaySales: number;
  todaySalesCount: number;
  weekSales: number;
  monthSales: number;
  pendingSync: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonRefresher,
    IonRefresherContent,
    IonBadge,
    IonChip,
    IonLabel,
    IonSpinner,
    IonList,
    IonItem
  ]
})
export class HomePage implements OnInit {
  // Signals for reactive state
  stats = signal<DashboardStats>({
    todaySales: 0,
    todaySalesCount: 0,
    weekSales: 0,
    monthSales: 0,
    pendingSync: 0
  });

  recentSales = signal<Sale[]>([]);
  loading = signal<boolean>(false);

  // Reactive computed values
  isOnline = this.network.isOnline;
  syncStatus = this.sync.syncStatus;

  networkStatusText = computed(() => {
    return this.isOnline() ? 'En línea' : 'Sin conexión';
  });

  networkStatusColor = computed(() => {
    return this.isOnline() ? 'success' : 'danger';
  });

  constructor(
    private router: Router,
    private salesService: SalesService,
    private network: NetworkService,
    private sync: SyncService
  ) {
    addIcons({
      addOutline,
      statsChartOutline,
      cashOutline,
      documentTextOutline,
      cloudDoneOutline,
      cloudOfflineOutline,
      syncOutline,
      timeOutline,
      cartOutline,
      peopleOutline,
      cubeOutline
    });
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  async loadDashboardData() {
    this.loading.set(true);

    try {
      // Load sales
      await this.salesService.loadSales();
      const allSales = this.salesService.getSales();

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaySales = allSales.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        saleDate.setHours(0, 0, 0, 0);
        return saleDate.getTime() === today.getTime();
      });

      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());

      const weekSales = allSales.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= weekStart;
      });

      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const monthSales = allSales.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= monthStart;
      });

      // Get pending sync count
      const pendingCount = await this.salesService.getPendingSalesCount();

      this.stats.set({
        todaySales: todaySales.reduce((sum, sale) => sum + sale.total, 0),
        todaySalesCount: todaySales.length,
        weekSales: weekSales.reduce((sum, sale) => sum + sale.total, 0),
        monthSales: monthSales.reduce((sum, sale) => sum + sale.total, 0),
        pendingSync: pendingCount
      });

      // Get recent sales (last 5)
      this.recentSales.set(allSales.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async handleRefresh(event: any) {
    await this.loadDashboardData();
    event.target.complete();
  }

  async triggerSync() {
    if (!this.isOnline()) {
      alert('No hay conexión a internet');
      return;
    }

    try {
      await this.sync.manualSync();
      await this.loadDashboardData();
    } catch (error: any) {
      alert(error.message || 'Error al sincronizar');
    }
  }

  goToNewSale() {
    this.router.navigate(['/sales/new']);
  }

  goToSales() {
    this.router.navigate(['/tabs/sales']);
  }

  goToSaleDetail(saleId: string | undefined) {
    if (saleId) {
      this.router.navigate(['/sales/detail', saleId]);
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

  // TrackBy function for ngFor optimization
  trackBySaleId(index: number, sale: Sale): string {
    return sale.id || sale.localId || index.toString();
  }
}
