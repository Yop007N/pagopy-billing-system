import { Component, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export interface Breadcrumb {
  label: string;
  route?: string;
  icon?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() breadcrumbs: Breadcrumb[] = [];
  @Input() actionsTemplate?: TemplateRef<any>;
  @Input() showBackButton = false;
  @Input() backRoute?: string;

  onBackClick(): void {
    if (this.backRoute) {
      // Navigation will be handled by routerLink
      return;
    }
    window.history.back();
  }
}
