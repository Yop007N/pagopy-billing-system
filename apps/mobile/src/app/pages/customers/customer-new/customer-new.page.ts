/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonBadge,
  IonIcon,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cloudOfflineOutline } from 'ionicons/icons';
import { CustomerFormComponent } from '../../../shared/components/customer-form/customer-form.component';
import { CustomersService } from '../../../core/services/customers.service';
import { NetworkService } from '../../../core/services/network.service';
import { CreateCustomerDto } from '../../../models/customer.model';

/**
 * CustomerNewPage - Create new customer
 */
@Component({
  selector: 'app-customer-new',
  templateUrl: './customer-new.page.html',
  styleUrls: ['./customer-new.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonBadge,
    IonIcon,
    CustomerFormComponent
  ]
})
export class CustomerNewPage implements OnInit {
  private customersService = inject(CustomersService);
  private networkService = inject(NetworkService);
  private router = inject(Router);
  private toastController = inject(ToastController);

  isOnline = signal(true);

  constructor() {
    addIcons({ cloudOfflineOutline });
  }

  ngOnInit() {
    // Subscribe to network status
    this.networkService.isOnline$.subscribe(online => {
      this.isOnline.set(online);
    });
  }

  /**
   * Handle form submission
   */
  onFormSubmit(dto: CreateCustomerDto) {
    this.customersService.createCustomer(dto).subscribe({
      next: (customer) => {
        const message = this.isOnline()
          ? 'Cliente creado exitosamente'
          : 'Cliente guardado localmente. Se sincronizará cuando esté en línea.';
        this.showToast(message, 'success');
        const customerId = customer.id || customer._localId;
        this.router.navigate(['/customers', customerId]);
      },
      error: (error) => {
        console.error('Error creating customer:', error);
        this.showToast('Error al crear cliente', 'danger');
      }
    });
  }

  /**
   * Handle form cancellation
   */
  onFormCancel() {
    this.router.navigate(['/customers']);
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
