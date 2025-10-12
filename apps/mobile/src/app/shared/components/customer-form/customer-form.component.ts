import { Component, OnInit, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonToggle,
  IonButton,
  IonIcon,
  IonNote,
  IonSpinner,
  ToastController,
  Platform
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, closeOutline, cameraOutline, scanOutline } from 'ionicons/icons';
import { Customer, CustomerType, CreateCustomerDto, UpdateCustomerDto } from '../../../models/customer.model';
import { CustomersService } from '../../../core/services/customers.service';
import { DocumentScannerService } from '../../../core/services/document-scanner.service';

/**
 * CustomerFormComponent - Reusable form for creating/editing customers
 *
 * Features:
 * - Reactive form with validation
 * - RUC validation for Paraguay
 * - Dynamic fields based on customer type
 * - Email and phone validation
 * - Create and edit modes
 * - Real-time RUC formatting
 */
@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonToggle,
    IonButton,
    IonIcon,
    IonNote,
    IonSpinner,
    ToastController,
    Platform
  ]
})
export class CustomerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private customersService = inject(CustomersService);
  private documentScanner = inject(DocumentScannerService);
  private toastController = inject(ToastController);
  private platform = inject(Platform);

  @Input() customer?: Customer;
  @Input() submitLabel = 'Guardar';
  @Output() formSubmit = new EventEmitter<CreateCustomerDto | UpdateCustomerDto>();
  @Output() formCancel = new EventEmitter<void>();

  customerForm!: FormGroup;
  loading = signal(false);
  scanning = signal(false);

  // Customer type enum for template
  CustomerType = CustomerType;

  // Document types
  documentTypes = [
    { value: 'CI', label: 'Cédula de Identidad' },
    { value: 'RUC', label: 'RUC' },
    { value: 'PASSPORT', label: 'Pasaporte' }
  ];

  constructor() {
    addIcons({ saveOutline, closeOutline, cameraOutline, scanOutline });
  }

  ngOnInit() {
    this.initializeForm();
  }

  /**
   * Initialize form with validators
   */
  private initializeForm() {
    this.customerForm = this.fb.group({
      name: [
        this.customer?.name || '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(100)]
      ],
      customerType: [
        this.customer?.customerType || CustomerType.INDIVIDUAL,
        [Validators.required]
      ],
      documentType: [
        this.customer?.documentType || 'CI',
        [Validators.required]
      ],
      documentId: [
        this.customer?.documentId || '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(50)]
      ],
      email: [
        this.customer?.email || '',
        [Validators.email, Validators.maxLength(100)]
      ],
      phone: [
        this.customer?.phone || '',
        [Validators.pattern(/^[+]?[\d\s()-]{7,20}$/), Validators.maxLength(20)]
      ],
      address: [
        this.customer?.address || '',
        [Validators.maxLength(200)]
      ],
      city: [
        this.customer?.city || '',
        [Validators.maxLength(100)]
      ],
      country: [
        this.customer?.country || 'Paraguay',
        [Validators.maxLength(100)]
      ],
      taxId: [
        this.customer?.taxId || '',
        [Validators.pattern(/^\d{8}-\d$/)]
      ],
      creditLimit: [
        this.customer?.creditLimit || null,
        [Validators.min(0)]
      ],
      notes: [
        this.customer?.notes || '',
        [Validators.maxLength(500)]
      ],
      isActive: [
        this.customer?.isActive !== undefined ? this.customer.isActive : true
      ]
    });

    // Subscribe to customer type changes to adjust validators
    this.customerForm.get('customerType')?.valueChanges.subscribe(type => {
      this.onCustomerTypeChange(type);
    });

    // Subscribe to taxId changes for real-time formatting
    this.customerForm.get('taxId')?.valueChanges.subscribe(value => {
      if (value) {
        this.formatRUCInput(value);
      }
    });
  }

  /**
   * Handle customer type changes
   */
  private onCustomerTypeChange(type: CustomerType) {
    const taxIdControl = this.customerForm.get('taxId');

    if (type === CustomerType.BUSINESS) {
      // Make taxId required for businesses
      taxIdControl?.setValidators([Validators.required, Validators.pattern(/^\d{8}-\d$/)]);
    } else {
      // Optional for individuals
      taxIdControl?.setValidators([Validators.pattern(/^\d{8}-\d$/)]);
    }

    taxIdControl?.updateValueAndValidity();
  }

  /**
   * Format RUC input in real-time
   */
  private formatRUCInput(value: string) {
    // Remove all non-digit characters
    const cleanValue = value.replace(/\D/g, '');

    // Only format if we have 9 digits
    if (cleanValue.length === 9) {
      const formatted = this.customersService.formatRUC(cleanValue);
      if (formatted !== value) {
        this.customerForm.get('taxId')?.setValue(formatted, { emitEvent: false });
      }
    }
  }

  /**
   * Validate RUC on blur
   */
  onRUCBlur() {
    const taxIdControl = this.customerForm.get('taxId');
    const taxId = taxIdControl?.value;

    if (taxId && taxId.trim() !== '') {
      const isValid = this.customersService.validateRUC(taxId);
      if (!isValid) {
        taxIdControl?.setErrors({ invalidRUC: true });
      }
    }
  }

  /**
   * Handle form submission
   */
  onSubmit() {
    if (this.customerForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.customerForm.controls).forEach(key => {
        this.customerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);

    const formValue = this.customerForm.value;

    // Clean up empty strings to null for optional fields
    const cleanedData = {
      ...formValue,
      email: formValue.email?.trim() || undefined,
      phone: formValue.phone?.trim() || undefined,
      address: formValue.address?.trim() || undefined,
      city: formValue.city?.trim() || undefined,
      country: formValue.country?.trim() || undefined,
      taxId: formValue.taxId?.trim() || undefined,
      notes: formValue.notes?.trim() || undefined,
      creditLimit: formValue.creditLimit || undefined
    };

    this.formSubmit.emit(cleanedData);

    // Reset loading state after a short delay (parent should handle this properly)
    setTimeout(() => {
      this.loading.set(false);
    }, 500);
  }

  /**
   * Handle form cancellation
   */
  onCancel() {
    this.formCancel.emit();
  }

  /**
   * Check if a field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.customerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.customerForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required']) return 'Este campo es requerido';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['email']) return 'Email inválido';
    if (errors['pattern']) {
      if (fieldName === 'phone') return 'Teléfono inválido';
      if (fieldName === 'taxId') return 'Formato de RUC inválido (XXXXXXXX-X)';
    }
    if (errors['min']) return `Valor mínimo: ${errors['min'].min}`;
    if (errors['invalidRUC']) return 'RUC inválido - verifique el dígito verificador';

    return 'Campo inválido';
  }

  /**
   * Check if business type is selected
   */
  isBusinessType(): boolean {
    return this.customerForm.get('customerType')?.value === CustomerType.BUSINESS;
  }

  /**
   * Scan document with camera
   */
  async scanDocument() {
    if (!this.platform.is('capacitor')) {
      await this.showToast('El escaneo de documentos solo está disponible en dispositivos móviles', 'warning');
      return;
    }

    this.scanning.set(true);

    try {
      const imageData = await this.documentScanner.scanDocument();

      if (imageData) {
        // Attempt OCR (placeholder for now)
        const extractedText = await this.documentScanner.extractTextFromImage(imageData);

        if (extractedText) {
          // Try to extract document information
          this.processExtractedText(extractedText);
        } else {
          await this.showToast('Documento escaneado. Por favor, ingrese los datos manualmente.', 'success');
        }
      }
    } catch (error) {
      console.error('Error scanning document:', error);
      await this.showToast('Error al escanear documento', 'danger');
    } finally {
      this.scanning.set(false);
    }
  }

  /**
   * Process extracted text from OCR
   */
  private processExtractedText(text: string) {
    // Try to extract RUC
    const ruc = this.documentScanner.parseRUC(text);
    if (ruc && this.customerForm.get('taxId')?.value === '') {
      this.customerForm.patchValue({ taxId: ruc });
    }

    // Try to extract CI
    const ci = this.documentScanner.parseCI(text);
    if (ci && this.customerForm.get('documentId')?.value === '') {
      this.customerForm.patchValue({ documentId: ci });
    }

    this.showToast('Documento procesado. Verifique los datos extraídos.', 'success');
  }

  /**
   * Check if scanning is available
   */
  isScanningAvailable(): boolean {
    return this.platform.is('capacitor');
  }

  /**
   * Show toast message
   */
  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
