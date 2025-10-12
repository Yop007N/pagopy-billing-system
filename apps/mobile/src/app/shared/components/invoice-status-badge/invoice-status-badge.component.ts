import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonBadge, IonIcon, IonChip, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  closeCircle,
  timeOutline,
  hourglassOutline,
  alertCircleOutline,
  documentTextOutline,
  sendOutline,
  checkmarkDoneOutline
} from 'ionicons/icons';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  SENT = 'SENT',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR'
}

export interface StatusConfig {
  label: string;
  color: string;
  icon: string;
  description?: string;
}

/**
 * InvoiceStatusBadgeComponent - Visual status indicator for invoices
 *
 * Features:
 * - Supports all invoice statuses (SET e-Kuatia flow)
 * - Customizable appearance (badge or chip)
 * - Icons for better visual recognition
 * - Color-coded by status
 * - Optional click handling
 * - Tooltip/description support
 */
@Component({
  selector: 'app-invoice-status-badge',
  standalone: true,
  imports: [CommonModule, IonBadge, IonIcon, IonChip, IonLabel],
  template: `
    @if (variant === 'badge') {
      <ion-badge
        [color]="statusConfig.color"
        [class.clickable]="clickable"
        (click)="onClick()"
        class="status-badge"
      >
        @if (showIcon) {
          <ion-icon [name]="statusConfig.icon" class="badge-icon"></ion-icon>
        }
        <span>{{ statusConfig.label }}</span>
      </ion-badge>
    }

    @if (variant === 'chip') {
      <ion-chip
        [color]="statusConfig.color"
        [class.clickable]="clickable"
        (click)="onClick()"
        [outline]="outline"
        class="status-chip"
      >
        @if (showIcon) {
          <ion-icon [name]="statusConfig.icon"></ion-icon>
        }
        <ion-label>{{ statusConfig.label }}</ion-label>
      </ion-chip>
    }

    @if (variant === 'detailed') {
      <div
        class="status-detailed"
        [class.clickable]="clickable"
        (click)="onClick()"
      >
        <div class="status-icon-container" [style.background-color]="getIconBackground()">
          <ion-icon
            [name]="statusConfig.icon"
            [color]="statusConfig.color"
            class="status-icon"
          ></ion-icon>
        </div>
        <div class="status-content">
          <div class="status-label">{{ statusConfig.label }}</div>
          @if (statusConfig.description && showDescription) {
            <div class="status-description">{{ statusConfig.description }}</div>
          }
          @if (timestamp) {
            <div class="status-timestamp">{{ formatTimestamp(timestamp) }}</div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    /* Badge Variant */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge.clickable {
      cursor: pointer;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }

    .status-badge.clickable:hover {
      opacity: 0.8;
      transform: scale(1.05);
    }

    .status-badge.clickable:active {
      transform: scale(0.95);
    }

    .badge-icon {
      font-size: 14px;
    }

    /* Chip Variant */
    .status-chip {
      margin: 0;
      height: 32px;
    }

    .status-chip.clickable {
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .status-chip.clickable:hover {
      transform: scale(1.02);
    }

    .status-chip.clickable:active {
      transform: scale(0.98);
    }

    /* Detailed Variant */
    .status-detailed {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      background: var(--ion-color-light);
      transition: all 0.2s ease;
    }

    .status-detailed.clickable {
      cursor: pointer;
    }

    .status-detailed.clickable:hover {
      background: var(--ion-color-light-shade);
      transform: translateX(2px);
    }

    .status-icon-container {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .status-icon {
      font-size: 24px;
    }

    .status-content {
      flex: 1;
      min-width: 0;
    }

    .status-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--ion-text-color);
      margin-bottom: 2px;
    }

    .status-description {
      font-size: 12px;
      color: var(--ion-color-medium);
      line-height: 1.4;
    }

    .status-timestamp {
      font-size: 11px;
      color: var(--ion-color-medium);
      margin-top: 4px;
    }

    /* Animation */
    :host {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* Pulse animation for pending/processing states */
    .status-badge[color="warning"],
    .status-chip[color="warning"],
    .status-detailed .status-icon[color="warning"] {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }
  `]
})
export class InvoiceStatusBadgeComponent {
  @Input() status: InvoiceStatus = InvoiceStatus.DRAFT;
  @Input() variant: 'badge' | 'chip' | 'detailed' = 'badge';
  @Input() showIcon = true;
  @Input() showDescription = false;
  @Input() outline = false;
  @Input() clickable = false;
  @Input() timestamp?: Date | string;
  @Input() customLabel?: string;
  @Input() customColor?: string;
  @Input() customIcon?: string;

