import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logInOutline, personOutline, lockClosedOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonSpinner
  ]
})
export class LoginPage {
  credentials = {
    email: '',
    password: ''
  };
  loading = false;
  errorMessage = '';

  constructor(private router: Router) {
    addIcons({ logInOutline, personOutline, lockClosedOutline });
  }

  async onLogin() {
    this.loading = true;
    this.errorMessage = '';

    try {
      // TODO: Implement actual authentication
      await this.simulateLogin();
      this.router.navigate(['/tabs/home']);
    } catch (error) {
      this.errorMessage = 'Error al iniciar sesión. Verifique sus credenciales.';
    } finally {
      this.loading = false;
    }
  }

  private simulateLogin(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 1500);
    });
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }
}
