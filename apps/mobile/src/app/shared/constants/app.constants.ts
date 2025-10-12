/**
 * Application-wide constants
 */

export const APP_CONSTANTS = {
  // App Information
  APP_NAME: 'PagoPy',
  APP_DESCRIPTION: 'Sistema de Gestión de Pagos y Facturación Electrónica',
  COMPANY_NAME: 'PagoPy S.A.',
  SUPPORT_EMAIL: 'soporte@pagopy.py',
  SUPPORT_PHONE: '+595 21 123 4567',

  // Time Constants
  DEFAULT_DEBOUNCE_TIME: 300,
  DEFAULT_THROTTLE_TIME: 1000,
  SESSION_CHECK_INTERVAL: 60000, // 1 minute
  HEARTBEAT_INTERVAL: 30000, // 30 seconds

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  INFINITE_SCROLL_THRESHOLD: '15%',

  // Date Formats
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm:ss',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
  ISO_DATE_FORMAT: 'YYYY-MM-DD',

  // Currency
  CURRENCY_CODE: 'PYG',
  CURRENCY_SYMBOL: '₲',
  CURRENCY_DECIMALS: 0,

  // Validation
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,

  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],

  // Cache
  CACHE_VERSION: '1.0',
  CACHE_TTL: 3600000, // 1 hour

  // UI
  TOAST_DURATION: 3000,
  TOAST_LONG_DURATION: 5000,
  LOADING_DEBOUNCE: 300,
  ANIMATION_DURATION: 300,

  // Offline
  OFFLINE_QUEUE_MAX_SIZE: 500,
  OFFLINE_DATA_RETENTION_DAYS: 30,

  // Network
  NETWORK_CHECK_INTERVAL: 5000,
  REQUEST_TIMEOUT: 30000,
  MAX_CONCURRENT_REQUESTS: 5,

  // Sync
  SYNC_BATCH_SIZE: 10,
  SYNC_MAX_RETRIES: 5,
  SYNC_RETRY_DELAY: 2000,
  SYNC_AUTO_INTERVAL: 300000, // 5 minutes

  // Local Storage Keys Prefixes
  PREFIX_AUTH: 'auth_',
  PREFIX_USER: 'user_',
  PREFIX_CACHE: 'cache_',
  PREFIX_SETTINGS: 'settings_',
  PREFIX_SYNC: 'sync_',

  // Error Messages
  ERRORS: {
    NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
    SERVER_ERROR: 'Error del servidor. Por favor intenta nuevamente.',
    UNAUTHORIZED: 'Sesión expirada. Por favor inicia sesión nuevamente.',
    FORBIDDEN: 'No tienes permisos para realizar esta acción.',
    NOT_FOUND: 'Recurso no encontrado.',
    VALIDATION_ERROR: 'Error de validación. Verifica los datos ingresados.',
    TIMEOUT_ERROR: 'La solicitud tardó demasiado. Por favor intenta nuevamente.',
    UNKNOWN_ERROR: 'Ocurrió un error inesperado. Por favor intenta nuevamente.'
  },

  // Success Messages
  SUCCESS: {
    SAVE: 'Guardado exitosamente',
    UPDATE: 'Actualizado exitosamente',
    DELETE: 'Eliminado exitosamente',
    SYNC: 'Sincronización completada',
    LOGIN: 'Inicio de sesión exitoso',
    LOGOUT: 'Sesión cerrada exitosamente'
  },

  // Regex Patterns
  PATTERNS: {
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PHONE_PY: /^(\+595|0)?9[6-9]\d{7}$/,
    RUC_PY: /^\d{6,8}-\d{1}$/,
    CI_PY: /^\d{6,8}$/,
    NUMERIC: /^\d+$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  },

  // Paraguay Specific
  PARAGUAY: {
    COUNTRY_CODE: 'PY',
    COUNTRY_NAME: 'Paraguay',
    PHONE_PREFIX: '+595',
    TIMEZONE: 'America/Asuncion',
    TAX_RATE: 10, // IVA 10%
    TAX_NAME: 'IVA'
  },

  // Payment Methods
  PAYMENT_METHODS: {
    CASH: { code: 'CASH', label: 'Efectivo', icon: 'cash-outline' },
    CARD: { code: 'CARD', label: 'Tarjeta', icon: 'card-outline' },
    TRANSFER: { code: 'TRANSFER', label: 'Transferencia', icon: 'swap-horizontal-outline' },
    QR: { code: 'QR', label: 'QR', icon: 'qr-code-outline' },
    CHECK: { code: 'CHECK', label: 'Cheque', icon: 'document-text-outline' }
  },

  // Sale Status
  SALE_STATUS: {
    PENDING: { code: 'PENDING', label: 'Pendiente', color: 'warning' },
    COMPLETED: { code: 'COMPLETED', label: 'Completada', color: 'success' },
    CANCELLED: { code: 'CANCELLED', label: 'Cancelada', color: 'danger' },
    REFUNDED: { code: 'REFUNDED', label: 'Reembolsada', color: 'medium' }
  },

  // Invoice Status
  INVOICE_STATUS: {
    PENDING: { code: 'PENDING', label: 'Pendiente', color: 'warning' },
    SENT: { code: 'SENT', label: 'Enviada a SET', color: 'primary' },
    APPROVED: { code: 'APPROVED', label: 'Aprobada', color: 'success' },
    REJECTED: { code: 'REJECTED', label: 'Rechazada', color: 'danger' },
    CANCELLED: { code: 'CANCELLED', label: 'Anulada', color: 'dark' }
  },

  // User Roles
  USER_ROLES: {
    ADMIN: { code: 'ADMIN', label: 'Administrador' },
    SELLER: { code: 'SELLER', label: 'Vendedor' },
    CASHIER: { code: 'CASHIER', label: 'Cajero' },
    VIEWER: { code: 'VIEWER', label: 'Visualizador' }
  }
} as const;

// Type exports for better TypeScript support
export type PaymentMethodCode = keyof typeof APP_CONSTANTS.PAYMENT_METHODS;
export type SaleStatusCode = keyof typeof APP_CONSTANTS.SALE_STATUS;
export type InvoiceStatusCode = keyof typeof APP_CONSTANTS.INVOICE_STATUS;
export type UserRoleCode = keyof typeof APP_CONSTANTS.USER_ROLES;
