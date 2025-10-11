import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';

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
    MatDividerModule
  ],
  template: `
    <div class="new-sale-container">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">Nueva Venta</h1>
        <button mat-stroked-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Volver
        </button>
      </div>

      <form [formGroup]="saleForm" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Cliente Information -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Información del Cliente</mat-card-title>
            </mat-card-header>
            <mat-card-content class="mt-4">
              <mat-form-field appearance="outline" class="w-full mb-4">
                <mat-label>Cliente</mat-label>
                <mat-select formControlName="customerId">
                  <mat-option [value]="1">Cliente General</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full mb-4">
                <mat-label>RUC/CI</mat-label>
                <input matInput formControlName="customerDocument">
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Dirección</mat-label>
                <textarea matInput formControlName="customerAddress" rows="2"></textarea>
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <!-- Sale Information -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Información de la Venta</mat-card-title>
            </mat-card-header>
            <mat-card-content class="mt-4">
              <mat-form-field appearance="outline" class="w-full mb-4">
                <mat-label>Tipo de Factura</mat-label>
                <mat-select formControlName="invoiceType">
                  <mat-option value="contado">Contado</mat-option>
                  <mat-option value="credito">Crédito</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full mb-4">
                <mat-label>Condición de Pago</mat-label>
                <mat-select formControlName="paymentCondition">
                  <mat-option value="efectivo">Efectivo</mat-option>
                  <mat-option value="tarjeta">Tarjeta</mat-option>
                  <mat-option value="transferencia">Transferencia</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Fecha</mat-label>
                <input matInput type="date" formControlName="saleDate">
              </mat-form-field>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Items Section -->
        <mat-card class="mt-6">
          <mat-card-header>
            <mat-card-title>Items de la Venta</mat-card-title>
          </mat-card-header>
          <mat-card-content class="mt-4">
            <div formArrayName="items">
              @for (item of items.controls; track $index; let i = $index) {
                <div [formGroupName]="i" class="grid grid-cols-12 gap-4 mb-4 items-start">
                  <mat-form-field appearance="outline" class="col-span-4">
                    <mat-label>Producto</mat-label>
                    <input matInput formControlName="product">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="col-span-2">
                    <mat-label>Cantidad</mat-label>
                    <input matInput type="number" formControlName="quantity" (input)="calculateItemTotal(i)">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="col-span-2">
                    <mat-label>Precio Unit.</mat-label>
                    <input matInput type="number" formControlName="unitPrice" (input)="calculateItemTotal(i)">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="col-span-3">
                    <mat-label>Total</mat-label>
                    <input matInput type="number" formControlName="total" readonly>
                  </mat-form-field>

                  <button mat-icon-button color="warn" type="button" (click)="removeItem(i)" class="col-span-1">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              }
            </div>

            <button mat-stroked-button type="button" (click)="addItem()" class="w-full mt-2">
              <mat-icon>add</mat-icon>
              Agregar Item
            </button>

            <mat-divider class="my-6"></mat-divider>

            <div class="totals-section bg-gray-50 p-4 rounded">
              <div class="flex justify-between mb-2">
                <span class="font-medium">Subtotal:</span>
                <span class="text-lg">{{ calculateSubtotal() | currency:'PYG':'symbol-narrow' }}</span>
              </div>
              <div class="flex justify-between mb-2">
                <span class="font-medium">IVA (10%):</span>
                <span class="text-lg">{{ calculateTax() | currency:'PYG':'symbol-narrow' }}</span>
              </div>
              <mat-divider class="my-3"></mat-divider>
              <div class="flex justify-between">
                <span class="font-bold text-xl">Total:</span>
                <span class="font-bold text-xl text-primary">{{ calculateTotal() | currency:'PYG':'symbol-narrow' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="flex justify-end gap-4 mt-6">
          <button mat-stroked-button type="button" (click)="goBack()">
            Cancelar
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="saleForm.invalid">
            <mat-icon>save</mat-icon>
            Guardar Venta
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .totals-section {
      max-width: 400px;
      margin-left: auto;
    }
  `]
})
export class NewSaleComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  saleForm: FormGroup;

  constructor() {
    this.saleForm = this.fb.group({
      customerId: [1, Validators.required],
      customerDocument: [''],
      customerAddress: [''],
      invoiceType: ['contado', Validators.required],
      paymentCondition: ['efectivo', Validators.required],
      saleDate: [new Date().toISOString().split('T')[0], Validators.required],
      items: this.fb.array([])
    });

    this.addItem();
  }

  get items(): FormArray {
    return this.saleForm.get('items') as FormArray;
  }

  addItem(): void {
    const itemGroup = this.fb.group({
      product: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      total: [{ value: 0, disabled: true }]
    });

    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  calculateItemTotal(index: number): void {
    const item = this.items.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unitPrice')?.value || 0;
    const total = quantity * unitPrice;
    item.get('total')?.setValue(total);
  }

  calculateSubtotal(): number {
    let subtotal = 0;
    this.items.controls.forEach(item => {
      subtotal += item.get('total')?.value || 0;
    });
    return subtotal;
  }

  calculateTax(): number {
    return this.calculateSubtotal() * 0.1;
  }

  calculateTotal(): number {
    return this.calculateSubtotal() + this.calculateTax();
  }

  onSubmit(): void {
    if (this.saleForm.valid) {
      console.log('Sale Data:', this.saleForm.getRawValue());
      // TODO: Implement API call to save sale
      this.router.navigate(['/sales/list']);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
