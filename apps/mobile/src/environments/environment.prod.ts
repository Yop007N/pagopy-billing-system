export const environment = {
  production: true,
  apiUrl: 'https://api.pagopy.py/api',
  appVersion: '1.0.0',
  features: {
    offlineMode: true,
    enableAnalytics: true,
    enableDebugLogs: false
  },
  capacitor: {
    appId: 'py.pago.app',
    appName: 'PagoPy'
  },
  sync: {
    autoSyncInterval: 300000, // 5 minutes
    maxRetries: 3,
    retryDelay: 1000
  }
};
