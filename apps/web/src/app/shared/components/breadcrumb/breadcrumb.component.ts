import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute, RouterLink } from '@angular/router';
import { filter, map, Observable } from 'rxjs';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  breadcrumbs$!: Observable<Breadcrumb[]>;

  private routeLabels: { [key: string]: string } = {
    'dashboard': 'Dashboard',
    'sales': 'Ventas',
    'new': 'Nueva Venta',
    'list': 'Listado',
    'products': 'Productos',
    'invoices': 'Facturas',
    'edit': 'Editar',
    'auth': 'Autenticación',
    'login': 'Iniciar Sesión',
    'register': 'Registrarse'
  };

  ngOnInit(): void {
    this.breadcrumbs$ = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.buildBreadcrumbs(this.activatedRoute.root))
    );

    // Initial breadcrumbs
    this.breadcrumbs$ = new Observable(subscriber => {
      subscriber.next(this.buildBreadcrumbs(this.activatedRoute.root));

      this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      ).subscribe(() => {
        subscriber.next(this.buildBreadcrumbs(this.activatedRoute.root));
      });
    });
  }

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: Breadcrumb[] = []
  ): Breadcrumb[] {
    // Get the child routes
    const children: ActivatedRoute[] = route.children;

    // Return if there are no more children
    if (children.length === 0) {
      return breadcrumbs;
    }

    // Iterate over each child
    for (const child of children) {
      // Get the route's URL segment
      const routeURL: string = child.snapshot.url
        .map(segment => segment.path)
        .join('/');

      // Skip if the route URL is empty
      if (routeURL !== '') {
        url += `/${routeURL}`;

        // Get the route's label
        const label = this.getLabel(routeURL);

        // Add breadcrumb only if label exists
        if (label) {
          breadcrumbs.push({
            label,
            url
          });
        }
      }

      // Recursive call
      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  private getLabel(segment: string): string {
    // Check if it's a dynamic segment (id)
    if (!isNaN(Number(segment))) {
      return '';
    }

    // Return the label from the map
    return this.routeLabels[segment] || this.capitalizeFirst(segment);
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
