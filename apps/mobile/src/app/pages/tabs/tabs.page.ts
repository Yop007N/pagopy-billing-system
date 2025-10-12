/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, OnInit, OnDestroy, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  home,
  receiptOutline,
  receipt,
  personOutline,
  person,
  cloudOfflineOutline
} from 'ionicons/icons';
import { SyncService } from '../../services/sync.service';
import { NetworkService } from '../../core/services/network.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonBadge
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsPage implements OnInit, OnDestroy {
  private syncService = inject(SyncService);
  private networkService = inject(NetworkService);

  // Signals for reactive state
  pendingSalesCount = signal<number>(0);
  isOffline = signal<boolean>(false);
  isSyncing = signal<boolean>(false);

  private subscriptions: Subscription[] = [];
  private refreshInterval?: any;

  constructor() {
    // Register icons
    addIcons({
      homeOutline,
      home,
      receiptOutline,
      receipt,
      personOutline,
      person,
      cloudOfflineOutline
    });
  }

  async ngOnInit() {
    await this.loadCounts();
    this.setupSubscriptions();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());

    // Clear refresh interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  /**
   * Load initial badge counts
   */
  private async loadCounts() {
    try {
      // Get pending sales count
      const count = await this.syncService.getPendingItemsCount();
      this.pendingSalesCount.set(count);

      // Get network status
      const isOffline = !this.networkService.getCurrentStatus();
      this.isOffline.set(isOffline);

      // Get sync status
      const syncStatus = this.syncService.syncStatus();
      this.isSyncing.set(syncStatus.isSyncing);
    } catch (error) {
      console.error('Error loading tab counts:', error);
    }
  }

  /**
   * Setup reactive subscriptions
   */
  private setupSubscriptions() {
    // Monitor sync status changes
    const _syncEffect = this.syncService.syncStatus;

    // Create a simple interval to check sync status
    // This is a workaround since we're using signals
    this.subscriptions.push(
      // We'll use the auto-refresh mechanism instead
    );

    // Monitor network status changes
    const _networkEffect = this.networkService.isOnline;

    // Note: Since we're using signals with effects,
    // the UI will automatically update when signals change
  }

  /**
   * Start auto-refresh for badge counts
   */
  private startAutoRefresh() {
    // Refresh counts every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadCounts();
    }, 30000);
  }

  /**
   * Manual refresh trigger
   */
  async refresh() {
    await this.loadCounts();
  }

  /**
   * Get the appropriate icon for a tab
   */
  getTabIcon(tabName: string, isActive: boolean): string {
    const icons: { [key: string]: { active: string; inactive: string } } = {
      home: { active: 'home', inactive: 'homeOutline' },
      sales: { active: 'receipt', inactive: 'receiptOutline' },
      profile: { active: 'person', inactive: 'personOutline' }
    };

    const iconSet = icons[tabName];
    return iconSet ? (isActive ? iconSet.active : iconSet.inactive) : 'homeOutline';
  }
}
