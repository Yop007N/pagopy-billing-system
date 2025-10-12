import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isCollapsed = signal(false);
  currentUser = this.authService.currentUser;

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Ventas',
      icon: 'point_of_sale',
      route: '/sales',
      children: [
        { label: 'Nueva Venta', icon: 'add_shopping_cart', route: '/sales/new' },
        { label: 'Listado', icon: 'receipt_long', route: '/sales/list' }
      ]
    },
    {
      label: 'Productos',
      icon: 'inventory_2',
      route: '/products',
      children: [
        { label: 'Nuevo Producto', icon: 'add_box', route: '/products/new' },
        { label: 'Listado', icon: 'list_alt', route: '/products/list' }
      ]
    },
    {
      label: 'Facturas',
      icon: 'description',
      route: '/invoices'
    }
  ];

  expandedItems = signal<Set<string>>(new Set());

  toggleSidebar(): void {
    this.isCollapsed.update(value => !value);
  }

  toggleExpand(item: NavItem): void {
    if (item.children && item.children.length > 0) {
      this.expandedItems.update(items => {
        const newItems = new Set(items);
        if (newItems.has(item.label)) {
          newItems.delete(item.label);
        } else {
          newItems.add(item.label);
        }
        return newItems;
      });
    } else {
      this.router.navigate([item.route]);
    }
  }

  isExpanded(item: NavItem): boolean {
    return this.expandedItems().has(item.label);
  }

  logout(): void {
    this.authService.logout();
  }
}
