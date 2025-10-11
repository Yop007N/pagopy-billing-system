import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircleOutline,
  settingsOutline,
  helpCircleOutline,
  logOutOutline,
  cloudDownloadOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton
  ]
})
export class ProfilePage {
  userInfo = {
    name: 'Usuario Demo',
    email: 'demo@pagopy.py',
    businessName: 'Mi Negocio'
  };

  constructor(private router: Router) {
    addIcons({
      personCircleOutline,
      settingsOutline,
      helpCircleOutline,
      logOutOutline,
      cloudDownloadOutline
    });
  }

  async syncData() {
    // TODO: Implement sync
    console.log('Syncing data...');
  }

  logout() {
    // TODO: Implement logout
    this.router.navigate(['/auth/login']);
  }
}
