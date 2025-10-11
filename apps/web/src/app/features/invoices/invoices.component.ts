import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="invoices-container">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">Facturas Electrónicas</h1>
      </div>

      <mat-card>
        <mat-card-content class="text-center py-12">
          <mat-icon class="text-6xl text-gray-400">receipt_long</mat-icon>
          <p class="text-xl text-gray-600 mt-4">No hay facturas emitidas</p>
          <p class="text-gray-500 mt-2">Las facturas se generarán automáticamente al completar ventas</p>
          <button mat-raised-button color="primary" routerLink="/sales/new" class="mt-4">
            <mat-icon>add</mat-icon>
            Nueva Venta
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    mat-icon {
      width: auto;
      height: auto;
    }
  `]
})
export class InvoicesComponent {
}
