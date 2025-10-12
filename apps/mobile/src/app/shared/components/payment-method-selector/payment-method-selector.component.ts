import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonList,
  IonItem,
  IonLabel,
  IonRadioGroup,
  IonRadio,
  IonIcon,
  IonNote,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonBadge,
  IonInput
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  cashOutline,
  cardOutline,
  phonePortraitOutline,
  walletOutline,
  timeOutline,
  checkmarkCircle,
  alertCircle
} from 'ionicons/icons';

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  MOBILE = 'MOBILE',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT = 'CREDIT',
  MIXED = 'MIXED'
}

export interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  icon: string;
  description?: string;
  color?: string;
  enabled: boolean;
}

export interface PaymentSelection {
  method: PaymentMethod;
  amount?: number;
  reference?: string;
  details?: any;
}

/**
 * PaymentMethodSelectorComponent - Interactive payment method selector
 *
 * Features:
 * - Multiple payment method options
 * - Visual icons and descriptions
 * - Mixed payment support (split between methods)
 * - Payment reference/transaction tracking
 * - Custom payment details
 * - Validation and error handling
 */
@Component({
  selector: 'app-payment-method-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonList,
    IonItem,
    IonLabel,
    IonRadioGroup,
    IonRadio,
    IonIcon,
    IonNote,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonBadge,
    IonInput
  ],
  template: `
    <div class="payment-method-selector">
      <!-- Header -->
      @if (showHeader) {
        <div class="selector-header">
          <h3>{{ headerTitle }}</h3>
          @if (totalAmount) {
            <ion-badge color="primary">
              Total: {{ formatCurrency(totalAmount) }}
            </ion-badge>
          }
        </div>
      }

      <!-- Payment Methods -->
      <ion-radio-group
        [value]="selectedMethod()"
        (ionChange)="onMethodChange($event)"
      >
        <ion-list class="payment-methods-list">
          @for (option of paymentOptions; track option.value) {
            <ion-card
              [class.selected]="selectedMethod() === option.value"
              [class.disabled]="!option.enabled"
              class="payment-option-card"
            >
              <ion-item
                lines="none"
                [disabled]="!option.enabled"
                [button]="option.enabled"
                (click)="selectMethod(option.value)"
              >
                <ion-icon
                  slot="start"
                  [name]="option.icon"
                  [color]="selectedMethod() === option.value ? option.color || 'primary' : 'medium'"
                  class="payment-icon"
                ></ion-icon>

                <ion-label>
                  <h3>{{ option.label }}</h3>
                  @if (option.description) {
                    <p>{{ option.description }}</p>
                  }
                </ion-label>

                @if (option.enabled) {
                  <ion-radio slot="end" [value]="option.value"></ion-radio>
                } @else {
                  <ion-note slot="end" color="medium">No disponible</ion-note>
                }
              </ion-item>
            </ion-card>
          }
        </ion-list>
      </ion-radio-group>

      <!-- Payment Details (shown when method is selected) -->
      @if (selectedMethod() && showPaymentDetails) {
        <ion-card class="payment-details-card">
          <ion-card-header>
            <ion-card-title>Detalles del pago</ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <!-- Amount (for mixed payments or custom amounts) -->
            @if (allowCustomAmount) {
              <ion-item>
                <ion-label position="stacked">Monto</ion-label>
                <ion-input
                  type="number"
                  [value]="paymentAmount()"
                  (ionChange)="onAmountChange($event)"
                  [min]="0"
                  [max]="totalAmount || undefined"
                  placeholder="0"
                ></ion-input>
                <ion-note slot="helper">
                  {{ formatCurrency(paymentAmount()) }}
                </ion-note>
              </ion-item>
            }

            <!-- Reference Number -->
            @if (requiresReference()) {
              <ion-item>
                <ion-label position="stacked">
                  Número de referencia
                  @if (isReferenceRequired()) { * }
                </ion-label>
                <ion-input
                  type="text"
                  [value]="paymentReference()"
                  (ionChange)="onReferenceChange($event)"
                  placeholder="Ej: 123456789"
                ></ion-input>
              </ion-item>
            }

            <!-- Method-specific details -->
            @switch (selectedMethod()) {
              @case (PaymentMethod.CARD) {
                <div class="method-details">
                  <ion-item>
                    <ion-label position="stacked">Últimos 4 dígitos</ion-label>
                    <ion-input
                      type="text"
                      maxlength="4"
                      placeholder="1234"
                      (ionChange)="onCardDigitsChange($event)"
                    ></ion-input>
                  </ion-item>
                  <ion-item>
                    <ion-label position="stacked">Tipo de tarjeta</ion-label>
                    <ion-input
                      type="text"
                      placeholder="Visa, Mastercard, etc."
                      (ionChange)="onCardTypeChange($event)"
                    ></ion-input>
                  </ion-item>
                </div>
              }
              @case (PaymentMethod.BANK_TRANSFER) {
                <div class="method-details">
                  <ion-item>
                    <ion-label position="stacked">Banco</ion-label>
                    <ion-input
                      type="text"
                      placeholder="Nombre del banco"
                      (ionChange)="onBankNameChange($event)"
                    ></ion-input>
                  </ion-item>
                </div>
              }
              @case (PaymentMethod.MOBILE) {
                <div class="method-details">
                  <ion-item>
                    <ion-label position="stacked">Proveedor</ion-label>
                    <ion-input
                      type="text"
                      placeholder="Ej: Bancard, Zimple, Tigo Money"
                      (ionChange)="onProviderChange($event)"
                    ></ion-input>
                  </ion-item>
                </div>
              }
            }

            <!-- Validation Messages -->
            @if (validationError()) {
              <div class="validation-error">
                <ion-icon name="alert-circle" color="danger"></ion-icon>
                <ion-note color="danger">{{ validationError() }}</ion-note>
              </div>
            }

            <!-- Success Indicator -->
            @if (isValid()) {
              <div class="validation-success">
                <ion-icon name="checkmark-circle" color="success"></ion-icon>
                <ion-note color="success">Información completa</ion-note>
              </div>
            }
          </ion-card-content>
        </ion-card>
      }

      <!-- Summary (if amount is provided) -->
      @if (selectedMethod() && totalAmount && showSummary) {
        <ion-card class="summary-card">
          <ion-card-content>
            <div class="summary-row">
              <span>Método de pago:</span>
              <strong>{{ getSelectedMethodLabel() }}</strong>
            </div>
            <div class="summary-row total">
              <span>Monto a pagar:</span>
              <strong class="amount">{{ formatCurrency(paymentAmount() || totalAmount) }}</strong>
            </div>
            @if (paymentReference()) {
              <div class="summary-row">
                <span>Referencia:</span>
                <span class="reference">{{ paymentReference() }}</span>
              </div>
            }
          </ion-card-content>
        </ion-card>
      }
    </div>
  `,
  styles: [`
    .payment-method-selector {
      width: 100%;
    }

    .selector-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: var(--ion-background-color);
      border-bottom: 1px solid var(--ion-color-light);
    }

    .selector-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .payment-methods-list {
      padding: 8px;
    }

    .payment-option-card {
      margin: 8px 0;
      border: 2px solid transparent;
      transition: all 0.2s ease;
    }

    .payment-option-card.selected {
      border-color: var(--ion-color-primary);
      background: var(--ion-color-primary-tint);
    }

    .payment-option-card.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .payment-option-card ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
    }

    .payment-icon {
      font-size: 32px;
      margin-right: 8px;
    }

    .payment-option-card ion-label h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .payment-option-card ion-label p {
      font-size: 13px;
      color: var(--ion-color-medium);
    }

    .payment-details-card,
    .summary-card {
      margin: 16px 8px;
    }

    .payment-details-card ion-card-title {
      font-size: 16px;
    }

    .method-details {
      margin-top: 12px;
    }

    .validation-error,
    .validation-success {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px;
      border-radius: 8px;
    }

    .validation-error {
      background: rgba(var(--ion-color-danger-rgb), 0.1);
    }

    .validation-success {
      background: rgba(var(--ion-color-success-rgb), 0.1);
    }

    .summary-card {
      background: var(--ion-color-light);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .summary-row:last-child {
      margin-bottom: 0;
    }

    .summary-row.total {
      font-size: 16px;
      padding-top: 12px;
      margin-top: 8px;
      border-top: 1px solid var(--ion-color-medium);
    }

    .summary-row .amount {
      color: var(--ion-color-primary);
      font-size: 18px;
    }

    .summary-row .reference {
      font-family: monospace;
      color: var(--ion-color-medium);
    }

    /* Animations */
    .payment-option-card {
      animation: fadeInUp 0.3s ease-out;
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
  `]
})
export class PaymentMethodSelectorComponent implements OnInit {
  @Input() totalAmount?: number;
  @Input() allowCustomAmount = false;
  @Input() showHeader = true;
  @Input() headerTitle = 'Método de pago';
  @Input() showPaymentDetails = true;
  @Input() showSummary = true;
  @Input() enabledMethods?: PaymentMethod[];
  @Input() defaultMethod?: PaymentMethod;

