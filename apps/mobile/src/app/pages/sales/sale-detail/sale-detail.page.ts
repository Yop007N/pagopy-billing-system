/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonChip,
  AlertController,
  ActionSheetController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cloudDoneOutline,
  cloudOfflineOutline,
  syncOutline,
  timeOutline,
  cashOutline,
  cardOutline,
  qrCodeOutline,
  documentTextOutline,
  shareOutline,
  printOutline,
  personOutline,
  receiptOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  trashOutline
} from 'ionicons/icons';
import { SalesService, Sale } from '../../../services/sales.service';
import { NetworkService } from '../../../core/services/network.service';
import { SyncService } from '../../../services/sync.service';

@Component({
  selector: 'app-sale-detail',
  templateUrl: './sale-detail.page.html',
  styleUrls: ['./sale-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonBadge,
    IonGrid,
    IonRow,
    IonCol,
    IonSpinner,
    IonChip
  ]
})
export class SaleDetailPage implements OnInit {
  saleId: string | null = null;
  sale = signal<Sale | null>(null);
  loading = signal<boolean>(false);

  isOnline = this.network.isOnline;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private salesService: SalesService,
    private network: NetworkService,
    private sync: SyncService,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController
  ) {
    addIcons({
      cloudDoneOutline,
      cloudOfflineOutline,
      syncOutline,
      timeOutline,
      cashOutline,
      cardOutline,
      qrCodeOutline,
      documentTextOutline,
      shareOutline,
      printOutline,
      personOutline,
      receiptOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      trashOutline
    });
  }

  async ngOnInit() {
    this.saleId = this.route.snapshot.paramMap.get('id');
    if (this.saleId) {
      await this.loadSaleDetail();
    }
  }

  async loadSaleDetail() {
    if (!this.saleId) return;

    this.loading.set(true);

    try {
      const saleData = await this.salesService.getSale(this.saleId);
      this.sale.set(saleData);
    } catch (error) {
      console.error('Error loading sale detail:', error);
      await this.showAlert('Error', 'No se pudo cargar el detalle de la venta');
      this.router.navigate(['/tabs/sales']);
    } finally {
      this.loading.set(false);
    }
  }

  async retrySync() {
    const sale = this.sale();
    if (!sale || !sale.localId) return;

    if (!this.isOnline()) {
      await this.showAlert('Sin conexión', 'No hay conexión a internet para sincronizar');
      return;
    }

    try {
      await this.salesService.retrySync(sale.localId);
      await this.showAlert('Éxito', 'La venta se agregó a la cola de sincronización');
      await this.loadSaleDetail();
    } catch (error: any) {
      await this.showAlert('Error', error.message || 'Error al reintentar sincronización');
    }
  }

  async showActions() {
    const sale = this.sale();
    if (!sale) return;

    const buttons = [
      {
        text: 'Compartir',
        icon: 'share-outline',
        handler: () => {
          this.shareSale();
        }
      }
    ];

    // Only show retry sync for pending/error sales
    if (sale.syncStatus === 'pending' || sale.syncStatus === 'error') {
      buttons.push({
        text: 'Reintentar Sincronización',
        icon: 'sync-outline',
        handler: () => {
          this.retrySync();
        }
      });
    }

    // Only show delete for offline sales
    if (sale.localId) {
      buttons.push({
        text: 'Eliminar',
        icon: 'trash-outline',
        role: 'destructive' as const,
        handler: () => {
          this.deleteSale();
        }
      });
    }

    buttons.push({
      text: 'Cancelar',
      icon: 'close',
      role: 'cancel' as const
    });

    const actionSheet = await this.actionSheetController.create({
      header: 'Acciones',
      buttons
    });

    await actionSheet.present();
  }

  async shareSale() {
    const sale = this.sale();
    if (!sale) return;

    const text = this.generateSaleText(sale);

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Venta - ${sale.customerName}`,
          text
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(text);
        await this.showAlert('Copiado', 'Detalle de la venta copiado al portapapeles');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }

  async deleteSale() {
    const sale = this.sale();
    if (!sale || !sale.localId) return;

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que quieres eliminar esta venta? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.salesService.deleteOfflineSale(sale.localId!);
              await this.showAlert('Éxito', 'Venta eliminada correctamente');
              this.router.navigate(['/tabs/sales']);
            } catch (error) {
              await this.showAlert('Error', 'No se pudo eliminar la venta');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  generateSaleText(sale: Sale): string {
    let text = `VENTA - ${sale.customerName}\n\n`;
    text += `Fecha: ${new Date(sale.createdAt).toLocaleString()}\n`;
    if (sale.customerDocument) {
      text += `Documento: ${sale.customerDocument}\n`;
    }
    text += `Método de pago: ${this.formatPaymentMethod(sale.paymentMethod)}\n\n`;

    text += `ITEMS:\n`;
    sale.items.forEach((item, index) => {
      text += `${index + 1}. ${item.productName}\n`;
      text += `   Cantidad: ${item.quantity} x ${item.unitPrice.toLocaleString()} Gs.\n`;
      text += `   Subtotal: ${item.total.toLocaleString()} Gs.\n`;
    });

    text += `\nTOTAL: ${sale.total.toLocaleString()} Gs.\n`;
    text += `\nEstado: ${this.getSyncStatusText(sale.syncStatus)}`;

    return text;
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
      case 'error': return 'Error al sincronizar';
      default: return 'Pendiente de sincronización';
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

  getPaymentMethodIcon(method: string): string {
    const icons: Record<string, string> = {
      cash: 'cash-outline',
      card: 'card-outline',
      transfer: 'swap-horizontal-outline',
      qr: 'qr-code-outline'
    };
    return icons[method] || 'cash-outline';
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }
}
