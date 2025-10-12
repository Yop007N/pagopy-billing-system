import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { Sale, SaleStatus, PaymentMethod, PaymentStatus } from '@pago-py/shared-models';

@Component({
  selector: 'app-sale-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatCardModule,
    MatTableModule
  ],
  template: `
    <div class="sale-detail-dialog">
      <div class="dialog-header flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <mat-icon class="text-4xl">receipt_long</mat-icon>
          <div>
            <h2 mat-dialog-title class="m-0">Detalle de Venta</h2>
            <p class="text-gray-600 text-sm m-0">#{{ sale.saleNumber }}</p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <!-- Sale Status -->
        <div class="mb-6">
          <mat-chip [class]="getStatusClass(sale.status)" class="text-base">
            {{ getStatusLabel(sale.status) }}
          </mat-chip>
        </div>

        <!-- Sale Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>calendar_today</mat-icon>
              <mat-card-title>Información de la Venta</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-row">
                <span class="label">Fecha:</span>
                <span class="value">{{ sale.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Número de Venta:</span>
                <span class="value font-mono">#{{ sale.saleNumber }}</span>
              </div>
              @if (sale.invoiceNumber) {
                <div class="info-row">
                  <span class="label">Número de Factura:</span>
                  <span class="value font-mono">{{ sale.invoiceNumber }}</span>
                </div>
              }
              @if (sale.timbrado) {
                <div class="info-row">
                  <span class="label">Timbrado:</span>
                  <span class="value">{{ sale.timbrado }}</span>
                </div>
              }
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>person</mat-icon>
              <mat-card-title>Información del Cliente</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-row">
                <span class="label">Nombre:</span>
                <span class="value">{{ getCustomerName() }}</span>
              </div>
              @if (sale.customer?.documentId || sale.customerRuc) {
                <div class="info-row">
                  <span class="label">RUC:</span>
                  <span class="value">{{ sale.customer?.documentId || sale.customerRuc }}</span>
                </div>
              }
              @if (sale.customer?.email || sale.customerEmail) {
                <div class="info-row">
                  <span class="label">Email:</span>
                  <span class="value">{{ sale.customer?.email || sale.customerEmail }}</span>
                </div>
              }
              @if (sale.customerPhone) {
                <div class="info-row">
                  <span class="label">Teléfono:</span>
                  <span class="value">{{ sale.customerPhone }}</span>
                </div>
              }
              <div class="info-row">
                <span class="label">Tipo:</span>
                <span class="value">{{ getCustomerType() }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Payment Information -->
        <mat-card class="mb-6">
          <mat-card-header>
            <mat-icon mat-card-avatar>payment</mat-icon>
            <mat-card-title>Información de Pago</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="info-row">
                <span class="label">Método de Pago:</span>
                <span class="value flex items-center gap-1">
                  <mat-icon class="text-sm">{{ getPaymentIcon(sale.paymentMethod) }}</mat-icon>
                  {{ getPaymentLabel(sale.paymentMethod) }}
                </span>
              </div>
              @if (sale.payment) {
                <div class="info-row">
                  <span class="label">Estado del Pago:</span>
                  <span class="value">
                    <mat-chip [class]="getPaymentStatusClass(sale.payment!.status)" class="text-xs">
                      {{ getPaymentStatusLabel(sale.payment!.status) }}
                    </mat-chip>
                  </span>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Items -->
        <mat-card class="mb-6">
          <mat-card-header>
            <mat-icon mat-card-avatar>shopping_cart</mat-icon>
            <mat-card-title>Items de la Venta</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="overflow-x-auto">
              <table mat-table [dataSource]="sale.items || []" class="w-full">
                <ng-container matColumnDef="product">
                  <th mat-header-cell *matHeaderCellDef>Producto</th>
                  <td mat-cell *matCellDef="let item">
                    <div>
                      <div class="font-medium">{{ item.product?.name || item.concept }}</div>
                      @if (item.product?.code) {
                        <div class="text-xs text-gray-500">Código: {{ item.product.code }}</div>
                      }
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef class="text-center">Cantidad</th>
                  <td mat-cell *matCellDef="let item" class="text-center">
                    {{ item.quantity }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="unitPrice">
                  <th mat-header-cell *matHeaderCellDef class="text-right">Precio Unit.</th>
                  <td mat-cell *matCellDef="let item" class="text-right">
                    {{ item.unitPrice || item.amount | number:'1.0-0' }} Gs
                  </td>
                </ng-container>

                <ng-container matColumnDef="iva">
                  <th mat-header-cell *matHeaderCellDef class="text-center">IVA</th>
                  <td mat-cell *matCellDef="let item" class="text-center">
                    {{ item.taxRate || item.iva }}%
                  </td>
                </ng-container>

                <ng-container matColumnDef="subtotal">
                  <th mat-header-cell *matHeaderCellDef class="text-right">Subtotal</th>
                  <td mat-cell *matCellDef="let item" class="text-right">
                    {{ item.subtotal | number:'1.0-0' }} Gs
                  </td>
                </ng-container>

                <ng-container matColumnDef="total">
                  <th mat-header-cell *matHeaderCellDef class="text-right">Total</th>
                  <td mat-cell *matCellDef="let item" class="text-right font-semibold">
                    {{ item.total | number:'1.0-0' }} Gs
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Totals -->
        <mat-card>
          <mat-card-content>
            <div class="totals-section">
              <div class="total-row">
                <span class="label">Subtotal:</span>
                <span class="value">{{ (sale.subtotal ?? sale.subtotalGravado) | number:'1.0-0' }} Gs</span>
              </div>
              <div class="total-row">
                <span class="label">IVA:</span>
                <span class="value">{{ (sale.tax ?? (sale.iva10 + sale.iva5)) | number:'1.0-0' }} Gs</span>
              </div>
              @if (sale.discount && sale.discount > 0) {
                <div class="total-row text-red-600">
                  <span class="label">Descuento:</span>
                  <span class="value">-{{ sale.discount | number:'1.0-0' }} Gs</span>
                </div>
              }
              <mat-divider class="my-2"></mat-divider>
              <div class="total-row text-xl font-bold">
                <span class="label">Total:</span>
                <span class="value text-primary">{{ sale.total | number:'1.0-0' }} Gs</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Notifications Status -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
          <div class="status-badge" [class.active]="sale.pdfGenerated">
            <mat-icon>{{ sale.pdfGenerated ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
            <span>PDF Generado</span>
          </div>
          <div class="status-badge" [class.active]="sale.whatsappSent">
            <mat-icon>{{ sale.whatsappSent ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
            <span>WhatsApp Enviado</span>
          </div>
          <div class="status-badge" [class.active]="sale.emailSent">
            <mat-icon>{{ sale.emailSent ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
            <span>Email Enviado</span>
          </div>
        </div>

        @if (sale.notes) {
          <mat-card class="mt-4">
            <mat-card-header>
              <mat-icon mat-card-avatar>note</mat-icon>
              <mat-card-title>Notas</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="whitespace-pre-wrap">{{ sale.notes }}</p>
            </mat-card-content>
          </mat-card>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        @if (sale.pdfUrl) {
          <button mat-raised-button color="primary" (click)="downloadPdf()">
            <mat-icon>download</mat-icon>
            Descargar Factura
          </button>
        }
        <button mat-button mat-dialog-close>Cerrar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .sale-detail-dialog {
      max-width: 100%;
    }

    .dialog-header mat-icon {
      width: auto;
      height: auto;
      color: #1976d2;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-row .label {
      font-weight: 500;
      color: #6b7280;
    }

    .info-row .value {
      color: #111827;
      text-align: right;
    }

    .totals-section {
      background: #f9fafb;
      padding: 16px;
      border-radius: 8px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      color: #6b7280;
    }

    .status-badge.active {
      background-color: #dcfce7;
      border-color: #86efac;
      color: #166534;
    }

    .status-badge mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    mat-chip {
      font-size: 12px;
      min-height: 24px;
      padding: 4px 8px;
    }

    table {
      font-size: 14px;
    }

    th.mat-header-cell {
      font-weight: 600;
      color: #374151;
    }
  `]
})
export class SaleDetailDialogComponent {
  dialogRef = inject(MatDialogRef<SaleDetailDialogComponent>);
  displayedColumns = ['product', 'quantity', 'unitPrice', 'iva', 'subtotal', 'total'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { sale: Sale }) {}

