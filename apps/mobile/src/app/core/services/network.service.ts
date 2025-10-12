import { Injectable, signal, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Network } from '@capacitor/network';
import { catchError, timeout, firstValueFrom } from 'rxjs';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NetworkStatus {
  connected: boolean;
  connectionType: 'wifi' | 'cellular' | 'none' | 'unknown';
  backendReachable?: boolean;
  lastBackendCheck?: Date;
  latency?: number;
}

export interface ConnectivityCheckResult {
  isOnline: boolean;
  backendReachable: boolean;
  latency: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NetworkService implements OnDestroy {
  private readonly BACKEND_URL = environment.apiUrl.replace('/api', '');
  private readonly HEALTH_CHECK_ENDPOINT = environment.healthCheckEndpoint;
  private readonly HEALTH_CHECK_TIMEOUT = environment.healthCheckTimeout;
  private readonly BACKEND_CHECK_INTERVAL = environment.healthCheckInterval;

  // Angular signals for reactive state
  private networkStatusSignal = signal<NetworkStatus>({
    connected: true,
    connectionType: 'unknown',
    backendReachable: undefined,
    lastBackendCheck: undefined,
    latency: undefined
  });

  private isOnlineSignal = signal<boolean>(true);
  private backendReachableSignal = signal<boolean>(false);

  // Public readonly signals
  readonly networkStatus = this.networkStatusSignal.asReadonly();
  readonly isOnline = this.isOnlineSignal.asReadonly();
  readonly backendReachable = this.backendReachableSignal.asReadonly();

  private initialized = false;
  private backendCheckInterval: any;

  constructor(private http: HttpClient) {
    this.initializeNetworkMonitoring();
  }

  private async initializeNetworkMonitoring(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Get initial network status
      const status = await Network.getStatus();
      await this.updateNetworkStatus(status);

      // Listen for network status changes
      Network.addListener('networkStatusChange', async (status) => {
        console.log('Network status changed:', status);
        await this.updateNetworkStatus(status);

        // Check backend connectivity when network comes online
        if (status.connected) {
          await this.checkBackendConnectivity();
        }
      });

      // Initial backend connectivity check
      if (status.connected) {
        await this.checkBackendConnectivity();
      }

      // Start periodic backend checks
      this.startPeriodicBackendChecks();

      this.initialized = true;
      console.log('Network monitoring initialized');
    } catch (error) {
      console.error('Failed to initialize network monitoring:', error);
      // Fallback to browser's navigator.onLine
      await this.updateNetworkStatus({
        connected: navigator.onLine,
        connectionType: 'unknown'
      });
    }
  }

  private async updateNetworkStatus(status: any): Promise<void> {
    const connectionType = this.mapConnectionType(status.connectionType);

    this.networkStatusSignal.update(current => ({
      ...current,
      connected: status.connected,
      connectionType
    }));

    this.isOnlineSignal.set(status.connected);
  }

  private mapConnectionType(type: string): 'wifi' | 'cellular' | 'none' | 'unknown' {
    switch (type?.toLowerCase()) {
      case 'wifi':
        return 'wifi';
      case 'cellular':
      case '2g':
      case '3g':
      case '4g':
      case '5g':
        return 'cellular';
      case 'none':
        return 'none';
      default:
        return 'unknown';
    }
  }

  /**
   * Start periodic backend connectivity checks
   */
  private startPeriodicBackendChecks(): void {
    // Clear any existing interval
    if (this.backendCheckInterval) {
      clearInterval(this.backendCheckInterval);
    }

    // Check backend connectivity periodically
    this.backendCheckInterval = setInterval(async () => {
      if (this.isOnlineSignal()) {
        await this.checkBackendConnectivity();
      }
    }, this.BACKEND_CHECK_INTERVAL);
  }

  /**
   * Stop periodic backend checks
   */
  stopPeriodicBackendChecks(): void {
    if (this.backendCheckInterval) {
      clearInterval(this.backendCheckInterval);
      this.backendCheckInterval = null;
    }
  }

