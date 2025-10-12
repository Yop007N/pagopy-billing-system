import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.scss']
})
export class ActionButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() label!: string;
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClasses(): string[] {
    return [
      'action-button',
      `variant-${this.variant}`,
      `size-${this.size}`,
      this.fullWidth ? 'full-width' : '',
      this.loading ? 'loading' : ''
    ].filter(Boolean);
  }

  get isDisabled(): boolean {
    return this.disabled || this.loading;
  }

  onClick(event: MouseEvent): void {
    if (!this.isDisabled) {
      this.clicked.emit(event);
    }
  }
}
