import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './models/user.model';

/**
 * PagoPy Mobile Application Routes
 *
 * Route Structure:
 * - /auth/* - Authentication routes (login, register) - Protected by guestGuard
 * - /tabs/* - Main tabbed interface (home, sales, profile) - Protected by authGuard
 * - /sales/* - Sales management routes - Protected by authGuard
 * - /products/* - Product management routes - Protected by authGuard
 * - /customers/* - Customer management routes - Protected by authGuard
 * - /invoices/* - Invoice management routes - Protected by authGuard
 * - /settings - Application settings - Protected by authGuard
 *
 * All routes use lazy loading for optimal performance.
 * Deep linking is supported via Capacitor App plugin.
 */
export const routes: Routes = [
  // Root redirect
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },

  // Authentication routes (Guest only)
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage),
        title: 'Iniciar Sesión - PagoPy'
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.page').then(m => m.RegisterPage),
        title: 'Registrarse - PagoPy'
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/auth/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage),
        title: 'Recuperar Contraseña - PagoPy'
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // Main tabbed interface (Authenticated users)
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/tabs/home/home.page').then(m => m.HomePage),
        title: 'Inicio - PagoPy'
      },
      {
        path: 'sales',
        loadComponent: () => import('./pages/tabs/sales/sales.page').then(m => m.SalesPage),
        title: 'Ventas - PagoPy'
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/tabs/profile/profile.page').then(m => m.ProfilePage),
        title: 'Perfil - PagoPy'
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },

  // Sales management routes
  {
    path: 'sales',
    canActivate: [authGuard],
    children: [
      {
        path: 'new',
        loadComponent: () => import('./pages/sales/new-sale/new-sale.page').then(m => m.NewSalePage),
        title: 'Nueva Venta - PagoPy',
        data: {
          animation: 'slideLeft'
        }
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./pages/sales/sale-detail/sale-detail.page').then(m => m.SaleDetailPage),
        title: 'Detalle de Venta - PagoPy',
        data: {
          animation: 'slideLeft'
        }
      },
      {
        path: '',
        redirectTo: '/tabs/sales',
        pathMatch: 'full'
      }
    ]
  },

  // Products management routes
  {
    path: 'products',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/products/products.page').then(m => m.ProductsPage),
        title: 'Productos - PagoPy'
      },
      {
        path: 'new',
        canActivate: [roleGuard],
        data: {
          roles: [UserRole.ADMIN, UserRole.SELLER],
          animation: 'slideLeft'
        },
        loadComponent: () => import('./pages/products/product-detail/product-detail.page').then(m => m.ProductDetailPage),
        title: 'Nuevo Producto - PagoPy'
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/products/product-detail/product-detail.page').then(m => m.ProductDetailPage),
        title: 'Detalle de Producto - PagoPy',
        data: {
          animation: 'slideLeft'
        }
      }
    ]
  },

  // Customers management routes
  {
    path: 'customers',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/customers/customers.page').then(m => m.CustomersPage),
        title: 'Clientes - PagoPy'
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/customers/customer-new/customer-new.page').then(m => m.CustomerNewPage),
        title: 'Nuevo Cliente - PagoPy',
        data: {
          animation: 'slideLeft'
        }
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/customers/customer-detail/customer-detail.page').then(m => m.CustomerDetailPage),
        title: 'Detalle de Cliente - PagoPy',
        data: {
          animation: 'slideLeft'
        }
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/customers/customer-edit/customer-edit.page').then(m => m.CustomerEditPage),
        title: 'Editar Cliente - PagoPy',
        data: {
          animation: 'slideLeft'
        }
      }
    ]
  },

  // Invoices management routes
  {
    path: 'invoices',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/invoices/invoices.page').then(m => m.InvoicesPage),
        title: 'Facturas - PagoPy'
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./pages/invoices/invoice-detail/invoice-detail.page').then(m => m.InvoiceDetailPage),
        title: 'Detalle de Factura - PagoPy',
        data: {
          animation: 'slideLeft'
        }
      }
    ]
  },

  // Settings routes
  {
    path: 'settings',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage),
        title: 'Configuración - PagoPy'
      },
      {
        path: 'printer',
        loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage),
        title: 'Configuración de Impresora - PagoPy',
        data: {
          section: 'printer'
        }
      }
    ]
  },

  // Wildcard route - Redirect to login for any unmatched routes
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
