export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appVersion: '1.0.0',
  features: {
    offlineMode: true,
    enableAnalytics: false,
    enableDebugLogs: true
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
