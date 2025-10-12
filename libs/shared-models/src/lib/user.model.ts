import { UserRole } from './enums';

export interface User {
  id: string;
  email: string;

  // Datos fiscales
  ruc: string;
  razonSocial: string;
  direccion?: string;
  telefono?: string;

  // Timbrado vigente
  timbrado: string;
  timbradoVence: Date;

  // Estado y roles
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  ruc: string;
  razonSocial: string;
  direccion?: string;
  telefono?: string;
  timbrado: string;
  timbradoVence: Date | string;
}

export interface UpdateUserDto {
  email?: string;
  razonSocial?: string;
  direccion?: string;
  telefono?: string;
  timbrado?: string;
  timbradoVence?: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}