  get sale(): Sale {
    return this.data.sale;
  }

  getCustomerName(): string {
    return this.sale.customer?.name || this.sale.customerName || 'Cliente General';
  }

  getCustomerType(): string {
    return this.sale.customerType === 'BUSINESS' ? 'Empresa' : 'Consumidor Final';
  }

  getStatusClass(status: SaleStatus): string {
    const classes: Record<string, string> = {
      [SaleStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [SaleStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [SaleStatus.CANCELLED]: 'bg-red-100 text-red-800'
    };
    return classes[status] || '';
  }

  getStatusLabel(status: SaleStatus): string {
    const labels: Record<string, string> = {
      [SaleStatus.PENDING]: 'Pendiente',
      [SaleStatus.COMPLETED]: 'Completada',
      [SaleStatus.CANCELLED]: 'Cancelada'
    };
    return labels[status] || status;
  }

  getPaymentStatusClass(status: PaymentStatus): string {
    const classes: Record<string, string> = {
      [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [PaymentStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [PaymentStatus.FAILED]: 'bg-red-100 text-red-800'
    };
    return classes[status] || '';
  }

  getPaymentStatusLabel(status: PaymentStatus): string {
    const labels: Record<string, string> = {
      [PaymentStatus.PENDING]: 'Pendiente',
      [PaymentStatus.COMPLETED]: 'Completado',
      [PaymentStatus.FAILED]: 'Fallido'
    };
    return labels[status] || status;
  }

  getPaymentIcon(method: PaymentMethod): string {
    const icons: Record<string, string> = {
      [PaymentMethod.CASH]: 'payments',
      [PaymentMethod.TRANSFER]: 'account_balance',
      [PaymentMethod.CARD]: 'credit_card'
    };
    return icons[method] || 'payment';
  }

  getPaymentLabel(method: PaymentMethod): string {
    const labels: Record<string, string> = {
      [PaymentMethod.CASH]: 'Efectivo',
      [PaymentMethod.TRANSFER]: 'Transferencia Bancaria',
      [PaymentMethod.CARD]: 'Tarjeta de Crédito/Débito'
    };
    return labels[method] || method;
  }

  downloadPdf(): void {
    if (this.sale.pdfUrl) {
      window.open(this.sale.pdfUrl, '_blank');
    }
  }
}
