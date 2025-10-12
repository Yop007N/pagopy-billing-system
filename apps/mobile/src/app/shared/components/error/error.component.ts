import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface ErrorDetails {
  title?: string;
  message: string;
  code?: string;
  statusCode?: number;
  timestamp?: Date;
}

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="error-container">
      <ion-card [color]="cardColor" class="error-card">
        <ion-card-content>
          <!-- Error Icon -->
          <div class="error-icon-container">
            <ion-icon
              [name]="errorIcon"
              [color]="iconColor"
              class="error-icon"
            />
          </div>

          <!-- Error Title -->
          <h2 class="error-title">
            {{ errorDetails.title || defaultTitle }}
          </h2>

          <!-- Error Message -->
          <p class="error-message">
            {{ errorDetails.message }}
          </p>

          <!-- Error Details (Collapsible) -->
          @if (showDetails && (errorDetails.code || errorDetails.statusCode)) {
            <div class="error-details">
              @if (errorDetails.statusCode) {
                <div class="error-detail-item">
                  <span class="error-detail-label">Código de estado:</span>
                  <span class="error-detail-value">{{ errorDetails.statusCode }}</span>
                </div>
              }
              @if (errorDetails.code) {
                <div class="error-detail-item">
                  <span class="error-detail-label">Código de error:</span>
                  <span class="error-detail-value">{{ errorDetails.code }}</span>
                </div>
              }
              @if (errorDetails.timestamp) {
                <div class="error-detail-item">
                  <span class="error-detail-label">Fecha:</span>
                  <span class="error-detail-value">{{ errorDetails.timestamp | date:'short' }}</span>
                </div>
              }
            </div>
          }

          <!-- Action Buttons -->
          <div class="error-actions">
            <!-- Retry Button -->
            @if (showRetry) {
              <ion-button
                expand="block"
                [color]="retryButtonColor"
                (click)="onRetry()"
                [disabled]="retrying"
              >
                @if (retrying) {
                  <ion-spinner name="crescent" slot="start" />
                } @else {
                  <ion-icon name="refresh-outline" slot="start" />
                }
                {{ retryButtonText }}
              </ion-button>
            }

            <!-- Secondary Action -->
            @if (secondaryAction) {
              <ion-button
                expand="block"
                fill="outline"
                [color]="secondaryAction.color || 'medium'"
                (click)="secondaryAction.callback()"
              >
                @if (secondaryAction.icon) {
                  <ion-icon [name]="secondaryAction.icon" slot="start" />
                }
                {{ secondaryAction.label }}
              </ion-button>
            }

            <!-- Toggle Details -->
            @if (errorDetails.code || errorDetails.statusCode) {
              <ion-button
                fill="clear"
                size="small"
                (click)="toggleDetails()"
                class="toggle-details-button"
              >
                {{ showDetails ? 'Ocultar detalles' : 'Ver detalles' }}
                <ion-icon
                  [name]="showDetails ? 'chevron-up' : 'chevron-down'"
                  slot="end"
                />
              </ion-button>
            }
          </div>
        </ion-card-content>
      </ion-card>
    </div>
  `,
  styles: [`
    .error-container {
      padding: 16px;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .error-card {
      width: 100%;
      max-width: 500px;
    }

    ion-card-content {
      text-align: center;
    }

    .error-icon-container {
      margin-bottom: 16px;
    }

    .error-icon {
      font-size: 64px;
    }

    .error-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: var(--ion-text-color);
    }

    .error-message {
      font-size: 14px;
      color: var(--ion-color-medium);
      margin: 0 0 24px 0;
      line-height: 1.5;
    }

    .error-details {
      background: var(--ion-color-light);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 16px;
      text-align: left;
    }

    .error-detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }

    .error-detail-item:last-child {
      margin-bottom: 0;
    }

    .error-detail-label {
      font-weight: 500;
      color: var(--ion-color-medium);
    }

    .error-detail-value {
      color: var(--ion-text-color);
      font-family: monospace;
    }

    .error-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .toggle-details-button {
      margin-top: 8px;
    }

    /* Animation */
    .error-card {
      animation: errorShake 0.5s ease-out;
    }

    @keyframes errorShake {
      0%, 100% {
        transform: translateX(0);
      }
      10%, 30%, 50%, 70%, 90% {
        transform: translateX(-5px);
      }
      20%, 40%, 60%, 80% {
        transform: translateX(5px);
      }
    }
  `]
})
export class ErrorComponent {
  @Input() error: Error | ErrorDetails | string = '';
  @Input() retryCallback?: () => void | Promise<void>;
  @Input() showRetry = true;
  @Input() retryButtonText = 'Reintentar';
  @Input() retryButtonColor = 'primary';
  @Input() cardColor = 'light';
  @Input() iconColor = 'danger';
  @Input() errorIcon = 'alert-circle-outline';
  @Input() defaultTitle = 'Ha ocurrido un error';
  @Input() secondaryAction?: {
    label: string;
    icon?: string;
    color?: string;
    callback: () => void;
  };

  @Output() retry = new EventEmitter<void>();

  retrying = false;
  showDetails = false;

  get errorDetails(): ErrorDetails {
    if (typeof this.error === 'string') {
      return {
        message: this.error
      };
    }

    if (this.error instanceof Error) {
      return {
        message: this.error.message,
        code: (this.error as any).code,
        timestamp: new Date()
      };
    }

    return this.error as ErrorDetails;
  }

  async onRetry(): Promise<void> {
    if (this.retrying) return;

    this.retrying = true;
    try {
      if (this.retryCallback) {
        await this.retryCallback();
      }
      this.retry.emit();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      this.retrying = false;
    }
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }
}
