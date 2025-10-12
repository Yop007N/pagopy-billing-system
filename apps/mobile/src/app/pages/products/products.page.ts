/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonBadge,
  IonFab,
  IonFabButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner,
  IonChip,
  IonButton,
  IonButtons,
  IonMenuButton,
  AlertController,
  ToastController,
  RefresherCustomEvent,
  InfiniteScrollCustomEvent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, searchOutline, barcodeOutline, filterOutline, closeCircle } from 'ionicons/icons';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../models/product.model';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
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
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonBadge,
    IonFab,
    IonFabButton,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSpinner,
    IonChip,
    IonButton,
    IonButtons,
    IonMenuButton
  ]
})
export class ProductsPage implements OnInit, OnDestroy {
  private productsService = inject(ProductsService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  // Signals
  products = signal<Product[]>([]);
  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const prods = this.products();

    if (!query) {
      return prods;
    }

    return prods.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.code.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    );
  });

  searchQuery = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  showActiveOnly = signal(true);
  selectedFilter = signal<'all' | 'low-stock' | 'inactive'>('all');

  // Pagination
  private currentPage = 0;
  private pageSize = 20;
  private hasMoreData = true;

  // Search debounce
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor() {
    addIcons({ add, searchOutline, barcodeOutline, filterOutline, closeCircle });

    // Setup search debounce
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts(refresh = false) {
    if (refresh) {
      this.currentPage = 0;
      this.hasMoreData = true;
      this.products.set([]);
    }

    this.loading.set(true);
    this.error.set(null);

    this.productsService.getProducts(refresh).subscribe({
      next: (products) => {
        if (this.showActiveOnly()) {
          products = products.filter(p => p.isActive);
        }

        if (this.selectedFilter() === 'low-stock') {
          products = products.filter(p => p.stock < 10);
        } else if (this.selectedFilter() === 'inactive') {
          products = products.filter(p => !p.isActive);
          this.showActiveOnly.set(false);
        }

        this.products.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error.set('Error al cargar productos');
        this.loading.set(false);
        this.showErrorToast('Error al cargar productos');
      }
    });
  }

  onSearchChange(event: any) {
    const query = event.target.value || '';
    this.searchSubject.next(query);
  }

  onRefresh(event: RefresherCustomEvent) {
    this.loadProducts(true);
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  onInfiniteScroll(event: InfiniteScrollCustomEvent) {
    // Simple pagination - in a real app, you'd fetch more data from API
    setTimeout(() => {
      event.target.complete();

      // Disable infinite scroll when no more data
      if (!this.hasMoreData) {
        event.target.disabled = true;
      }
    }, 500);
  }

  applyFilter(filter: 'all' | 'low-stock' | 'inactive') {
    this.selectedFilter.set(filter);
    this.loadProducts(true);
  }

  async toggleActiveFilter() {
    this.showActiveOnly.set(!this.showActiveOnly());
    this.loadProducts(true);
  }

  async clearFilters() {
    this.selectedFilter.set('all');
    this.showActiveOnly.set(true);
    this.searchQuery.set('');
    this.loadProducts(true);
  }

  navigateToProduct(product: Product) {
    this.router.navigate(['/products', product.id]);
  }

  navigateToNewProduct() {
    this.router.navigate(['/products/new']);
  }

  async showFilterOptions() {
    const alert = await this.alertController.create({
      header: 'Filtrar Productos',
      inputs: [
        {
          label: 'Todos',
          type: 'radio',
          value: 'all',
          checked: this.selectedFilter() === 'all'
        },
        {
          label: 'Stock Bajo (< 10)',
          type: 'radio',
          value: 'low-stock',
          checked: this.selectedFilter() === 'low-stock'
        },
        {
          label: 'Inactivos',
          type: 'radio',
          value: 'inactive',
          checked: this.selectedFilter() === 'inactive'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aplicar',
          handler: (value) => {
            this.applyFilter(value);
          }
        }
      ]
    });

    await alert.present();
  }

  async showDeleteConfirm(product: Product, event: Event) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar "${product.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deleteProduct(product);
          }
        }
      ]
    });

    await alert.present();
  }

  deleteProduct(product: Product) {
    this.productsService.deleteProduct(product.id).subscribe({
      next: () => {
        this.showSuccessToast('Producto eliminado');
        this.loadProducts(true);
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        this.showErrorToast('Error al eliminar producto');
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0
    }).format(price);
  }

  getStockColor(stock: number): string {
    if (stock === 0) return 'danger';
    if (stock < 10) return 'warning';
    return 'success';
  }

  getTaxBadgeColor(taxRate: number): string {
    if (taxRate === 0) return 'medium';
    if (taxRate === 5) return 'tertiary';
    return 'primary';
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    this.searchSubject.complete();
  }
}
