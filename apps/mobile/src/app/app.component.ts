import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp, URLOpenListenerEvent } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';
import { StorageService } from './services/storage.service';
import { NetworkService } from './services/network.service';
import { SyncService } from './services/sync.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet]
})
export class AppComponent implements OnInit, OnDestroy {
  private platform = inject(Platform);
  private router = inject(Router);
  private storage = inject(StorageService);
  private network = inject(NetworkService);
  private sync = inject(SyncService);

  private backButtonSubscription?: any;

  async ngOnInit() {
    await this.initializeApp();
  }

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
  }

  private async initializeApp() {
    try {
      this.logAppInfo();

      // Initialize platform-specific features
      await this.platform.ready();

      // Initialize core services
      await this.initializeCoreServices();

      // Initialize native features
      if (Capacitor.isNativePlatform()) {
        await this.initializeNativeFeatures();
      }

      // Setup app lifecycle handlers
      this.setupAppLifecycleHandlers();

      // Setup deep linking
      this.setupDeepLinking();

      // Setup back button handler
      this.setupBackButtonHandler();

      // Hide splash screen after everything is ready
      await this.hideSplashScreen();

      this.log('App initialization completed successfully');
    } catch (error) {
      console.error('Critical error during app initialization:', error);
      // App can still function, but log the error
    }
  }

  private async initializeCoreServices() {
    this.log('Initializing core services...');

    try {
      // Initialize storage service
      // Note: StorageService initialization happens automatically via providedIn: 'root'

      // Initialize network monitoring
      // Note: NetworkService initialization happens automatically via providedIn: 'root'

      // Perform initial sync if online
      if (environment.sync.autoSyncOnStartup && this.network.getCurrentStatus()) {
        this.log('Performing initial sync...');
        // Don't await - let it run in background
        this.sync.syncPendingData().catch(err => {
          console.error('Initial sync failed:', err);
        });
      }

      // Clean up old data
      await this.performMaintenanceTasks();

      this.log('Core services initialized');
    } catch (error) {
      console.error('Error initializing core services:', error);
      throw error;
    }
  }

  private async initializeNativeFeatures() {
    this.log('Initializing native features...');

    try {
      // Configure Status Bar
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0033A0' });

      // Configure Keyboard
      if (Capacitor.getPlatform() === 'ios') {
        Keyboard.setAccessoryBarVisible({ isVisible: true });
      }
      Keyboard.setScroll({ isDisabled: false });

      this.log('Native features initialized');
    } catch (error) {
      console.error('Error initializing native features:', error);
      // Non-critical - continue app initialization
    }
  }

  private setupAppLifecycleHandlers() {
    this.log('Setting up app lifecycle handlers...');

    // App state change listener
    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      this.log(`App state changed: ${isActive ? 'active' : 'background'}`);

      if (isActive) {
        this.onAppResume();
      } else {
        this.onAppPause();
      }
    });

    // App URL open listener (for deep links)
    CapacitorApp.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.handleDeepLink(event.url);
    });
  }

  private setupDeepLinking() {
    this.log('Setting up deep linking...');

    // Handle initial deep link if app was opened with one
    CapacitorApp.getLaunchUrl().then(result => {
      if (result && result.url) {
        this.log('App opened with deep link:', result.url);
        setTimeout(() => {
          this.handleDeepLink(result.url);
        }, 500);
      }
    });
  }

  private setupBackButtonHandler() {
    this.log('Setting up back button handler...');

    // Handle Android back button
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, async () => {
      const currentUrl = this.router.url;

      // Define routes where back button should exit app
      const exitRoutes = ['/tabs/home', '/login'];

      if (exitRoutes.includes(currentUrl)) {
        // Show exit confirmation or exit app
        CapacitorApp.exitApp();
      } else {
        // Navigate back
        this.router.navigate(['..'], { relativeTo: this.router.routerState.root });
      }
    });
  }

  private async hideSplashScreen() {
    try {
      if (Capacitor.isNativePlatform()) {
        // Add a small delay to ensure UI is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        await SplashScreen.hide();
        this.log('Splash screen hidden');
      }
    } catch (error) {
      console.error('Error hiding splash screen:', error);
    }
  }

  private handleDeepLink(url: string) {
    this.log('Handling deep link:', url);

    try {
      // Parse the URL
      const urlObject = new URL(url);
      const path = urlObject.pathname;
      const params = Object.fromEntries(urlObject.searchParams.entries());

      // Navigate to the appropriate route
      this.router.navigate([path], { queryParams: params });
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  }

  private onAppResume() {
    this.log('App resumed');

    // Refresh network status
    // NetworkService handles this automatically

    // Trigger sync if online and auto-sync is enabled
    if (this.sync.isAutoSyncEnabled() && this.network.getCurrentStatus()) {
      this.log('Triggering sync on app resume...');
      this.sync.syncPendingData().catch(err => {
        console.error('Resume sync failed:', err);
      });
    }

    // Refresh sync status
    this.sync.refreshSyncStatus().catch(err => {
      console.error('Failed to refresh sync status:', err);
    });
  }

  private onAppPause() {
    this.log('App paused');

    // Perform any cleanup or save operations
    // Storage operations are handled automatically by services
  }

  private async performMaintenanceTasks() {
    try {
      // Clean up old synced sales
      if (environment.sync.cleanupOldSyncedSalesAfterDays > 0) {
        const removed = await this.storage.cleanOldSyncedSales(
          environment.sync.cleanupOldSyncedSalesAfterDays
        );
        if (removed > 0) {
          this.log(`Cleaned up ${removed} old synced sales`);
        }
      }
    } catch (error) {
      console.error('Error performing maintenance tasks:', error);
    }
  }

  private logAppInfo() {
    if (environment.features.enableDebugLogs) {
      console.log('='.repeat(50));
      console.log(`${environment.capacitor.appName} v${environment.appVersion}`);
      console.log(`Platform: ${Capacitor.getPlatform()}`);
      console.log(`Native: ${Capacitor.isNativePlatform()}`);
      console.log(`Environment: ${environment.production ? 'Production' : 'Development'}`);
      console.log('='.repeat(50));
    }
  }

  private log(...args: any[]) {
    if (environment.features.enableDebugLogs) {
      console.log('[AppComponent]', ...args);
    }
  }
}
