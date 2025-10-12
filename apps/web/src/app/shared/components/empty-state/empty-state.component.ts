import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'No hay datos disponibles';
  @Input() message?: string;
  @Input() actionLabel?: string;
  @Input() iconColor = 'rgba(0, 0, 0, 0.26)';

  @Output() action = new EventEmitter<void>();

  onActionClick(): void {
    this.action.emit();
  }
}
