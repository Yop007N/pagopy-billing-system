/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, inject, signal, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonList,
  IonSpinner,
  IonNote,
  IonBadge,
  IonSearchbar,
  IonModal,
  ToastController,
  LoadingController,
  ModalController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  saveOutline,
  addCircleOutline,
  trashOutline,
  cashOutline,
  cardOutline,
  swapHorizontalOutline,
  cloudOfflineOutline,
  checkmarkCircleOutline,
  searchOutline,
  personOutline,
  barcodeOutline,
  printOutline
} from 'ionicons/icons';
import { firstValueFrom, Subscription } from 'rxjs';
import { SalesService } from '../../../services/sales.service';
import { SyncService } from '../../../services/sync.service';
import { NetworkService } from '../../../core/services/network.service';
import { CreateSaleDto } from '../../../models/offline-sale.model';
import { CustomersService } from '../../../core/services/customers.service';
import { ProductsService } from '../../../core/services/products.service';
import { PrinterService } from '../../../core/services/printer.service';
import { BarcodeScannerService } from '../../../core/services/barcode-scanner.service';

// Define PaymentMethod and CustomerType locally if not available from shared models
enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
  QR = 'qr'
}

enum CustomerType {
  CONSUMER = 'consumer',
  BUSINESS = 'business'
}

