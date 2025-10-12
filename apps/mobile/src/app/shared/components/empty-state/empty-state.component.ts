import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface EmptyStateButton {
  label: string;
  icon?: string;
  color?: string;
  action: () => void;
}

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="empty-state-container">
      <div class="empty-state-content">
        <!-- Icon -->
        <ion-icon
          [name]="icon"
          [color]="iconColor"
          class="empty-state-icon"
        />

        <!-- Title -->
        <h2 class="empty-state-title">{{ title }}</h2>

        <!-- Message -->
        <p class="empty-state-message">{{ message }}</p>

        <!-- Action Button -->
        @if (actionButton) {
          <ion-button
            [color]="actionButton.color || 'primary'"
            (click)="actionButton.action()"
            class="empty-state-button"
          >
            @if (actionButton.icon) {
              <ion-icon [name]="actionButton.icon" slot="start" />
            }
            {{ actionButton.label }}
          </ion-button>
        }

        <!-- Custom Content Slot -->
        <div class="empty-state-custom">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .empty-state-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
      padding: 32px 16px;
    }

    .empty-state-content {
      text-align: center;
      max-width: 400px;
      width: 100%;
    }

    .empty-state-icon {
      font-size: 80px;
      margin-bottom: 16px;
      opacity: 0.6;
    }

    .empty-state-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: var(--ion-text-color);
    }

    .empty-state-message {
      font-size: 14px;
      color: var(--ion-color-medium);
      margin: 0 0 24px 0;
      line-height: 1.5;
    }

    .empty-state-button {
      margin: 0 auto;
    }

    .empty-state-custom {
      margin-top: 16px;
    }

    /* Animation */
    .empty-state-content {
      animation: fadeInUp 0.5s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'file-tray-outline';
  @Input() iconColor = 'medium';
  @Input() title = 'No hay datos';
  @Input() message = 'No se encontraron elementos para mostrar';
  @Input() actionButton?: EmptyStateButton;
}
