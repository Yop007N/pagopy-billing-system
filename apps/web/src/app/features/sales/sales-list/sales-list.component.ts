import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { SalesService, SalesFilters } from '../../../core/services/sales.service';
import { Sale, PaymentMethod, PaymentStatus, SaleStatus } from '@pago-py/shared-models';
import { SaleDetailDialogComponent } from '../sale-detail-dialog/sale-detail-dialog.component';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="sales-list-container p-6">
      <!-- Header Section -->
      <div class="header-section flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Historial de Ventas</h1>
          <p class="text-gray-600 mt-1">Gestiona y consulta todas tus ventas registradas</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/sales/new" class="new-sale-btn">
          <mat-icon>add_circle_outline</mat-icon>
          Nueva Venta
        </button>
      </div>

      <!-- Enhanced Filters Section -->
      <mat-card class="filter-card mb-6 elevation-2">
        <mat-card-content class="p-6">
          <div class="flex items-center mb-4">
            <mat-icon class="text-primary mr-2">filter_list</mat-icon>
            <h2 class="text-lg font-semibold text-gray-800">Filtros de Búsqueda</h2>
            @if (hasActiveFilters()) {
              <span class="ml-3 px-2 py-1 bg-primary text-white text-xs rounded-full">Activo</span>
            }
          </div>

          <form [formGroup]="filterForm">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <mat-form-field appearance="outline" class="modern-field">
                <mat-label>Buscar</mat-label>
                <input matInput placeholder="Cliente, número de venta..." formControlName="search">
                <mat-icon matPrefix class="text-gray-500">search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="modern-field">
                <mat-label>Estado</mat-label>
                <mat-select formControlName="status">
                  <mat-option [value]="null">
                    <span class="flex items-center gap-2">
                      <mat-icon>check_box_outline_blank</mat-icon>
                      Todos
                    </span>
                  </mat-option>
                  <mat-option [value]="SaleStatus.PENDING">
                    <span class="flex items-center gap-2">
                      <mat-icon class="text-yellow-600">pending</mat-icon>
                      Pendiente
                    </span>
                  </mat-option>
                  <mat-option [value]="SaleStatus.COMPLETED">
                    <span class="flex items-center gap-2">
                      <mat-icon class="text-green-600">check_circle</mat-icon>
                      Completada
                    </span>
                  </mat-option>
                  <mat-option [value]="SaleStatus.CANCELLED">
                    <span class="flex items-center gap-2">
                      <mat-icon class="text-red-600">cancel</mat-icon>
                      Cancelada
                    </span>
                  </mat-option>
                </mat-select>
                <mat-icon matPrefix class="text-gray-500">label</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="modern-field">
                <mat-label>Método de Pago</mat-label>
                <mat-select formControlName="paymentMethod">
                  <mat-option [value]="null">
                    <span class="flex items-center gap-2">
                      <mat-icon>payment</mat-icon>
                      Todos
                    </span>
                  </mat-option>
                  <mat-option [value]="PaymentMethod.CASH">
                    <span class="flex items-center gap-2">
                      <mat-icon>payments</mat-icon>
                      Efectivo
                    </span>
                  </mat-option>
                  <mat-option [value]="PaymentMethod.TRANSFER">
                    <span class="flex items-center gap-2">
                      <mat-icon>account_balance</mat-icon>
                      Transferencia
                    </span>
                  </mat-option>
                  <mat-option [value]="PaymentMethod.CARD">
                    <span class="flex items-center gap-2">
                      <mat-icon>credit_card</mat-icon>
                      Tarjeta
                    </span>
                  </mat-option>
                </mat-select>
                <mat-icon matPrefix class="text-gray-500">payment</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="modern-field">
                <mat-label>Rango de fechas</mat-label>
                <mat-date-range-input [rangePicker]="picker">
                  <input matStartDate formControlName="startDate" placeholder="Fecha inicio">
                  <input matEndDate formControlName="endDate" placeholder="Fecha fin">
                </mat-date-range-input>
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-date-range-picker #picker></mat-date-range-picker>
                <mat-icon matPrefix class="text-gray-500">date_range</mat-icon>
              </mat-form-field>
            </div>

            <div class="flex justify-end gap-3 mt-4">
              <button mat-stroked-button type="button" (click)="clearFilters()" class="clear-btn">
                <mat-icon>clear_all</mat-icon>
                Limpiar
              </button>
              <button mat-raised-button color="primary" type="button" (click)="applyFilters()" class="apply-btn">
                <mat-icon>check</mat-icon>
                Aplicar Filtros
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Enhanced Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <mat-card class="stat-card stat-card-primary">
          <mat-card-content class="p-6">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <p class="text-gray-600 text-sm font-medium mb-1">Total Ventas</p>
                <p class="text-3xl font-bold text-gray-900 mb-1">{{ pagination().total }}</p>
                <p class="text-xs text-gray-500">Todas las ventas registradas</p>
              </div>
              <div class="stat-icon-wrapper bg-blue-100">
                <mat-icon class="text-blue-600">receipt_long</mat-icon>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-card-success">
          <mat-card-content class="p-6">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <p class="text-gray-600 text-sm font-medium mb-1">Completadas</p>
                <p class="text-3xl font-bold text-green-600 mb-1">{{ completedCount() }}</p>
                <p class="text-xs text-gray-500">Ventas finalizadas</p>
              </div>
              <div class="stat-icon-wrapper bg-green-100">
                <mat-icon class="text-green-600">check_circle</mat-icon>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-card-warning">
          <mat-card-content class="p-6">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <p class="text-gray-600 text-sm font-medium mb-1">Pendientes</p>
                <p class="text-3xl font-bold text-yellow-600 mb-1">{{ pendingCount() }}</p>
                <p class="text-xs text-gray-500">En proceso</p>
              </div>
              <div class="stat-icon-wrapper bg-yellow-100">
                <mat-icon class="text-yellow-600">pending</mat-icon>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Sales Table/List Container -->
      <mat-card class="sales-table-card elevation-2">
        <mat-card-content class="p-0">
          @if (loading()) {
            <!-- Skeleton Loaders -->
            <div class="skeleton-container p-6">
              <div class="skeleton-header mb-4">
                <div class="skeleton-line h-8 w-48 mb-2"></div>
                <div class="skeleton-line h-4 w-96"></div>
              </div>
              @for (item of [1,2,3,4,5]; track item) {
                <div class="skeleton-row flex gap-4 mb-4 p-4 border-b">
                  <div class="skeleton-circle h-12 w-12"></div>
                  <div class="flex-1">
                    <div class="skeleton-line h-4 w-32 mb-2"></div>
                    <div class="skeleton-line h-3 w-48"></div>
                  </div>
                  <div class="skeleton-line h-4 w-24"></div>
                  <div class="skeleton-line h-4 w-16"></div>
                </div>
              }
            </div>
          } @else if (error()) {
            <div class="text-center py-12">
              <mat-icon class="text-6xl text-red-400">error_outline</mat-icon>
              <p class="text-xl text-red-600 mt-4">{{ error() }}</p>
              <button mat-raised-button color="primary" (click)="loadSales()" class="mt-4">
                Reintentar
              </button>
            </div>
          } @else if (sales().length === 0) {
            <div class="empty-state text-center py-16 px-6">
              <div class="empty-icon-wrapper mx-auto mb-6">
                <mat-icon class="text-gray-300">
                  @if (hasActiveFilters()) {
                    search_off
                  } @else {
                    receipt_long
                  }
                </mat-icon>
              </div>
              <h3 class="text-2xl font-semibold text-gray-700 mb-2">
                @if (hasActiveFilters()) {
                  No se encontraron resultados
                } @else {
                  No hay ventas registradas
                }
              </h3>
              <p class="text-gray-500 mb-6 max-w-md mx-auto">
                @if (hasActiveFilters()) {
                  No se encontraron ventas con los filtros aplicados. Prueba modificando los criterios de búsqueda.
                } @else {
                  Comienza a registrar tus ventas para ver el historial completo aquí.
                }
              </p>
              <button mat-raised-button color="primary"
                      [routerLink]="hasActiveFilters() ? null : '/sales/new'"
                      (click)="hasActiveFilters() ? clearFilters() : null"
                      class="empty-action-btn">
                <mat-icon>
                  @if (hasActiveFilters()) {
                    filter_alt_off
                  } @else {
                    add_circle_outline
                  }
                </mat-icon>
                @if (hasActiveFilters()) {
                  Limpiar filtros
                } @else {
                  Crear primera venta
                }
              </button>
            </div>
          } @else {
            <!-- Desktop Table View -->
            <div class="desktop-view overflow-x-auto">
              <table mat-table [dataSource]="sales()" matSort (matSortChange)="sortData($event)" class="modern-table w-full">
                <ng-container matColumnDef="saleNumber">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>N° Venta</th>
                  <td mat-cell *matCellDef="let sale">
                    <span class="sale-number font-mono font-bold text-primary">#{{ sale.saleNumber }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="customer">
                  <th mat-header-cell *matHeaderCellDef>Cliente</th>
                  <td mat-cell *matCellDef="let sale">
                    <div class="customer-cell">
                      <div class="font-semibold text-gray-900">{{ getCustomerName(sale) }}</div>
                      @if (sale.customer?.documentId) {
                        <div class="text-xs text-gray-500 mt-1">
                          <mat-icon class="inline text-xs">badge</mat-icon>
                          {{ sale.customer.documentId }}
                        </div>
                      }
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha</th>
                  <td mat-cell *matCellDef="let sale">
                    <div class="date-cell">
                      <div class="text-sm font-medium text-gray-900">{{ sale.createdAt | date:'dd/MM/yyyy' }}</div>
                      <div class="text-xs text-gray-500">{{ sale.createdAt | date:'HH:mm' }}</div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="items">
                  <th mat-header-cell *matHeaderCellDef>Items</th>
                  <td mat-cell *matCellDef="let sale">
                    <span class="items-badge inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                      <mat-icon class="text-sm">inventory_2</mat-icon>
                      {{ sale.items?.length || 0 }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="paymentMethod">
                  <th mat-header-cell *matHeaderCellDef>Método Pago</th>
                  <td mat-cell *matCellDef="let sale">
                    <span class="payment-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 border border-gray-200">
                      <mat-icon class="text-lg">{{ getPaymentIcon(sale.paymentMethod) }}</mat-icon>
                      {{ getPaymentLabel(sale.paymentMethod) }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="total">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-right">Total</th>
                  <td mat-cell *matCellDef="let sale" class="text-right">
                    <span class="total-amount text-lg font-bold text-gray-900">{{ sale.total | number:'1.0-0' }} <span class="text-sm text-gray-600">Gs</span></span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let sale">
                    <span class="status-badge" [ngClass]="getStatusClass(sale.status)">
                      <mat-icon class="status-icon">{{ getStatusIcon(sale.status) }}</mat-icon>
                      {{ getStatusLabel(sale.status) }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef class="text-center">Acciones</th>
                  <td mat-cell *matCellDef="let sale" class="text-center">
                    <div class="action-buttons flex items-center justify-center gap-1">
                      <button mat-icon-button
                              (click)="viewSaleDetail(sale); $event.stopPropagation()"
                              matTooltip="Ver detalle"
                              class="action-btn action-view">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button mat-icon-button
                              [matMenuTriggerFor]="menu"
                              (click)="$event.stopPropagation()"
                              matTooltip="Más opciones"
                              class="action-btn action-more">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                    </div>
                    <mat-menu #menu="matMenu" class="modern-menu">
                      <button mat-menu-item (click)="generateInvoice(sale)" [disabled]="sale.pdfGenerated">
                        <mat-icon class="text-blue-600">picture_as_pdf</mat-icon>
                        <span>Generar Factura</span>
                      </button>
                      <button mat-menu-item (click)="downloadInvoice(sale)" [disabled]="!sale.pdfUrl">
                        <mat-icon class="text-green-600">download</mat-icon>
                        <span>Descargar PDF</span>
                      </button>
                      <button mat-menu-item (click)="sendWhatsApp(sale)" [disabled]="!sale.pdfUrl || sale.whatsappSent">
                        <mat-icon class="text-green-600">whatsapp</mat-icon>
                        <span>Enviar WhatsApp</span>
                      </button>
                      <mat-divider></mat-divider>
                      <button mat-menu-item (click)="cancelSale(sale)" [disabled]="sale.status === SaleStatus.CANCELLED || sale.status === SaleStatus.COMPLETED">
                        <mat-icon class="text-red-600">cancel</mat-icon>
                        <span>Cancelar Venta</span>
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns" class="modern-header"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="modern-row" (click)="viewSaleDetail(row)"></tr>
              </table>
            </div>

            <!-- Mobile Card View -->
            <div class="mobile-view">
              @for (sale of sales(); track sale.id) {
                <div class="sale-card" (click)="viewSaleDetail(sale)">
                  <div class="sale-card-header">
                    <div class="flex-1">
                      <span class="sale-number font-mono font-bold text-primary">#{{ sale.saleNumber }}</span>
                      <span class="status-badge-mobile ml-2" [ngClass]="getStatusClass(sale.status)">
                        {{ getStatusLabel(sale.status) }}
                      </span>
                    </div>
                    <button mat-icon-button
                            [matMenuTriggerFor]="mobileMenu"
                            (click)="$event.stopPropagation()"
                            class="text-gray-500">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #mobileMenu="matMenu">
                      <button mat-menu-item (click)="viewSaleDetail(sale)">
                        <mat-icon>visibility</mat-icon>
                        <span>Ver Detalle</span>
                      </button>
                      <button mat-menu-item (click)="generateInvoice(sale)" [disabled]="sale.pdfGenerated">
                        <mat-icon>picture_as_pdf</mat-icon>
                        <span>Generar Factura</span>
                      </button>
                      <button mat-menu-item (click)="downloadInvoice(sale)" [disabled]="!sale.pdfUrl">
                        <mat-icon>download</mat-icon>
                        <span>Descargar PDF</span>
                      </button>
                      <button mat-menu-item (click)="sendWhatsApp(sale)" [disabled]="!sale.pdfUrl || sale.whatsappSent">
                        <mat-icon>whatsapp</mat-icon>
                        <span>Enviar WhatsApp</span>
                      </button>
                      <button mat-menu-item (click)="cancelSale(sale)" [disabled]="sale.status === SaleStatus.CANCELLED">
                        <mat-icon>cancel</mat-icon>
                        <span>Cancelar</span>
                      </button>
                    </mat-menu>
                  </div>

                  <div class="sale-card-body">
                    <div class="sale-info-row">
                      <mat-icon class="info-icon text-gray-500">person</mat-icon>
                      <div class="flex-1">
                        <div class="font-semibold text-gray-900">{{ getCustomerName(sale) }}</div>
                        @if (sale.customer?.documentId) {
                          <div class="text-xs text-gray-500">{{ sale.customer.documentId }}</div>
                        }
                      </div>
                    </div>

                    <div class="sale-info-row">
                      <mat-icon class="info-icon text-gray-500">event</mat-icon>
                      <div class="flex-1">
                        <span class="text-sm text-gray-700">{{ sale.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                      </div>
                    </div>

                    <div class="sale-info-row">
                      <mat-icon class="info-icon text-gray-500">{{ getPaymentIcon(sale.paymentMethod) }}</mat-icon>
                      <div class="flex-1">
                        <span class="text-sm text-gray-700">{{ getPaymentLabel(sale.paymentMethod) }}</span>
                      </div>
                      <span class="items-count text-xs bg-gray-100 px-2 py-1 rounded">
                        {{ sale.items?.length || 0 }} items
                      </span>
                    </div>

                    <div class="sale-total mt-3 pt-3 border-t">
                      <span class="text-gray-600 text-sm">Total:</span>
                      <span class="total-amount text-xl font-bold text-primary ml-2">
                        {{ sale.total | number:'1.0-0' }} Gs
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Enhanced Pagination -->
            <div class="pagination-container border-t bg-gray-50 p-4">
              <mat-paginator
                [length]="pagination().total"
                [pageSize]="pagination().limit"
                [pageIndex]="pagination().page - 1"
                [pageSizeOptions]="[10, 25, 50, 100]"
                (page)="onPageChange($event)"
                showFirstLastButtons
                class="modern-paginator">
              </mat-paginator>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    /* Container */
    .sales-list-container {
      max-width: 1600px;
      margin: 0 auto;
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Header Section */
    .header-section {
      animation: slideDown 0.4s ease-out;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .new-sale-btn {
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .new-sale-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    /* Filter Card */
    .filter-card {
      transition: all 0.3s ease;
      border-radius: 12px;
    }

    .filter-card:hover {
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .modern-field {
      transition: all 0.2s ease;
    }

    .clear-btn, .apply-btn {
      transition: all 0.2s ease;
    }

    .clear-btn:hover {
      background-color: #f3f4f6;
    }

    /* Stat Cards */
    .stat-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 12px;
      cursor: pointer;
      border: 1px solid transparent;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
    }

    .stat-card-primary:hover {
      border-color: #3b82f6;
    }

    .stat-card-success:hover {
      border-color: #10b981;
    }

    .stat-card-warning:hover {
      border-color: #f59e0b;
    }

    .stat-icon-wrapper {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .stat-card:hover .stat-icon-wrapper {
      transform: scale(1.1) rotate(5deg);
    }

    .stat-icon-wrapper mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    /* Skeleton Loaders */
    .skeleton-container {
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .skeleton-line {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    .skeleton-circle {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 50%;
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* Empty State */
    .empty-state {
      animation: fadeIn 0.5s ease-in;
    }

    .empty-icon-wrapper {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .empty-icon-wrapper mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
    }

    .empty-action-btn {
      transition: all 0.3s ease;
    }

    .empty-action-btn:hover {
      transform: scale(1.05);
    }

    /* Sales Table Card */
    .sales-table-card {
      border-radius: 12px;
      overflow: hidden;
    }

    /* Desktop Table */
    .desktop-view {
      display: block;
    }

    .mobile-view {
      display: none;
    }

    .modern-table {
      font-size: 14px;
      border-spacing: 0;
    }

    .modern-header {
      background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
      border-bottom: 2px solid #e5e7eb;
    }

    th.mat-header-cell {
      font-weight: 600;
      color: #1f2937;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 16px;
    }

    .modern-row {
      transition: all 0.2s ease;
      cursor: pointer;
      border-bottom: 1px solid #f3f4f6;
    }

    .modern-row:hover {
      background-color: #f9fafb;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      transform: scale(1.001);
    }

    td.mat-cell {
      padding: 16px;
      vertical-align: middle;
    }

    .sale-number {
      font-size: 15px;
      letter-spacing: -0.5px;
    }

    .customer-cell mat-icon {
      vertical-align: middle;
      margin-right: 4px;
    }

    .items-badge {
      transition: all 0.2s ease;
    }

    .items-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .payment-badge {
      transition: all 0.2s ease;
    }

    .payment-badge:hover {
      background-color: #e5e7eb;
      border-color: #d1d5db;
    }

    /* Status Badges */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .status-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .status-badge.bg-yellow-100 {
      background-color: #fef3c7;
      color: #92400e;
      border-color: #fde68a;
    }

    .status-badge.bg-green-100 {
      background-color: #d1fae5;
      color: #065f46;
      border-color: #a7f3d0;
    }

    .status-badge.bg-red-100 {
      background-color: #fee2e2;
      color: #991b1b;
      border-color: #fecaca;
    }

    .status-badge:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    /* Action Buttons */
    .action-buttons {
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .modern-row:hover .action-buttons {
      opacity: 1;
    }

    .action-btn {
      transition: all 0.2s ease;
    }

    .action-view:hover {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .action-more:hover {
      background-color: #f3f4f6;
    }

    /* Mobile Cards */
    @media (max-width: 768px) {
      .desktop-view {
        display: none;
      }

      .mobile-view {
        display: block;
      }

      .sale-card {
        background: white;
        border-radius: 12px;
        margin-bottom: 12px;
        border: 1px solid #e5e7eb;
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .sale-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transform: translateY(-2px);
      }

      .sale-card-header {
        display: flex;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid #f3f4f6;
      }

      .sale-card-body {
        padding: 16px;
      }

      .sale-info-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }

      .info-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .status-badge-mobile {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
      }

      .status-badge-mobile.bg-yellow-100 {
        background-color: #fef3c7;
        color: #92400e;
      }

      .status-badge-mobile.bg-green-100 {
        background-color: #d1fae5;
        color: #065f46;
      }

      .status-badge-mobile.bg-red-100 {
        background-color: #fee2e2;
        color: #991b1b;
      }
    }

    /* Pagination */
    .pagination-container {
      border-radius: 0 0 12px 12px;
    }

    .modern-paginator {
      background: transparent;
    }

    /* Menu */
    ::ng-deep .modern-menu .mat-mdc-menu-content {
      padding: 8px;
    }

    ::ng-deep .modern-menu .mat-mdc-menu-item {
      border-radius: 6px;
      margin: 2px 0;
      transition: all 0.2s ease;
    }

    ::ng-deep .modern-menu .mat-mdc-menu-item:hover {
      background-color: #f3f4f6;
    }

    ::ng-deep .modern-menu .mat-icon {
      margin-right: 12px;
    }

    /* Responsive Adjustments */
    @media (max-width: 1024px) {
      .sales-list-container {
        padding: 1rem;
      }
    }

    @media (max-width: 640px) {
      .header-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .new-sale-btn {
        width: 100%;
      }
    }
  `]
})
export class SalesListComponent implements OnInit {
  private salesService = inject(SalesService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Expose enums to template
  readonly PaymentMethod = PaymentMethod;
  readonly SaleStatus = SaleStatus;

  // Columns
  displayedColumns: string[] = ['saleNumber', 'customer', 'date', 'items', 'paymentMethod', 'total', 'status', 'actions'];

  // State
  sales = signal<Sale[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  pagination = signal({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  // Filter form
  filterForm: FormGroup;

  // Computed stats
  completedCount = computed(() => {
    return this.sales().filter(s => s.status === SaleStatus.COMPLETED).length;
  });

  pendingCount = computed(() => {
    return this.sales().filter(s => s.status === SaleStatus.PENDING).length;
  });

  constructor() {
    this.filterForm = this.fb.group({
      search: [''],
      status: [null],
      paymentMethod: [null],
      startDate: [null],
      endDate: [null]
    });
  }

  async ngOnInit() {
    await this.loadSales();
  }

  async loadSales(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const filters = this.buildFilters();
      const response = await firstValueFrom(this.salesService.getSales(filters));
      this.sales.set(response.data);
      this.pagination.set(response.pagination);
    } catch (err: any) {
      console.error('Error loading sales:', err);
      this.error.set('Error al cargar las ventas. Por favor intente nuevamente.');
    } finally {
      this.loading.set(false);
    }
  }

  buildFilters(): SalesFilters {
    const formValue = this.filterForm.value;
    const filters: SalesFilters = {
      page: this.pagination().page,
      limit: this.pagination().limit
    };

    if (formValue.search) {
      filters.search = formValue.search;
    }

    if (formValue.status) {
      filters.status = formValue.status;
    }

    if (formValue.paymentMethod) {
      filters.paymentMethod = formValue.paymentMethod;
    }

    if (formValue.startDate) {
      filters.startDate = formValue.startDate.toISOString();
    }

    if (formValue.endDate) {
      filters.endDate = formValue.endDate.toISOString();
    }

    return filters;
  }

  applyFilters(): void {
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadSales();
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      status: null,
      paymentMethod: null,
      startDate: null,
      endDate: null
    });
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    const formValue = this.filterForm.value;
    return !!(formValue.search || formValue.status || formValue.paymentMethod ||
              formValue.startDate || formValue.endDate);
  }

  onPageChange(event: PageEvent): void {
    this.pagination.update(p => ({
      ...p,
      page: event.pageIndex + 1,
      limit: event.pageSize
    }));
    this.loadSales();
  }

  sortData(sort: Sort): void {
    // Implement sorting if backend supports it
    console.log('Sort:', sort);
  }

  viewSaleDetail(sale: Sale): void {
    const dialogRef = this.dialog.open(SaleDetailDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: { sale }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.refresh) {
        this.loadSales();
      }
    });
  }

  async generateInvoice(sale: Sale): Promise<void> {
    try {
      this.loading.set(true);
      await firstValueFrom(this.salesService.generateInvoice(sale.id));
      this.snackBar.open('Factura generada exitosamente', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      await this.loadSales();
    } catch (err: any) {
      this.snackBar.open('Error al generar la factura', 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    } finally {
      this.loading.set(false);
    }
  }

  downloadInvoice(sale: Sale): void {
    if (sale.pdfUrl) {
      window.open(sale.pdfUrl, '_blank');
    }
  }

  async sendWhatsApp(sale: Sale): Promise<void> {
    try {
      this.loading.set(true);
      await firstValueFrom(this.salesService.sendWhatsApp(sale.id));
      this.snackBar.open('Mensaje enviado por WhatsApp', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      await this.loadSales();
    } catch (err: any) {
      this.snackBar.open('Error al enviar mensaje', 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    } finally {
      this.loading.set(false);
    }
  }

  async cancelSale(sale: Sale): Promise<void> {
    const confirmed = confirm('¿Está seguro que desea cancelar esta venta? Esta acción restaurará el stock de los productos.');

    if (!confirmed) {
      return;
    }

    try {
      this.loading.set(true);
      await firstValueFrom(this.salesService.cancelSale(sale.id));
      this.snackBar.open('Venta cancelada exitosamente', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      await this.loadSales();
    } catch (err: any) {
      const message = err.error?.message || 'Error al cancelar la venta';
      this.snackBar.open(message, 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    } finally {
      this.loading.set(false);
    }
  }

  getCustomerName(sale: Sale): string {
    return sale.customer?.name || sale.customerName || 'Cliente General';
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
      [PaymentMethod.TRANSFER]: 'Transferencia',
      [PaymentMethod.CARD]: 'Tarjeta'
    };
    return labels[method] || method;
  }

  getStatusIcon(status: SaleStatus): string {
    const icons: Record<string, string> = {
      [SaleStatus.PENDING]: 'pending',
      [SaleStatus.COMPLETED]: 'check_circle',
      [SaleStatus.CANCELLED]: 'cancel'
    };
    return icons[status] || 'help_outline';
  }
}
