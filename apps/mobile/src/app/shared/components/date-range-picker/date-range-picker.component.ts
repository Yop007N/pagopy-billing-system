import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonIcon,
  IonLabel,
  IonChip,
  IonDatetime,
  IonPopover,
  IonCard,
  IonCardContent,
  IonItem,
  IonList,
  IonNote,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  closeCircleOutline,
  chevronForwardOutline,
  todayOutline,
  checkmarkOutline
} from 'ionicons/icons';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  label?: string;
}

export interface DateRangePreset {
  label: string;
  value: string;
  startDate: Date;
  endDate: Date;
}

/**
 * DateRangePickerComponent - Interactive date range selector
 *
 * Features:
 * - Start and end date selection
 * - Quick preset ranges (today, this week, this month, etc.)
 * - Custom date range selection
 * - Visual date display
 * - Clear functionality
 * - Validation (end date must be after start date)
 * - Ionic datetime integration
 */
@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonButtons,
    IonIcon,
    IonLabel,
    IonChip,
    IonDatetime,
    IonPopover,
    IonCard,
    IonCardContent,
    IonItem,
    IonList,
    IonNote
  ],
  template: `
    <div class="date-range-picker">
      <!-- Selected Range Display -->
      <div class="range-display">
        @if (selectedRange()) {
          <ion-chip color="primary" class="range-chip">
            <ion-icon name="calendar-outline"></ion-icon>
            <ion-label>{{ formatRangeLabel() }}</ion-label>
            @if (showClearButton) {
              <ion-icon
                name="close-circle-outline"
                (click)="clearRange($event)"
              ></ion-icon>
            }
          </ion-chip>
        } @else {
          <ion-button
            fill="outline"
            (click)="openPicker()"
            [disabled]="disabled"
          >
            <ion-icon slot="start" name="calendar-outline"></ion-icon>
            {{ placeholder }}
          </ion-button>
        }
      </div>

      <!-- Popover for Date Selection -->
      <ion-popover
        #popover
        [isOpen]="isOpen()"
        (didDismiss)="onDismiss()"
        [showBackdrop]="true"
      >
        <ng-template>
          <ion-card class="date-picker-card">
            <ion-card-content>
              <!-- Quick Presets -->
              @if (showPresets) {
                <div class="presets-section">
                  <h4>Rangos rápidos</h4>
                  <div class="presets-grid">
                    @for (preset of presets; track preset.value) {
                      <ion-button
                        fill="outline"
                        size="small"
                        (click)="selectPreset(preset)"
                        [color]="isPresetSelected(preset) ? 'primary' : 'medium'"
                        class="preset-button"
                      >
                        {{ preset.label }}
                      </ion-button>
                    }
                  </div>
                </div>
              }

              <!-- Custom Date Selection -->
              <div class="custom-dates-section">
                <h4>Selección personalizada</h4>

                <!-- Start Date -->
                <ion-item lines="none" class="date-item">
                  <ion-label position="stacked">Fecha inicial</ion-label>
                  <ion-datetime
                    presentation="date"
                    [value]="startDateISO()"
                    (ionChange)="onStartDateChange($event)"
                    [max]="endDateISO() || todayISO()"
                    locale="es-PY"
                  ></ion-datetime>
                </ion-item>

                <!-- End Date -->
                <ion-item lines="none" class="date-item">
                  <ion-label position="stacked">Fecha final</ion-label>
                  <ion-datetime
                    presentation="date"
                    [value]="endDateISO()"
                    (ionChange)="onEndDateChange($event)"
                    [min]="startDateISO()"
                    [max]="maxDateISO()"
                    locale="es-PY"
                  ></ion-datetime>
                </ion-item>

                <!-- Validation Message -->
                @if (validationError()) {
                  <ion-note color="danger" class="validation-note">
                    {{ validationError() }}
                  </ion-note>
                }
              </div>

              <!-- Actions -->
              <div class="actions-section">
                <ion-button
                  expand="block"
                  fill="clear"
                  (click)="cancel()"
                >
                  Cancelar
                </ion-button>
                <ion-button
                  expand="block"
                  (click)="apply()"
                  [disabled]="!isValid()"
                  color="primary"
                >
                  <ion-icon slot="start" name="checkmark-outline"></ion-icon>
                  Aplicar
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </ng-template>
      </ion-popover>

      <!-- Range Summary (optional) -->
      @if (showSummary && selectedRange()) {
        <div class="range-summary">
          <ion-note color="medium">
            {{ getRangeDuration() }}
          </ion-note>
        </div>
      }
    </div>
  `,
  styles: [`
    .date-range-picker {
      width: 100%;
    }

    .range-display {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .range-chip {
      margin: 0;
      cursor: pointer;
    }

    .range-chip ion-icon:last-child {
      cursor: pointer;
      margin-left: 4px;
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }

    .range-chip ion-icon:last-child:hover {
      opacity: 1;
    }

    .date-picker-card {
      width: 90vw;
      max-width: 400px;
      margin: 0;
      box-shadow: none;
    }

    .date-picker-card ion-card-content {
      padding: 16px;
    }

    .presets-section,
    .custom-dates-section {
      margin-bottom: 16px;
    }

    .presets-section h4,
    .custom-dates-section h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--ion-color-medium);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .presets-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .preset-button {
      margin: 0;
      font-size: 12px;
      height: 32px;
    }

    .date-item {
      --padding-start: 0;
      --inner-padding-end: 0;
      margin-bottom: 12px;
    }

    .date-item ion-label {
      margin-bottom: 8px;
      font-weight: 500;
      font-size: 13px;
    }

    .validation-note {
      display: block;
      margin: 8px 0;
      font-size: 12px;
    }

    .actions-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--ion-color-light);
    }

    .range-summary {
      margin-top: 8px;
      text-align: center;
    }

    .range-summary ion-note {
      font-size: 12px;
    }

    /* Animations */
    .range-chip {
      animation: slideInRight 0.3s ease-out;
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class DateRangePickerComponent implements OnInit {
  @Input() initialRange?: DateRange;
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() placeholder = 'Seleccionar rango de fechas';
  @Input() showClearButton = true;
  @Input() showPresets = true;
  @Input() showSummary = true;
  @Input() disabled = false;

  @Output() rangeChange = new EventEmitter<DateRange | null>();
  @Output() rangeApplied = new EventEmitter<DateRange>();
  @Output() rangeCleared = new EventEmitter<void>();

  isOpen = signal(false);
  selectedRange = signal<DateRange | null>(null);
  tempStartDate = signal<Date | null>(null);
  tempEndDate = signal<Date | null>(null);
  validationError = signal<string>('');

  presets: DateRangePreset[] = [];

  constructor() {
    addIcons({
      calendarOutline,
      closeCircleOutline,
      chevronForwardOutline,
      todayOutline,
      checkmarkOutline
    });
  }

  ngOnInit() {
    this.initializePresets();

    if (this.initialRange) {
      this.selectedRange.set(this.initialRange);
    }
  }

  private initializePresets(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    this.presets = [
      {
        label: 'Hoy',
        value: 'today',
        startDate: new Date(today),
        endDate: new Date(today)
      },
      {
        label: 'Ayer',
        value: 'yesterday',
        startDate: new Date(yesterday),
        endDate: new Date(yesterday)
      },
      {
        label: 'Esta semana',
        value: 'this-week',
        startDate: new Date(weekStart),
        endDate: new Date(today)
      },
      {
        label: 'Este mes',
        value: 'this-month',
        startDate: new Date(monthStart),
        endDate: new Date(today)
      },
      {
        label: 'Últimos 7 días',
        value: 'last-7-days',
        startDate: new Date(last7Days),
        endDate: new Date(today)
      },
      {
        label: 'Últimos 30 días',
        value: 'last-30-days',
        startDate: new Date(last30Days),
        endDate: new Date(today)
      },
      {
        label: 'Mes pasado',
        value: 'last-month',
        startDate: new Date(lastMonthStart),
        endDate: new Date(lastMonthEnd)
      }
    ];
  }

  openPicker(): void {
    if (this.disabled) return;

    // Initialize temp dates with current selection or defaults
    const current = this.selectedRange();
    if (current) {
      this.tempStartDate.set(new Date(current.startDate));
      this.tempEndDate.set(new Date(current.endDate));
    } else {
      const today = new Date();
      this.tempStartDate.set(new Date(today));
      this.tempEndDate.set(new Date(today));
    }

    this.isOpen.set(true);
  }

  onDismiss(): void {
    this.isOpen.set(false);
    this.validationError.set('');
  }

  selectPreset(preset: DateRangePreset): void {
    this.tempStartDate.set(new Date(preset.startDate));
    this.tempEndDate.set(new Date(preset.endDate));
    this.validationError.set('');
  }

  isPresetSelected(preset: DateRangePreset): boolean {
    const start = this.tempStartDate();
    const end = this.tempEndDate();

    if (!start || !end) return false;

    return (
      start.toDateString() === preset.startDate.toDateString() &&
      end.toDateString() === preset.endDate.toDateString()
    );
  }

  onStartDateChange(event: any): void {
    const value = event.detail.value;
    if (value) {
      const date = new Date(value);
      this.tempStartDate.set(date);
      this.validate();
    }
  }

  onEndDateChange(event: any): void {
    const value = event.detail.value;
    if (value) {
      const date = new Date(value);
      this.tempEndDate.set(date);
      this.validate();
    }
  }

  validate(): boolean {
    const start = this.tempStartDate();
    const end = this.tempEndDate();

    if (!start || !end) {
      this.validationError.set('Seleccione ambas fechas');
      return false;
    }

    if (start > end) {
      this.validationError.set('La fecha inicial debe ser anterior a la fecha final');
      return false;
    }

    this.validationError.set('');
    return true;
  }

  isValid(): boolean {
    return !this.validationError() && !!this.tempStartDate() && !!this.tempEndDate();
  }

  apply(): void {
    if (!this.isValid()) return;

    const start = this.tempStartDate()!;
    const end = this.tempEndDate()!;

    const range: DateRange = {
      startDate: start,
      endDate: end
    };

    this.selectedRange.set(range);
    this.rangeChange.emit(range);
    this.rangeApplied.emit(range);
    this.isOpen.set(false);
  }

  cancel(): void {
    this.isOpen.set(false);
    this.validationError.set('');
  }

  clearRange(event: Event): void {
    event.stopPropagation();
    this.selectedRange.set(null);
    this.tempStartDate.set(null);
    this.tempEndDate.set(null);
    this.rangeChange.emit(null);
    this.rangeCleared.emit();
  }

  formatRangeLabel(): string {
    const range = this.selectedRange();
    if (!range) return '';

    const start = this.formatDate(range.startDate);
    const end = this.formatDate(range.endDate);

    if (start === end) {
      return start;
    }

    return `${start} - ${end}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-PY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getRangeDuration(): string {
    const range = this.selectedRange();
    if (!range) return '';

    const diffTime = Math.abs(range.endDate.getTime() - range.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays === 1) return '1 día';
    if (diffDays < 7) return `${diffDays} días`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} semana${weeks > 1 ? 's' : ''}`;
    }
    const months = Math.floor(diffDays / 30);
    return `${months} mes${months > 1 ? 'es' : ''}`;
  }

  // ISO format helpers for ion-datetime
  startDateISO(): string {
    const date = this.tempStartDate();
    return date ? date.toISOString() : '';
  }

  endDateISO(): string {
    const date = this.tempEndDate();
    return date ? date.toISOString() : '';
  }

  todayISO(): string {
    return new Date().toISOString();
  }

  maxDateISO(): string {
    return this.maxDate ? this.maxDate.toISOString() : this.todayISO();
  }

  // Public methods
  public getRange(): DateRange | null {
    return this.selectedRange();
  }

  public setRange(range: DateRange): void {
    this.selectedRange.set(range);
    this.rangeChange.emit(range);
  }

  public reset(): void {
    this.clearRange(new Event('click'));
  }
}
