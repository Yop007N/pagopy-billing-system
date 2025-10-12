import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonInput,
  IonNote,
  IonSearchbar,
  IonCard,
  IonCardContent,
  IonBadge,
  IonChip,
  IonAvatar,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  removeOutline,
  trashOutline,
  searchOutline,
  barcodeOutline,
  closeCircleOutline
} from 'ionicons/icons';
import { Product } from '../../../models/product.model';

export interface SaleItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  tax: number;
  total: number;
  discount?: number;
}

export interface SaleItemChange {
  items: SaleItem[];
  totals: {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
  };
}

/**
 * SaleItemSelectorComponent - Interactive component for selecting products and quantities
 *
 * Features:
 * - Product search and filtering
 * - Quantity adjustment with +/- buttons
 * - Real-time calculations (subtotal, tax, total)
 * - Price override capability
 * - Discount support
 * - Stock validation
 * - Barcode scanning integration
 */
@Component({
  selector: 'app-sale-item-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonInput,
    IonNote,
    IonSearchbar,
    IonCard,
    IonCardContent,
    IonBadge,
    IonChip,
    IonAvatar
  ],
  template: `
    <div class="sale-item-selector">
      <!-- Search and Add Section -->
      <div class="product-search">
        <ion-searchbar
          [value]="searchTerm()"
          (ionInput)="onSearchInput($event)"
          placeholder="Buscar productos..."
          [debounce]="300"
          [showClearButton]="'focus'"
        >
        </ion-searchbar>

        @if (showBarcodeButton) {
          <ion-button fill="clear" (click)="onScanBarcode()">
            <ion-icon slot="icon-only" name="barcode-outline"></ion-icon>
          </ion-button>
        }
      </div>

      <!-- Product List (when searching) -->
      @if (searchTerm() && filteredProducts().length > 0) {
        <ion-list class="product-list">
          @for (product of filteredProducts(); track product.id) {
            <ion-item button (click)="addProduct(product)">
              <ion-avatar slot="start">
                <div class="product-icon">{{ product.name.charAt(0) }}</div>
              </ion-avatar>
              <ion-label>
                <h3>{{ product.name }}</h3>
                <p>{{ product.code }} - Stock: {{ product.stock }}</p>
              </ion-label>
              <ion-note slot="end">
                {{ formatCurrency(product.price) }}
              </ion-note>
            </ion-item>
          }
        </ion-list>
      }

      @if (searchTerm() && filteredProducts().length === 0) {
        <div class="no-results">
          <ion-note color="medium">
            <p>No se encontraron productos</p>
          </ion-note>
        </div>
      }

      <!-- Selected Items -->
      @if (selectedItems().length > 0) {
        <div class="selected-items">
          <div class="section-header">
            <h3>Productos seleccionados ({{ selectedItems().length }})</h3>
            <ion-button fill="clear" size="small" (click)="clearAll()" color="danger">
              <ion-icon slot="start" name="trash-outline"></ion-icon>
              Limpiar todo
            </ion-button>
          </div>

          <ion-list class="items-list">
            @for (item of selectedItems(); track item.product.id) {
              <ion-card class="sale-item-card">
                <ion-card-content>
                  <!-- Product Info -->
                  <div class="item-header">
                    <div class="item-info">
                      <h4>{{ item.product.name }}</h4>
                      <p class="item-code">{{ item.product.code }}</p>
                    </div>
                    <ion-button
                      fill="clear"
                      size="small"
                      color="danger"
                      (click)="removeItem(item)"
                    >
                      <ion-icon slot="icon-only" name="close-circle-outline"></ion-icon>
                    </ion-button>
                  </div>

                  <!-- Quantity and Price Controls -->
                  <div class="item-controls">
                    <!-- Quantity -->
                    <div class="quantity-control">
                      <ion-label>Cantidad</ion-label>
                      <div class="quantity-buttons">
                        <ion-button
                          fill="outline"
                          size="small"
                          (click)="decreaseQuantity(item)"
                          [disabled]="item.quantity <= 1"
                        >
                          <ion-icon slot="icon-only" name="remove-outline"></ion-icon>
                        </ion-button>
                        <ion-input
                          type="number"
                          [value]="item.quantity"
                          (ionChange)="onQuantityChange(item, $event)"
                          [min]="1"
                          [max]="item.product.stock"
                          class="quantity-input"
                        ></ion-input>
                        <ion-button
                          fill="outline"
                          size="small"
                          (click)="increaseQuantity(item)"
                          [disabled]="!allowOverselling && item.quantity >= item.product.stock"
                        >
                          <ion-icon slot="icon-only" name="add-outline"></ion-icon>
                        </ion-button>
                      </div>
                      @if (!allowOverselling && item.quantity >= item.product.stock) {
                        <ion-note color="warning" class="stock-warning">
                          Stock máximo alcanzado
                        </ion-note>
                      }
                    </div>

                    <!-- Unit Price -->
                    @if (allowPriceOverride) {
                      <div class="price-control">
                        <ion-label>Precio unitario</ion-label>
                        <ion-input
                          type="number"
                          [value]="item.unitPrice"
                          (ionChange)="onPriceChange(item, $event)"
                          [min]="0"
                          class="price-input"
                        ></ion-input>
                      </div>
                    } @else {
                      <div class="price-display">
                        <ion-label>Precio unitario</ion-label>
                        <p class="price-value">{{ formatCurrency(item.unitPrice) }}</p>
                      </div>
                    }
                  </div>

                  <!-- Item Totals -->
                  <div class="item-totals">
                    <div class="total-row">
                      <span>Subtotal:</span>
                      <span>{{ formatCurrency(item.subtotal) }}</span>
                    </div>
                    @if (item.tax > 0) {
                      <div class="total-row tax">
                        <span>IVA ({{ item.product.taxRate }}%):</span>
                        <span>{{ formatCurrency(item.tax) }}</span>
                      </div>
                    }
                    @if (item.discount && item.discount > 0) {
                      <div class="total-row discount">
                        <span>Descuento:</span>
                        <span>-{{ formatCurrency(item.discount) }}</span>
                      </div>
                    }
                    <div class="total-row total">
                      <strong>Total:</strong>
                      <strong>{{ formatCurrency(item.total) }}</strong>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            }
          </ion-list>
        </div>
      }

      <!-- Overall Totals -->
      @if (selectedItems().length > 0) {
        <ion-card class="totals-card">
          <ion-card-content>
            <h3>Resumen del pedido</h3>
            <div class="totals-details">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>{{ formatCurrency(totals().subtotal) }}</span>
              </div>
              <div class="total-row">
                <span>IVA:</span>
                <span>{{ formatCurrency(totals().tax) }}</span>
              </div>
              @if (totals().discount > 0) {
                <div class="total-row discount">
                  <span>Descuento:</span>
                  <span>-{{ formatCurrency(totals().discount) }}</span>
                </div>
              }
              <div class="total-row grand-total">
                <strong>Total a pagar:</strong>
                <strong class="amount">{{ formatCurrency(totals().total) }}</strong>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      }

      <!-- Empty State -->
      @if (selectedItems().length === 0 && !searchTerm()) {
        <div class="empty-state">
          <ion-icon name="cart-outline" color="medium"></ion-icon>
          <p>No hay productos seleccionados</p>
          <p class="empty-hint">Busca y selecciona productos para continuar</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .sale-item-selector {
      width: 100%;
    }

    .product-search {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: var(--ion-background-color);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .product-search ion-searchbar {
      flex: 1;
    }

    .product-list {
      max-height: 300px;
      overflow-y: auto;
      margin-bottom: 16px;
    }

    .product-icon {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ion-color-primary);
      color: white;
      font-weight: 600;
      font-size: 18px;
    }

    .no-results {
      text-align: center;
      padding: 32px 16px;
    }

    .selected-items {
      padding: 8px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding: 0 8px;
    }

    .section-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .items-list {
      padding: 0;
    }

    .sale-item-card {
      margin: 8px 0;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .item-info h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .item-code {
      margin: 0;
      font-size: 13px;
      color: var(--ion-color-medium);
    }

    .item-controls {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 12px;
    }

    .quantity-control,
    .price-control,
    .price-display {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .quantity-control ion-label,
    .price-control ion-label,
    .price-display ion-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--ion-color-medium);
    }

    .quantity-buttons {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .quantity-input,
    .price-input {
      text-align: center;
      max-width: 80px;
      --padding-start: 8px;
      --padding-end: 8px;
    }

    .price-value {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .stock-warning {
      font-size: 11px;
      margin-top: 4px;
    }

    .item-totals {
      border-top: 1px solid var(--ion-color-light);
      padding-top: 12px;
      margin-top: 12px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 14px;
    }

    .total-row.tax {
      color: var(--ion-color-medium);
      font-size: 13px;
    }

    .total-row.discount {
      color: var(--ion-color-success);
    }

    .total-row.total {
      font-size: 16px;
      padding-top: 6px;
      border-top: 1px solid var(--ion-color-light);
    }

    .totals-card {
      margin: 16px 8px;
      background: var(--ion-color-light);
    }

    .totals-card h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .totals-details .total-row {
      font-size: 15px;
    }

    .grand-total {
      font-size: 18px !important;
      padding-top: 12px;
      margin-top: 8px;
      border-top: 2px solid var(--ion-color-medium);
    }

    .grand-total .amount {
      color: var(--ion-color-primary);
    }

    .empty-state {
      text-align: center;
      padding: 64px 32px;
      color: var(--ion-color-medium);
    }

    .empty-state ion-icon {
      font-size: 80px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 8px 0;
    }

    .empty-hint {
      font-size: 13px;
      opacity: 0.8;
    }
  `]
})
export class SaleItemSelectorComponent implements OnInit {
  @Input() availableProducts: Product[] = [];
  @Input() initialItems: SaleItem[] = [];
  @Input() allowPriceOverride = false;
  @Input() allowOverselling = false;
  @Input() showBarcodeButton = true;

