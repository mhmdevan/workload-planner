// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  showError(message: string, action = 'Close', duration = 5000): void {
    this.snackBar.open(message, action, { duration });
  }

  showSuccess(message: string, action = 'OK', duration = 3000): void {
    this.snackBar.open(message, action, { duration });
  }
}
