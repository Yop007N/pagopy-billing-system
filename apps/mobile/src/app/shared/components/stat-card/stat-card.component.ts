import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface StatTrend {
  value: number;
  direction: TrendDirection;
  label?: string;
}

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-card
      [color]="cardColor"
      [class.clickable]="clickable"
      (click)="onClick()"
      class="stat-card"
    >
      <ion-card-content>
        <div class="stat-card-layout">
          <!-- Icon -->
          <div class="stat-icon-container" [style.background-color]="iconBackgroundColor">
            <ion-icon
              [name]="icon"
              [color]="iconColor"
              class="stat-icon"
            />
          </div>

          <!-- Content -->
          <div class="stat-content">
            <!-- Title -->
            <div class="stat-title">
              {{ title }}
            </div>

            <!-- Value -->
            <div class="stat-value" [style.color]="valueColor">
              @if (prefix) {
                <span class="stat-prefix">{{ prefix }}</span>
              }
              {{ formattedValue }}
              @if (suffix) {
                <span class="stat-suffix">{{ suffix }}</span>
              }
            </div>

            <!-- Subtitle -->
            @if (subtitle) {
              <div class="stat-subtitle">
                {{ subtitle }}
              </div>
            }

            <!-- Trend -->
            @if (trend) {
              <div class="stat-trend" [class]="'trend-' + trend.direction">
                <ion-icon [name]="trendIcon" />
                <span>{{ formatTrendValue(trend.value) }}%</span>
                @if (trend.label) {
                  <span class="trend-label">{{ trend.label }}</span>
                }
              </div>
            }
          </div>
        </div>

        <!-- Footer (optional) -->
        @if (footerText) {
          <div class="stat-footer">
            <ion-text color="medium">
              <small>{{ footerText }}</small>
            </ion-text>
          </div>
        }
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    .stat-card {
      margin: 8px;
      --ion-card-padding: 16px;
    }

    .stat-card.clickable {
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card.clickable:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .stat-card.clickable:active {
      transform: translateY(0);
    }

    ion-card-content {
      padding: 16px;
    }

    .stat-card-layout {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .stat-icon-container {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon {
      font-size: 24px;
    }

    .stat-content {
      flex: 1;
      min-width: 0;
    }

    .stat-title {
      font-size: 13px;
      color: var(--ion-color-medium);
      font-weight: 500;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 4px;
      line-height: 1.2;
      display: flex;
      align-items: baseline;
      gap: 4px;
    }

    .stat-prefix,
    .stat-suffix {
      font-size: 16px;
      font-weight: 500;
      opacity: 0.8;
    }

    .stat-subtitle {
      font-size: 12px;
      color: var(--ion-color-medium);
      margin-bottom: 8px;
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 8px;
    }

    .stat-trend ion-icon {
      font-size: 16px;
    }

    .trend-label {
      color: var(--ion-color-medium);
      font-weight: 400;
      margin-left: 4px;
    }

    .trend-up {
      color: var(--ion-color-success);
    }

    .trend-down {
      color: var(--ion-color-danger);
    }

    .trend-neutral {
      color: var(--ion-color-medium);
    }

    .stat-footer {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--ion-color-light);
    }

    /* Animation */
    .stat-card {
      animation: fadeInUp 0.4s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Value count animation */
    .stat-value {
      animation: countUp 0.6s ease-out;
    }

    @keyframes countUp {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `]
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string | number = 0;
  @Input() subtitle?: string;
  @Input() icon = 'stats-chart-outline';
  @Input() iconColor = 'primary';
  @Input() iconBackgroundColor?: string;
  @Input() cardColor = '';
  @Input() valueColor?: string;
  @Input() prefix?: string;
  @Input() suffix?: string;
  @Input() trend?: StatTrend;
  @Input() footerText?: string;
  @Input() clickable = false;
  @Input() formatValue = true;

  @Output() cardClick = new EventEmitter<void>();

  get formattedValue(): string {
    if (typeof this.value === 'string') {
      return this.value;
    }

    if (!this.formatValue) {
      return this.value.toString();
    }

    // Format numbers with thousand separators
    return new Intl.NumberFormat('es-PY').format(this.value);
  }

  get trendIcon(): string {
    if (!this.trend) return '';

    switch (this.trend.direction) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      case 'neutral':
        return 'remove-outline';
      default:
        return 'remove-outline';
    }
  }

  formatTrendValue(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}`;
  }

  onClick(): void {
    if (this.clickable) {
      this.cardClick.emit();
    }
  }
}
