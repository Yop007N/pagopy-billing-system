/**
 * User interface matching backend Prisma schema
 * Represents a system user with fiscal data for Paraguayan business requirements
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;

  // Fiscal data (Paraguayan business requirements)
  ruc: string;
  razonSocial: string;
  direccion?: string;
  telefono?: string;
  timbrado: string;
  timbradoVence: Date | string;

  // User settings
  role: UserRole;
  isActive: boolean;

  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;

  // Mobile-specific optional fields
  phone?: string; // Alias for telefono
  avatar?: string;
  lastLogin?: Date | string;
  permissions?: Permission[];

  // Offline sync fields
  _synced?: boolean;
  _localId?: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  CASHIER = 'CASHIER',
  VIEWER = 'VIEWER'
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data for new users
 */
export interface RegisterData {
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

// Permission system
export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  MANAGE = 'MANAGE',
  APPROVE = 'APPROVE',
  CANCEL = 'CANCEL',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  VIEW_REPORTS = 'VIEW_REPORTS'
}

export enum PermissionResource {
  USERS = 'USERS',
  SALES = 'SALES',
  PRODUCTS = 'PRODUCTS',
  CUSTOMERS = 'CUSTOMERS',
  INVOICES = 'INVOICES',
  PAYMENTS = 'PAYMENTS',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS',
  DASHBOARD = 'DASHBOARD',
  NOTIFICATIONS = 'NOTIFICATIONS'
}

export interface Permission {
  id: string;
  resource: PermissionResource;
  action: PermissionAction;
  description?: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

export interface UserPermissions {
  userId: string;
  rolePermissions: Permission[];
  customPermissions?: Permission[];
}

// User Activity
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// User DTOs
/**
 * Data Transfer Object for creating a new user
 */
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
  role?: UserRole;
  isActive?: boolean;
}

/**
 * Data Transfer Object for updating user information
 */
export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  ruc?: string;
  razonSocial?: string;
  direccion?: string;
  telefono?: string;
  timbrado?: string;
  timbradoVence?: Date | string;
  role?: UserRole;
  isActive?: boolean;
  avatar?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordDto {
  userId: string;
  tempPassword: string;
}

/**
 * Forgot Password Request DTO
 */
export interface ForgotPasswordDto {
  email: string;
}

/**
 * Forgot Password Response
 */
export interface ForgotPasswordResponse {
  message: string;
  expiresIn?: number; // Token expiration time in seconds
}

/**
 * Reset Password Request DTO (with token)
 */
export interface ResetPasswordWithTokenDto {
  token: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface UserSearchParams {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