  @Output() badgeClick = new EventEmitter<InvoiceStatus>();

  private statusConfigs: Record<InvoiceStatus, StatusConfig> = {
    [InvoiceStatus.DRAFT]: {
      label: 'Borrador',
      color: 'medium',
      icon: 'document-text-outline',
      description: 'Factura en preparación'
    },
    [InvoiceStatus.PENDING]: {
      label: 'Pendiente',
      color: 'warning',
      icon: 'hourglass-outline',
      description: 'Esperando procesamiento'
    },
    [InvoiceStatus.PROCESSING]: {
      label: 'Procesando',
      color: 'warning',
      icon: 'time-outline',
      description: 'En proceso de validación'
    },
    [InvoiceStatus.SENT]: {
      label: 'Enviada',
      color: 'tertiary',
      icon: 'send-outline',
      description: 'Enviada a SET e-Kuatia'
    },
    [InvoiceStatus.APPROVED]: {
      label: 'Aprobada',
      color: 'success',
      icon: 'checkmark-done-outline',
      description: 'Aprobada por SET'
    },
    [InvoiceStatus.REJECTED]: {
      label: 'Rechazada',
      color: 'danger',
      icon: 'close-circle',
      description: 'Rechazada por SET'
    },
    [InvoiceStatus.CANCELLED]: {
      label: 'Anulada',
      color: 'dark',
      icon: 'close-circle',
      description: 'Factura anulada'
    },
    [InvoiceStatus.ERROR]: {
      label: 'Error',
      color: 'danger',
      icon: 'alert-circle-outline',
      description: 'Error en el procesamiento'
    }
  };

  constructor() {
    addIcons({
      checkmarkCircle,
      closeCircle,
      timeOutline,
      hourglassOutline,
      alertCircleOutline,
      documentTextOutline,
      sendOutline,
      checkmarkDoneOutline
    });
  }

  get statusConfig(): StatusConfig {
    const config = this.statusConfigs[this.status];

    // Apply custom overrides
    return {
      label: this.customLabel || config.label,
      color: this.customColor || config.color,
      icon: this.customIcon || config.icon,
      description: config.description
    };
  }

  onClick(): void {
    if (this.clickable) {
      this.badgeClick.emit(this.status);
    }
  }

  getIconBackground(): string {
    const colorMap: Record<string, string> = {
      'success': 'rgba(16, 220, 96, 0.1)',
      'danger': 'rgba(245, 61, 61, 0.1)',
      'warning': 'rgba(255, 206, 0, 0.1)',
      'primary': 'rgba(66, 140, 255, 0.1)',
      'secondary': 'rgba(12, 209, 232, 0.1)',
      'tertiary': 'rgba(112, 68, 255, 0.1)',
      'medium': 'rgba(146, 148, 156, 0.1)',
      'dark': 'rgba(34, 36, 40, 0.1)'
    };

    return colorMap[this.statusConfig.color] || colorMap['medium'];
  }

  formatTimestamp(timestamp: Date | string): string {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Ahora';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours}h`;
      if (diffDays < 7) return `Hace ${diffDays} días`;

      return date.toLocaleDateString('es-PY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  }

  // Public method to get status info
  public getStatusInfo(): StatusConfig {
    return this.statusConfig;
  }

  // Static helper method to get status color
  public static getStatusColor(status: InvoiceStatus): string {
    const colors: Record<InvoiceStatus, string> = {
      [InvoiceStatus.DRAFT]: 'medium',
      [InvoiceStatus.PENDING]: 'warning',
      [InvoiceStatus.PROCESSING]: 'warning',
      [InvoiceStatus.SENT]: 'tertiary',
      [InvoiceStatus.APPROVED]: 'success',
      [InvoiceStatus.REJECTED]: 'danger',
      [InvoiceStatus.CANCELLED]: 'dark',
      [InvoiceStatus.ERROR]: 'danger'
    };
    return colors[status] || 'medium';
  }

  // Static helper method to check if status is final
  public static isFinalStatus(status: InvoiceStatus): boolean {
    return [
      InvoiceStatus.APPROVED,
      InvoiceStatus.REJECTED,
      InvoiceStatus.CANCELLED
    ].includes(status);
  }

  // Static helper method to check if status is in progress
  public static isInProgress(status: InvoiceStatus): boolean {
    return [
      InvoiceStatus.PENDING,
      InvoiceStatus.PROCESSING,
      InvoiceStatus.SENT
    ].includes(status);
  }
}
