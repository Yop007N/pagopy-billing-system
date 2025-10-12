import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    // Set defaults
    this.data = {
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      type: 'warning',
      ...data
    };
  }

  get dialogIcon(): string {
    if (this.data.icon) {
      return this.data.icon;
    }

    // Default icons based on type
    const icons = {
      warning: 'warning',
      danger: 'error',
      info: 'info',
      success: 'check_circle'
    };

    return icons[this.data.type || 'warning'];
  }

  get iconColor(): string {
    const colors = {
      warning: '#ff9800',
      danger: '#f44336',
      info: '#2196f3',
      success: '#4caf50'
    };

    return colors[this.data.type || 'warning'];
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
