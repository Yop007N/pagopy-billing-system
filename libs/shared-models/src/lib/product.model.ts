export interface Product {
  id: string;
  userId: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  taxRate: number; // 0, 5 or 10 (IVA)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  code: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock?: number;
  taxRate: number; // 0, 5 or 10
}

export interface UpdateProductDto {
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  stock?: number;
  taxRate?: number;
  isActive?: boolean;
}
