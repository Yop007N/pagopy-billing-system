import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { firstValueFrom } from 'rxjs';
import { SalesService } from '../../../core/services/sales.service';
import { ProductsService } from '../../../core/services/products.service';
import { PaymentMethod, CustomerType, Product } from '@pago-py/shared-models';

interface SaleTotals {
  subtotalGravado10: number;
  iva10: number;
  subtotalGravado5: number;
  iva5: number;
  exento: number;
  subtotal: number;
  discountAmount: number;
  total: number;
}

@Component({
  selector: 'app-new-sale',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './new-sale.component.html',
  styleUrls: ['./new-sale.component.scss']
})
export class NewSaleComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private salesService = inject(SalesService);
  private productsService = inject(ProductsService);
  private snackBar = inject(MatSnackBar);

  // Expose enums to template
  readonly PaymentMethod = PaymentMethod;
  readonly CustomerType = CustomerType;

  // Signals
  loading = signal(false);
  availableProducts = signal<Product[]>([]);
  productSearchControl = new FormControl('');

  // Filtered products based on search
  filteredProducts = computed(() => {
    const searchTerm = this.productSearchControl.value?.toLowerCase() || '';
    if (!searchTerm) {
      return this.availableProducts();
    }

    return this.availableProducts().filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.code?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm)
    );
  });

  // Totals signal with discount support
  totals = signal<SaleTotals>({
    subtotalGravado10: 0,
    iva10: 0,
    subtotalGravado5: 0,
    iva5: 0,
    exento: 0,
    subtotal: 0,
    discountAmount: 0,
    total: 0
  });

  saleForm: FormGroup;

  constructor() {
    this.saleForm = this.fb.group({
      // Customer info
      customerType: [CustomerType.CONSUMER, Validators.required],
      customerName: ['', Validators.required],
      customerRuc: ['', Validators.pattern(/^\d{6,8}-\d$/)],
      customerEmail: ['', Validators.email],
      customerPhone: [''],

      // Payment info
      paymentMethod: [PaymentMethod.CASH, Validators.required],
      discount: [0, [Validators.min(0), Validators.max(100)]],
      notes: [''],

      // Items
      items: this.fb.array([], Validators.required)
    });

    // Add first item by default
    this.addItem();
  }

  async ngOnInit() {
    await this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    try {
      this.loading.set(true);
      const response = await firstValueFrom(
        this.productsService.getProducts({ isActive: true, limit: 1000 })
      );
      this.availableProducts.set(response.data);
    } catch (err) {
      console.error('Error loading products:', err);
      this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  get items(): FormArray {
    return this.saleForm.get('items') as FormArray;
  }

  /**
   * Display function for autocomplete
   */
  displayProduct(product: Product | null): string {
    return product ? product.name : '';
  }

  /**
   * Clear product search
   */
  clearProductSearch(): void {
    this.productSearchControl.setValue('');
  }

  /**
   * Handle product selection from autocomplete
   */
  onProductSearchSelected(product: Product): void {
    if (!product || !product.isActive) {
      this.snackBar.open('Producto no disponible', 'Cerrar', { duration: 3000 });
      return;
    }

    // Check if product already exists in items
    const existingItemIndex = this.items.controls.findIndex(
      control => control.get('concept')?.value === product.name
    );

    if (existingItemIndex >= 0) {
      // Increment quantity if product already exists
      const existingItem = this.items.at(existingItemIndex);
      const currentQuantity = existingItem.get('quantity')?.value || 0;
      existingItem.get('quantity')?.setValue(currentQuantity + 1);
      this.calculateItemTotal(existingItemIndex);

      this.snackBar.open('Cantidad incrementada', 'OK', { duration: 2000 });
    } else {
      // Add new item with product data
      this.addItemWithProduct(product);
    }

    // Clear search
    this.clearProductSearch();
  }

  /**
   * Add item with product data
   */
  addItemWithProduct(product: Product): void {
    const itemGroup = this.fb.group({
      productId: [product.id],
      concept: [product.name, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      amount: [product.price, [Validators.required, Validators.min(0)]],
      iva: [product.taxRate, Validators.required],
      subtotal: [{ value: product.price, disabled: true }]
    });

    this.items.push(itemGroup);
    this.calculateItemTotal(this.items.length - 1);

    this.snackBar.open('Producto agregado', 'OK', { duration: 2000 });
  }

  /**
   * Add empty item
   */
  addItem(): void {
    const itemGroup = this.fb.group({
      productId: [null], // Will be set to manual ID when submitting
      concept: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      amount: [0, [Validators.required, Validators.min(0)]],
      iva: [10, Validators.required],
      subtotal: [{ value: 0, disabled: true }]
    });

    this.items.push(itemGroup);
  }

  /**
   * Remove item from array
   */
  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.calculateAllTotals();
      this.snackBar.open('Item eliminado', 'OK', { duration: 2000 });
    } else {
      this.snackBar.open('Debe haber al menos un item', 'Cerrar', { duration: 3000 });
    }
  }

  /**
   * Calculate total for a specific item
   */
  calculateItemTotal(index: number): void {
    const item = this.items.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const amount = item.get('amount')?.value || 0;
    const subtotal = quantity * amount;

    item.get('subtotal')?.setValue(subtotal);
    this.calculateAllTotals();
  }

  /**
   * Calculate all totals including IVA and discount
   */
  calculateAllTotals(): void {
    let subtotalGravado10 = 0;
    let subtotalGravado5 = 0;
    let exento = 0;

    // Calculate subtotals by IVA rate
    this.items.controls.forEach(item => {
      const subtotal = item.get('subtotal')?.value || 0;
      const iva = item.get('iva')?.value || 0;

      if (iva === 10) {
        subtotalGravado10 += subtotal;
      } else if (iva === 5) {
        subtotalGravado5 += subtotal;
      } else {
        exento += subtotal;
      }
    });

    // Calculate IVA amounts
    const iva10 = subtotalGravado10 * 0.10;
    const iva5 = subtotalGravado5 * 0.05;

    // Calculate subtotal before discount
    const subtotal = subtotalGravado10 + iva10 + subtotalGravado5 + iva5 + exento;

    // Calculate discount
    const discountPercent = this.saleForm.get('discount')?.value || 0;
    const discountAmount = (subtotal * discountPercent) / 100;

    // Calculate final total
    const total = subtotal - discountAmount;

    this.totals.set({
      subtotalGravado10,
      iva10,
      subtotalGravado5,
      iva5,
      exento,
      subtotal,
      discountAmount,
      total
    });
  }

  /**
   * Validate and submit the sale
   */
  async onSubmit(): Promise<void> {
    // Validate form
    if (this.saleForm.invalid) {
      this.markFormGroupTouched(this.saleForm);
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Validate at least one item
    if (this.items.length === 0) {
      this.snackBar.open('Debe agregar al menos un item a la venta', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Validate all items have positive amounts
    const hasInvalidItems = this.items.controls.some(item => {
      const quantity = item.get('quantity')?.value || 0;
      const amount = item.get('amount')?.value || 0;
      return quantity <= 0 || amount < 0;
    });

    if (hasInvalidItems) {
      this.snackBar.open('Todos los items deben tener cantidades y precios válidos', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.loading.set(true);

    try {
      const formValue = this.saleForm.getRawValue();

      // Map form items to SaleItem format expected by backend
      const items = formValue.items.map((item: any) => ({
        productId: item.productId || 'manual-item-' + Date.now(), // Use manual ID for non-product items
        concept: item.concept,
        amount: item.amount,
        quantity: item.quantity,
        iva: item.iva
      }));

      // Prepare sale data
      const saleData = {
        items,
        paymentMethod: formValue.paymentMethod,
        customerType: formValue.customerType,
        customerName: formValue.customerName,
        customerRuc: formValue.customerRuc || undefined,
        customerEmail: formValue.customerEmail || undefined,
        customerPhone: formValue.customerPhone || undefined
      };

      // Create sale
      const createdSale = await firstValueFrom(this.salesService.createSale(saleData));

      this.snackBar.open('Venta registrada exitosamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      // Navigate to sales list
      this.router.navigate(['/sales/list']);
    } catch (error: any) {
      console.error('Error creating sale:', error);
      this.snackBar.open(
        error.error?.message || 'Error al registrar la venta. Intente nuevamente.',
        'Cerrar',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Navigate back to dashboard
   */
  goBack(): void {
    if (confirm('¿Está seguro que desea cancelar? Se perderán los datos ingresados.')) {
      this.router.navigate(['/dashboard']);
    }
  }
}
