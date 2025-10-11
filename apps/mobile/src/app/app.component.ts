import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet]
})
export class AppComponent implements OnInit {
  constructor() {}

  async ngOnInit() {
    await this.initializeApp();
  }

  private async initializeApp() {
    if (Capacitor.isNativePlatform()) {
      try {
        // Configure status bar
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0033A0' });

        // Hide splash screen after app is ready
        await SplashScreen.hide();
      } catch (error) {
        console.error('Error initializing native features:', error);
      }
    }
  }
}