  @Output() methodChange = new EventEmitter<PaymentSelection>();
  @Output() validationChange = new EventEmitter<boolean>();

  selectedMethod = signal<PaymentMethod | null>(null);
  paymentAmount = signal<number>(0);
  paymentReference = signal<string>('');
  validationError = signal<string>('');
  paymentDetails = signal<any>({});

  PaymentMethod = PaymentMethod;

  paymentOptions: PaymentMethodOption[] = [
    {
      value: PaymentMethod.CASH,
      label: 'Efectivo',
      icon: 'cash-outline',
      description: 'Pago en efectivo',
      color: 'success',
      enabled: true
    },
    {
      value: PaymentMethod.CARD,
      label: 'Tarjeta',
      icon: 'card-outline',
      description: 'Débito o crédito',
      color: 'primary',
      enabled: true
    },
    {
      value: PaymentMethod.MOBILE,
      label: 'Pago móvil',
      icon: 'phone-portrait-outline',
      description: 'Bancard, Zimple, Tigo Money',
      color: 'tertiary',
      enabled: true
    },
    {
      value: PaymentMethod.BANK_TRANSFER,
      label: 'Transferencia bancaria',
      icon: 'wallet-outline',
      description: 'Transferencia directa',
      color: 'secondary',
      enabled: true
    },
    {
      value: PaymentMethod.CREDIT,
      label: 'Crédito',
      icon: 'time-outline',
      description: 'Pago a crédito',
      color: 'warning',
      enabled: true
    }
  ];

