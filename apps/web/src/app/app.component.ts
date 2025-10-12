import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ToolbarComponent } from './shared/components/toolbar/toolbar.component';
import { BreadcrumbComponent } from './shared/components/breadcrumb/breadcrumb.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    ToolbarComponent,
    BreadcrumbComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  title = 'PagoPy';
  sidebarCollapsed = signal(false);
  isAuthenticated = this.authService.isAuthenticated;

  // Compute if current route is an auth route
  isAuthRoute = signal(false);

  constructor() {
    // Track navigation to determine if we're on an auth route
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isAuthRoute.set(event.url.includes('/auth/'));
    });

    // Set initial value
    this.isAuthRoute.set(this.router.url.includes('/auth/'));
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(value => !value);
  }

  // Computed property to determine if we should show the main layout
  showMainLayout = computed(() => this.isAuthenticated() && !this.isAuthRoute());
}
