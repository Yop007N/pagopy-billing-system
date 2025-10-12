import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type SpinnerSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent {
  @Input() size: SpinnerSize = 'medium';
  @Input() message?: string;
  @Input() overlay = false;

  get diameter(): number {
    switch (this.size) {
      case 'small':
        return 24;
      case 'medium':
        return 48;
      case 'large':
        return 72;
      default:
        return 48;
    }
  }
}
