import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  menuToggle = output<void>();

  showUserMenu = signal(false);

  toggleUserMenu(): void {
    this.showUserMenu.update(value => !value);
  }

  closeUserMenu(): void {
    this.showUserMenu.set(false);
  }

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  logout(): void {
    this.closeUserMenu();
    this.authService.logout();
  }
}
