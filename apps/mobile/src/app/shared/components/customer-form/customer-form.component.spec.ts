import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { IonicModule, ToastController, Platform } from '@ionic/angular/standalone';
import { CustomerFormComponent } from './customer-form.component';
import { CustomersService } from '../../../core/services/customers.service';
import { DocumentScannerService } from '../../../core/services/document-scanner.service';
import { Customer, CustomerType, CreateCustomerDto } from '../../../models/customer.model';
import { } from 'rxjs';

describe('CustomerFormComponent', () => {
  let component: CustomerFormComponent;
  let fixture: ComponentFixture<CustomerFormComponent>;
  let customersService: jasmine.SpyObj<CustomersService>;
  let documentScanner: jasmine.SpyObj<DocumentScannerService>;
  let toastController: jasmine.SpyObj<ToastController>;
  let platform: jasmine.SpyObj<Platform>;

  // Mock data
  const mockCustomer: Customer = {
    id: '123',
    name: 'Juan Pérez',
    customerType: CustomerType.INDIVIDUAL,
    documentType: 'CI',
    documentId: '1234567',
    email: 'juan@example.com',
    phone: '+595981234567',
    address: 'Calle Test 123',
    city: 'Asunción',
    country: 'Paraguay',
    taxId: '',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(async () => {
    // Create spies for services
    const customersServiceSpy = jasmine.createSpyObj('CustomersService', [
      'formatRUC',
      'validateRUC'
    ]);
    const documentScannerSpy = jasmine.createSpyObj('DocumentScannerService', [
      'scanDocument',
      'extractTextFromImage',
      'parseRUC',
      'parseCI'
    ]);
    const toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    const platformSpy = jasmine.createSpyObj('Platform', ['is']);

    // Configure default return values
    customersServiceSpy.validateRUC.and.returnValue(true);
    customersServiceSpy.formatRUC.and.returnValue('12345678-9');
    platformSpy.is.and.returnValue(false);

    const toastSpy = jasmine.createSpyObj('Toast', ['present']);
    toastControllerSpy.create.and.returnValue(Promise.resolve(toastSpy));

    await TestBed.configureTestingModule({
      imports: [
        CustomerFormComponent,
        ReactiveFormsModule,
        IonicModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CustomersService, useValue: customersServiceSpy },
        { provide: DocumentScannerService, useValue: documentScannerSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: Platform, useValue: platformSpy }
      ]
    }).compileComponents();

    customersService = TestBed.inject(CustomersService) as jasmine.SpyObj<CustomersService>;
    documentScanner = TestBed.inject(DocumentScannerService) as jasmine.SpyObj<DocumentScannerService>;
    toastController = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;
    platform = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;

    fixture = TestBed.createComponent(CustomerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form initialization', () => {
    it('should initialize form with empty values for new customer', () => {
      expect(component.customerForm).toBeDefined();
      expect(component.customerForm.get('name')?.value).toBe('');
      expect(component.customerForm.get('customerType')?.value).toBe(CustomerType.INDIVIDUAL);
      expect(component.customerForm.get('documentType')?.value).toBe('CI');
    });

    it('should initialize form with customer data when editing', () => {
      component.customer = mockCustomer;
      component.ngOnInit();
      fixture.detectChanges();

      expect(component.customerForm.get('name')?.value).toBe(mockCustomer.name);
      expect(component.customerForm.get('email')?.value).toBe(mockCustomer.email);
      expect(component.customerForm.get('phone')?.value).toBe(mockCustomer.phone);
    });

    it('should set default isActive to true for new customers', () => {
      expect(component.customerForm.get('isActive')?.value).toBe(true);
    });
  });

  describe('Form validation', () => {
    it('should require name field', () => {
      const nameControl = component.customerForm.get('name');

      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBe(true);

      nameControl?.setValue('John Doe');
      expect(nameControl?.hasError('required')).toBe(false);
    });

    it('should validate name minimum length', () => {
      const nameControl = component.customerForm.get('name');

      nameControl?.setValue('ab');
      expect(nameControl?.hasError('minlength')).toBe(true);

      nameControl?.setValue('abc');
      expect(nameControl?.hasError('minlength')).toBe(false);
    });

    it('should validate email format', () => {
      const emailControl = component.customerForm.get('email');

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);

      emailControl?.setValue('valid@example.com');
      expect(emailControl?.hasError('email')).toBe(false);
    });

    it('should validate phone pattern', () => {
      const phoneControl = component.customerForm.get('phone');

      phoneControl?.setValue('abc');
      expect(phoneControl?.hasError('pattern')).toBe(true);

      phoneControl?.setValue('+595981234567');
      expect(phoneControl?.hasError('pattern')).toBe(false);
    });

    it('should validate RUC pattern', () => {
      const taxIdControl = component.customerForm.get('taxId');

      taxIdControl?.setValue('invalid');
      expect(taxIdControl?.hasError('pattern')).toBe(true);

      taxIdControl?.setValue('12345678-9');
      expect(taxIdControl?.hasError('pattern')).toBe(false);
    });

    it('should make taxId required for business customers', () => {
      const taxIdControl = component.customerForm.get('taxId');
      const customerTypeControl = component.customerForm.get('customerType');

      customerTypeControl?.setValue(CustomerType.BUSINESS);
      fixture.detectChanges();

      taxIdControl?.setValue('');
      expect(taxIdControl?.hasError('required')).toBe(true);

      taxIdControl?.setValue('12345678-9');
      expect(taxIdControl?.hasError('required')).toBe(false);
    });

    it('should not require taxId for individual customers', () => {
      const taxIdControl = component.customerForm.get('taxId');
      const customerTypeControl = component.customerForm.get('customerType');

      customerTypeControl?.setValue(CustomerType.INDIVIDUAL);
      fixture.detectChanges();

      taxIdControl?.setValue('');
      expect(taxIdControl?.hasError('required')).toBe(false);
    });
  });

  describe('Form submission', () => {
    it('should emit formSubmit event with valid data', () => {
      spyOn(component.formSubmit, 'emit');

      component.customerForm.patchValue({
        name: 'Test Customer',
        customerType: CustomerType.INDIVIDUAL,
        documentType: 'CI',
        documentId: '1234567',
        email: 'test@example.com',
        phone: '+595981234567'
      });

      component.onSubmit();

      expect(component.formSubmit.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'Test Customer',
          customerType: CustomerType.INDIVIDUAL,
          documentType: 'CI',
          documentId: '1234567',
          email: 'test@example.com',
          phone: '+595981234567'
        })
      );
    });

    it('should not submit if form is invalid', () => {
      spyOn(component.formSubmit, 'emit');

      component.customerForm.patchValue({
        name: '', // Invalid - required
        documentType: 'CI',
        documentId: '1234567'
      });

      component.onSubmit();

      expect(component.formSubmit.emit).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when submitting invalid form', () => {
      component.customerForm.patchValue({
        name: '', // Invalid
      });

      component.onSubmit();

      expect(component.customerForm.get('name')?.touched).toBe(true);
    });

    it('should set loading state during submission', () => {
      component.customerForm.patchValue({
        name: 'Test Customer',
        customerType: CustomerType.INDIVIDUAL,
        documentType: 'CI',
        documentId: '1234567'
      });

      expect(component.loading()).toBe(false);

      component.onSubmit();

      expect(component.loading()).toBe(true);
    });

    it('should clean up empty optional fields', () => {
      spyOn(component.formSubmit, 'emit');

      component.customerForm.patchValue({
        name: 'Test Customer',
        customerType: CustomerType.INDIVIDUAL,
        documentType: 'CI',
        documentId: '1234567',
        email: '   ', // Empty with spaces
        phone: ''
      });

      component.onSubmit();

      const emittedData = (component.formSubmit.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedData.email).toBeUndefined();
      expect(emittedData.phone).toBeUndefined();
    });
  });

  describe('Form cancellation', () => {
    it('should emit formCancel event when cancelled', () => {
      spyOn(component.formCancel, 'emit');

      component.onCancel();

      expect(component.formCancel.emit).toHaveBeenCalled();
    });
  });

  describe('RUC validation', () => {
    it('should validate RUC on blur', () => {
      customersService.validateRUC.and.returnValue(true);

      component.customerForm.patchValue({
        taxId: '12345678-9'
      });

      component.onRUCBlur();

      expect(customersService.validateRUC).toHaveBeenCalledWith('12345678-9');
      expect(component.customerForm.get('taxId')?.errors).toBeNull();
    });

    it('should set error for invalid RUC', () => {
      customersService.validateRUC.and.returnValue(false);

      component.customerForm.patchValue({
        taxId: '12345678-0' // Invalid check digit
      });

      component.onRUCBlur();

      expect(component.customerForm.get('taxId')?.hasError('invalidRUC')).toBe(true);
    });

    it('should not validate empty RUC', () => {
      component.customerForm.patchValue({
        taxId: ''
      });

      component.onRUCBlur();

      expect(customersService.validateRUC).not.toHaveBeenCalled();
    });
  });

  describe('Helper methods', () => {
    it('should detect invalid fields correctly', () => {
      const nameControl = component.customerForm.get('name');

      nameControl?.setValue('');
      nameControl?.markAsTouched();

      expect(component.isFieldInvalid('name')).toBe(true);
    });

    it('should return appropriate error messages', () => {
      const nameControl = component.customerForm.get('name');

      nameControl?.setValue('');
      nameControl?.markAsTouched();

      expect(component.getErrorMessage('name')).toBe('Este campo es requerido');

      nameControl?.setValue('ab');
      expect(component.getErrorMessage('name')).toContain('Mínimo');
    });

    it('should detect business type correctly', () => {
      component.customerForm.patchValue({
        customerType: CustomerType.BUSINESS
      });

      expect(component.isBusinessType()).toBe(true);

      component.customerForm.patchValue({
        customerType: CustomerType.INDIVIDUAL
      });

      expect(component.isBusinessType()).toBe(false);
    });

    it('should check scanning availability', () => {
      platform.is.and.returnValue(false);
      expect(component.isScanningAvailable()).toBe(false);

      platform.is.and.returnValue(true);
      expect(component.isScanningAvailable()).toBe(true);
    });
  });

  describe('Document scanning', () => {
    it('should show warning when scanning on non-mobile device', async () => {
      platform.is.and.returnValue(false);

      await component.scanDocument();

      expect(toastController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: jasmine.stringContaining('solo está disponible en dispositivos móviles'),
          color: 'warning'
        })
      );
    });

    it('should handle successful document scan', async () => {
      platform.is.and.returnValue(true);
      documentScanner.scanDocument.and.returnValue(Promise.resolve('base64imagedata'));
      documentScanner.extractTextFromImage.and.returnValue(Promise.resolve('extracted text'));
      documentScanner.parseRUC.and.returnValue('12345678-9');
      documentScanner.parseCI.and.returnValue('1234567');

      expect(component.scanning()).toBe(false);

      await component.scanDocument();

      expect(component.scanning()).toBe(false); // Should reset after scan
      expect(documentScanner.scanDocument).toHaveBeenCalled();
    });

    it('should handle scan errors', async () => {
      platform.is.and.returnValue(true);
      documentScanner.scanDocument.and.returnValue(Promise.reject(new Error('Scan failed')));

      await component.scanDocument();

      expect(toastController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: jasmine.stringContaining('Error al escanear'),
          color: 'danger'
        })
      );
    });
  });

  describe('Customer type changes', () => {
    it('should update validators when customer type changes', () => {
      const taxIdControl = component.customerForm.get('taxId');

      component.customerForm.patchValue({
        customerType: CustomerType.BUSINESS
      });
      fixture.detectChanges();

      taxIdControl?.setValue('');
      expect(taxIdControl?.hasError('required')).toBe(true);

      component.customerForm.patchValue({
        customerType: CustomerType.INDIVIDUAL
      });
      fixture.detectChanges();

      taxIdControl?.setValue('');
      expect(taxIdControl?.hasError('required')).toBe(false);
    });
  });
});
