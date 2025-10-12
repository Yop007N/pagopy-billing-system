export const environment = {
  production: false,
  appVersion: '1.0.0',
  buildNumber: '1',

  // API Configuration
  apiUrl: 'http://localhost:3000/api',
  apiTimeout: 30000, // 30 seconds
  healthCheckEndpoint: '/health',
  healthCheckTimeout: 5000,
  healthCheckInterval: 30000, // 30 seconds

  // Capacitor Configuration
  capacitor: {
    appId: 'py.pago.app',
    appName: 'PagoPy DEV'
  },

  // SET (e-Kuatia) Configuration - Development/Testing
  set: {
    apiUrl: 'https://ekuatia-test.set.gov.py/api',
    environment: 'TEST',
    timbrado: '',
    ruc: '',
    enabled: false // Disable in dev by default
  },

  // Feature Flags
  features: {
    offlineMode: true,
    enableAnalytics: false,
    enableDebugLogs: true,
    enableCrashReporting: false,
    enablePerformanceMonitoring: false,
    bluetoothPrinting: true,
    biometricAuth: true,
    autoBackup: true,
    pushNotifications: true,
    cameraUpload: true,
    barcodeScanner: true,
    thermalPrinter: true,
    electronicInvoicing: false // Disable in dev
  },

  // Sync Configuration
  sync: {
    autoSyncInterval: 300000, // 5 minutes
    autoSyncOnStartup: true,
    autoSyncOnNetworkRestore: true,
    maxRetries: 3,
    retryDelay: 1000,
    batchSize: 5,
    cleanupOldSyncedSalesAfterDays: 30,
    syncOnlyOnWifi: false, // Allow sync on cellular in dev
    backgroundSyncEnabled: true
  },

  // Storage Configuration
  storage: {
    encryptSensitiveData: false,
    maxCacheSize: 50 * 1024 * 1024, // 50 MB
    clearCacheOnLogout: true,
    compressionEnabled: false,
    databaseName: 'pagopy_dev_db'
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
    level: 'debug', // 'debug' | 'info' | 'warn' | 'error'
    enableConsole: true,
    enableRemote: false,
    maxLogSize: 1000,
    logToFile: false
  },

  // Security Configuration
  security: {
    enableSSLPinning: false,
    sessionTimeout: 3600000, // 1 hour
    requireBiometricForSensitiveOps: false,
    autoLockTimeout: 0, // Disabled in dev
    maxLoginAttempts: 5
  },

  // Network Configuration
  network: {
    retryAttempts: 3,
    retryDelay: 1000,
    connectionTimeout: 10000,
    enableOfflineMode: true
  },

  // External Services (Development)
  services: {
    sentry: {
      dsn: '',
      enabled: false,
      environment: 'development',
      tracesSampleRate: 1.0
    },
    firebase: {
      enabled: false,
      apiKey: '',
      projectId: 'pagopy-dev'
    },
    analytics: {
      enabled: false,
      trackingId: ''
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
