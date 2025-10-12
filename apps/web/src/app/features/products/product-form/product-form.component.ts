import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { ProductsService } from '../../../core/services/products.service';

@Component({
  selector: 'app-product-form',
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
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="product-form-container p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">{{ isEditMode() ? 'Editar Producto' : 'Nuevo Producto' }}</h1>
        <button mat-stroked-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Volver
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center items-center py-12">
          <mat-spinner></mat-spinner>
        </div>
      } @else {
        <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
          <mat-card>
            <mat-card-content class="mt-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Código del Producto</mat-label>
                  <input matInput formControlName="code" placeholder="PROD-001">
                  @if (productForm.get('code')?.hasError('required')) {
                    <mat-error>El código es requerido</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Nombre del Producto</mat-label>
                  <input matInput formControlName="name" placeholder="Laptop Dell Inspiron 15">
                  @if (productForm.get('name')?.hasError('required')) {
                    <mat-error>El nombre es requerido</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full md:col-span-2">
                  <mat-label>Descripción</mat-label>
                  <textarea
                    matInput
                    formControlName="description"
                    rows="3"
                    placeholder="Descripción detallada del producto...">
                  </textarea>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Precio de Venta (Gs)</mat-label>
                  <input matInput type="number" formControlName="price" min="0" placeholder="4500000">
                  @if (productForm.get('price')?.hasError('required')) {
                    <mat-error>El precio es requerido</mat-error>
                  }
                  @if (productForm.get('price')?.hasError('min')) {
                    <mat-error>El precio debe ser mayor o igual a 0</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Costo (Gs) - Opcional</mat-label>
                  <input matInput type="number" formControlName="cost" min="0" placeholder="3500000">
                  @if (productForm.get('cost')?.hasError('min')) {
                    <mat-error>El costo debe ser mayor o igual a 0</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Stock Inicial</mat-label>
                  <input matInput type="number" formControlName="stock" min="0" placeholder="10">
                  @if (productForm.get('stock')?.hasError('min')) {
                    <mat-error>El stock debe ser mayor o igual a 0</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Tasa de IVA</mat-label>
                  <mat-select formControlName="taxRate">
                    <mat-option [value]="10">10% (Gravado)</mat-option>
                    <mat-option [value]="5">5% (Reducido)</mat-option>
                    <mat-option [value]="0">0% (Exento)</mat-option>
                  </mat-select>
                  @if (productForm.get('taxRate')?.hasError('required')) {
                    <mat-error>La tasa de IVA es requerida</mat-error>
                  }
                </mat-form-field>
              </div>

              @if (isEditMode()) {
                <div class="bg-blue-50 p-4 rounded-lg mt-4">
                  <p class="text-sm text-gray-600">
                    <strong>Nota:</strong> El stock se gestiona automáticamente con las ventas.
                    Para ajustes manuales, use la opción de actualizar stock desde el listado.
                  </p>
                </div>
              }
            </mat-card-content>
          </mat-card>

          <div class="flex justify-end gap-4 mt-6">
            <button mat-stroked-button type="button" (click)="goBack()" [disabled]="saving()">
              Cancelar
            </button>
            <button mat-raised-button color="primary" type="submit" [disabled]="productForm.invalid || saving()">
              @if (saving()) {
                <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
              } @else {
                <mat-icon>save</mat-icon>
              }
              {{ isEditMode() ? 'Actualizar' : 'Guardar' }} Producto
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .product-form-container {
      max-width: 900px;
      margin: 0 auto;
    }

    mat-form-field {
      font-size: 14px;
    }
  `]
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);
  private snackBar = inject(MatSnackBar);

  // State
  loading = signal(false);
  saving = signal(false);
  isEditMode = signal(false);
  productId = signal<string | null>(null);

  productForm: FormGroup;

  constructor() {
    this.productForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      cost: [0, Validators.min(0)],
      stock: [0, Validators.min(0)],
      taxRate: [10, Validators.required]
    });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.productId.set(id);
      await this.loadProduct(id);
    }
  }

  async loadProduct(id: string): Promise<void> {
    this.loading.set(true);

    try {
      const product = await firstValueFrom(this.productsService.getProductById(id));

      this.productForm.patchValue({
        code: product.code,
        name: product.name,
        description: product.description || '',
        price: product.price,
        cost: product.cost || 0,
        stock: product.stock,
        taxRate: product.taxRate
      });
    } catch (err: any) {
      console.error('Error loading product:', err);
      this.snackBar.open('Error al cargar el producto', 'Cerrar', { duration: 3000 });
      this.goBack();
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.productForm.invalid) {
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this.saving.set(true);

    try {
      const formValue = this.productForm.value;

      if (this.isEditMode() && this.productId()) {
        // Update existing product
        const updateData: any = {
          code: formValue.code,
          name: formValue.name,
          description: formValue.description || undefined,
          price: formValue.price,
          cost: formValue.cost || undefined,
          taxRate: formValue.taxRate
        };

        await firstValueFrom(
          this.productsService.updateProduct(this.productId()!, updateData)
        );

        this.snackBar.open('Producto actualizado exitosamente', 'Cerrar', {
          duration: 3000
        });
      } else {
        // Create new product
        const createData: any = {
          code: formValue.code,
          name: formValue.name,
          description: formValue.description || undefined,
          price: formValue.price,
          cost: formValue.cost || undefined,
          stock: formValue.stock || 0,
          taxRate: formValue.taxRate
        };

        await firstValueFrom(this.productsService.createProduct(createData));

        this.snackBar.open('Producto creado exitosamente', 'Cerrar', {
          duration: 3000
        });
      }

      this.router.navigate(['/products/list']);
    } catch (error: any) {
      console.error('Error saving product:', error);

      const errorMessage = error.error?.message ||
        (this.isEditMode() ? 'Error al actualizar el producto' : 'Error al crear el producto');

      this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
    } finally {
      this.saving.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/products/list']);
  }
}
