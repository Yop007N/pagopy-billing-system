/**
 * Storage keys and related constants
 */

export const STORAGE_CONSTANTS = {
  // Authentication Keys
  AUTH: {
    TOKEN: 'auth_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    TOKEN_EXPIRY: 'auth_token_expiry',
    USER_ID: 'auth_user_id',
    SESSION_ID: 'auth_session_id',
    BIOMETRIC_ENABLED: 'auth_biometric_enabled',
    LAST_LOGIN: 'auth_last_login'
  },

  // User Keys
  USER: {
    PROFILE: 'user_profile',
    PREFERENCES: 'user_preferences',
    SETTINGS: 'user_settings',
    AVATAR: 'user_avatar',
    THEME: 'user_theme',
    LANGUAGE: 'user_language'
  },

  // Offline Data Keys
  OFFLINE: {
    SALES: 'offline_sales',
    SALES_ITEMS: 'offline_sales_items',
    PRODUCTS: 'offline_products',
    CUSTOMERS: 'offline_customers',
    PENDING_OPERATIONS: 'offline_pending_operations',
    LAST_SYNC_TIMESTAMP: 'offline_last_sync_timestamp'
  },

  // Sync Keys
  SYNC: {
    QUEUE: 'sync_queue',
    STATUS: 'sync_status',
    METADATA: 'sync_metadata',
    LAST_SYNC_DATE: 'sync_last_sync_date',
    CONFLICTS: 'sync_conflicts',
    FAILED_ITEMS: 'sync_failed_items',
    RETRY_COUNT: 'sync_retry_count'
  },

  // Cache Keys
  CACHE: {
    PRODUCTS: 'cache_products',
    CUSTOMERS: 'cache_customers',
    SALES: 'cache_sales',
    INVOICES: 'cache_invoices',
    REPORTS: 'cache_reports',
    SETTINGS: 'cache_settings',
    METADATA: 'cache_metadata'
  },

  // Application State Keys
  APP: {
    VERSION: 'app_version',
    BUILD_NUMBER: 'app_build_number',
    FIRST_RUN: 'app_first_run',
    ONBOARDING_COMPLETED: 'app_onboarding_completed',
    LAST_UPDATE_CHECK: 'app_last_update_check',
    DEVICE_ID: 'app_device_id',
    PUSH_TOKEN: 'app_push_token'
  },

  // Network Keys
  NETWORK: {
    STATUS: 'network_status',
    LAST_ONLINE: 'network_last_online',
    OFFLINE_MODE_ENABLED: 'network_offline_mode_enabled'
  },

  // Settings Keys
  SETTINGS: {
    COMPANY_INFO: 'settings_company_info',
    TAX_CONFIG: 'settings_tax_config',
    PRINTER_CONFIG: 'settings_printer_config',
    INVOICE_CONFIG: 'settings_invoice_config',
    NOTIFICATION_CONFIG: 'settings_notification_config',
    AUTO_SYNC_ENABLED: 'settings_auto_sync_enabled',
    SYNC_INTERVAL: 'settings_sync_interval',
    THEME_MODE: 'settings_theme_mode'
  },

  // Temporary Keys (for session data)
  TEMP: {
    CURRENT_SALE: 'temp_current_sale',
    SEARCH_HISTORY: 'temp_search_history',
    FORM_DRAFT: 'temp_form_draft',
    LAST_VIEWED: 'temp_last_viewed'
  },

  // Analytics Keys
  ANALYTICS: {
    EVENTS: 'analytics_events',
    SESSION_START: 'analytics_session_start',
    PAGE_VIEWS: 'analytics_page_views',
    ERROR_LOGS: 'analytics_error_logs'
  },

  // Security Keys
  SECURITY: {
    PIN: 'security_pin',
    PIN_ENABLED: 'security_pin_enabled',
    FAILED_ATTEMPTS: 'security_failed_attempts',
    LOCKED_UNTIL: 'security_locked_until',
    ENCRYPTION_KEY: 'security_encryption_key'
  },

  // Printer Keys
  PRINTER: {
    DEVICE_NAME: 'printer_device_name',
    DEVICE_ID: 'printer_device_id',
    DEVICE_TYPE: 'printer_device_type',
    PAPER_SIZE: 'printer_paper_size',
    AUTO_PRINT: 'printer_auto_print',
    PRINT_COPIES: 'printer_print_copies'
  },

  // Backup Keys
  BACKUP: {
    LAST_BACKUP_DATE: 'backup_last_backup_date',
    AUTO_BACKUP_ENABLED: 'backup_auto_backup_enabled',
    BACKUP_FREQUENCY: 'backup_frequency'
  },

  // Notification Keys
  NOTIFICATION: {
    UNREAD_COUNT: 'notification_unread_count',
    LAST_NOTIFICATION_ID: 'notification_last_notification_id',
    SETTINGS: 'notification_settings'
  },

  // Debug Keys (only in development)
  DEBUG: {
    LOGS: 'debug_logs',
    NETWORK_LOGS: 'debug_network_logs',
    ERROR_LOGS: 'debug_error_logs',
    PERFORMANCE_LOGS: 'debug_performance_logs'
  }
} as const;

// Storage Key Prefixes
export const STORAGE_PREFIXES = {
  USER: 'user_',
  AUTH: 'auth_',
  CACHE: 'cache_',
  OFFLINE: 'offline_',
  SYNC: 'sync_',
  TEMP: 'temp_',
  SETTINGS: 'settings_',
  DEBUG: 'debug_'
} as const;

// TTL (Time To Live) in milliseconds
export const STORAGE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
  WEEK: 7 * 24 * 60 * 60 * 1000, // 7 days
  PERMANENT: null // Never expires
} as const;

// Storage Sizes
export const STORAGE_LIMITS = {
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50 MB
  MAX_OFFLINE_SALES: 1000,
  MAX_LOG_ENTRIES: 500,
  MAX_SEARCH_HISTORY: 20,
  MAX_ERROR_LOGS: 100
} as const;

// Helper function to generate namespaced key
export function getStorageKey(prefix: string, key: string): string {
  return `${prefix}${key}`;
}

// Helper function to check if key belongs to prefix
export function hasPrefix(key: string, prefix: string): boolean {
  return key.startsWith(prefix);
}

// Helper function to get all keys with prefix
export function filterKeysByPrefix(keys: string[], prefix: string): string[] {
  return keys.filter(key => hasPrefix(key, prefix));
}

// Helper to clear keys by prefix
export const CLEAR_STRATEGIES = {
  ALL: 'all',
  AUTH_ONLY: 'auth',
  CACHE_ONLY: 'cache',
  TEMP_ONLY: 'temp',
  KEEP_AUTH: 'keep_auth'
} as const;

export type ClearStrategy = typeof CLEAR_STRATEGIES[keyof typeof CLEAR_STRATEGIES];
