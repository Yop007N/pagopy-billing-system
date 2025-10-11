import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

interface Sale {
  id: number;
  customer: string;
  date: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
}

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule
  ],
  template: `
    <div class="sales-list-container">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">Historial de Ventas</h1>
        <button mat-raised-button color="primary" routerLink="/sales/new">
          <mat-icon>add</mat-icon>
          Nueva Venta
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          @if (sales().length === 0) {
            <div class="empty-state text-center py-12">
              <mat-icon class="text-6xl text-gray-400">receipt_long</mat-icon>
              <p class="text-xl text-gray-600 mt-4">No hay ventas registradas</p>
              <button mat-raised-button color="primary" routerLink="/sales/new" class="mt-4">
                Crear primera venta
              </button>
            </div>
          } @else {
            <table mat-table [dataSource]="sales()" class="w-full">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let sale">{{ sale.id }}</td>
              </ng-container>

              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef>Cliente</th>
                <td mat-cell *matCellDef="let sale">{{ sale.customer }}</td>
              </ng-container>

              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Fecha</th>
                <td mat-cell *matCellDef="let sale">{{ sale.date }}</td>
              </ng-container>

              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef>Total</th>
                <td mat-cell *matCellDef="let sale">{{ sale.total | currency:'PYG':'symbol-narrow' }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let sale">
                  <mat-chip [class]="getStatusClass(sale.status)">
                    {{ getStatusLabel(sale.status) }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let sale">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .empty-state mat-icon {
      width: auto;
      height: auto;
    }
  `]
})
export class SalesListComponent {
  displayedColumns: string[] = ['id', 'customer', 'date', 'total', 'status', 'actions'];
  sales = signal<Sale[]>([]);

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return classes[status] || '';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'completed': 'Completada',
      'cancelled': 'Cancelada'
    };
    return labels[status] || status;
  }
}
