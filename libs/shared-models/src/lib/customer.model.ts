import { CustomerType } from './enums';

export interface Customer {
  id: string;
  userId: string;

  type: CustomerType;
  ruc?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDto {
  type: CustomerType;
  ruc?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerDto {
  type?: CustomerType;
  ruc?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}
