import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/home',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage)
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.page').then(m => m.RegisterPage)
      }
    ]
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/tabs/home/home.page').then(m => m.HomePage)
      },
      {
        path: 'sales',
        loadComponent: () => import('./pages/tabs/sales/sales.page').then(m => m.SalesPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/tabs/profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'sales',
    children: [
      {
        path: 'new',
        loadComponent: () => import('./pages/sales/new-sale/new-sale.page').then(m => m.NewSalePage)
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./pages/sales/sale-detail/sale-detail.page').then(m => m.SaleDetailPage)
      }
    ]
  },
  {
    path: 'invoices',
    loadComponent: () => import('./pages/invoices/invoices.page').then(m => m.InvoicesPage)
  },
  {
    path: '**',
    redirectTo: 'tabs/home'
  }
];
