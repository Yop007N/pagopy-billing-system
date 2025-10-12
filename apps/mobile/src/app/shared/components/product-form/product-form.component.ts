import { Component, OnInit, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonSpinner,
  IonNote,
  ModalController,
  ToastController,
  AlertController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, saveOutline, barcodeOutline } from 'ionicons/icons';
import { ProductsService } from '../../../core/services/products.service';
import { Product, CreateProductDto, UpdateProductDto } from '../../../models/product.model';
import { BarcodeScannerService } from '../../../core/services/barcode-scanner.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonSpinner,
    IonNote
  ]
})
export class ProductFormComponent implements OnInit {
  @Input() product?: Product;

  private fb = inject(FormBuilder);
  private modalController = inject(ModalController);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);
  private productsService = inject(ProductsService);
  private barcodeScanner = inject(BarcodeScannerService);

  productForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  scanningBarcode = signal(false);

  // Tax rate options (IVA in Paraguay)
  taxRateOptions = [
    { value: 0, label: 'Exento (0%)' },
    { value: 5, label: 'IVA 5%' },
    { value: 10, label: 'IVA 10%' }
  ];

  constructor() {
    addIcons({ closeOutline, saveOutline, barcodeOutline });
  }

  ngOnInit() {
    this.isEditMode.set(!!this.product);
    this.initializeForm();
  }

  private initializeForm() {
    this.productForm = this.fb.group({
      code: [
        this.product?.code || '',
        [Validators.required, Validators.minLength(1), Validators.maxLength(50)]
      ],
      name: [
        this.product?.name || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(200)]
      ],
      description: [
        this.product?.description || '',
        [Validators.maxLength(500)]
      ],
      price: [
        this.product?.price || 0,
        [Validators.required, Validators.min(0)]
      ],
      cost: [
        this.product?.cost || 0,
        [Validators.min(0)]
      ],
      stock: [
        this.product?.stock || 0,
        [Validators.required, Validators.min(0)]
      ],
      taxRate: [
        this.product?.taxRate ?? 10,
        [Validators.required, Validators.min(0), Validators.max(10)]
      ],
      isActive: [
        this.product?.isActive ?? true
      ]
    });

    // Calculate profit margin when price or cost changes
    this.productForm.get('price')?.valueChanges.subscribe(() => {
      this.calculateProfit();
    });

    this.productForm.get('cost')?.valueChanges.subscribe(() => {
      this.calculateProfit();
    });
  }

  calculateProfit(): { profit: number; margin: number } {
    const price = this.productForm.get('price')?.value || 0;
    const cost = this.productForm.get('cost')?.value || 0;

    const profit = price - cost;
    const margin = cost > 0 ? (profit / cost) * 100 : 0;

    return { profit, margin };
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0
    }).format(value);
  }

  async scanBarcode() {
    // Check if barcode scanning is enabled
    if (!environment.features.barcodeScanner) {
      await this.showErrorToast('Escáner de código de barras no disponible');
      return;
    }

    try {
      // Check if scanning is supported on this device
      const isSupported = await this.barcodeScanner.isSupported();
      if (!isSupported) {
        await this.showBarcodeFallbackDialog();
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
          // Set the barcode value in the form
          this.productForm.patchValue({ code: result.content });

          await this.showSuccessToast(
            `Código escaneado: ${result.content}${result.format ? ` (${result.format})` : ''}`
          );
        } else {
          await this.showErrorToast('Formato de código de barras no válido');
        }
      } else {
        // Scanning was cancelled
        await this.showToast('Escaneo cancelado', 'warning');
      }
    } catch (error: any) {
      console.error('Error scanning barcode:', error);

      if (error.message?.includes('permission')) {
        await this.showPermissionDeniedDialog();
      } else {
        await this.showErrorToast(`Error al escanear: ${error.message || 'Error desconocido'}`);
      }
    } finally {
      this.scanningBarcode.set(false);
      // Ensure scanner is stopped
      await this.barcodeScanner.stopScan();
    }
  }

  /**
   * Show dialog when permission is denied
   */
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

  /**
   * Show fallback dialog when barcode scanning is not supported
   */
  private async showBarcodeFallbackDialog() {
    const alert = await this.alertController.create({
      header: 'Ingreso manual',
      message: 'El escáner de códigos de barras no está disponible en este dispositivo. Ingrese el código manualmente.',
      inputs: [
        {
          name: 'barcode',
          type: 'text',
          placeholder: 'Código de barras',
          value: this.productForm.get('code')?.value || ''
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: (data) => {
            if (data.barcode) {
              this.productForm.patchValue({ code: data.barcode });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Show toast with warning color
   */
  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  async onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      await this.showErrorToast('Por favor completa todos los campos requeridos');
      return;
    }

    this.loading.set(true);

    const formValue = this.productForm.value;

    try {
      if (this.isEditMode() && this.product) {
        // Update existing product
        const updateData: UpdateProductDto = {
          code: formValue.code,
          name: formValue.name,
          description: formValue.description || undefined,
          price: parseFloat(formValue.price),
          cost: formValue.cost ? parseFloat(formValue.cost) : undefined,
          stock: parseInt(formValue.stock),
          taxRate: parseInt(formValue.taxRate),
          isActive: formValue.isActive
        };

        this.productsService.updateProduct(this.product.id, updateData).subscribe({
          next: async (updated) => {
            await this.showSuccessToast('Producto actualizado exitosamente');
            this.modalController.dismiss(updated, 'confirm');
          },
          error: async (error) => {
            console.error('Error updating product:', error);
            await this.showErrorToast('Error al actualizar el producto');
            this.loading.set(false);
          }
        });
      } else {
        // Create new product
        const createData: CreateProductDto = {
          code: formValue.code,
          name: formValue.name,
          description: formValue.description || undefined,
          price: parseFloat(formValue.price),
          cost: formValue.cost ? parseFloat(formValue.cost) : undefined,
          stock: parseInt(formValue.stock),
          taxRate: parseInt(formValue.taxRate)
        };

        this.productsService.createProduct(createData).subscribe({
          next: async (created) => {
            await this.showSuccessToast('Producto creado exitosamente');
            this.modalController.dismiss(created, 'confirm');
          },
          error: async (error) => {
            console.error('Error creating product:', error);
            await this.showErrorToast('Error al crear el producto');
            this.loading.set(false);
          }
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      await this.showErrorToast('Error inesperado');
      this.loading.set(false);
    }
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
    if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`;

    return 'Campo inválido';
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
}
