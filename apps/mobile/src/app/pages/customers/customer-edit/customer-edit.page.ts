/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonBadge,
  IonIcon,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cloudOfflineOutline } from 'ionicons/icons';
import { CustomerFormComponent } from '../../../shared/components/customer-form/customer-form.component';
import { CustomersService } from '../../../core/services/customers.service';
import { NetworkService } from '../../../core/services/network.service';
import { Customer, UpdateCustomerDto } from '../../../models/customer.model';

/**
 * CustomerEditPage - Edit existing customer
 */
@Component({
  selector: 'app-customer-edit',
  templateUrl: './customer-edit.page.html',
  styleUrls: ['./customer-edit.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonSpinner,
    IonBadge,
    IonIcon,
    CustomerFormComponent
  ]
})
export class CustomerEditPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customersService = inject(CustomersService);
  private networkService = inject(NetworkService);
  private toastController = inject(ToastController);

  customer = signal<Customer | null>(null);
  loading = signal(true);
  isOnline = signal(true);
  customerId: string | null = null;

  constructor() {
    addIcons({ cloudOfflineOutline });
  }

  ngOnInit() {
    this.customerId = this.route.snapshot.paramMap.get('id');
    if (this.customerId) {
      this.loadCustomer();
    }

    // Subscribe to network status
    this.networkService.isOnline$.subscribe(online => {
      this.isOnline.set(online);
    });
  }

  /**
   * Load customer for editing
   */
  loadCustomer() {
    if (!this.customerId) return;

    this.loading.set(true);
    this.customersService.getCustomerById(this.customerId).subscribe({
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

  /**
   * Handle form submission
   */
  onFormSubmit(dto: UpdateCustomerDto) {
    if (!this.customerId) return;

    this.customersService.updateCustomer(this.customerId, dto).subscribe({
      next: (customer) => {
        const message = this.isOnline()
          ? 'Cliente actualizado exitosamente'
          : 'Cliente actualizado localmente. Se sincronizará cuando esté en línea.';
        this.showToast(message, 'success');
        const customerId = customer.id || customer._localId;
        this.router.navigate(['/customers', customerId]);
      },
      error: (error) => {
        console.error('Error updating customer:', error);
        this.showToast('Error al actualizar cliente', 'danger');
      }
    });
  }

  /**
   * Handle form cancellation
   */
  onFormCancel() {
    if (this.customerId) {
      this.router.navigate(['/customers', this.customerId]);
    } else {
      this.router.navigate(['/customers']);
    }
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
