import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SalesService } from '../../core/services/sales.service';
import { Sale, SalesSummary, DailySalesStats } from '@pago-py/shared-models';

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
    MatGridListModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div class="header-content">
          <h1>Dashboard</h1>
          <p class="header-subtitle">Resumen de ventas y métricas principales</p>
        </div>
        <button mat-fab color="primary" (click)="loadDashboardData()" matTooltip="Actualizar datos" class="refresh-btn">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="60" strokeWidth="4"></mat-spinner>
          <p class="loading-text">Cargando métricas...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <mat-icon color="warn">error_outline</mat-icon>
          <p class="error-text">{{ error() }}</p>
          <button mat-raised-button color="primary" (click)="loadDashboardData()">
            <mat-icon>refresh</mat-icon>
            Reintentar
          </button>
        </div>
      } @else {
        <!-- Quick Actions - Prominently displayed at top -->
        <div class="quick-actions-section">
          <h2 class="section-title">Acciones Rápidas</h2>
          <div class="quick-actions">
            <button mat-raised-button class="action-btn primary" routerLink="/sales/new">
              <div class="btn-content">
                <mat-icon>add_circle</mat-icon>
                <span>Nueva Venta</span>
              </div>
            </button>
            <button mat-raised-button class="action-btn accent" routerLink="/sales/list">
              <div class="btn-content">
                <mat-icon>receipt_long</mat-icon>
                <span>Ver Ventas</span>
              </div>
            </button>
            <button mat-raised-button class="action-btn secondary" routerLink="/products/list">
              <div class="btn-content">
                <mat-icon>inventory_2</mat-icon>
                <span>Productos</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Metrics Grid with Enhanced Cards -->
        <div class="metrics-section">
          <h2 class="section-title">Métricas de Ventas</h2>
          <div class="metrics-grid">
            <mat-card class="metric-card today animated">
              <div class="metric-accent-bar"></div>
              <mat-card-content>
                <div class="metric-header">
                  <div class="metric-icon-wrapper today-icon">
                    <mat-icon>today</mat-icon>
                  </div>
                  <div class="metric-info">
                    <h3 class="metric-title">Ventas Hoy</h3>
                    <p class="metric-period">Actualizado ahora</p>
                  </div>
                </div>
                <div class="metric-value">{{ todayRevenue() | currency:'PYG':'symbol-narrow':'1.0-0' }}</div>
                <div class="metric-footer">
                  <mat-icon class="metric-trend">trending_up</mat-icon>
                  <span class="metric-label">{{ todayCount() }} transacciones</span>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="metric-card week animated">
              <div class="metric-accent-bar"></div>
              <mat-card-content>
                <div class="metric-header">
                  <div class="metric-icon-wrapper week-icon">
                    <mat-icon>date_range</mat-icon>
                  </div>
                  <div class="metric-info">
                    <h3 class="metric-title">Esta Semana</h3>
                    <p class="metric-period">Últimos 7 días</p>
                  </div>
                </div>
                <div class="metric-value">{{ weekRevenue() | currency:'PYG':'symbol-narrow':'1.0-0' }}</div>
                <div class="metric-footer">
                  <mat-icon class="metric-trend">trending_up</mat-icon>
                  <span class="metric-label">{{ weekCount() }} transacciones</span>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="metric-card month animated">
              <div class="metric-accent-bar"></div>
              <mat-card-content>
                <div class="metric-header">
                  <div class="metric-icon-wrapper month-icon">
                    <mat-icon>calendar_month</mat-icon>
                  </div>
                  <div class="metric-info">
                    <h3 class="metric-title">Este Mes</h3>
                    <p class="metric-period">Mensual</p>
                  </div>
                </div>
                <div class="metric-value">{{ monthRevenue() | currency:'PYG':'symbol-narrow':'1.0-0' }}</div>
                <div class="metric-footer">
                  <mat-icon class="metric-trend">trending_up</mat-icon>
                  <span class="metric-label">{{ monthCount() }} transacciones</span>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="metric-card alltime animated">
              <div class="metric-accent-bar"></div>
              <mat-card-content>
                <div class="metric-header">
                  <div class="metric-icon-wrapper alltime-icon">
                    <mat-icon>analytics</mat-icon>
                  </div>
                  <div class="metric-info">
                    <h3 class="metric-title">Total Histórico</h3>
                    <p class="metric-period">Todo el tiempo</p>
                  </div>
                </div>
                <div class="metric-value">{{ allTimeRevenue() | currency:'PYG':'symbol-narrow':'1.0-0' }}</div>
                <div class="metric-footer">
                  <mat-icon class="metric-trend">show_chart</mat-icon>
                  <span class="metric-label">{{ allTimeCount() }} transacciones</span>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <!-- Enhanced Sales Chart -->
        <mat-card class="chart-card animated">
          <mat-card-header>
            <div class="chart-header">
              <div class="chart-title-wrapper">
                <mat-icon class="chart-icon">insert_chart</mat-icon>
                <mat-card-title>Tendencia de Ventas</mat-card-title>
              </div>
              <p class="chart-subtitle">Últimos 7 días</p>
            </div>
          </mat-card-header>
          <mat-card-content>
            @if (dailyStats().length > 0) {
              <div class="chart-container">
                <div class="chart-bars">
                  @for (stat of dailyStats(); track stat.date; let i = $index) {
                    <div class="chart-bar-container" [style.animation-delay.ms]="i * 100">
                      <div class="chart-value-top">
                        {{ stat.total | currency:'PYG':'symbol-narrow':'1.0-0' }}
                      </div>
                      <div
                        class="chart-bar"
                        [style.height.%]="getBarHeight(stat.total)"
                        [matTooltip]="getBarTooltip(stat)">
                        <div class="bar-shine"></div>
                      </div>
                      <div class="chart-label">
                        {{ formatDate(stat.date) }}
                      </div>
                      <div class="chart-count">
                        {{ stat.count }} ventas
                      </div>
                    </div>
                  }
                </div>
              </div>
            } @else {
              <div class="empty-chart">
                <div class="empty-icon-wrapper">
                  <mat-icon>bar_chart</mat-icon>
                </div>
                <p class="empty-text">No hay datos de ventas para mostrar</p>
                <p class="empty-subtext">Crea tu primera venta para ver las estadísticas</p>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <!-- Enhanced Recent Sales Table -->
        <mat-card class="table-card animated">
          <mat-card-header>
            <div class="table-header">
              <div class="table-title-wrapper">
                <mat-icon class="table-icon">receipt_long</mat-icon>
                <mat-card-title>Ventas Recientes</mat-card-title>
              </div>
              <button mat-button color="primary" routerLink="/sales/list">
                Ver todas
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </mat-card-header>
          <mat-card-content>
            @if (recentSales().length === 0) {
              <div class="empty-state">
                <div class="empty-icon-wrapper">
                  <mat-icon>receipt_long</mat-icon>
                </div>
                <p class="empty-text">No hay ventas registradas</p>
                <p class="empty-subtext">Comienza creando tu primera venta</p>
                <button mat-raised-button color="primary" routerLink="/sales/new" class="empty-action">
                  <mat-icon>add</mat-icon>
                  Crear Primera Venta
                </button>
              </div>
            } @else {
              <div class="table-wrapper">
                <table mat-table [dataSource]="recentSales()" class="recent-sales-table">
                  <!-- Sale Number Column -->
                  <ng-container matColumnDef="saleNumber">
                    <th mat-header-cell *matHeaderCellDef>N° Venta</th>
                    <td mat-cell *matCellDef="let sale">
                      <span class="sale-number">{{ sale.saleNumber }}</span>
                    </td>
                  </ng-container>

                  <!-- Customer Column -->
                  <ng-container matColumnDef="customer">
                    <th mat-header-cell *matHeaderCellDef>Cliente</th>
                    <td mat-cell *matCellDef="let sale">
                      <div class="customer-cell">
                        <mat-icon class="customer-icon">person</mat-icon>
                        <span>{{ sale.customer?.name || 'Cliente Contado' }}</span>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Total Column -->
                  <ng-container matColumnDef="total">
                    <th mat-header-cell *matHeaderCellDef>Total</th>
                    <td mat-cell *matCellDef="let sale">
                      <span class="total-amount">{{ sale.total | currency:'PYG':'symbol-narrow':'1.0-0' }}</span>
                    </td>
                  </ng-container>

                  <!-- Payment Method Column -->
                  <ng-container matColumnDef="paymentMethod">
                    <th mat-header-cell *matHeaderCellDef>Método de Pago</th>
                    <td mat-cell *matCellDef="let sale">
                      <span class="payment-badge">{{ getPaymentMethodLabel(sale.paymentMethod) }}</span>
                    </td>
                  </ng-container>

                  <!-- Created At Column -->
                  <ng-container matColumnDef="createdAt">
                    <th mat-header-cell *matHeaderCellDef>Fecha</th>
                    <td mat-cell *matCellDef="let sale">
                      <span class="date-cell">{{ sale.createdAt | date:'short' }}</span>
                    </td>
                  </ng-container>

                  <!-- Actions Column -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Acciones</th>
                    <td mat-cell *matCellDef="let sale">
                      <button mat-icon-button [routerLink]="['/sales', sale.id]" matTooltip="Ver detalles" color="primary">
                        <mat-icon>visibility</mat-icon>
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
                </table>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <!-- Auto-refresh indicator -->
        <div class="refresh-indicator">
          <div class="refresh-content">
            <mat-icon>schedule</mat-icon>
            <span>Actualización automática cada 5 minutos</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    /* ========================================
       DASHBOARD CONTAINER & LAYOUT
       ======================================== */
    .dashboard-container {
      padding: 32px;
      max-width: 1440px;
      margin: 0 auto;
      background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
      min-height: 100vh;
    }

    /* ========================================
       HEADER SECTION
       ======================================== */
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding: 20px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }

    .header-content h1 {
      margin: 0;
      font-size: 36px;
      font-weight: 700;
      background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-subtitle {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
      font-weight: 400;
    }

    .refresh-btn {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .refresh-btn:hover {
      transform: rotate(180deg) scale(1.1);
    }

    /* ========================================
       LOADING & ERROR STATES
       ======================================== */
    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 48px;
      gap: 24px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .loading-text,
    .error-text {
      font-size: 16px;
      color: rgba(0, 0, 0, 0.6);
      font-weight: 500;
    }

    .error-container mat-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
    }

    /* ========================================
       SECTION STYLING
       ======================================== */
    .quick-actions-section,
    .metrics-section {
      margin-bottom: 32px;
    }

    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.87);
      margin: 0 0 16px 8px;
      letter-spacing: 0.5px;
    }

    /* ========================================
       QUICK ACTIONS
       ======================================== */
    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .action-btn {
      height: 80px !important;
      border-radius: 16px !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      position: relative;
      overflow: hidden;
    }

    .action-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0));
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .action-btn:hover {
      transform: translateY(-4px) !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
    }

    .action-btn:hover::before {
      opacity: 1;
    }

    .action-btn.primary {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
      color: white !important;
    }

    .action-btn.accent {
      background: linear-gradient(135deg, #00acc1 0%, #0097a7 100%) !important;
      color: white !important;
    }

    .action-btn.secondary {
      background: linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%) !important;
      color: white !important;
    }

    .btn-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .btn-content mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .btn-content span {
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    /* ========================================
       METRICS CARDS
       ======================================== */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .metric-card {
      position: relative;
      overflow: hidden;
      border-radius: 16px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .metric-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
    }

    .metric-accent-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
    }

    .metric-card.today .metric-accent-bar {
      background: linear-gradient(90deg, #4caf50 0%, #81c784 100%);
    }

    .metric-card.week .metric-accent-bar {
      background: linear-gradient(90deg, #2196f3 0%, #64b5f6 100%);
    }

    .metric-card.month .metric-accent-bar {
      background: linear-gradient(90deg, #ff9800 0%, #ffb74d 100%);
    }

    .metric-card.alltime .metric-accent-bar {
      background: linear-gradient(90deg, #9c27b0 0%, #ba68c8 100%);
    }

    .metric-card mat-card-content {
      padding: 24px !important;
    }

    .metric-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 20px;
    }

    .metric-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 14px;
      transition: all 0.3s ease;
    }

    .metric-card:hover .metric-icon-wrapper {
      transform: scale(1.1) rotate(5deg);
    }

    .today-icon {
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
    }

    .today-icon mat-icon {
      color: #4caf50;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .week-icon {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    }

    .week-icon mat-icon {
      color: #2196f3;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .month-icon {
      background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    }

    .month-icon mat-icon {
      color: #ff9800;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .alltime-icon {
      background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
    }

    .alltime-icon mat-icon {
      color: #9c27b0;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .metric-info {
      flex: 1;
    }

    .metric-title {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.87);
      letter-spacing: 0.3px;
    }

    .metric-period {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.5);
      font-weight: 400;
    }

    .metric-value {
      font-size: 32px;
      font-weight: 700;
      color: #1976d2;
      margin: 0 0 16px 0;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }

    .metric-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-top: 12px;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
    }

    .metric-trend {
      color: #4caf50;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .metric-label {
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
      font-weight: 500;
    }

    /* ========================================
       CHART CARD
       ======================================== */
    .chart-card {
      margin-bottom: 32px;
      border-radius: 16px !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    .chart-header {
      width: 100%;
    }

    .chart-title-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .chart-icon {
      color: #1976d2;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .chart-subtitle {
      margin: 8px 0 0 0;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
      font-weight: 400;
    }

    .chart-container {
      padding: 32px 16px;
      min-height: 340px;
    }

    .chart-bars {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 280px;
      gap: 12px;
      padding: 0 16px;
      position: relative;
    }

    .chart-bar-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-width: 0;
      animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      opacity: 0;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .chart-value-top {
      font-size: 12px;
      font-weight: 600;
      color: #1976d2;
      margin-bottom: 4px;
    }

    .chart-bar {
      width: 100%;
      max-width: 70px;
      background: linear-gradient(180deg, #42a5f5 0%, #1976d2 100%);
      border-radius: 8px 8px 0 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      min-height: 8px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 -4px 12px rgba(25, 118, 210, 0.3);
    }

    .bar-shine {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.4) 50%,
        transparent 100%);
      transition: left 0.5s ease;
    }

    .chart-bar:hover {
      background: linear-gradient(180deg, #64b5f6 0%, #2196f3 100%);
      transform: translateY(-8px) scale(1.05);
      box-shadow: 0 -8px 20px rgba(25, 118, 210, 0.4);
    }

    .chart-bar:hover .bar-shine {
      left: 100%;
    }

    .chart-label {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.7);
      text-align: center;
      font-weight: 600;
      margin-top: 8px;
    }

    .chart-count {
      font-size: 11px;
      color: rgba(0, 0, 0, 0.5);
      text-align: center;
    }

    .empty-chart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 48px;
      gap: 16px;
    }

    .empty-icon-wrapper {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }

    .empty-icon-wrapper mat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: #2196f3;
    }

    .empty-text {
      font-size: 18px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.6);
      margin: 0;
    }

    .empty-subtext {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.4);
      margin: 4px 0 0 0;
    }

    /* ========================================
       TABLE CARD
       ======================================== */
    .table-card {
      border-radius: 16px !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      margin-bottom: 32px;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .table-title-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .table-icon {
      color: #1976d2;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .recent-sales-table {
      width: 100%;
      margin-top: 16px;
    }

    .mat-mdc-header-cell {
      font-weight: 600 !important;
      font-size: 14px !important;
      color: rgba(0, 0, 0, 0.87) !important;
      background: #f5f5f5;
    }

    .table-row {
      transition: background-color 0.2s ease;
    }

    .table-row:hover {
      background-color: rgba(25, 118, 210, 0.04);
    }

    .sale-number {
      font-weight: 600;
      color: #1976d2;
      font-size: 14px;
    }

    .customer-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .customer-icon {
      color: rgba(0, 0, 0, 0.5);
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .total-amount {
      font-weight: 600;
      color: #2e7d32;
      font-size: 14px;
    }

    .payment-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      background: rgba(25, 118, 210, 0.1);
      color: #1976d2;
      font-size: 12px;
      font-weight: 600;
    }

    .date-cell {
      color: rgba(0, 0, 0, 0.6);
      font-size: 13px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 48px;
      gap: 16px;
    }

    .empty-action {
      margin-top: 8px;
    }

    /* ========================================
       REFRESH INDICATOR
       ======================================== */
    .refresh-indicator {
      text-align: center;
      margin-top: 32px;
      padding: 16px;
    }

    .refresh-content {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: white;
      border-radius: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      color: rgba(0, 0, 0, 0.6);
      font-size: 13px;
      font-weight: 500;
    }

    .refresh-content mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #1976d2;
    }

    /* ========================================
       ANIMATIONS
       ======================================== */
    .animated {
      animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .metric-card.today {
      animation-delay: 0.1s;
    }

    .metric-card.week {
      animation-delay: 0.2s;
    }

    .metric-card.month {
      animation-delay: 0.3s;
    }

    .metric-card.alltime {
      animation-delay: 0.4s;
    }

    /* ========================================
       RESPONSIVE DESIGN
       ======================================== */
    @media (max-width: 1200px) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .dashboard-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
        padding: 16px;
      }

      .header-content h1 {
        font-size: 28px;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions {
        grid-template-columns: 1fr;
      }

      .chart-bars {
        padding: 0 8px;
        height: 220px;
      }

      .chart-value-top {
        font-size: 10px;
      }

      .chart-label {
        font-size: 11px;
      }

      .chart-count {
        font-size: 9px;
      }

      .section-title {
        font-size: 18px;
      }

      .table-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }

    @media (max-width: 480px) {
      .header-content h1 {
        font-size: 24px;
      }

      .metric-value {
        font-size: 24px;
      }

      .action-btn {
        height: 72px !important;
      }

      .btn-content mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      .btn-content span {
        font-size: 14px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private salesService = inject(SalesService);
  private refreshInterval?: number;

  // State signals
  summary = signal<SalesSummary | null>(null);
  recentSales = signal<Sale[]>([]);
  dailyStats = signal<DailySalesStats[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Computed signals for metrics
  todayRevenue = computed(() => this.summary()?.today.total ?? 0);
  todayCount = computed(() => this.summary()?.today.count ?? 0);
  weekRevenue = computed(() => this.summary()?.week.total ?? 0);
  weekCount = computed(() => this.summary()?.week.count ?? 0);
  monthRevenue = computed(() => this.summary()?.month.total ?? 0);
  monthCount = computed(() => this.summary()?.month.count ?? 0);
  allTimeRevenue = computed(() => this.summary()?.allTime.total ?? 0);
  allTimeCount = computed(() => this.summary()?.allTime.count ?? 0);

  // Computed for chart max value
  maxDailySales = computed(() => {
    const stats = this.dailyStats();
    if (stats.length === 0) return 0;
    return Math.max(...stats.map(s => s.total));
  });

  // Table columns
  displayedColumns = ['saleNumber', 'customer', 'total', 'paymentMethod', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.loadDashboardData();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);

    // Load summary, recent sales, and daily stats in parallel
    Promise.all([
      this.loadSummary(),
      this.loadRecentSales(),
      this.loadDailyStats()
    ]).then(() => {
      this.loading.set(false);
    }).catch((err) => {
      console.error('Error loading dashboard data:', err);
      this.error.set('Error al cargar los datos. Por favor, intente nuevamente.');
      this.loading.set(false);
    });
  }

  private loadSummary(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.salesService.getSummary().subscribe({
        next: (data) => {
          this.summary.set(data);
          resolve();
        },
        error: (err) => {
          console.error('Error loading summary:', err);
          reject(err);
        }
      });
    });
  }

  private loadRecentSales(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.salesService.getRecentSales(5).subscribe({
        next: (data) => {
          this.recentSales.set(data);
          resolve();
        },
        error: (err) => {
          console.error('Error loading recent sales:', err);
          reject(err);
        }
      });
    });
  }

  private loadDailyStats(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.salesService.getDailyStats(7).subscribe({
        next: (data) => {
          this.dailyStats.set(data);
          resolve();
        },
        error: (err) => {
          console.error('Error loading daily stats:', err);
          reject(err);
        }
      });
    });
  }

  private startAutoRefresh(): void {
    // Refresh every 5 minutes (300000 ms)
    this.refreshInterval = window.setInterval(() => {
      console.log('Auto-refreshing dashboard data...');
      this.loadDashboardData();
    }, 300000);
  }

  private stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  getBarHeight(value: number): number {
    const max = this.maxDailySales();
    if (max === 0) return 0;
    return (value / max) * 100;
  }

  getBarTooltip(stat: DailySalesStats): string {
    return `${this.formatDate(stat.date)}: ${stat.count} ventas - ${stat.total.toLocaleString('es-PY')} Gs.`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return `${days[date.getDay()]} ${date.getDate()}`;
  }

  getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      'CASH': 'Efectivo',
      'CARD': 'Tarjeta',
      'DEBIT_CARD': 'Tarjeta de Débito',
      'CREDIT_CARD': 'Tarjeta de Crédito',
      'TRANSFER': 'Transferencia',
      'QR': 'QR',
      'MIXED': 'Mixto'
    };
    return labels[method] || method;
  }
}