  /**
   * Check backend connectivity with latency measurement
   */
  async checkBackendConnectivity(): Promise<ConnectivityCheckResult> {
    const startTime = Date.now();

    try {
      const healthUrl = `${this.BACKEND_URL}${this.HEALTH_CHECK_ENDPOINT}`;

      await firstValueFrom(
        this.http.get(healthUrl).pipe(
          timeout(this.HEALTH_CHECK_TIMEOUT),
          catchError((error: HttpErrorResponse) => {
            console.log('Backend health check failed:', error.message);
            return of(null);
          })
        )
      );

      const latency = Date.now() - startTime;
      const timestamp = new Date();

      // Update signals
      this.backendReachableSignal.set(true);
      this.networkStatusSignal.update(current => ({
        ...current,
        backendReachable: true,
        lastBackendCheck: timestamp,
        latency
      }));

      console.log(`Backend reachable (latency: ${latency}ms)`);

      return {
        isOnline: true,
        backendReachable: true,
        latency,
        timestamp
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      const timestamp = new Date();

      // Update signals
      this.backendReachableSignal.set(false);
      this.networkStatusSignal.update(current => ({
        ...current,
        backendReachable: false,
        lastBackendCheck: timestamp,
        latency
      }));

      console.warn('Backend not reachable');

      return {
        isOnline: this.isOnlineSignal(),
        backendReachable: false,
        latency,
        timestamp
      };
    }
  }

  /**
   * Get current online status synchronously
   */
  getCurrentStatus(): boolean {
    return this.isOnlineSignal();
  }

  /**
   * Get backend reachability status synchronously
   */
  isBackendReachable(): boolean {
    return this.backendReachableSignal();
  }

  /**
   * Get detailed network status
   */
  getNetworkStatus(): NetworkStatus {
    return this.networkStatusSignal();
  }

  /**
   * Force refresh network status and backend connectivity
   */
  async refreshNetworkStatus(): Promise<NetworkStatus> {
    try {
      const status = await Network.getStatus();
      await this.updateNetworkStatus(status);

      if (status.connected) {
        await this.checkBackendConnectivity();
      }

      return this.networkStatusSignal();
    } catch (error) {
      console.error('Failed to refresh network status:', error);
      return this.networkStatusSignal();
    }
  }

  /**
   * Check if connection is suitable for sync
   */
  isSuitableForSync(requireWifi = false): boolean {
    const status = this.networkStatusSignal();

    if (!status.connected || !status.backendReachable) {
      return false;
    }

    if (requireWifi) {
      return status.connectionType === 'wifi';
    }

    return status.connectionType === 'wifi' || status.connectionType === 'cellular';
  }

  /**
   * Wait for network to be online
   * @param timeoutMs Maximum time to wait (0 = no timeout)
   */
  async waitForOnline(timeoutMs = 0): Promise<boolean> {
    if (this.isOnlineSignal()) {
      return true;
    }

    return new Promise((resolve) => {
      let timeout: any;
      // eslint-disable-next-line prefer-const
      let checkInterval: any;

      const check = () => {
        if (this.isOnlineSignal()) {
          if (timeout) clearTimeout(timeout);
          if (checkInterval) clearInterval(checkInterval);
          resolve(true);
        }
      };

      // Check every 500ms
      checkInterval = setInterval(check, 500);

      if (timeoutMs > 0) {
        timeout = setTimeout(() => {
          if (checkInterval) clearInterval(checkInterval);
          resolve(false);
        }, timeoutMs);
      }
    });
  }

  /**
   * Wait for backend to be reachable
   * @param timeoutMs Maximum time to wait (0 = no timeout)
   */
  async waitForBackend(timeoutMs = 10000): Promise<boolean> {
    if (this.backendReachableSignal()) {
      return true;
    }

    const startTime = Date.now();

    return new Promise((resolve) => {
      const checkInterval = setInterval(async () => {
        const result = await this.checkBackendConnectivity();

        if (result.backendReachable) {
          clearInterval(checkInterval);
          resolve(true);
        } else if (timeoutMs > 0 && Date.now() - startTime >= timeoutMs) {
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 2000); // Check every 2 seconds
    });
  }

  /**
   * Get connection quality indicator
   */
  getConnectionQuality(): 'excellent' | 'good' | 'fair' | 'poor' | 'offline' {
    const status = this.networkStatusSignal();

    if (!status.connected) {
      return 'offline';
    }

    if (!status.backendReachable || !status.latency) {
      return 'poor';
    }

    if (status.latency < 100) {
      return 'excellent';
    } else if (status.latency < 300) {
      return 'good';
    } else if (status.latency < 1000) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  /**
   * Cleanup when service is destroyed
   */
  ngOnDestroy(): void {
    this.stopPeriodicBackendChecks();
  }
}
