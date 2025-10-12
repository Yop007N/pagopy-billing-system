import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonDatetime,
  IonSelect,
  IonSelectOption,
  IonRange,
  IonCheckbox,
  IonText,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, checkmarkOutline, trashOutline } from 'ionicons/icons';
import { InvoiceStatus } from '../../../models/invoice.model';

export interface InvoiceFilterOptions {
  status?: InvoiceStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
  hasCustomer?: boolean;
  hasCdc?: boolean;
  pdfGenerated?: boolean;
}

@Component({
  selector: 'app-invoice-filter-modal',
  templateUrl: './invoice-filter-modal.component.html',
  styleUrls: ['./invoice-filter-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    IonDatetime,
    IonSelect,
    IonSelectOption,
    IonRange,
    IonCheckbox,
    IonText
  ]
})
export class InvoiceFilterModalComponent {
  private modalController = inject(ModalController);

  // Filter options
  selectedStatuses = signal<InvoiceStatus[]>([]);
  dateFrom = signal<string | null>(null);
  dateTo = signal<string | null>(null);
  amountMin = signal<number>(0);
  amountMax = signal<number>(10000000);
  hasCustomer = signal<boolean | null>(null);
  hasCdc = signal<boolean | null>(null);
  pdfGenerated = signal<boolean | null>(null);

  // Available statuses
  readonly availableStatuses = [
    { value: InvoiceStatus.DRAFT, label: 'Borrador' },
    { value: InvoiceStatus.PENDING, label: 'Pendiente' },
    { value: InvoiceStatus.APPROVED, label: 'Aprobada' },
    { value: InvoiceStatus.REJECTED, label: 'Rechazada' },
    { value: InvoiceStatus.CANCELLED, label: 'Cancelada' }
  ];

  // Amount range
  amountRange = signal<{ lower: number; upper: number }>({
    lower: 0,
    upper: 10000000
  });

  constructor() {
    addIcons({
      closeOutline,
      checkmarkOutline,
      trashOutline
    });
  }

  /**
   * Handle status selection change
   */
  onStatusChange(event: any) {
    this.selectedStatuses.set(event.detail.value);
  }

  /**
   * Handle date from change
   */
  onDateFromChange(event: any) {
    this.dateFrom.set(event.detail.value);
  }

  /**
   * Handle date to change
   */
  onDateToChange(event: any) {
    this.dateTo.set(event.detail.value);
  }

  /**
   * Handle amount range change
   */
  onAmountRangeChange(event: any) {
    const value = event.detail.value;
    this.amountRange.set(value);
    this.amountMin.set(value.lower);
    this.amountMax.set(value.upper);
  }

  /**
   * Apply filters
   */
  applyFilters() {
    const filters: InvoiceFilterOptions = {
      status: this.selectedStatuses().length > 0 ? this.selectedStatuses() : undefined,
      dateFrom: this.dateFrom() ? new Date(this.dateFrom()!) : undefined,
      dateTo: this.dateTo() ? new Date(this.dateTo()!) : undefined,
      amountMin: this.amountMin() > 0 ? this.amountMin() : undefined,
      amountMax: this.amountMax() < 10000000 ? this.amountMax() : undefined,
      hasCustomer: this.hasCustomer(),
      hasCdc: this.hasCdc(),
      pdfGenerated: this.pdfGenerated()
    };

    this.modalController.dismiss(filters, 'apply');
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.selectedStatuses.set([]);
    this.dateFrom.set(null);
    this.dateTo.set(null);
    this.amountMin.set(0);
    this.amountMax.set(10000000);
    this.amountRange.set({ lower: 0, upper: 10000000 });
    this.hasCustomer.set(null);
    this.hasCdc.set(null);
    this.pdfGenerated.set(null);
  }

  /**
   * Close modal without applying
   */
  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return amount.toLocaleString('es-PY');
  }

  /**
   * Get count of active filters
   */
  getActiveFiltersCount(): number {
    let count = 0;

    if (this.selectedStatuses().length > 0) count++;
    if (this.dateFrom()) count++;
    if (this.dateTo()) count++;
    if (this.amountMin() > 0) count++;
    if (this.amountMax() < 10000000) count++;
    if (this.hasCustomer() !== null) count++;
    if (this.hasCdc() !== null) count++;
    if (this.pdfGenerated() !== null) count++;

    return count;
  }
}
