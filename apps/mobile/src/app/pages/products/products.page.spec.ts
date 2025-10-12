import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { IonicModule, AlertController, ToastController } from '@ionic/angular/standalone';
import { ProductsPage } from './products.page';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../models/product.model';
import { of, throwError, Subject } from 'rxjs';

describe('ProductsPage', () => {
  let component: ProductsPage;
  let fixture: ComponentFixture<ProductsPage>;
  let productsService: jasmine.SpyObj<ProductsService>;
  let router: jasmine.SpyObj<Router>;
  let alertController: jasmine.SpyObj<AlertController>;
  let toastController: jasmine.SpyObj<ToastController>;

  // Mock data
  const mockProducts: Product[] = [
    {
      id: '1',
      code: 'PROD001',
      name: 'Producto 1',
      description: 'Descripción del producto 1',
      price: 50000,
      cost: 30000,
      stock: 100,
      taxRate: 10,
      isActive: true,
      userId: 'user1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      code: 'PROD002',
      name: 'Producto 2',
      description: 'Descripción del producto 2',
      price: 75000,
      cost: 45000,
      stock: 5,
      taxRate: 10,
      isActive: true,
      userId: 'user1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      code: 'PROD003',
      name: 'Producto Inactivo',
      description: 'Producto desactivado',
      price: 25000,
      cost: 15000,
      stock: 50,
      taxRate: 10,
      isActive: false,
      userId: 'user1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  beforeEach(async () => {
    // Create spies
    const productsServiceSpy = jasmine.createSpyObj('ProductsService', [
      'getProducts',
      'deleteProduct'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    const toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);

    // Configure default return values
    productsServiceSpy.getProducts.and.returnValue(of(mockProducts));
    productsServiceSpy.deleteProduct.and.returnValue(of(void 0));

    const alertSpy = jasmine.createSpyObj('Alert', ['present']);
    alertControllerSpy.create.and.returnValue(Promise.resolve(alertSpy));

    const toastSpy = jasmine.createSpyObj('Toast', ['present']);
    toastControllerSpy.create.and.returnValue(Promise.resolve(toastSpy));

    await TestBed.configureTestingModule({
      imports: [
        ProductsPage,
        IonicModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProductsService, useValue: productsServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AlertController, useValue: alertControllerSpy },
        { provide: ToastController, useValue: toastControllerSpy }
      ]
    }).compileComponents();

    productsService = TestBed.inject(ProductsService) as jasmine.SpyObj<ProductsService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    alertController = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
    toastController = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;

    fixture = TestBed.createComponent(ProductsPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load products on init', () => {
      fixture.detectChanges(); // Triggers ngOnInit

      expect(productsService.getProducts).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
      expect(component.products().length).toBeGreaterThan(0);
    });

    it('should filter inactive products by default', () => {
      fixture.detectChanges();

      const activeProducts = component.products().filter(p => p.isActive);
      expect(component.products().length).toBe(activeProducts.length);
    });

    it('should handle loading errors', () => {
      productsService.getProducts.and.returnValue(
        throwError(() => new Error('Network error'))
      );

      fixture.detectChanges();

      expect(component.loading()).toBe(false);
      expect(component.error()).toBeTruthy();
    });
  });

  describe('Product loading', () => {
    it('should set loading state while fetching products', () => {
      const delayedObservable = new Subject<Product[]>();
      productsService.getProducts.and.returnValue(delayedObservable.asObservable());

      component.loadProducts();

      expect(component.loading()).toBe(true);

      delayedObservable.next(mockProducts);
      delayedObservable.complete();

      expect(component.loading()).toBe(false);
    });

    it('should reset products when refreshing', () => {
      component.products.set([mockProducts[0]]);

      component.loadProducts(true);

      expect(component.products().length).toBeGreaterThan(1);
    });

    it('should apply active filter', () => {
      component.showActiveOnly.set(true);
      component.loadProducts();

      const hasInactive = component.products().some(p => !p.isActive);
      expect(hasInactive).toBe(false);
    });

    it('should apply low-stock filter', () => {
      component.selectedFilter.set('low-stock');
      component.loadProducts();

      const allLowStock = component.products().every(p => p.stock < 10);
      expect(allLowStock).toBe(true);
    });

    it('should apply inactive filter', () => {
      component.selectedFilter.set('inactive');
      component.loadProducts();

      const allInactive = component.products().every(p => !p.isActive);
      expect(allInactive).toBe(true);
      expect(component.showActiveOnly()).toBe(false);
    });
  });

  describe('Search functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should filter products by name', () => {
      component.searchQuery.set('producto 1');

      const filtered = component.filteredProducts();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toContain('Producto 1');
    });

    it('should filter products by code', () => {
      component.searchQuery.set('PROD002');

      const filtered = component.filteredProducts();
      expect(filtered.length).toBe(1);
      expect(filtered[0].code).toBe('PROD002');
    });

    it('should be case-insensitive', () => {
      component.searchQuery.set('PRODUCTO');

      const filtered = component.filteredProducts();
      expect(filtered.length).toBeGreaterThan(0);
    });

    it('should show all products when search is empty', () => {
      component.searchQuery.set('');

      const filtered = component.filteredProducts();
      expect(filtered.length).toBe(component.products().length);
    });

    it('should debounce search input', (done) => {
      const event = { target: { value: 'test' } };

      component.onSearchChange(event);

      // Search should be debounced
      expect(component.searchQuery()).toBe('');

      setTimeout(() => {
        expect(component.searchQuery()).toBe('test');
        done();
      }, 350);
    });
  });

  describe('Refresh functionality', () => {
    it('should refresh products list', (done) => {
      const refreshEvent = {
        target: {
          complete: jasmine.createSpy('complete')
        }
      } as any;

      component.onRefresh(refreshEvent);

      expect(productsService.getProducts).toHaveBeenCalledWith(true);

      setTimeout(() => {
        expect(refreshEvent.target.complete).toHaveBeenCalled();
        done();
      }, 1100);
    });
  });

  describe('Infinite scroll', () => {
    it('should handle infinite scroll', (done) => {
      const scrollEvent = {
        target: {
          complete: jasmine.createSpy('complete'),
          disabled: false
        }
      } as any;

      component.onInfiniteScroll(scrollEvent);

      setTimeout(() => {
        expect(scrollEvent.target.complete).toHaveBeenCalled();
        done();
      }, 600);
    });
  });

  describe('Filter operations', () => {
    it('should apply filter and reload products', () => {
      component.applyFilter('low-stock');

      expect(component.selectedFilter()).toBe('low-stock');
      expect(productsService.getProducts).toHaveBeenCalled();
    });

    it('should toggle active filter', async () => {
      const initialValue = component.showActiveOnly();

      await component.toggleActiveFilter();

      expect(component.showActiveOnly()).toBe(!initialValue);
      expect(productsService.getProducts).toHaveBeenCalled();
    });

    it('should clear all filters', async () => {
      component.selectedFilter.set('low-stock');
      component.showActiveOnly.set(false);
      component.searchQuery.set('test');

      await component.clearFilters();

      expect(component.selectedFilter()).toBe('all');
      expect(component.showActiveOnly()).toBe(true);
      expect(component.searchQuery()).toBe('');
    });

    it('should show filter options dialog', async () => {
      await component.showFilterOptions();

      expect(alertController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          header: 'Filtrar Productos'
        })
      );
    });
  });

  describe('Navigation', () => {
    it('should navigate to product detail', () => {
      const product = mockProducts[0];

      component.navigateToProduct(product);

      expect(router.navigate).toHaveBeenCalledWith(['/products', product.id]);
    });

    it('should navigate to new product page', () => {
      component.navigateToNewProduct();

      expect(router.navigate).toHaveBeenCalledWith(['/products/new']);
    });
  });

  describe('Product deletion', () => {
    it('should show delete confirmation', async () => {
      const product = mockProducts[0];
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      await component.showDeleteConfirm(product, event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(alertController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          header: 'Confirmar Eliminación',
          message: jasmine.stringContaining(product.name)
        })
      );
    });

    it('should delete product successfully', () => {
      const product = mockProducts[0];

      component.deleteProduct(product);

      expect(productsService.deleteProduct).toHaveBeenCalledWith(product.id);
      expect(toastController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: 'Producto eliminado',
          color: 'success'
        })
      );
    });

    it('should handle delete errors', () => {
      productsService.deleteProduct.and.returnValue(
        throwError(() => new Error('Delete failed'))
      );

      const product = mockProducts[0];
      component.deleteProduct(product);

      expect(toastController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: jasmine.stringContaining('Error'),
          color: 'danger'
        })
      );
    });
  });

  describe('Helper methods', () => {
    it('should format price correctly', () => {
      const price = 50000;
      const formatted = component.formatPrice(price);

      expect(formatted).toContain('50.000');
      expect(formatted).toContain('Gs.'); // Guarani symbol
    });

    it('should return correct stock color', () => {
      expect(component.getStockColor(0)).toBe('danger');
      expect(component.getStockColor(5)).toBe('warning');
      expect(component.getStockColor(20)).toBe('success');
    });

    it('should return correct tax badge color', () => {
      expect(component.getTaxBadgeColor(0)).toBe('medium');
      expect(component.getTaxBadgeColor(5)).toBe('tertiary');
      expect(component.getTaxBadgeColor(10)).toBe('primary');
    });

    it('should track products by id', () => {
      const product = mockProducts[0];
      const result = component.trackByProductId(0, product);

      expect(result).toBe(product.id);
    });
  });

  describe('Toast notifications', () => {
    it('should show success toast', async () => {
      productsService.deleteProduct.and.returnValue(of(void 0));

      const product = mockProducts[0];
      component.deleteProduct(product);

      expect(toastController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          color: 'success',
          duration: 2000
        })
      );
    });

    it('should show error toast', async () => {
      productsService.deleteProduct.and.returnValue(
        throwError(() => new Error('Error'))
      );

      const product = mockProducts[0];
      component.deleteProduct(product);

      expect(toastController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          color: 'danger',
          duration: 3000
        })
      );
    });
  });

  describe('Signals', () => {
    it('should update products signal', () => {
      fixture.detectChanges();

      expect(component.products()).toEqual(jasmine.any(Array));
      expect(component.products().length).toBeGreaterThan(0);
    });

    it('should compute filtered products', () => {
      fixture.detectChanges();

      component.searchQuery.set('producto 1');
      const filtered = component.filteredProducts();

      expect(filtered.length).toBeLessThan(component.products().length);
    });

    it('should update loading signal', () => {
      expect(component.loading()).toBe(false);

      const delayedObservable = new Subject<Product[]>();
      productsService.getProducts.and.returnValue(delayedObservable.asObservable());

      component.loadProducts();
      expect(component.loading()).toBe(true);

      delayedObservable.next(mockProducts);
      delayedObservable.complete();

      expect(component.loading()).toBe(false);
    });
  });
});
