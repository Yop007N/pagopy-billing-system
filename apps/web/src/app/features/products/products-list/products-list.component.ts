import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { trigger, transition, style, animate } from '@angular/animations';
import { firstValueFrom } from 'rxjs';
import { ProductsService } from '../../../core/services/products.service';
import { Product } from '@pago-py/shared-models';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
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
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule
  ],
  template: `
    <div class="products-list-container">
      <!-- Header -->
      <div class="header-section">
        <div class="header-content">
          <div class="header-title">
            <mat-icon class="title-icon">inventory_2</mat-icon>
            <h1>Catálogo de Productos</h1>
          </div>
          <button mat-raised-button color="primary" routerLink="/products/new" class="new-product-btn">
            <mat-icon>add</mat-icon>
            Nuevo Producto
          </button>
        </div>
      </div>

      <!-- Filters Card -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-grid">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar productos</mat-label>
              <input matInput placeholder="Nombre, código o descripción..." [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()">
              <mat-icon matPrefix>search</mat-icon>
              @if (searchTerm) {
                <button matSuffix mat-icon-button (click)="clearSearch()">
                  <mat-icon>close</mat-icon>
                </button>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <mat-select [(ngModel)]="activeFilter" (ngModelChange)="loadProducts()">
                <mat-option [value]="undefined">Todos</mat-option>
                <mat-option [value]="true">Activos</mat-option>
                <mat-option [value]="false">Inactivos</mat-option>
              </mat-select>
              <mat-icon matPrefix>filter_list</mat-icon>
            </mat-form-field>

            <button mat-stroked-button [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'" class="view-toggle">
              <mat-icon>grid_view</mat-icon>
              Grid
            </button>

            <button mat-stroked-button [class.active]="viewMode === 'list'" (click)="viewMode = 'list'" class="view-toggle">
              <mat-icon>view_list</mat-icon>
              Lista
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Content Card -->
      <mat-card class="content-card">
        <mat-card-content>
          @if (loading()) {
            <div class="loading-state">
              <mat-spinner diameter="60"></mat-spinner>
              <p>Cargando productos...</p>
            </div>
          } @else if (error()) {
            <div class="error-state">
              <mat-icon>error_outline</mat-icon>
              <h2>Error al cargar productos</h2>
              <p>{{ error() }}</p>
              <button mat-raised-button color="primary" (click)="loadProducts()">
                <mat-icon>refresh</mat-icon>
                Reintentar
              </button>
            </div>
          } @else if (products().length === 0) {
            <div class="empty-state">
              <div class="empty-icon-wrapper">
                <mat-icon>inventory_2</mat-icon>
              </div>
              <h2>
                @if (searchTerm || activeFilter !== undefined) {
                  No se encontraron productos
                } @else {
                  No hay productos registrados
                }
              </h2>
              <p>
                @if (searchTerm || activeFilter !== undefined) {
                  Intenta ajustar los filtros de búsqueda
                } @else {
                  Comienza creando tu primer producto
                }
              </p>
              @if (!searchTerm && activeFilter === undefined) {
                <button mat-raised-button color="primary" routerLink="/products/new">
                  <mat-icon>add</mat-icon>
                  Crear primer producto
                </button>
              }
            </div>
          } @else {
            <!-- Grid View -->
            @if (viewMode === 'grid') {
              <div class="products-grid">
                @for (product of products(); track product.id) {
                  <div class="product-card" [@fadeIn]>
                    <!-- Product Image -->
                    <div class="product-image">
                      <img [src]="product.imageUrl || 'assets/product-placeholder.png'"
                           [alt]="product.name"
                           (error)="onImageError($event)">
                      <div class="product-badges">
                        @if (!product.isActive) {
                          <span class="badge badge-inactive">
                            <mat-icon>block</mat-icon>
                            Inactivo
                          </span>
                        }
                        @if (product.stock === 0) {
                          <span class="badge badge-out-of-stock">
                            <mat-icon>warning</mat-icon>
                            Sin stock
                          </span>
                        } @else if (product.stock < 10) {
                          <span class="badge badge-low-stock">
                            <mat-icon>inventory</mat-icon>
                            Bajo stock
                          </span>
                        }
                      </div>
                    </div>

                    <!-- Product Info -->
                    <div class="product-info">
                      <div class="product-header">
                        <span class="product-code">{{ product.code }}</span>
                        <mat-icon class="product-menu-trigger" [matMenuTriggerFor]="menu">more_vert</mat-icon>
                        <mat-menu #menu="matMenu">
                          <button mat-menu-item (click)="editProduct(product.id)">
                            <mat-icon>edit</mat-icon>
                            <span>Editar</span>
                          </button>
                          <button mat-menu-item (click)="toggleProductStatus(product)">
                            <mat-icon>{{ product.isActive ? 'block' : 'check_circle' }}</mat-icon>
                            <span>{{ product.isActive ? 'Desactivar' : 'Activar' }}</span>
                          </button>
                          <button mat-menu-item (click)="deleteProduct(product)" class="delete-action">
                            <mat-icon>delete</mat-icon>
                            <span>Eliminar</span>
                          </button>
                        </mat-menu>
                      </div>

                      <h3 class="product-name" [title]="product.name">{{ product.name }}</h3>

                      @if (product.description) {
                        <p class="product-description" [title]="product.description">{{ product.description }}</p>
                      }

                      <div class="product-meta">
                        <div class="meta-item">
                          <mat-icon>inventory_2</mat-icon>
                          <span [class]="getStockClass(product.stock)">{{ product.stock }} unidades</span>
                        </div>
                        <div class="meta-item">
                          <mat-icon>receipt</mat-icon>
                          <span>IVA {{ product.taxRate }}%</span>
                        </div>
                      </div>

                      <div class="product-footer">
                        <div class="product-price">
                          <span class="price-label">Precio</span>
                          <span class="price-value">{{ product.price | number:'1.0-0' }} Gs</span>
                        </div>
                        <div class="quick-actions">
                          <button mat-icon-button color="primary" (click)="editProduct(product.id)" matTooltip="Editar producto">
                            <mat-icon>edit</mat-icon>
                          </button>
                          <button mat-icon-button [color]="product.isActive ? 'warn' : 'accent'"
                                  (click)="toggleProductStatus(product)"
                                  [matTooltip]="product.isActive ? 'Desactivar' : 'Activar'">
                            <mat-icon>{{ product.isActive ? 'toggle_on' : 'toggle_off' }}</mat-icon>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- List View (Table) -->
            @if (viewMode === 'list') {
              <div class="products-table-wrapper" [@fadeIn]>
                <table mat-table [dataSource]="products()" class="products-table">
                  <ng-container matColumnDef="code">
                    <th mat-header-cell *matHeaderCellDef>Código</th>
                    <td mat-cell *matCellDef="let product">
                      <span class="table-code">{{ product.code }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Producto</th>
                    <td mat-cell *matCellDef="let product">
                      <div class="table-product">
                        <div class="table-product-image">
                          <img [src]="product.imageUrl || 'assets/product-placeholder.png'"
                               [alt]="product.name"
                               (error)="onImageError($event)">
                        </div>
                        <div class="table-product-info">
                          <div class="table-product-name">{{ product.name }}</div>
                          @if (product.description) {
                            <div class="table-product-description">{{ product.description }}</div>
                          }
                        </div>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="price">
                    <th mat-header-cell *matHeaderCellDef>Precio</th>
                    <td mat-cell *matCellDef="let product">
                      <span class="table-price">{{ product.price | number:'1.0-0' }} Gs</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="stock">
                    <th mat-header-cell *matHeaderCellDef>Stock</th>
                    <td mat-cell *matCellDef="let product">
                      <div class="stock-indicator">
                        <div class="stock-bar" [attr.data-level]="getStockLevel(product.stock)">
                          <div class="stock-fill" [style.width.%]="getStockPercentage(product.stock)"></div>
                        </div>
                        <span [class]="getStockClass(product.stock)">{{ product.stock }}</span>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="taxRate">
                    <th mat-header-cell *matHeaderCellDef>IVA</th>
                    <td mat-cell *matCellDef="let product">
                      <mat-chip [class]="getTaxClass(product.taxRate)">
                        {{ product.taxRate }}%
                      </mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Estado</th>
                    <td mat-cell *matCellDef="let product">
                      <div class="status-badge" [class.active]="product.isActive" [class.inactive]="!product.isActive">
                        <span class="status-dot"></span>
                        <span class="status-text">{{ product.isActive ? 'Activo' : 'Inactivo' }}</span>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Acciones</th>
                    <td mat-cell *matCellDef="let product">
                      <div class="table-actions">
                        <button mat-icon-button color="primary" (click)="editProduct(product.id)" matTooltip="Editar">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button [color]="product.isActive ? 'warn' : 'accent'"
                                (click)="toggleProductStatus(product)"
                                [matTooltip]="product.isActive ? 'Desactivar' : 'Activar'">
                          <mat-icon>{{ product.isActive ? 'toggle_on' : 'toggle_off' }}</mat-icon>
                        </button>
                        <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="Más opciones">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                        <mat-menu #menu="matMenu">
                          <button mat-menu-item (click)="deleteProduct(product)">
                            <mat-icon>delete</mat-icon>
                            <span>Eliminar</span>
                          </button>
                        </mat-menu>
                      </div>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
                </table>
              </div>
            }

            <!-- Pagination -->
            @if (pagination()) {
              <div class="pagination-section">
                <div class="pagination-info">
                  <mat-icon>info</mat-icon>
                  <span>Mostrando {{ products().length }} de {{ pagination()!.total }} productos</span>
                </div>
                @if (pagination()!.totalPages > 1) {
                  <div class="pagination-controls">
                    <button mat-icon-button [disabled]="currentPage() === 1" (click)="previousPage()" matTooltip="Página anterior">
                      <mat-icon>chevron_left</mat-icon>
                    </button>
                    <span class="page-indicator">
                      Página <strong>{{ currentPage() }}</strong> de <strong>{{ pagination()!.totalPages }}</strong>
                    </span>
                    <button mat-icon-button [disabled]="currentPage() === pagination()!.totalPages" (click)="nextPage()" matTooltip="Página siguiente">
                      <mat-icon>chevron_right</mat-icon>
                    </button>
                  </div>
                }
              </div>
            }
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .products-list-container {
      max-width: 1600px;
      margin: 0 auto;
      padding: 24px;
      background: #f5f5f5;
      min-height: 100vh;
    }

    /* Header Section */
    .header-section {
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .title-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #1976d2;
    }

    .header-title h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      color: #212121;
    }

    .new-product-btn {
      box-shadow: 0 2px 8px rgba(25, 118, 210, 0.25);
      transition: all 0.3s ease;
    }

    .new-product-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.35);
    }

    /* Filters Card */
    .filters-card {
      margin-bottom: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      transition: box-shadow 0.3s ease;
    }

    .filters-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }

    .filters-grid {
      display: grid;
      grid-template-columns: 2fr 1fr auto auto;
      gap: 16px;
      align-items: start;
    }

    @media (max-width: 968px) {
      .filters-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 640px) {
      .filters-grid {
        grid-template-columns: 1fr;
      }
    }

    .search-field {
      width: 100%;
    }

    .view-toggle {
      height: 56px;
      min-width: 100px;
      transition: all 0.2s ease;
    }

    .view-toggle.active {
      background: #1976d2;
      color: white;
    }

    .view-toggle mat-icon {
      margin-right: 4px;
    }

    /* Content Card */
    .content-card {
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      min-height: 400px;
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      gap: 20px;
    }

    .loading-state p {
      color: #666;
      font-size: 16px;
      margin: 0;
    }

    /* Error State */
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
    }

    .error-state mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #f44336;
      margin-bottom: 16px;
    }

    .error-state h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #212121;
    }

    .error-state p {
      margin: 0 0 24px 0;
      color: #666;
      font-size: 16px;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
    }

    .empty-icon-wrapper {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      animation: pulse 2s ease-in-out infinite;
    }

    .empty-icon-wrapper mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #1976d2;
    }

    .empty-state h2 {
      margin: 0 0 12px 0;
      font-size: 24px;
      color: #212121;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      color: #666;
      font-size: 16px;
      max-width: 400px;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    /* Products Grid View */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      padding: 4px;
    }

    @media (max-width: 640px) {
      .products-grid {
        grid-template-columns: 1fr;
      }
    }

    .product-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      border: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      border-color: #1976d2;
    }

    /* Product Image */
    .product-image {
      position: relative;
      width: 100%;
      height: 200px;
      background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .product-card:hover .product-image img {
      transform: scale(1.05);
    }

    .product-badges {
      position: absolute;
      top: 8px;
      left: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      backdrop-filter: blur(8px);
    }

    .badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .badge-inactive {
      background: rgba(158, 158, 158, 0.9);
      color: white;
    }

    .badge-out-of-stock {
      background: rgba(244, 67, 54, 0.9);
      color: white;
    }

    .badge-low-stock {
      background: rgba(255, 152, 0, 0.9);
      color: white;
    }

    /* Product Info */
    .product-info {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .product-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .product-code {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      font-weight: 600;
      color: #666;
      background: #f5f5f5;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .product-menu-trigger {
      cursor: pointer;
      color: #666;
      transition: color 0.2s ease;
    }

    .product-menu-trigger:hover {
      color: #1976d2;
    }

    .product-name {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: #212121;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 1.4;
      min-height: 44px;
    }

    .product-description {
      margin: 0 0 12px 0;
      font-size: 13px;
      color: #666;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 1.4;
    }

    .product-meta {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #666;
    }

    .meta-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #999;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
    }

    .product-price {
      display: flex;
      flex-direction: column;
    }

    .price-label {
      font-size: 11px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .price-value {
      font-size: 20px;
      font-weight: 700;
      color: #1976d2;
    }

    .quick-actions {
      display: flex;
      gap: 4px;
    }

    .delete-action {
      color: #f44336;
    }

    /* Table View */
    .products-table-wrapper {
      overflow-x: auto;
    }

    .products-table {
      width: 100%;
      background: white;
    }

    .table-row {
      transition: background-color 0.2s ease;
    }

    .table-row:hover {
      background-color: #f5f9ff !important;
    }

    .table-code {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: #666;
      background: #f5f5f5;
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
    }

    .table-product {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .table-product-image {
      width: 50px;
      height: 50px;
      border-radius: 8px;
      overflow: hidden;
      background: #f5f5f5;
      flex-shrink: 0;
    }

    .table-product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .table-product-info {
      flex: 1;
      min-width: 0;
    }

    .table-product-name {
      font-weight: 500;
      color: #212121;
      margin-bottom: 2px;
    }

    .table-product-description {
      font-size: 12px;
      color: #666;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .table-price {
      font-size: 16px;
      font-weight: 600;
      color: #1976d2;
    }

    /* Stock Indicator */
    .stock-indicator {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stock-bar {
      width: 60px;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .stock-fill {
      height: 100%;
      transition: width 0.3s ease, background-color 0.3s ease;
      background: linear-gradient(90deg, #4caf50 0%, #66bb6a 100%);
    }

    .stock-bar[data-level="empty"] .stock-fill {
      background: linear-gradient(90deg, #f44336 0%, #e57373 100%);
    }

    .stock-bar[data-level="low"] .stock-fill {
      background: linear-gradient(90deg, #ff9800 0%, #ffb74d 100%);
    }

    .stock-bar[data-level="good"] .stock-fill {
      background: linear-gradient(90deg, #4caf50 0%, #66bb6a 100%);
    }

    /* Status Badge */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .status-badge.active {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .status-badge.inactive {
      background: #f5f5f5;
      color: #757575;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: pulse-dot 2s ease-in-out infinite;
    }

    .status-badge.active .status-dot {
      background: #4caf50;
    }

    .status-badge.inactive .status-dot {
      background: #9e9e9e;
      animation: none;
    }

    @keyframes pulse-dot {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.6;
        transform: scale(1.2);
      }
    }

    /* Table Actions */
    .table-actions {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    /* Pagination */
    .pagination-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      flex-wrap: wrap;
      gap: 16px;
    }

    .pagination-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
    }

    .pagination-info mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #999;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .page-indicator {
      font-size: 14px;
      color: #666;
      white-space: nowrap;
    }

    .page-indicator strong {
      color: #1976d2;
      font-weight: 600;
    }

    /* Stock Color Classes */
    .text-red-600 {
      color: #dc2626;
    }

    .text-orange-600 {
      color: #ea580c;
    }

    .text-green-600 {
      color: #16a34a;
    }

    .font-semibold {
      font-weight: 600;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .products-list-container {
        padding: 16px;
      }

      .header-title h1 {
        font-size: 22px;
      }

      .pagination-section {
        flex-direction: column;
        text-align: center;
      }
    }
  `],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ProductsListComponent implements OnInit {
  private productsService = inject(ProductsService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  // Columns
  displayedColumns: string[] = ['code', 'name', 'price', 'stock', 'taxRate', 'status', 'actions'];

  // State
  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  pagination = signal<any>(null);
  currentPage = signal(1);

  // Filters
  searchTerm = '';
  activeFilter: boolean | undefined = true; // Default to active products only

  // View mode
  viewMode: 'grid' | 'list' = 'grid';

  async ngOnInit() {
    await this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const filters = {
        page: this.currentPage(),
        limit: 50,
        search: this.searchTerm || undefined,
        isActive: this.activeFilter
      };

      const response = await firstValueFrom(this.productsService.getProducts(filters));
      this.products.set(response.data);
      this.pagination.set(response.pagination);
    } catch (err: any) {
      console.error('Error loading products:', err);
      this.error.set('Error al cargar los productos. Por favor intente nuevamente.');
    } finally {
      this.loading.set(false);
    }
  }

  onSearchChange(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadProducts();
    }
  }

  nextPage(): void {
    const pagination = this.pagination();
    if (pagination && this.currentPage() < pagination.totalPages) {
      this.currentPage.update(p => p + 1);
      this.loadProducts();
    }
  }

  editProduct(id: string): void {
    this.router.navigate(['/products/edit', id]);
  }

  async toggleProductStatus(product: Product): Promise<void> {
    try {
      await firstValueFrom(
        this.productsService.updateProduct(product.id, {
          isActive: !product.isActive
        })
      );

      this.snackBar.open(
        `Producto ${product.isActive ? 'desactivado' : 'activado'} correctamente`,
        'Cerrar',
        { duration: 3000 }
      );

      await this.loadProducts();
    } catch (err: any) {
      this.snackBar.open('Error al actualizar el producto', 'Cerrar', { duration: 3000 });
    }
  }

  async deleteProduct(product: Product): Promise<void> {
    if (!confirm(`¿Está seguro de eliminar el producto "${product.name}"?`)) {
      return;
    }

    try {
      await firstValueFrom(this.productsService.deleteProduct(product.id));

      this.snackBar.open('Producto eliminado correctamente', 'Cerrar', { duration: 3000 });
      await this.loadProducts();
    } catch (err: any) {
      this.snackBar.open('Error al eliminar el producto', 'Cerrar', { duration: 3000 });
    }
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'text-red-600 font-semibold';
    if (stock < 10) return 'text-orange-600 font-semibold';
    return 'text-green-600 font-semibold';
  }

  getTaxClass(taxRate: number): string {
    const classes: Record<number, string> = {
      0: 'bg-gray-100 text-gray-800',
      5: 'bg-blue-100 text-blue-800',
      10: 'bg-purple-100 text-purple-800'
    };
    return classes[taxRate] || 'bg-gray-100 text-gray-800';
  }

  getStockLevel(stock: number): string {
    if (stock === 0) return 'empty';
    if (stock < 10) return 'low';
    return 'good';
  }

  getStockPercentage(stock: number): number {
    const maxStock = 100; // Assuming 100 as max for visualization
    return Math.min((stock / maxStock) * 100, 100);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23f5f5f5" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23999"%3ESin imagen%3C/text%3E%3C/svg%3E';
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearchChange();
  }
}
