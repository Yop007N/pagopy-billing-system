/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, OnInit, inject, signal } from '@angular/core';
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
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonSkeletonText,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  AlertController,
  LoadingController,
  ToastController,
  ActionSheetController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  receiptOutline,
  receipt,
  personOutline,
  cardOutline,
  calendarOutline,
  cashOutline,
  downloadOutline,
  shareOutline,
  syncOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  timeOutline,
  documentTextOutline,
  keyOutline,
  qrCodeOutline,
  listOutline,
  informationCircleOutline,
  printOutline
} from 'ionicons/icons';
import { InvoicesService } from '../../../core/services/invoices.service';
import { PrinterService } from '../../../core/services/printer.service';
import { Invoice, ShareInvoiceOptions } from '../../../models/invoice.model';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.page.html',
  styleUrls: ['./invoice-detail.page.scss'],
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
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonSkeletonText,
    IonSpinner,
    IonRefresher,
    IonRefresherContent
  ]
})
export class InvoiceDetailPage implements OnInit {
  readonly invoicesService = inject(InvoicesService);
  private printerService = inject(PrinterService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private actionSheetController = inject(ActionSheetController);

  invoice = signal<Invoice | null>(null);
  loading = signal(true);
  invoiceId = '';

  constructor() {
    addIcons({
      receiptOutline,
      receipt,
      personOutline,
      cardOutline,
      calendarOutline,
      cashOutline,
      downloadOutline,
      shareOutline,
      syncOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      timeOutline,
      documentTextOutline,
      keyOutline,
      qrCodeOutline,
      listOutline,
      informationCircleOutline,
      printOutline
    });
  }

  ngOnInit() {
    this.invoiceId = this.route.snapshot.paramMap.get('id') || '';
    if (this.invoiceId) {
      this.loadInvoice();
    }
  }

  /**
   * Load invoice details
   */
  loadInvoice() {
    this.loading.set(true);

    this.invoicesService.getInvoiceById(this.invoiceId).subscribe({
      next: (invoice) => {
        this.invoice.set(invoice);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading invoice:', error);
        this.loading.set(false);
        this.showToast('Error al cargar factura', 'danger');
        this.router.navigate(['/invoices']);
      }
    });
  }

  /**
   * Handle pull to refresh
   */
  handleRefresh(event: any) {
    this.loadInvoice();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  /**
   * Share invoice
   */
  async shareInvoice() {
    const invoice = this.invoice();
    if (!invoice) return;

    const actionSheet = await this.actionSheetController.create({
      header: 'Compartir Factura',
      buttons: [
        {
          text: 'WhatsApp',
          icon: 'logo-whatsapp',
          handler: () => {
            this.shareViaMethod(invoice, 'whatsapp');
          }
        },
        {
          text: 'Email',
          icon: 'mail-outline',
          handler: () => {
            this.shareViaMethod(invoice, 'email');
          }
        },
        {
          text: 'Compartir...',
          icon: 'share-outline',
          handler: () => {
            this.shareViaMethod(invoice, 'share');
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  /**
   * Share via specific method
   */
  async shareViaMethod(invoice: Invoice, method: 'whatsapp' | 'email' | 'share') {
    const loading = await this.loadingController.create({
      message: 'Preparando factura...'
    });
    await loading.present();

    try {
      const options: ShareInvoiceOptions = {
        method,
        customerEmail: invoice.sale?.customer?.email || undefined,
        customerPhone: invoice.sale?.customer?.phone || undefined
      };

      await this.invoicesService.shareInvoice(invoice, options);
      await loading.dismiss();
      this.showToast('Factura compartida', 'success');
    } catch (error) {
      await loading.dismiss();
      console.error('Error sharing invoice:', error);
      this.showToast('Error al compartir factura', 'danger');
    }
  }

  /**
   * Download PDF
   */
  async downloadPdf() {
    const invoice = this.invoice();
    if (!invoice) return;

    const loading = await this.loadingController.create({
      message: 'Descargando PDF...'
    });
    await loading.present();

    try {
      await this.invoicesService.downloadPdf(invoice.id).toPromise();
      await loading.dismiss();
      this.showToast('PDF descargado', 'success');
    } catch (error) {
      await loading.dismiss();
      console.error('Error downloading PDF:', error);
      this.showToast('Error al descargar PDF', 'danger');
    }
  }

  /**
   * Resend to SET
   */
  async resendToSet() {
    const invoice = this.invoice();
    if (!invoice) return;

    const alert = await this.alertController.create({
      header: 'Reenviar a SET',
      message: '¿Desea reenviar esta factura al sistema SET e-Kuatia?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Reenviar',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Enviando a SET...'
            });
            await loading.present();

            this.invoicesService.sendToSet({ invoiceId: invoice.id, force: true }).subscribe({
              next: async (updatedInvoice) => {
                await loading.dismiss();
                this.invoice.set(updatedInvoice);
                this.showToast('Factura enviada a SET', 'success');
              },
              error: async (error) => {
                await loading.dismiss();
                console.error('Error sending to SET:', error);
                this.showToast('Error al enviar a SET', 'danger');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Check SET status
   */
  async checkSetStatus() {
    const invoice = this.invoice();
    if (!invoice) return;

    const loading = await this.loadingController.create({
      message: 'Consultando estado en SET...'
    });
    await loading.present();

    this.invoicesService.checkSetStatus(invoice.id).subscribe({
      next: async (updatedInvoice) => {
        await loading.dismiss();
        this.invoice.set(updatedInvoice);
        this.showToast('Estado actualizado', 'success');
      },
      error: async (error) => {
        await loading.dismiss();
        console.error('Error checking SET status:', error);
        this.showToast('Error al consultar estado', 'danger');
      }
    });
  }

  /**
   * Cancel invoice
   */
  async cancelInvoice() {
    const invoice = this.invoice();
    if (!invoice) return;

    const alert = await this.alertController.create({
      header: 'Anular Factura',
      message: 'Ingrese el motivo de anulación:',
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Motivo de anulación...'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Anular',
          handler: async (data) => {
            if (!data.reason) {
              this.showToast('Debe ingresar un motivo', 'warning');
              return false;
            }

            const loading = await this.loadingController.create({
              message: 'Anulando factura...'
            });
            await loading.present();

            this.invoicesService.cancelInvoice(invoice.id, data.reason).subscribe({
              next: async (updatedInvoice) => {
                await loading.dismiss();
                this.invoice.set(updatedInvoice);
                this.showToast('Factura anulada', 'success');
              },
              error: async (error) => {
                await loading.dismiss();
                console.error('Error cancelling invoice:', error);
                this.showToast('Error al anular factura', 'danger');
              }
            });

            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * View SET response details
   */
  async viewSetResponse() {
    const invoice = this.invoice();
    if (!invoice || !invoice.setResponse) return;

    const alert = await this.alertController.create({
      header: 'Respuesta SET',
      message: `<pre>${JSON.stringify(invoice.setResponse, null, 2)}</pre>`,
      buttons: ['Cerrar']
    });

    await alert.present();
  }

  /**
   * Print invoice using thermal printer
   */
  async printInvoice() {
    const invoice = this.invoice();
    if (!invoice) return;

    // Check if printer is connected
    if (!this.printerService.isConnected()) {
      const alert = await this.alertController.create({
        header: 'Impresora no conectada',
        message: 'Debe conectar una impresora térmica antes de imprimir. ¿Desea ir a configuración?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Configurar',
            handler: () => {
              this.router.navigate(['/tabs/profile/settings']);
            }
          }
        ]
      });

      await alert.present();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Imprimiendo factura...'
    });
    await loading.present();

    try {
      // Convert invoice to printable format
      const printData = this.convertInvoiceToPrintFormat(invoice);

      // Print using printer service
      await this.printerService.printInvoice(printData);

      await loading.dismiss();
      this.showToast('Factura impresa correctamente', 'success');
    } catch (error) {
      await loading.dismiss();
      console.error('Error printing invoice:', error);
      this.showToast('Error al imprimir factura', 'danger');
    }
  }

  /**
   * Convert invoice to printer format
   */
  private convertInvoiceToPrintFormat(invoice: Invoice): any {
    return {
      invoiceNumber: invoice.invoiceNumber,
      saleNumber: invoice.sale?.saleNumber,
      cdc: invoice.cdc,
      timbrado: invoice.timbradoNumber,
      customer: {
        name: invoice.sale?.customer?.name || 'Cliente',
        documentType: invoice.sale?.customer?.documentType,
        documentId: invoice.sale?.customer?.documentId
      },
      items: (invoice.sale?.items || []).map(item => ({
        name: item.product.name,
        productName: item.product.name,
        code: item.product.code,
        quantity: item.quantity,
        price: item.unitPrice,
        total: item.total
      })),
      subtotal: invoice.sale?.subtotal || 0,
      tax: invoice.sale?.tax || 0,
      discount: invoice.sale?.discount || 0,
      total: invoice.sale?.total || 0,
      paymentMethod: invoice.sale?.paymentMethod || 'Efectivo',
      date: invoice.createdAt,
      seller: 'Sistema' // Could be enhanced to include actual seller info
    };
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return amount.toLocaleString('es-PY');
  }

  /**
   * Format date
   */
  formatDate(date: Date | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get status icon
   */
  getStatusIcon(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'checkmark-circle-outline';
      case 'REJECTED':
        return 'close-circle-outline';
      case 'PENDING':
        return 'time-outline';
      default:
        return 'information-circle-outline';
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
