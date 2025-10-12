import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../models/user.model';

/**
 * Role Guard - Protects routes based on user roles
 * Usage in routes: canActivate: [roleGuard], data: { roles: [UserRole.ADMIN, UserRole.SELLER] }
 *
 * @example
 * {
 *   path: 'admin',
 *   canActivate: [roleGuard],
 *   data: { roles: [UserRole.ADMIN] },
 *   loadComponent: () => import('./pages/admin/admin.page').then(m => m.AdminPage)
 * }
 */
export const roleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First check if user is authenticated
  const isAuthenticated = await authService.checkAuthStatus();
  if (!isAuthenticated) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Get required roles from route data
  const requiredRoles = route.data['roles'] as UserRole[];

  // If no roles specified, allow access (guard acts as simple auth guard)
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Get current user
  const currentUser = authService.currentUser();

  if (!currentUser) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Check if user has required role
  const hasRole = requiredRoles.includes(currentUser.role);

  if (!hasRole) {
    // User doesn't have required role, redirect to unauthorized page or home
    console.warn(`Access denied. Required roles: ${requiredRoles.join(', ')}, User role: ${currentUser.role}`);
    router.navigate(['/tabs/home'], {
      queryParams: {
        error: 'unauthorized',
        message: 'No tienes permisos para acceder a esta sección'
      }
    });
    return false;
  }

  return true;
};

/**
 * Permission Guard - Protects routes based on specific permissions
 * Usage in routes: canActivate: [permissionGuard], data: { permissions: ['SALES:CREATE', 'PRODUCTS:READ'] }
 *
 * @example
 * {
 *   path: 'sales/new',
 *   canActivate: [permissionGuard],
 *   data: { permissions: ['SALES:CREATE'] },
 *   loadComponent: () => import('./pages/sales/new-sale/new-sale.page').then(m => m.NewSalePage)
 * }
 */
export const permissionGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First check if user is authenticated
  const isAuthenticated = await authService.checkAuthStatus();
  if (!isAuthenticated) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Get required permissions from route data
  const requiredPermissions = route.data['permissions'] as string[];

  // If no permissions specified, allow access
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // Get current user
  const currentUser = authService.currentUser();

  if (!currentUser) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Check if user has required permissions
  // For now, we implement role-based permissions
  const hasPermission = checkRolePermissions(currentUser.role, requiredPermissions);

  if (!hasPermission) {
    console.warn(`Access denied. Required permissions: ${requiredPermissions.join(', ')}, User role: ${currentUser.role}`);
    router.navigate(['/tabs/home'], {
      queryParams: {
        error: 'unauthorized',
        message: 'No tienes permisos para realizar esta acción'
      }
    });
    return false;
  }

  return true;
};

/**
 * Check if a role has specific permissions
 * This is a simplified implementation. In a real app, you would fetch this from the backend
 */
function checkRolePermissions(role: UserRole, requiredPermissions: string[]): boolean {
  // Define role permissions mapping
  const rolePermissions: Record<UserRole, string[]> = {
    [UserRole.ADMIN]: [
      'USERS:CREATE', 'USERS:READ', 'USERS:UPDATE', 'USERS:DELETE', 'USERS:MANAGE',
      'SALES:CREATE', 'SALES:READ', 'SALES:UPDATE', 'SALES:DELETE', 'SALES:CANCEL', 'SALES:APPROVE',
      'PRODUCTS:CREATE', 'PRODUCTS:READ', 'PRODUCTS:UPDATE', 'PRODUCTS:DELETE',
      'CUSTOMERS:CREATE', 'CUSTOMERS:READ', 'CUSTOMERS:UPDATE', 'CUSTOMERS:DELETE',
      'INVOICES:CREATE', 'INVOICES:READ', 'INVOICES:UPDATE', 'INVOICES:DELETE', 'INVOICES:EXPORT',
      'PAYMENTS:CREATE', 'PAYMENTS:READ', 'PAYMENTS:UPDATE', 'PAYMENTS:DELETE',
      'REPORTS:READ', 'REPORTS:EXPORT',
      'SETTINGS:READ', 'SETTINGS:UPDATE',
      'DASHBOARD:READ'
    ],
    [UserRole.SELLER]: [
      'SALES:CREATE', 'SALES:READ', 'SALES:UPDATE',
      'PRODUCTS:READ',
      'CUSTOMERS:CREATE', 'CUSTOMERS:READ', 'CUSTOMERS:UPDATE',
      'INVOICES:CREATE', 'INVOICES:READ',
      'PAYMENTS:CREATE', 'PAYMENTS:READ',
      'DASHBOARD:READ'
    ],
    [UserRole.CASHIER]: [
      'SALES:READ',
      'PRODUCTS:READ',
      'CUSTOMERS:READ',
      'INVOICES:READ',
      'PAYMENTS:CREATE', 'PAYMENTS:READ', 'PAYMENTS:UPDATE',
      'DASHBOARD:READ'
    ],
    [UserRole.VIEWER]: [
      'SALES:READ',
      'PRODUCTS:READ',
      'CUSTOMERS:READ',
      'INVOICES:READ',
      'PAYMENTS:READ',
      'REPORTS:READ',
      'DASHBOARD:READ'
    ]
  };

  const userPermissions = rolePermissions[role] || [];

  // Check if user has all required permissions
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}

/**
 * Helper function to check if current user has a specific role
 */
export function hasRole(authService: AuthService, ...roles: UserRole[]): boolean {
  const currentUser = authService.currentUser();
  return currentUser ? roles.includes(currentUser.role) : false;
}

/**
 * Helper function to check if current user has a specific permission
 */
export function hasPermission(authService: AuthService, permission: string): boolean {
  const currentUser = authService.currentUser();
  if (!currentUser) return false;

  return checkRolePermissions(currentUser.role, [permission]);
}