  constructor() {
    addIcons({
      cashOutline,
      cardOutline,
      phonePortraitOutline,
      walletOutline,
      timeOutline,
      checkmarkCircle,
      alertCircle
    });
  }

  ngOnInit() {
    // Filter enabled methods if specified
    if (this.enabledMethods) {
      this.paymentOptions = this.paymentOptions.map(option => ({
        ...option,
        enabled: this.enabledMethods!.includes(option.value)
      }));
    }

    // Set default method
    if (this.defaultMethod) {
      this.selectMethod(this.defaultMethod);
    }

    // Initialize amount
    if (this.totalAmount) {
      this.paymentAmount.set(this.totalAmount);
    }
  }

  onMethodChange(event: any): void {
    const method = event.detail.value as PaymentMethod;
    this.selectMethod(method);
  }

  selectMethod(method: PaymentMethod): void {
    this.selectedMethod.set(method);
    this.validationError.set('');
    this.paymentReference.set('');
    this.paymentDetails.set({});

    // Reset amount to total if not custom
    if (!this.allowCustomAmount && this.totalAmount) {
      this.paymentAmount.set(this.totalAmount);
    }

    this.emitChange();
    this.validate();
  }

  onAmountChange(event: any): void {
    const value = parseFloat(event.target.value);
    if (!isNaN(value) && value >= 0) {
      this.paymentAmount.set(value);
      this.emitChange();
      this.validate();
    }
  }

  onReferenceChange(event: any): void {
    const value = event.target.value || '';
    this.paymentReference.set(value);
    this.emitChange();
    this.validate();
  }

  onCardDigitsChange(event: any): void {
    const value = event.target.value || '';
    this.paymentDetails.set({
      ...this.paymentDetails(),
      cardLastDigits: value
    });
    this.emitChange();
  }

  onCardTypeChange(event: any): void {
    const value = event.target.value || '';
    this.paymentDetails.set({
      ...this.paymentDetails(),
      cardType: value
    });
    this.emitChange();
  }

  onBankNameChange(event: any): void {
    const value = event.target.value || '';
    this.paymentDetails.set({
      ...this.paymentDetails(),
      bankName: value
    });
    this.emitChange();
  }

  onProviderChange(event: any): void {
    const value = event.target.value || '';
    this.paymentDetails.set({
      ...this.paymentDetails(),
      provider: value
    });
    this.emitChange();
  }

  requiresReference(): boolean {
    const method = this.selectedMethod();
    return method === PaymentMethod.CARD ||
           method === PaymentMethod.BANK_TRANSFER ||
           method === PaymentMethod.MOBILE;
  }

  isReferenceRequired(): boolean {
    return this.requiresReference();
  }

  validate(): boolean {
    const method = this.selectedMethod();
    if (!method) {
      this.validationError.set('Selecciona un método de pago');
      this.validationChange.emit(false);
      return false;
    }

    if (this.totalAmount && this.paymentAmount() > this.totalAmount) {
      this.validationError.set('El monto no puede ser mayor al total');
      this.validationChange.emit(false);
      return false;
    }

    if (this.isReferenceRequired() && !this.paymentReference()) {
      this.validationError.set('El número de referencia es requerido');
      this.validationChange.emit(false);
      return false;
    }

    this.validationError.set('');
    this.validationChange.emit(true);
    return true;
  }

  isValid(): boolean {
    return !this.validationError() && !!this.selectedMethod();
  }

  private emitChange(): void {
    const method = this.selectedMethod();
    if (method) {
      this.methodChange.emit({
        method,
        amount: this.paymentAmount(),
        reference: this.paymentReference() || undefined,
        details: this.paymentDetails()
      });
    }
  }

  getSelectedMethodLabel(): string {
    const method = this.selectedMethod();
    const option = this.paymentOptions.find(o => o.value === method);
    return option?.label || '';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0
    }).format(value);
  }

  // Public methods
  public getSelection(): PaymentSelection | null {
    const method = this.selectedMethod();
    if (!method) return null;

    return {
      method,
      amount: this.paymentAmount(),
      reference: this.paymentReference() || undefined,
      details: this.paymentDetails()
    };
  }

  public reset(): void {
    this.selectedMethod.set(null);
    this.paymentAmount.set(this.totalAmount || 0);
    this.paymentReference.set('');
    this.paymentDetails.set({});
    this.validationError.set('');
  }
}