@Component({
  selector: 'app-new-sale',
  templateUrl: './new-sale.page.html',
  styleUrls: ['./new-sale.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonList,
    IonSpinner,
    IonNote,
    IonBadge,
    IonSearchbar,
    IonModal
  ]
})
export class NewSalePage implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private salesService = inject(SalesService);
  private syncService = inject(SyncService);
  private networkService = inject(NetworkService);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);
  private customersService = inject(CustomersService);
  private productsService = inject(ProductsService);
  private printerService = inject(PrinterService);
  private modalController = inject(ModalController);
  private alertController = inject(AlertController);
  private barcodeScanner = inject(BarcodeScannerService);

  // Expose enums to template
  readonly PaymentMethod = PaymentMethod;
  readonly CustomerType = CustomerType;

  // Subscriptions management
  private formSubscriptions: Subscription[] = [];

  // Signals
  loading = signal(false);
  isOnline = this.networkService.isOnline;
  syncStatus = this.syncService.syncStatus;
  totals = signal({
    subtotalGravado10: 0,
    iva10: 0,
    subtotalGravado5: 0,
    iva5: 0,
    exento: 0,
    total: 0
  });

  // Search signals
  customerSearchResults = signal<any[]>([]);
  productSearchResults = signal<any[]>([]);
  isSearchingCustomers = signal(false);
  isSearchingProducts = signal(false);
  showCustomerModal = signal(false);
  showProductModal = signal(false);
  selectedCustomer = signal<any>(null);
  printerConnected = signal(false);
  scanningBarcode = signal(false);

  saleForm: FormGroup;

  constructor() {
    // Register icons
    addIcons({
      saveOutline,
      addCircleOutline,
      trashOutline,
      cashOutline,
      cardOutline,
      swapHorizontalOutline,
      cloudOfflineOutline,
      checkmarkCircleOutline,
      searchOutline,
      personOutline,
      barcodeOutline,
      printOutline
    });

    // Initialize form
    this.saleForm = this.fb.group({
      // Customer info
      customerType: [CustomerType.CONSUMER, Validators.required],
      customerName: ['', Validators.required],
      customerRuc: ['', Validators.pattern(/^\d{6,8}-\d$/)],
      customerEmail: ['', Validators.email],
      customerPhone: [''],

      // Payment info
      paymentMethod: [PaymentMethod.CASH, Validators.required],

      // Items
      items: this.fb.array([])
    });

    // Add first item by default
    this.addItem();
  }

  async ngOnInit() {
    // Network status is now handled by NetworkService signal
    // No manual subscription needed

    // Check printer connection status
    this.printerConnected.set(this.printerService.isConnected());
  }

  get items(): FormArray {
    return this.saleForm.get('items') as FormArray;
  }

  addItem(): void {
    const itemGroup = this.fb.group({
      concept: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      amount: [0, [Validators.required, Validators.min(0)]],
      iva: [10, Validators.required],
      subtotal: [{ value: 0, disabled: true }]
    });

    const currentItemIndex = this.items.length;

    // Subscribe to value changes for automatic calculation and track subscription
    const quantitySubscription = itemGroup.get('quantity')?.valueChanges.subscribe(() => {
      this.calculateItemTotal(currentItemIndex);
    });

    const amountSubscription = itemGroup.get('amount')?.valueChanges.subscribe(() => {
      this.calculateItemTotal(currentItemIndex);
    });

    const ivaSubscription = itemGroup.get('iva')?.valueChanges.subscribe(() => {
      this.calculateAllTotals();
    });

    // Store subscriptions for cleanup
    if (quantitySubscription) this.formSubscriptions.push(quantitySubscription);
    if (amountSubscription) this.formSubscriptions.push(amountSubscription);
    if (ivaSubscription) this.formSubscriptions.push(ivaSubscription);

    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.calculateAllTotals();
    } else {
      this.presentToast('Debe haber al menos un item', 'warning');
    }
  }

  calculateItemTotal(index: number): void {
    const item = this.items.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const amount = item.get('amount')?.value || 0;
    const subtotal = quantity * amount;
    item.get('subtotal')?.setValue(subtotal);

    this.calculateAllTotals();
  }

  calculateAllTotals(): void {
    let subtotalGravado10 = 0;
    let subtotalGravado5 = 0;
    let exento = 0;

    this.items.controls.forEach((item, _index) => {
      // Ensure subtotal is calculated
      const quantity = item.get('quantity')?.value || 0;
      const amount = item.get('amount')?.value || 0;
      const subtotal = quantity * amount;
      item.get('subtotal')?.setValue(subtotal);

      const iva = item.get('iva')?.value || 0;

      if (iva === 10) {
        subtotalGravado10 += subtotal;
      } else if (iva === 5) {
        subtotalGravado5 += subtotal;
      } else {
        exento += subtotal;
      }
    });

    const iva10 = subtotalGravado10 * 0.10;
    const iva5 = subtotalGravado5 * 0.05;
    const total = subtotalGravado10 + iva10 + subtotalGravado5 + iva5 + exento;

    this.totals.set({
      subtotalGravado10,
      iva10,
      subtotalGravado5,
      iva5,
      exento,
      total
    });
  }

  async onSubmit(printTicket = false): Promise<void> {
    // Validate form
    if (this.saleForm.invalid) {
      this.markFormGroupTouched(this.saleForm);
      await this.presentToast('Por favor complete todos los campos requeridos', 'danger');
      return;
    }

    // Show loading
    const loading = await this.loadingController.create({
      message: this.isOnline() ? 'Guardando venta...' : 'Guardando venta offline...',
      spinner: 'crescent'
    });
    await loading.present();

    this.loading.set(true);

    try {
      const formValue = this.saleForm.getRawValue();
      const totalsData = this.totals();

      // Map form items to SaleItem format (CreateSaleDto)
      const items = formValue.items.map((item: any) => {
        const quantity = item.quantity || 1;
        const unitPrice = item.amount || 0;
        const subtotalBeforeTax = quantity * unitPrice;
        const taxRate = (item.iva || 0) / 100;
        const taxAmount = subtotalBeforeTax * taxRate;
        const total = subtotalBeforeTax + taxAmount;

        return {
          productName: item.concept,
          quantity,
          unitPrice,
          subtotal: subtotalBeforeTax,
          taxRate: item.iva || 0,
          taxAmount,
          total
        };
      });

      // Create sale data matching CreateSaleDto interface
      const saleData: CreateSaleDto = {
        customerName: formValue.customerName,
        customerDocument: formValue.customerRuc || undefined,
        items,
        subtotal: totalsData.subtotalGravado10 + totalsData.subtotalGravado5 + totalsData.exento,
        tax: totalsData.iva10 + totalsData.iva5,
        total: totalsData.total,
        paymentMethod: formValue.paymentMethod,
        notes: undefined
      };

      // Use offline-first SalesService
      const _result = await this.salesService.createSale(saleData);

      await loading.dismiss();

      // Print ticket if requested and printer is connected
      if (printTicket && this.printerConnected()) {
        try {
          await this.printSaleTicket(saleData);
        } catch (printError) {
          console.error('Error printing ticket:', printError);
          await this.presentToast('Venta guardada pero no se pudo imprimir', 'warning');
        }
      }

      if (this.isOnline()) {
        await this.presentToast('Venta registrada exitosamente', 'success');
      } else {
        await this.presentToast('Venta guardada offline. Se sincronizara cuando haya conexion', 'warning');
      }

      // Navigate back to sales list
      this.router.navigate(['/tabs/sales']);
    } catch (error: any) {
      await loading.dismiss();
      console.error('Error creating sale:', error);
      await this.presentToast(
        error.message || 'Error al registrar la venta. Intente nuevamente.',
        'danger'
      );
    } finally {
      this.loading.set(false);
    }
  }

  // Customer search methods
  async openCustomerSearch() {
    this.showCustomerModal.set(true);
    this.customerSearchResults.set([]);
  }

  async searchCustomers(event: any) {
    const query = event.target.value?.trim();
    if (!query || query.length < 2) {
      this.customerSearchResults.set([]);
      return;
    }

    this.isSearchingCustomers.set(true);
    try {
      const results = await firstValueFrom(this.customersService.searchCustomers(query));
      this.customerSearchResults.set(results);
    } catch (error) {
      console.error('Error searching customers:', error);
      await this.presentToast('Error al buscar clientes', 'danger');
    } finally {
      this.isSearchingCustomers.set(false);
    }
  }

  selectCustomer(customer: any) {
    this.selectedCustomer.set(customer);
    this.saleForm.patchValue({
      customerName: customer.name,
      customerRuc: customer.taxId || customer.documentId,
      customerEmail: customer.email,
      customerPhone: customer.phone
    });
    this.showCustomerModal.set(false);
    this.customerSearchResults.set([]);
  }

  closeCustomerModal() {
    this.showCustomerModal.set(false);
    this.customerSearchResults.set([]);
  }

  // Product search methods
  async openProductSearch(itemIndex: number) {
    this.showProductModal.set(true);
    this.productSearchResults.set([]);
    // Store the current item index for later use
    (this as any).currentItemIndex = itemIndex;
  }

  async searchProducts(event: any) {
    const query = event.target.value?.trim();
    if (!query || query.length < 2) {
      this.productSearchResults.set([]);
      return;
    }

    this.isSearchingProducts.set(true);
    try {
      const results = await firstValueFrom(
        this.productsService.searchProducts({ query, isActive: true })
      );
      this.productSearchResults.set(results);
    } catch (error) {
      console.error('Error searching products:', error);
      await this.presentToast('Error al buscar productos', 'danger');
    } finally {
      this.isSearchingProducts.set(false);
    }
  }

  selectProduct(product: any) {
    const itemIndex = (this as any).currentItemIndex || 0;
    const item = this.items.at(itemIndex);

    item.patchValue({
      concept: product.name,
      amount: product.price,
      iva: product.taxRate || 10
    });

    this.calculateItemTotal(itemIndex);
    this.showProductModal.set(false);
    this.productSearchResults.set([]);
  }

  closeProductModal() {
    this.showProductModal.set(false);
    this.productSearchResults.set([]);
  }

  // Barcode scanning implementation
  async scanBarcode(itemIndex: number) {
    try {
      // Check if scanning is supported on this device
      const isSupported = await this.barcodeScanner.isSupported();
      if (!isSupported) {
        await this.showBarcodeFallbackDialog(itemIndex);
        return;
      }

      // Request camera permission
      const hasPermission = await this.barcodeScanner.requestPermission();
      if (!hasPermission) {
        await this.showPermissionDeniedDialog();
        return;
      }

      this.scanningBarcode.set(true);

      // Show scanning UI
      const loading = await this.loadingController.create({
        message: 'Preparando escáner...',
        duration: 2000
      });
      await loading.present();

      // Start scanning
      const result = await this.barcodeScanner.startScan();
      await loading.dismiss();

      if (result.hasContent && result.content) {
        // Validate barcode
        if (this.barcodeScanner.isValidBarcodeFormat(result.content)) {
          // Search for product by barcode
          await this.searchProductByBarcode(result.content, itemIndex);
        } else {
          await this.presentToast('Formato de código de barras no válido', 'danger');
        }
      } else {
        // Scanning was cancelled
        await this.presentToast('Escaneo cancelado', 'warning');
      }
    } catch (error: any) {
      console.error('Error scanning barcode:', error);

      if (error.message?.includes('permission')) {
        await this.showPermissionDeniedDialog();
      } else {
        await this.presentToast(
          `Error al escanear: ${error.message || 'Error desconocido'}`,
          'danger'
        );
      }
    } finally {
      this.scanningBarcode.set(false);
      // Ensure scanner is stopped
      await this.barcodeScanner.stopScan();
    }
  }

  // Search product by barcode and add to sale
  private async searchProductByBarcode(barcode: string, itemIndex: number) {
    const searchLoading = await this.loadingController.create({
      message: 'Buscando producto...',
      spinner: 'crescent'
    });
    await searchLoading.present();

    try {
      // Search products by barcode (code field)
      const results = await firstValueFrom(
        this.productsService.searchProducts({ query: barcode, isActive: true })
      );

      await searchLoading.dismiss();

      if (results && results.length > 0) {
        // Product found - use the first matching product
        const product = results[0];
        const item = this.items.at(itemIndex);

        item.patchValue({
          concept: product.name,
          amount: product.price,
          iva: product.taxRate || 10
        });

        this.calculateItemTotal(itemIndex);

        await this.presentToast(
          `Producto agregado: ${product.name}`,
          'success'
        );
      } else {
        // Product not found
        const alert = await this.alertController.create({
          header: 'Producto no encontrado',
          message: `No se encontró ningún producto con el código de barras: ${barcode}`,
          buttons: [
            {
              text: 'Cerrar',
              role: 'cancel'
            },
            {
              text: 'Ingresar manualmente',
              handler: () => {
                // User can manually enter product details
                this.presentToast('Ingrese los datos del producto manualmente', 'warning');
              }
            }
          ]
        });
        await alert.present();
      }
    } catch (error) {
      await searchLoading.dismiss();
      console.error('Error searching product by barcode:', error);
      await this.presentToast('Error al buscar el producto', 'danger');
    }
  }

  // Show dialog when permission is denied
  private async showPermissionDeniedDialog() {
    const alert = await this.alertController.create({
      header: 'Permiso de cámara necesario',
      message: 'Para escanear códigos de barras, necesitamos acceso a la cámara. ¿Desea abrir la configuración?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Abrir configuración',
          handler: async () => {
            await this.barcodeScanner.openSettings();
          }
        }
      ]
    });

    await alert.present();
  }

  // Show fallback dialog when barcode scanning is not supported
  private async showBarcodeFallbackDialog(itemIndex: number) {
    const alert = await this.alertController.create({
      header: 'Ingreso manual',
      message: 'El escáner de códigos de barras no está disponible en este dispositivo. Ingrese el código manualmente.',
      inputs: [
        {
          name: 'barcode',
          type: 'text',
          placeholder: 'Código de barras'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Buscar',
          handler: async (data) => {
            if (data.barcode) {
              await this.searchProductByBarcode(data.barcode, itemIndex);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Printing methods
  async printSaleTicket(saleData: CreateSaleDto) {
    if (!this.printerConnected()) {
      const alert = await this.alertController.create({
        header: 'Impresora no conectada',
        message: '¿Desea configurar una impresora ahora?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Configurar',
            handler: () => {
              this.router.navigate(['/settings/printer']);
            }
          }
        ]
      });
      await alert.present();
      return;
    }

    try {
      const loading = await this.loadingController.create({
        message: 'Imprimiendo ticket...',
        spinner: 'crescent'
      });
      await loading.present();

      await this.printerService.printSaleTicket(saleData);
      await loading.dismiss();
      await this.presentToast('Ticket impreso correctamente', 'success');
    } catch (error) {
      console.error('Error printing:', error);
      await this.presentToast('Error al imprimir ticket', 'danger');
      throw error;
    }
  }

  async showSaveOptions() {
    const alert = await this.alertController.create({
      header: 'Guardar Venta',
      message: '¿Desea imprimir el ticket?',
      buttons: [
        {
          text: 'Solo Guardar',
          handler: () => {
            this.onSubmit(false);
          }
        },
        {
          text: 'Guardar e Imprimir',
          handler: () => {
            this.onSubmit(true);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  getPaymentMethodIcon(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.CASH:
        return 'cash-outline';
      case PaymentMethod.CARD:
        return 'card-outline';
      case PaymentMethod.TRANSFER:
        return 'swap-horizontal-outline';
      default:
        return 'cash-outline';
    }
  }

  getPaymentMethodLabel(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.CASH:
        return 'Efectivo';
      case PaymentMethod.CARD:
        return 'Tarjeta';
      case PaymentMethod.TRANSFER:
        return 'Transferencia';
      default:
        return 'Efectivo';
    }
  }

  getCustomerTypeLabel(type: CustomerType): string {
    switch (type) {
      case CustomerType.CONSUMER:
        return 'Consumidor Final';
      case CustomerType.BUSINESS:
        return 'Empresa';
      default:
        return 'Consumidor Final';
    }
  }

  ngOnDestroy(): void {
    // Clean up all form subscriptions to prevent memory leaks
    this.formSubscriptions.forEach(subscription => subscription.unsubscribe());
    this.formSubscriptions = [];
  }
}
