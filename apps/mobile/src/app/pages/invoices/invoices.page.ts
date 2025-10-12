/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonSkeletonText,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonBadge,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  AlertController,
  LoadingController,
  ToastController,
  ActionSheetController,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  receiptOutline,
  receipt,
  filterOutline,
  filter,
  personOutline,
  keyOutline,
  cashOutline,
  calendarOutline,
  shareOutline,
  downloadOutline,
  syncOutline
} from 'ionicons/icons';
import { InvoicesService } from '../../core/services/invoices.service';
import {
  Invoice,
  InvoiceStatus,
  InvoiceListFilter,
  InvoiceStats,
  ShareInvoiceOptions
} from '../../models/invoice.model';
import { InvoiceFilterModalComponent, InvoiceFilterOptions } from './invoice-filter-modal/invoice-filter-modal.component';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.page.html',
  styleUrls: ['./invoices.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonRefresher,
    IonRefresherContent,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonSkeletonText,
    IonGrid,
    IonRow,
    IonCol,
    IonList,
    IonBadge,
    IonInfiniteScroll,
    IonInfiniteScrollContent
  ]
})
export class InvoicesPage implements OnInit {
  readonly invoicesService = inject(InvoicesService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private actionSheetController = inject(ActionSheetController);
  private modalController = inject(ModalController);

  // Signals
  invoices = signal<Invoice[]>([]);
  stats = signal<InvoiceStats | null>(null);
  loading = signal(false);
  hasMore = signal(true);
  activeFiltersCount = signal(0);

  // Filter state
  searchTerm = '';
  selectedStatus = 'all';
  currentPage = 1;
  readonly pageSize = 20;
  advancedFilters: InvoiceFilterOptions | null = null;

  constructor() {
    addIcons({
      receiptOutline,
      receipt,
      filterOutline,
      filter,
      personOutline,
      keyOutline,
      cashOutline,
      calendarOutline,
      shareOutline,
      downloadOutline,
      syncOutline
    });
  }

  ngOnInit() {
    this.loadInvoices();
    this.loadStats();
  }

  /**
   * Load invoices with current filters
   */
  loadInvoices(reset = true) {
    if (reset) {
      this.currentPage = 1;
      this.hasMore.set(true);
    }

    this.loading.set(true);

    const filter: InvoiceListFilter = {
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm || undefined,
      status: this.selectedStatus !== 'all' ? this.selectedStatus as InvoiceStatus : undefined
    };

    this.invoicesService.getInvoices(filter).subscribe({
      next: (response) => {
        if (reset) {
          this.invoices.set(response.invoices);
        } else {
          this.invoices.set([...this.invoices(), ...response.invoices]);
        }

        this.hasMore.set(response.page < response.totalPages);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.loading.set(false);
        this.showToast('Error al cargar facturas', 'danger');
      }
    });
  }

  /**
   * Load statistics
   */
  loadStats() {
    this.invoicesService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  /**
   * Handle pull to refresh
   */
  handleRefresh(event: any) {
    this.loadInvoices(true);
    this.loadStats();

    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  /**
   * Handle infinite scroll
   */
  loadMore(event: any) {
    this.currentPage++;
    this.loadInvoices(false);

    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  /**
   * Handle search input
   */
  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.loadInvoices(true);
  }

  /**
   * Handle status filter change
   */
  onStatusChange(event: any) {
    this.selectedStatus = event.detail.value;
    this.loadInvoices(true);
  }

  /**
   * Present filter modal
   */
  async presentFilterModal() {
    const modal = await this.modalController.create({
      component: InvoiceFilterModalComponent,
      componentProps: {
        currentFilters: this.advancedFilters
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss<InvoiceFilterOptions>();

    if (role === 'apply' && data) {
      this.advancedFilters = data;
      this.updateActiveFiltersCount();
      this.loadInvoices(true);
    }
  }

  /**
   * Update count of active filters
   */
  private updateActiveFiltersCount() {
    if (!this.advancedFilters) {
      this.activeFiltersCount.set(0);
      return;
    }

    let count = 0;
    if (this.advancedFilters.status && this.advancedFilters.status.length > 0) count++;
    if (this.advancedFilters.dateFrom) count++;
    if (this.advancedFilters.dateTo) count++;
    if (this.advancedFilters.amountMin !== undefined) count++;
    if (this.advancedFilters.amountMax !== undefined) count++;
    if (this.advancedFilters.hasCustomer !== undefined) count++;
    if (this.advancedFilters.hasCdc !== undefined) count++;
    if (this.advancedFilters.pdfGenerated !== undefined) count++;

    this.activeFiltersCount.set(count);
  }

  /**
   * Clear advanced filters
   */
  clearAdvancedFilters() {
    this.advancedFilters = null;
    this.activeFiltersCount.set(0);
    this.loadInvoices(true);
  }

  /**
   * Open invoice detail
   */
  openInvoiceDetail(invoiceId: string) {
    this.router.navigate(['/invoices/detail', invoiceId]);
  }

  /**
   * Share invoice
   */
  async shareInvoice(event: Event, invoice: Invoice) {
    event.stopPropagation();

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
  async downloadPdf(event: Event, invoice: Invoice) {
    event.stopPropagation();

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
   * Resend invoice to SET
   */
  async resendToSet(event: Event, invoice: Invoice) {
    event.stopPropagation();

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

                // Update invoice in list
                const invoiceList = this.invoices();
                const index = invoiceList.findIndex(inv => inv.id === invoice.id);
                if (index >= 0) {
                  invoiceList[index] = updatedInvoice;
                  this.invoices.set([...invoiceList]);
                }

                this.showToast('Factura enviada a SET', 'success');
                this.loadStats();
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
   * Format CDC for display
   */
  formatCdc(cdc: string): string {
    if (!cdc || cdc.length < 10) return cdc;
    return cdc.substring(0, 10) + '...';
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
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Track by function for invoice list
   */
  trackByInvoiceId(index: number, invoice: Invoice): string {
    return invoice.id;
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
