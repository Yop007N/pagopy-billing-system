export const environment = {
  production: true,
  appVersion: '1.0.0',
  buildNumber: '1',

  // API Configuration
  apiUrl: 'https://api.pagopy.py/api',
  apiTimeout: 30000, // 30 seconds
  healthCheckEndpoint: '/health',
  healthCheckTimeout: 5000,
  healthCheckInterval: 60000, // 1 minute in production

  // Capacitor Configuration
  capacitor: {
    appId: 'py.pago.app',
    appName: 'PagoPy'
  },

  // SET (e-Kuatia) Configuration - Production
  set: {
    apiUrl: 'https://ekuatia.set.gov.py/api',
    environment: 'PRODUCTION',
    timbrado: '', // Must be set in production
    ruc: '', // Must be set in production
    enabled: true
  },

  // Feature Flags
  features: {
    offlineMode: true,
    enableAnalytics: true,
    enableDebugLogs: false,
    enableCrashReporting: true,
    enablePerformanceMonitoring: true,
    bluetoothPrinting: true,
    biometricAuth: true,
    autoBackup: true,
    pushNotifications: true,
    cameraUpload: true,
    barcodeScanner: true,
    thermalPrinter: true,
    electronicInvoicing: true
  },

  // Sync Configuration
  sync: {
    autoSyncInterval: 300000, // 5 minutes
    autoSyncOnStartup: true,
    autoSyncOnNetworkRestore: true,
    maxRetries: 5,
    retryDelay: 2000,
    batchSize: 10,
    cleanupOldSyncedSalesAfterDays: 30,
    syncOnlyOnWifi: false, // Allow sync on cellular (configurable by user)
    backgroundSyncEnabled: true
  },

  // Storage Configuration
  storage: {
    encryptSensitiveData: true,
    maxCacheSize: 100 * 1024 * 1024, // 100 MB
    clearCacheOnLogout: true,
    compressionEnabled: true,
    databaseName: 'pagopy_prod_db'
  },

  // Storage Keys
  storageKeys: {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
    currentUser: 'current_user',
    offlineSales: 'offline_sales',
    syncQueue: 'sync_queue',
    syncMetadata: 'sync_metadata',
    customersCache: 'customers_cache',
    productsCache: 'products_cache',
    settingsCache: 'settings_cache'
  },

  // Logging Configuration
  logging: {
    level: 'error', // 'debug' | 'info' | 'warn' | 'error'
    enableConsole: false,
    enableRemote: true,
    maxLogSize: 500,
    logToFile: true
  },

  // Security Configuration
  security: {
    enableSSLPinning: true,
    sessionTimeout: 1800000, // 30 minutes
    requireBiometricForSensitiveOps: true,
    autoLockTimeout: 300000, // 5 minutes
    maxLoginAttempts: 3
  },

  // Network Configuration
  network: {
    retryAttempts: 5,
    retryDelay: 2000,
    connectionTimeout: 15000,
    enableOfflineMode: true
  },

  // External Services (Production)
  services: {
    sentry: {
      dsn: 'https://your-sentry-dsn@sentry.io/project-id', // Replace with actual DSN
      enabled: true,
      environment: 'production',
      tracesSampleRate: 0.1 // Lower sample rate in production
    },
    firebase: {
      enabled: true,
      apiKey: '', // Must be set in production
      projectId: 'pagopy-prod'
    },
    analytics: {
      enabled: true,
      trackingId: '' // Google Analytics or similar
    }
  },

  // Default Settings
  defaults: {
    currency: 'PYG',
    locale: 'es-PY',
    timezone: 'America/Asuncion',
    taxRate: 10, // 10% IVA
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    itemsPerPage: 20
  },

  // Printer Configuration
  printer: {
    defaultPrinterType: 'thermal', // 'thermal' | 'standard'
    paperWidth: 80, // mm
    fontSize: 12,
    enableAutoPrint: false,
    printCopies: 1
  }
};
