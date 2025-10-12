/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonBadge,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  AlertController,
  ToastController,
  IonAvatar,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  createOutline,
  trashOutline,
  callOutline,
  mailOutline,
  locationOutline,
  cardOutline,
  businessOutline,
  personCircle,
  calendar,
  cashOutline,
  receiptOutline,
  logoWhatsapp,
  mapOutline,
  syncOutline,
  cloudOfflineOutline
} from 'ionicons/icons';
import { CustomersService } from '../../../core/services/customers.service';
import { Customer, CustomerType, CustomerWithStats } from '../../../models/customer.model';
import { formatCurrency, formatDate } from '@angular/common';

/**
 * CustomerDetailPage - View customer details and purchase history
 *
 * Features:
 * - Complete customer information display
 * - Purchase statistics
 * - Edit and delete actions
 * - Segmented view (Details / History)
 * - Responsive layout
 */
@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.page.html',
  styleUrls: ['./customer-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonBadge,
    IonSpinner,
    IonSegment,
    IonSegmentButton,
    IonAvatar,
    IonGrid,
    IonRow,
    IonCol
  ]
})
export class CustomerDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customersService = inject(CustomersService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  // Signals
  customer = signal<CustomerWithStats | null>(null);
  loading = signal(true);
  selectedSegment = signal<'details' | 'history'>('details');

  // Computed values
  customerInitials = computed(() => {
    const c = this.customer();
    if (!c) return '';
    return c.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  });

  customerId: string | null = null;

  constructor() {
    addIcons({
      createOutline,
      trashOutline,
      callOutline,
      mailOutline,
      locationOutline,
      cardOutline,
      businessOutline,
      personCircle,
      calendar,
      cashOutline,
      receiptOutline,
      logoWhatsapp,
      mapOutline,
      syncOutline,
      cloudOfflineOutline
    });
  }

  ngOnInit() {
    this.customerId = this.route.snapshot.paramMap.get('id');
    if (this.customerId) {
      this.loadCustomer();
    }
  }

  /**
   * Load customer details with statistics
   */
  loadCustomer() {
    if (!this.customerId) return;

    this.loading.set(true);

    // Try to get with stats first, fallback to regular get
    this.customersService.getCustomerStats(this.customerId).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading customer stats:', error);
        // Fallback to regular customer get
        this.customersService.getCustomerById(this.customerId!).subscribe({
          next: (customer) => {
            this.customer.set(customer);
            this.loading.set(false);
          },
          error: (error) => {
            console.error('Error loading customer:', error);
            this.loading.set(false);
            this.showToast('Error al cargar cliente', 'danger');
            this.router.navigate(['/customers']);
          }
        });
      }
    });
  }

  /**
   * Handle segment change
   */
  onSegmentChange(event: any) {
    this.selectedSegment.set(event.detail.value);
  }

  /**
   * Navigate to edit customer
   */
  editCustomer() {
    if (!this.customerId) return;
    this.router.navigate(['/customers', this.customerId, 'edit']);
  }

  /**
   * Delete customer with confirmation
   */
  async deleteCustomer() {
    const customer = this.customer();
    if (!customer) return;

    // Build detailed message
    let message = `¿Está seguro de eliminar a ${customer.name}?`;

    if (customer.totalPurchases && customer.totalPurchases > 0) {
      message += `\n\nEste cliente tiene ${customer.totalPurchases} compras registradas por un total de ${this.formatCurrency(customer.totalSpent || 0)}.`;
      message += '\n\nAl eliminar el cliente, se mantendrá el historial de ventas pero no podrá realizar nuevas operaciones con este cliente.';
    } else {
      message += '\n\nEsta acción no se puede deshacer.';
    }

    const alert = await this.alertController.create({
      header: 'Eliminar Cliente',
      message,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.confirmDelete();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Confirm and execute delete
   */
  private confirmDelete() {
    if (!this.customerId) return;

    this.customersService.deleteCustomer(this.customerId).subscribe({
      next: () => {
        this.showToast('Cliente eliminado exitosamente', 'success');
        this.router.navigate(['/customers']);
      },
      error: (error) => {
        console.error('Error deleting customer:', error);
        this.showToast('Error al eliminar cliente', 'danger');
      }
    });
  }

  /**
   * Call customer
   */
  callCustomer(phone: string) {
    window.location.href = `tel:${phone}`;
  }

  /**
   * Email customer
   */
  emailCustomer(email: string) {
    window.location.href = `mailto:${email}`;
  }

  /**
   * Send WhatsApp message to customer
   */
  whatsappCustomer(phone: string) {
    // Clean phone number (remove spaces, dashes, parentheses)
    const cleanPhone = phone.replace(/[\s\-()]/g, '');

    // Ensure phone starts with country code
    let whatsappPhone = cleanPhone;
    if (!cleanPhone.startsWith('+')) {
      // Add Paraguay country code if not present
      whatsappPhone = cleanPhone.startsWith('595') ? `+${cleanPhone}` : `+595${cleanPhone}`;
    }

    // Open WhatsApp with pre-filled message
    const message = encodeURIComponent('Hola, me comunico desde PagoPy.');
    const whatsappUrl = `https://wa.me/${whatsappPhone.replace('+', '')}?text=${message}`;

    window.open(whatsappUrl, '_blank');
  }

  /**
   * Open map with customer address
   */
  openMap(address: string, city?: string) {
    const fullAddress = city ? `${address}, ${city}` : address;
    const encodedAddress = encodeURIComponent(fullAddress);

    // Use Google Maps URL scheme that works on both web and mobile
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

    window.open(mapsUrl, '_blank');
  }

  /**
   * Get customer type icon
   */
  getCustomerTypeIcon(type: CustomerType): string {
    return type === CustomerType.BUSINESS ? 'businessOutline' : 'personCircle';
  }

  /**
   * Get customer type label
   */
  getCustomerTypeLabel(type: CustomerType): string {
    return type === CustomerType.BUSINESS ? 'Empresa' : 'Individual';
  }

  /**
   * Format currency (Paraguayan Guaraníes)
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format date
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-PY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
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
}