  @Output() itemsChange = new EventEmitter<SaleItemChange>();
  @Output() scanBarcode = new EventEmitter<void>();

  private toastController = inject(ToastController);

  searchTerm = signal<string>('');
  selectedItems = signal<SaleItem[]>([]);
  filteredProducts = signal<Product[]>([]);

  constructor() {
    addIcons({
      addOutline,
      removeOutline,
      trashOutline,
      searchOutline,
      barcodeOutline,
      closeCircleOutline
    });
  }

  ngOnInit() {
    if (this.initialItems.length > 0) {
      this.selectedItems.set([...this.initialItems]);
    }
    this.emitChanges();
  }

  onSearchInput(event: any): void {
    const term = event.target.value?.toLowerCase() || '';
    this.searchTerm.set(term);

    if (term) {
      const filtered = this.availableProducts.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term)
      );
      this.filteredProducts.set(filtered);
    } else {
      this.filteredProducts.set([]);
    }
  }

  addProduct(product: Product): void {
    const items = this.selectedItems();
    const existingItem = items.find(i => i.product.id === product.id);

    if (existingItem) {
      if (!this.allowOverselling && existingItem.quantity >= product.stock) {
        this.showToast('No hay suficiente stock disponible', 'warning');
        return;
      }
      existingItem.quantity++;
      this.calculateItemTotals(existingItem);
    } else {
      const newItem: SaleItem = {
        product,
        quantity: 1,
        unitPrice: product.price,
        subtotal: 0,
        tax: 0,
        total: 0
      };
      this.calculateItemTotals(newItem);
      items.push(newItem);
    }

    this.selectedItems.set([...items]);
    this.searchTerm.set('');
    this.filteredProducts.set([]);
    this.emitChanges();
  }

  removeItem(item: SaleItem): void {
    const items = this.selectedItems().filter(i => i.product.id !== item.product.id);
    this.selectedItems.set(items);
    this.emitChanges();
  }

  increaseQuantity(item: SaleItem): void {
    if (!this.allowOverselling && item.quantity >= item.product.stock) {
      this.showToast('No hay suficiente stock disponible', 'warning');
      return;
    }

    item.quantity++;
    this.calculateItemTotals(item);
    this.selectedItems.set([...this.selectedItems()]);
    this.emitChanges();
  }

  decreaseQuantity(item: SaleItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.calculateItemTotals(item);
      this.selectedItems.set([...this.selectedItems()]);
      this.emitChanges();
    }
  }

  onQuantityChange(item: SaleItem, event: any): void {
    const value = parseInt(event.target.value);
    if (isNaN(value) || value < 1) {
      item.quantity = 1;
    } else if (!this.allowOverselling && value > item.product.stock) {
      item.quantity = item.product.stock;
      this.showToast('Cantidad ajustada al stock disponible', 'warning');
    } else {
      item.quantity = value;
    }

    this.calculateItemTotals(item);
    this.selectedItems.set([...this.selectedItems()]);
    this.emitChanges();
  }

  onPriceChange(item: SaleItem, event: any): void {
    const value = parseFloat(event.target.value);
    if (!isNaN(value) && value >= 0) {
      item.unitPrice = value;
      this.calculateItemTotals(item);
      this.selectedItems.set([...this.selectedItems()]);
      this.emitChanges();
    }
  }

  clearAll(): void {
    this.selectedItems.set([]);
    this.emitChanges();
  }

  onScanBarcode(): void {
    this.scanBarcode.emit();
  }

  private calculateItemTotals(item: SaleItem): void {
    const subtotal = item.unitPrice * item.quantity;
    const taxRate = item.product.taxRate / 100;
    const tax = subtotal * taxRate;
    const discount = item.discount || 0;
    const total = subtotal + tax - discount;

    item.subtotal = subtotal;
    item.tax = tax;
    item.total = total;
  }

  totals() {
    const items = this.selectedItems();
    return {
      subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
      tax: items.reduce((sum, item) => sum + item.tax, 0),
      discount: items.reduce((sum, item) => sum + (item.discount || 0), 0),
      total: items.reduce((sum, item) => sum + item.total, 0)
    };
  }

  private emitChanges(): void {
    this.itemsChange.emit({
      items: this.selectedItems(),
      totals: this.totals()
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0
    }).format(value);
  }

  private async showToast(message: string, color = 'primary'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  // Public methods for parent components
  public getSelectedItems(): SaleItem[] {
    return this.selectedItems();
  }

  public getTotals() {
    return this.totals();
  }

  public setItems(items: SaleItem[]): void {
    this.selectedItems.set([...items]);
    this.emitChanges();
  }
}
