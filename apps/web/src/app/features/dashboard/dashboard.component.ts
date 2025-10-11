import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';

interface DashboardMetric {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  route?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule
  ],
  template: `
    <div class="dashboard-container">
      <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        @for (metric of metrics(); track metric.title) {
          <mat-card class="metric-card cursor-pointer hover:shadow-lg transition-shadow"
                    [routerLink]="metric.route">
            <mat-card-content class="flex items-center justify-between p-4">
              <div>
                <p class="text-gray-600 text-sm">{{ metric.title }}</p>
                <h2 class="text-3xl font-bold mt-2">{{ metric.value }}</h2>
              </div>
              <div class="metric-icon rounded-full p-4" [ngClass]="metric.color">
                <mat-icon class="text-white text-4xl">{{ metric.icon }}</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Acciones Rápidas</mat-card-title>
          </mat-card-header>
          <mat-card-content class="mt-4">
            <div class="flex flex-col gap-3">
              <button mat-raised-button color="primary" routerLink="/sales/new" class="w-full">
                <mat-icon>add_shopping_cart</mat-icon>
                Nueva Venta
              </button>
              <button mat-raised-button color="accent" routerLink="/invoices" class="w-full">
                <mat-icon>receipt</mat-icon>
                Ver Facturas
              </button>
              <button mat-stroked-button routerLink="/sales/list" class="w-full">
                <mat-icon>list</mat-icon>
                Historial de Ventas
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Actividad Reciente</mat-card-title>
          </mat-card-header>
          <mat-card-content class="mt-4">
            <div class="activity-list">
              @if (recentActivity().length === 0) {
                <p class="text-gray-500 text-center py-4">No hay actividad reciente</p>
              } @else {
                @for (activity of recentActivity(); track activity.id) {
                  <div class="activity-item flex items-start gap-3 pb-3 mb-3 border-b">
                    <mat-icon [class]="activity.iconColor">{{ activity.icon }}</mat-icon>
                    <div class="flex-1">
                      <p class="font-medium">{{ activity.title }}</p>
                      <p class="text-sm text-gray-600">{{ activity.description }}</p>
                      <p class="text-xs text-gray-400 mt-1">{{ activity.timestamp }}</p>
                    </div>
                  </div>
                }
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .metric-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .activity-list {
      max-height: 400px;
      overflow-y: auto;
    }
  `]
})
export class DashboardComponent {
  metrics = signal<DashboardMetric[]>([
    {
      title: 'Ventas del Día',
      value: 'Gs. 0',
      icon: 'attach_money',
      color: 'bg-green-500',
      route: '/sales/list'
    },
    {
      title: 'Facturas Emitidas',
      value: 0,
      icon: 'receipt_long',
      color: 'bg-blue-500',
      route: '/invoices'
    },
    {
      title: 'Clientes Activos',
      value: 0,
      icon: 'people',
      color: 'bg-purple-500'
    },
    {
      title: 'Productos',
      value: 0,
      icon: 'inventory_2',
      color: 'bg-orange-500'
    }
  ]);

  recentActivity = signal([
    {
      id: 1,
      title: 'Bienvenido a PagoPy',
      description: 'Comienza creando tu primera venta',
      icon: 'info',
      iconColor: 'text-blue-500',
      timestamp: 'Ahora'
    }
  ]);
}
