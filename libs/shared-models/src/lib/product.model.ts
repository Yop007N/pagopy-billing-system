export interface Product {
  id: string;
  userId: string;

  name: string;
  description?: string;
  price: number;
  iva: number; // 0, 5 o 10

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  iva: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  iva?: number;
  isActive?: boolean;
}
