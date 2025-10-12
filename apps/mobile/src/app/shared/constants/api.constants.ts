/**
 * API Endpoints and related constants
 */

export const API_CONSTANTS = {
  // Base paths
  VERSION: 'v1',

  // Authentication Endpoints
  AUTH: {
    BASE: '/auth',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password'
  },

  // User Endpoints
  USERS: {
    BASE: '/users',
    ME: '/users/me',
    UPDATE_PROFILE: '/users/me',
    UPDATE_AVATAR: '/users/me/avatar',
    BY_ID: (id: string) => `/users/${id}`,
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`
  },

  // Sales Endpoints
  SALES: {
    BASE: '/sales',
    LIST: '/sales',
    CREATE: '/sales',
    BY_ID: (id: string) => `/sales/${id}`,
    UPDATE: (id: string) => `/sales/${id}`,
    DELETE: (id: string) => `/sales/${id}`,
    CANCEL: (id: string) => `/sales/${id}/cancel`,
    STATS: '/sales/stats',
    DAILY: '/sales/daily',
    BY_DATE_RANGE: '/sales/by-date-range'
  },

  // Products Endpoints
  PRODUCTS: {
    BASE: '/products',
    LIST: '/products',
    CREATE: '/products',
    BY_ID: (id: string) => `/products/${id}`,
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    BY_CODE: (code: string) => `/products/code/${code}`,
    SEARCH: '/products/search',
    CATEGORIES: '/products/categories',
    LOW_STOCK: '/products/low-stock'
  },

  // Customers Endpoints
  CUSTOMERS: {
    BASE: '/customers',
    LIST: '/customers',
    CREATE: '/customers',
    BY_ID: (id: string) => `/customers/${id}`,
    UPDATE: (id: string) => `/customers/${id}`,
    DELETE: (id: string) => `/customers/${id}`,
    SEARCH: '/customers/search',
    BY_DOCUMENT: (document: string) => `/customers/document/${document}`
  },

  // Invoices Endpoints
  INVOICES: {
    BASE: '/invoices',
    LIST: '/invoices',
    CREATE: '/invoices',
    BY_ID: (id: string) => `/invoices/${id}`,
    BY_SALE: (saleId: string) => `/invoices/sale/${saleId}`,
    SEND_TO_SET: (id: string) => `/invoices/${id}/send-to-set`,
    CANCEL: (id: string) => `/invoices/${id}/cancel`,
    PDF: (id: string) => `/invoices/${id}/pdf`,
    XML: (id: string) => `/invoices/${id}/xml`,
    VERIFY_STATUS: (id: string) => `/invoices/${id}/verify-status`
  },

  // Payments Endpoints
  PAYMENTS: {
    BASE: '/payments',
    LIST: '/payments',
    CREATE: '/payments',
    BY_ID: (id: string) => `/payments/${id}`,
    BY_SALE: (saleId: string) => `/payments/sale/${saleId}`,
    VERIFY: (id: string) => `/payments/${id}/verify`,
    REFUND: (id: string) => `/payments/${id}/refund`,
    WEBHOOK_BANCARD: '/payments/webhook/bancard',
    WEBHOOK_PAGOPAR: '/payments/webhook/pagopar'
  },

  // Reports Endpoints
  REPORTS: {
    BASE: '/reports',
    SALES: '/reports/sales',
    PRODUCTS: '/reports/products',
    CUSTOMERS: '/reports/customers',
    PAYMENTS: '/reports/payments',
    DASHBOARD: '/reports/dashboard',
    EXPORT: '/reports/export'
  },

  // Sync Endpoints
  SYNC: {
    BASE: '/sync',
    STATUS: '/sync/status',
    PULL: '/sync/pull',
    PUSH: '/sync/push',
    RESOLVE_CONFLICT: '/sync/resolve-conflict'
  },

  // Notifications Endpoints
  NOTIFICATIONS: {
    BASE: '/notifications',
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
    SETTINGS: '/notifications/settings'
  },

  // Settings Endpoints
  SETTINGS: {
    BASE: '/settings',
    GET: '/settings',
    UPDATE: '/settings',
    COMPANY: '/settings/company',
    TAX: '/settings/tax',
    INVOICE: '/settings/invoice',
    PRINTER: '/settings/printer'
  },

  // HTTP Headers
  HEADERS: {
    AUTHORIZATION: 'Authorization',
    CONTENT_TYPE: 'Content-Type',
    ACCEPT: 'Accept',
    X_API_KEY: 'X-Api-Key',
    X_REQUEST_ID: 'X-Request-Id',
    X_DEVICE_ID: 'X-Device-Id',
    X_APP_VERSION: 'X-App-Version'
  },

  // HTTP Methods
  METHODS: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE'
  },

  // HTTP Status Codes
  STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504
  },

  // Query Parameters
  QUERY_PARAMS: {
    PAGE: 'page',
    LIMIT: 'limit',
    SORT: 'sort',
    ORDER: 'order',
    SEARCH: 'search',
    FILTER: 'filter',
    FROM_DATE: 'fromDate',
    TO_DATE: 'toDate',
    STATUS: 'status',
    INCLUDE: 'include',
    FIELDS: 'fields'
  },

  // Request Timeouts (milliseconds)
  TIMEOUTS: {
    DEFAULT: 30000, // 30 seconds
    UPLOAD: 120000, // 2 minutes
    DOWNLOAD: 120000, // 2 minutes
    SYNC: 60000 // 1 minute
  },

  // Retry Configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 second
    BACKOFF_MULTIPLIER: 2,
    RETRYABLE_CODES: [408, 429, 500, 502, 503, 504]
  }
} as const;

// Helper function to build URL with query parameters
export function buildUrl(endpoint: string, params?: Record<string, any>): string {
  if (!params) return endpoint;

  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return queryString ? `${endpoint}?${queryString}` : endpoint;
}

// Helper function to check if status code is retryable
export function isRetryableStatus(status: number): boolean {
  return API_CONSTANTS.RETRY.RETRYABLE_CODES.includes(status);
}

// Helper function to check if status code is client error
export function isClientError(status: number): boolean {
  return status >= 400 && status < 500;
}

// Helper function to check if status code is server error
export function isServerError(status: number): boolean {
  return status >= 500;
}
