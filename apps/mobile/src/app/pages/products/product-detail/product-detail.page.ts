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
  IonFab,
  IonFabButton,
  IonFabList,
  IonImg,
  IonActionSheet,
  AlertController,
  ToastController,
  ModalController,
  ActionSheetController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  pencilOutline,
  trashOutline,
  barcodeOutline,
  pricetagOutline,
  cubeOutline,
  documentTextOutline,
  checkmarkCircle,
  closeCircle,
  ellipsisVertical,
  add,
  remove,
  cameraOutline,
  imagesOutline,
  closeOutline,
  scanOutline
} from 'ionicons/icons';
import { ProductsService } from '../../../core/services/products.service';
import { Product } from '../../../models/product.model';
import { ProductFormComponent } from '../../../shared/components/product-form/product-form.component';
import { CameraService } from '../../../core/services/camera.service';
import { QrScannerComponent } from '../../../shared/components/qr-scanner/qr-scanner.component';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
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
    IonFab,
    IonFabButton,
    IonFabList,
    IonImg,
    IonActionSheet
  ]
})
export class ProductDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productsService = inject(ProductsService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private modalController = inject(ModalController);
  private actionSheetController = inject(ActionSheetController);
  private cameraService = inject(CameraService);

  // Signals
  product = signal<Product | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  isNewProduct = signal(false);
  productImage = signal<string | null>(null);
  uploadingImage = signal(false);

  constructor() {
    addIcons({
      pencilOutline,
      trashOutline,
      barcodeOutline,
      pricetagOutline,
      cubeOutline,
      documentTextOutline,
      checkmarkCircle,
      closeCircle,
      ellipsisVertical,
      add,
      remove,
      cameraOutline,
      imagesOutline,
      closeOutline,
      scanOutline
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id === 'new') {
      this.isNewProduct.set(true);
      this.openProductForm();
    } else if (id) {
      this.loadProduct(id);
    } else {
      this.router.navigate(['/products']);
    }
  }

  loadProduct(id: string) {
    this.loading.set(true);
    this.error.set(null);

    this.productsService.getProductById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        // Load product image if available
        if (product.imageUrl) {
          this.productImage.set(product.imageUrl);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.error.set('Error al cargar el producto');
        this.loading.set(false);
        this.showErrorToast('Error al cargar el producto');
      }
    });
  }

  async openProductForm(product?: Product) {
    const modal = await this.modalController.create({
      component: ProductFormComponent,
      componentProps: {
        product: product || this.product()
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      if (this.isNewProduct()) {
        // Navigate to the new product
        this.router.navigate(['/products', data.id], { replaceUrl: true });
        this.isNewProduct.set(false);
        this.loadProduct(data.id);
      } else {
        // Reload current product
        this.product.set(data);
      }
    } else if (role === 'cancel' && this.isNewProduct()) {
      // If cancelled on new product, go back to list
      this.router.navigate(['/products'], { replaceUrl: true });
    }
  }

  async showDeleteConfirm() {
    const product = this.product();
    if (!product) return;

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
            this.deleteProduct();
          }
        }
      ]
    });

    await alert.present();
  }

  deleteProduct() {
    const product = this.product();
    if (!product) return;

    this.productsService.deleteProduct(product.id).subscribe({
      next: () => {
        this.showSuccessToast('Producto eliminado');
        this.router.navigate(['/products'], { replaceUrl: true });
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        this.showErrorToast('Error al eliminar producto');
      }
    });
  }

  async toggleActive() {
    const product = this.product();
    if (!product) return;

    const newStatus = !product.isActive;

    this.productsService.updateProduct(product.id, { isActive: newStatus }).subscribe({
      next: (updated) => {
        this.product.set(updated);
        const message = newStatus ? 'Producto activado' : 'Producto desactivado';
        this.showSuccessToast(message);
      },
      error: (err) => {
        console.error('Error updating product:', err);
        this.showErrorToast('Error al actualizar producto');
      }
    });
  }

  async adjustStock() {
    const product = this.product();
    if (!product) return;

    const alert = await this.alertController.create({
      header: 'Ajustar Stock',
      message: `Stock actual: ${product.stock}`,
      inputs: [
        {
          name: 'operation',
          type: 'radio',
          label: 'Agregar',
          value: 'add',
          checked: true
        },
        {
          name: 'operation',
          type: 'radio',
          label: 'Restar',
          value: 'subtract'
        },
        {
          name: 'operation',
          type: 'radio',
          label: 'Establecer',
          value: 'set'
        },
        {
          name: 'quantity',
          type: 'number',
          placeholder: 'Cantidad',
          min: 0
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: (data) => {
            const quantity = parseInt(data.quantity);
            if (isNaN(quantity) || quantity < 0) {
              this.showErrorToast('Cantidad inválida');
              return false;
            }

            this.updateStock(data.operation, quantity);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  updateStock(operation: 'add' | 'subtract' | 'set', quantity: number) {
    const product = this.product();
    if (!product) return;

    this.productsService.updateStock(product.id, quantity, operation).subscribe({
      next: (updated) => {
        this.product.set(updated);
        this.showSuccessToast('Stock actualizado');
      },
      error: (err) => {
        console.error('Error updating stock:', err);
        this.showErrorToast('Error al actualizar stock');
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

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStockColor(stock: number): string {
    if (stock === 0) return 'danger';
    if (stock < 10) return 'warning';
    return 'success';
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }

  getTaxBadgeColor(taxRate: number): string {
    if (taxRate === 0) return 'medium';
    if (taxRate === 5) return 'tertiary';
    return 'primary';
  }

  calculateProfit(): number {
    const product = this.product();
    if (!product || !product.cost) return 0;
    return product.price - product.cost;
  }

  calculateMargin(): number {
    const product = this.product();
    if (!product || !product.cost || product.cost === 0) return 0;
    return ((product.price - product.cost) / product.cost) * 100;
  }

  /**
   * Show image options (camera, gallery, remove)
   */
  async showImageOptions() {
    const buttons: any[] = [
      {
        text: 'Tomar Foto',
        icon: 'camera-outline',
        handler: () => {
          this.takePhoto();
        }
      },
      {
        text: 'Seleccionar de Galería',
        icon: 'images-outline',
        handler: () => {
          this.selectFromGallery();
        }
      }
    ];

    // Add remove option if image exists
    if (this.productImage()) {
      buttons.push({
        text: 'Eliminar Imagen',
        icon: 'close-outline',
        role: 'destructive',
        handler: () => {
          this.removeImage();
        }
      });
    }

    buttons.push({
      text: 'Cancelar',
      icon: 'close',
      role: 'cancel'
    });

    const actionSheet = await this.actionSheetController.create({
      header: 'Imagen del Producto',
      buttons
    });

    await actionSheet.present();
  }

  /**
   * Take photo with camera
   */
  async takePhoto() {
    try {
      this.uploadingImage.set(true);
      const product = this.product();
      if (!product) return;

      const result = await this.cameraService.takeAndUploadProductPhoto(product.id);
      this.productImage.set(result.url);
      await this.showSuccessToast('Imagen subida exitosamente');
    } catch (error) {
      console.error('Error taking photo:', error);
      await this.showErrorToast('Error al tomar foto');
    } finally {
      this.uploadingImage.set(false);
    }
  }

  /**
   * Select photo from gallery
   */
  async selectFromGallery() {
    try {
      this.uploadingImage.set(true);
      const product = this.product();
      if (!product) return;

      const result = await this.cameraService.selectAndUploadProductPhoto(product.id);
      this.productImage.set(result.url);
      await this.showSuccessToast('Imagen subida exitosamente');
    } catch (error) {
      console.error('Error selecting photo:', error);
      await this.showErrorToast('Error al seleccionar foto');
    } finally {
      this.uploadingImage.set(false);
    }
  }

  /**
   * Remove product image
   */
  async removeImage() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas eliminar la imagen?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.productImage.set(null);
            this.showSuccessToast('Imagen eliminada');
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Scan barcode to update product code
   */
  async scanBarcode() {
    try {
      const modal = await this.modalController.create({
        component: QrScannerComponent,
        cssClass: 'barcode-scanner-modal'
      });

      await modal.present();

      const { data } = await modal.onWillDismiss<{ text: string; format: string }>();

      if (data?.text) {
        // Update product code with scanned barcode
        const product = this.product();
        if (product) {
          const alert = await this.alertController.create({
            header: 'Código Escaneado',
            message: `¿Deseas actualizar el código del producto a "${data.text}"?`,
            buttons: [
              {
                text: 'Cancelar',
                role: 'cancel'
              },
              {
                text: 'Actualizar',
                handler: () => {
                  this.updateProductCode(data.text);
                }
              }
            ]
          });

          await alert.present();
        }
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      await this.showErrorToast('Error al escanear código');
    }
  }

  /**
   * Update product code
   */
  private updateProductCode(code: string) {
    const product = this.product();
    if (!product) return;

    this.productsService.updateProduct(product.id, { code }).subscribe({
      next: (updated) => {
        this.product.set(updated);
        this.showSuccessToast('Código actualizado');
      },
      error: (err) => {
        console.error('Error updating code:', err);
        this.showErrorToast('Error al actualizar código');
      }
    });
  }

  /**
   * View full screen image
   */
  async viewImageFullScreen() {
    if (!this.productImage()) return;

    const alert = await this.alertController.create({
      header: this.product()?.name || 'Imagen del Producto',
      message: `<img src="${this.productImage()}" style="width: 100%; border-radius: 8px;">`,
      buttons: ['Cerrar'],
      cssClass: 'image-preview-alert'
    });

    await alert.present();
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
