import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Product, CreateProductDto, UpdateProductDto } from '@pago-py/shared-models';

export interface ProductsResponse {
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private api = inject(ApiService);

  /**
   * Get all products with optional filters
   */
  getProducts(filters?: ProductFilters): Observable<ProductsResponse> {
    const params: any = {};

    if (filters?.page) params.page = filters.page.toString();
    if (filters?.limit) params.limit = filters.limit.toString();
    if (filters?.search) params.search = filters.search;
    if (filters?.isActive !== undefined) params.isActive = filters.isActive.toString();

    return this.api.get<ProductsResponse>('/products', { params });
  }

  /**
   * Get product by ID
   */
  getProductById(id: string): Observable<Product> {
    return this.api.get<Product>(`/products/${id}`);
  }

  /**
   * Create a new product
   */
  createProduct(data: CreateProductDto): Observable<Product> {
    return this.api.post<Product>('/products', data);
  }

  /**
   * Update existing product
   */
  updateProduct(id: string, data: UpdateProductDto): Observable<Product> {
    return this.api.patch<Product>(`/products/${id}`, data);
  }

  /**
   * Soft delete product (deactivate)
   */
  deleteProduct(id: string): Observable<Product> {
    return this.api.delete<Product>(`/products/${id}`);
  }

  /**
   * Update product stock
   */
  updateStock(id: string, quantity: number): Observable<Product> {
    return this.api.patch<Product>(`/products/${id}/stock`, null, {
      params: { quantity: quantity.toString() } as any
    });
  }

  /**
   * Get all active products (for dropdowns/selectors)
   */
  getActiveProducts(): Observable<Product[]> {
    return this.api.get<Product[]>('/products', {
      params: { isActive: 'true', limit: '1000' } as any
    });
  }
}
