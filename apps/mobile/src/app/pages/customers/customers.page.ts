/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, OnInit, OnDestroy, inject, signal, computed, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonAvatar,
  IonNote,
  IonBadge,
  IonFab,
  IonFabButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonButtons,
  IonButton,
  IonSpinner,
  AlertController,
  ToastController,
  IonItemSliding,
  IonItemOptions,
  IonItemOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  personCircle,
  business,
  search,
  filter,
  cloudOffline,
  syncCircle,
  callOutline,
  mailOutline,
  createOutline,
  trashOutline
} from 'ionicons/icons';
import { CustomersService } from '../../core/services/customers.service';
import { NetworkService } from '../../core/services/network.service';
import { Customer, CustomerType } from '../../models/customer.model';
import { Subscription } from 'rxjs';

/**
 * CustomersPage - List and manage customers
 *
 * Features:
 * - Searchbar with real-time filtering
 * - Segmented control for customer type filtering
 * - Pull-to-refresh
 * - Infinite scroll for pagination
 * - Offline indicator
 * - Swipe actions (edit/delete)
 * - FAB for adding new customers
 */
@Component({
  selector: 'app-customers',
  templateUrl: './customers.page.html',
  styleUrls: ['./customers.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
    IonAvatar,
    IonNote,
    IonBadge,
    IonFab,
    IonFabButton,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonButtons,
    IonButton,
    IonSpinner,
    IonItemSliding,
    IonItemOptions,
    IonItemOption
  ]
})
export class CustomersPage implements OnInit, OnDestroy {
  private customersService = inject(CustomersService);
  private networkService = inject(NetworkService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  @ViewChild(IonInfiniteScroll) infiniteScroll?: IonInfiniteScroll;

  // Subscriptions management
  private networkSubscription?: Subscription;

  // Signals
  customers = signal<Customer[]>([]);
  filteredCustomers = computed(() => {
    let result = this.customers();

    // Filter by segment
    const segment = this.selectedSegment();
    if (segment !== 'all') {
      result = result.filter(c => c.customerType === segment.toUpperCase());
    }

    // Filter by search
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.documentId.toLowerCase().includes(query) ||
        (c.taxId && c.taxId.toLowerCase().includes(query)) ||
        (c.email && c.email.toLowerCase().includes(query))
      );
    }

    return result;
  });

  loading = this.customersService.loading;
  isOnline = signal(true);
  syncPending = this.customersService.syncPending;
  searchQuery = signal('');
  selectedSegment = signal<'all' | 'individual' | 'business'>('all');

  // Pagination
  currentPage = signal(1);
  pageSize = 20;
  hasMoreData = signal(true);

  constructor() {
    addIcons({
      add,
      personCircle,
      business,
      search,
      filter,
      cloudOffline,
      syncCircle,
      callOutline,
      mailOutline,
      createOutline,
      trashOutline
    });
  }

  ngOnInit() {
    this.loadCustomers();
    this.subscribeToNetwork();
  }

  /**
   * Subscribe to network status changes
   */
  private subscribeToNetwork() {
    this.networkSubscription = this.networkService.isOnline$.subscribe(online => {
      this.isOnline.set(online);
      if (online && this.syncPending()) {
        this.syncData();
      }
    });
  }

  /**
   * Load customers from service
   */
  loadCustomers(event?: any) {
    this.customersService.getCustomers({
      page: this.currentPage(),
      limit: this.pageSize
    }).subscribe({
      next: (response) => {
        if (event) {
          // Refreshing - replace data
          this.customers.set(response.data);
          event.target.complete();
        } else {
          // Initial load
          this.customers.set(response.data);
        }
        this.hasMoreData.set(response.page < response.totalPages);
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        if (event) {
          event.target.complete();
        }
        this.showToast('Error al cargar clientes', 'danger');
      }
    });
  }

  /**
   * Handle pull-to-refresh
   */
  handleRefresh(event: any) {
    this.currentPage.set(1);
    this.loadCustomers(event);
  }

  /**
   * Handle infinite scroll
   */
  loadMoreCustomers(event: any) {
    if (!this.hasMoreData()) {
      event.target.complete();
      return;
    }

    const nextPage = this.currentPage() + 1;

    this.customersService.getCustomers({
      page: nextPage,
      limit: this.pageSize
    }).subscribe({
      next: (response) => {
        // Append new data
        this.customers.set([...this.customers(), ...response.data]);
        this.currentPage.set(nextPage);
        this.hasMoreData.set(response.page < response.totalPages);
        event.target.complete();
      },
      error: (error) => {
        console.error('Error loading more customers:', error);
        event.target.complete();
      }
    });
  }

  /**
   * Handle search input
   */
  onSearchChange(event: any) {
    const query = event.detail.value || '';
    this.searchQuery.set(query);

    // If search is active, perform API search
    if (query.length >= 2) {
      this.customersService.searchCustomers(query).subscribe({
        next: (results) => {
          this.customers.set(results);
        },
        error: (error) => {
          console.error('Error searching customers:', error);
        }
      });
    } else if (query.length === 0) {
      // Reset to full list
      this.loadCustomers();
    }
  }

  /**
   * Handle segment change
   */
  onSegmentChange(event: any) {
    this.selectedSegment.set(event.detail.value);
  }

  /**
   * Navigate to customer detail
   */
  viewCustomer(customer: Customer) {
    const customerId = customer.id || customer._localId;
    this.router.navigate(['/customers', customerId]);
  }

  /**
   * Navigate to add customer
   */
  addCustomer() {
    this.router.navigate(['/customers/new']);
  }

  /**
   * Edit customer (swipe action)
   */
  editCustomer(customer: Customer, slidingItem: IonItemSliding) {
    slidingItem.close();
    const customerId = customer.id || customer._localId;
    this.router.navigate(['/customers', customerId, 'edit']);
  }

  /**
   * Delete customer (swipe action)
   */
  async deleteCustomer(customer: Customer, slidingItem: IonItemSliding) {
    slidingItem.close();

    const alert = await this.alertController.create({
      header: 'Eliminar Cliente',
      message: `¿Está seguro de eliminar a ${customer.name}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.confirmDelete(customer);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Confirm and execute delete
   */
  private confirmDelete(customer: Customer) {
    const customerId = customer.id || customer._localId!;

    this.customersService.deleteCustomer(customerId).subscribe({
      next: () => {
        // Remove from local list
        const updated = this.customers().filter(c =>
          (c.id !== customer.id) && (c._localId !== customer._localId)
        );
        this.customers.set(updated);
        this.showToast('Cliente eliminado exitosamente', 'success');
      },
      error: (error) => {
        console.error('Error deleting customer:', error);
        this.showToast('Error al eliminar cliente', 'danger');
      }
    });
  }

  /**
   * Sync offline data
   */
  async syncData() {
    try {
      await this.customersService.syncPendingOperations();
      this.showToast('Datos sincronizados exitosamente', 'success');
      this.loadCustomers();
    } catch (error) {
      console.error('Error syncing data:', error);
      this.showToast('Error al sincronizar datos', 'danger');
    }
  }

  /**
   * Get customer initials for avatar
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  /**
   * Get customer type icon
   */
  getCustomerTypeIcon(type: CustomerType): string {
    return type === CustomerType.BUSINESS ? 'business' : 'personCircle';
  }

  /**
   * Get customer type label
   */
  getCustomerTypeLabel(type: CustomerType): string {
    return type === CustomerType.BUSINESS ? 'Empresa' : 'Individual';
  }

  /**
   * Show toast message
   */
  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  /**
   * Track by function for ngFor
   */
  trackByCustomerId(index: number, customer: Customer): string {
    return customer.id || customer._localId || index.toString();
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe();
    }
  }
}
