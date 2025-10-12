import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'default';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss']
})
export class StatusBadgeComponent {
  @Input() status: BadgeStatus = 'default';
  @Input() label?: string;
  @Input() size: 'small' | 'medium' = 'medium';
  @Input() rounded = true;

  get displayLabel(): string {
    if (this.label) {
      return this.label;
    }

    // Default labels
    const labels: Record<BadgeStatus, string> = {
      success: 'Completado',
      warning: 'Advertencia',
      error: 'Error',
      info: 'Información',
      pending: 'Pendiente',
      default: 'Estado'
    };

    return labels[this.status];
  }

  get statusClasses(): string[] {
    return [
      'status-badge',
      `status-${this.status}`,
      `size-${this.size}`,
      this.rounded ? 'rounded' : ''
    ].filter(Boolean);
  }
}
