import { Injectable, signal } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import {
  LocalProduct,
  LocalCustomer,
  LocalSale,
  LocalSaleItem,
  SyncLog,
  DatabaseInfo
} from '../../models/database.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly DB_NAME = 'pagopy_local.db';
  private readonly DB_VERSION = 1;
  private readonly DB_ENCRYPTED = false;
  private readonly DB_MODE = 'no-encryption';

  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private platform: string;

  // Signal to track initialization status
  private initializedSignal = signal<boolean>(false);
  readonly isInitialized = this.initializedSignal.asReadonly();

  constructor() {
    this.platform = Capacitor.getPlatform();
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  /**
   * Initialize the database
   */
  async initialize(): Promise<void> {
    if (this.initializedSignal()) {
      console.log('Database already initialized');
      return;
    }

    try {
      console.log('Initializing database on platform:', this.platform);

      // Check if connection consistency is correct (web only)
      if (this.platform === 'web') {
        await this.sqlite.initWebStore();
        const ret = await this.sqlite.checkConnectionsConsistency();
        const isConnection = (await this.sqlite.isConnection(this.DB_NAME, false)).result;

        if (ret.result && isConnection) {
          this.db = await this.sqlite.retrieveConnection(this.DB_NAME, false);
        } else {
          this.db = await this.sqlite.createConnection(
            this.DB_NAME,
            this.DB_ENCRYPTED,
            this.DB_MODE,
            this.DB_VERSION,
            false
          );
        }
      } else {
        // Native platforms
        this.db = await this.sqlite.createConnection(
          this.DB_NAME,
          this.DB_ENCRYPTED,
          this.DB_MODE,
          this.DB_VERSION,
          false
        );
      }

      // Open the database
      await this.db.open();

      // Create tables
      await this.createTables();

      // Run migrations
      await this.runMigrations();

      this.initializedSignal.set(true);
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = `
      -- Products table
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY NOT NULL,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        cost REAL NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        taxRate REAL NOT NULL DEFAULT 10,
        category TEXT,
        barcode TEXT,
        imageUrl TEXT,
        isActive INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        lastSyncedAt TEXT NOT NULL
      );

      -- Customers table
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        documentType TEXT NOT NULL,
        documentNumber TEXT NOT NULL,
        customerType TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        country TEXT DEFAULT 'Paraguay',
        isActive INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        lastSyncedAt TEXT NOT NULL,
        UNIQUE(documentType, documentNumber)
      );

      -- Sales table
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY NOT NULL,
        localId TEXT NOT NULL UNIQUE,
        saleNumber TEXT,
        customerId TEXT,
        customerName TEXT NOT NULL,
        customerDocument TEXT,
        subtotal REAL NOT NULL,
        tax REAL NOT NULL,
        discount REAL NOT NULL DEFAULT 0,
        total REAL NOT NULL,
        paymentMethod TEXT NOT NULL,
        paymentStatus TEXT NOT NULL DEFAULT 'pending',
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'completed',
        syncStatus TEXT NOT NULL DEFAULT 'pending',
        syncAttempts INTEGER NOT NULL DEFAULT 0,
        lastSyncAttempt TEXT,
        errorMessage TEXT,
        serverId TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        createdBy TEXT,
        FOREIGN KEY (customerId) REFERENCES customers(id)
      );

      -- Sale items table
      CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY NOT NULL,
        saleId TEXT NOT NULL,
        productId TEXT,
        productName TEXT NOT NULL,
        productCode TEXT,
        quantity INTEGER NOT NULL,
        unitPrice REAL NOT NULL,
        subtotal REAL NOT NULL,
        taxRate REAL NOT NULL,
        taxAmount REAL NOT NULL,
        discount REAL NOT NULL DEFAULT 0,
        total REAL NOT NULL,
        FOREIGN KEY (saleId) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products(id)
      );

      -- Invoices table
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY NOT NULL,
        localId TEXT NOT NULL UNIQUE,
        saleId TEXT NOT NULL,
        invoiceNumber TEXT,
        timbradoNumber TEXT,
        cdc TEXT,
        kude TEXT,
        qrCode TEXT,
        xmlData TEXT,
        pdfUrl TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        issuedAt TEXT,
        expiresAt TEXT,
        setResponse TEXT,
        syncStatus TEXT NOT NULL DEFAULT 'pending',
        errorMessage TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (saleId) REFERENCES sales(id)
      );

      -- Sync logs table
      CREATE TABLE IF NOT EXISTS sync_logs (
        id TEXT PRIMARY KEY NOT NULL,
        entityType TEXT NOT NULL,
        entityId TEXT NOT NULL,
        operation TEXT NOT NULL,
        status TEXT NOT NULL,
        direction TEXT NOT NULL,
        errorMessage TEXT,
        requestData TEXT,
        responseData TEXT,
        duration INTEGER,
        timestamp TEXT NOT NULL,
        syncedAt TEXT
      );

      -- Indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
      CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
      CREATE INDEX IF NOT EXISTS idx_products_active ON products(isActive);
      CREATE INDEX IF NOT EXISTS idx_customers_document ON customers(documentType, documentNumber);
      CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(isActive);
      CREATE INDEX IF NOT EXISTS idx_sales_sync_status ON sales(syncStatus);
      CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
      CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customerId);
      CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(createdAt);
      CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(saleId);
      CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(productId);
      CREATE INDEX IF NOT EXISTS idx_invoices_sale ON invoices(saleId);
      CREATE INDEX IF NOT EXISTS idx_invoices_sync_status ON invoices(syncStatus);
      CREATE INDEX IF NOT EXISTS idx_sync_logs_entity ON sync_logs(entityType, entityId);
      CREATE INDEX IF NOT EXISTS idx_sync_logs_timestamp ON sync_logs(timestamp);
    `;

    await this.db.execute(tables);
    console.log('Database tables created successfully');
  }

  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Get current version
    const result = await this.db.query('PRAGMA user_version;');
    const currentVersion = result.values && result.values.length > 0
      ? result.values[0].user_version
      : 0;

    console.log('Current database version:', currentVersion);

    // Run migrations based on version
    if (currentVersion < 1) {
      // Migration 1: Initial schema (already created above)
      await this.db.execute('PRAGMA user_version = 1;');
      console.log('Migration 1 completed');
    }

    // Future migrations can be added here
    // if (currentVersion < 2) {
    //   await this.runMigration2();
    //   await this.db.execute('PRAGMA user_version = 2;');
    // }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.initializedSignal.set(false);
      console.log('Database connection closed');
    }
  }

  /**
   * Clear all data from database
   */
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execute(`
      DELETE FROM sync_logs;
      DELETE FROM sale_items;
      DELETE FROM invoices;
      DELETE FROM sales;
      DELETE FROM customers;
      DELETE FROM products;
    `);

    console.log('All data cleared from database');
  }

  /**
   * Get database information
   */
  async getDatabaseInfo(): Promise<DatabaseInfo> {
    if (!this.db) throw new Error('Database not initialized');

    const productCount = await this.db.query('SELECT COUNT(*) as count FROM products');
    const customerCount = await this.db.query('SELECT COUNT(*) as count FROM customers');
    const saleCount = await this.db.query('SELECT COUNT(*) as count FROM sales');
    const invoiceCount = await this.db.query('SELECT COUNT(*) as count FROM invoices');
    const logCount = await this.db.query('SELECT COUNT(*) as count FROM sync_logs');

    const versionResult = await this.db.query('PRAGMA user_version;');
    const version = versionResult.values?.[0]?.user_version || 0;

    return {
      version,
      recordCounts: {
        products: productCount.values?.[0]?.count || 0,
        customers: customerCount.values?.[0]?.count || 0,
        sales: saleCount.values?.[0]?.count || 0,
        invoices: invoiceCount.values?.[0]?.count || 0,
        syncLogs: logCount.values?.[0]?.count || 0
      }
    };
  }

  // ============================================
  // PRODUCT OPERATIONS
  // ============================================

  async getProducts(activeOnly = true): Promise<LocalProduct[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = activeOnly
      ? 'SELECT * FROM products WHERE isActive = 1 ORDER BY name'
      : 'SELECT * FROM products ORDER BY name';

    const result = await this.db.query(query);
    return (result.values || []).map(this.mapProduct);
  }

  async getProductById(id: string): Promise<LocalProduct | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query('SELECT * FROM products WHERE id = ?', [id]);
    return result.values && result.values.length > 0 ? this.mapProduct(result.values[0]) : null;
  }

  async getProductByCode(code: string): Promise<LocalProduct | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query('SELECT * FROM products WHERE code = ?', [code]);
    return result.values && result.values.length > 0 ? this.mapProduct(result.values[0]) : null;
  }

  async searchProducts(searchTerm: string): Promise<LocalProduct[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      SELECT * FROM products
      WHERE isActive = 1 AND (
        name LIKE ? OR
        code LIKE ? OR
        barcode LIKE ? OR
        description LIKE ?
      )
      ORDER BY name
      LIMIT 50
    `;

    const term = `%${searchTerm}%`;
    const result = await this.db.query(query, [term, term, term, term]);
    return (result.values || []).map(this.mapProduct);
  }

  async saveProduct(product: LocalProduct): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT OR REPLACE INTO products (
        id, code, name, description, price, cost, stock, taxRate,
        category, barcode, imageUrl, isActive, createdAt, updatedAt, lastSyncedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(query, [
      product.id,
      product.code,
      product.name,
      product.description,
      product.price,
      product.cost,
      product.stock,
      product.taxRate,
      product.category,
      product.barcode,
      product.imageUrl,
      product.isActive ? 1 : 0,
      product.createdAt,
      product.updatedAt,
      product.lastSyncedAt
    ]);
  }

  async bulkSaveProducts(products: LocalProduct[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSet(products.map(product => ({
      statement: `
        INSERT OR REPLACE INTO products (
          id, code, name, description, price, cost, stock, taxRate,
          category, barcode, imageUrl, isActive, createdAt, updatedAt, lastSyncedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      values: [
        product.id,
        product.code,
        product.name,
        product.description,
        product.price,
        product.cost,
        product.stock,
        product.taxRate,
        product.category,
        product.barcode,
        product.imageUrl,
        product.isActive ? 1 : 0,
        product.createdAt,
        product.updatedAt,
        product.lastSyncedAt
      ]
    })));
  }

  async updateProductStock(productId: string, quantity: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(
      'UPDATE products SET stock = stock + ?, updatedAt = ? WHERE id = ?',
      [quantity, new Date().toISOString(), productId]
    );
  }

  // ============================================
  // CUSTOMER OPERATIONS
  // ============================================

  async getCustomers(activeOnly = true): Promise<LocalCustomer[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = activeOnly
      ? 'SELECT * FROM customers WHERE isActive = 1 ORDER BY name'
      : 'SELECT * FROM customers ORDER BY name';

    const result = await this.db.query(query);
    return (result.values || []).map(this.mapCustomer);
  }

  async getCustomerById(id: string): Promise<LocalCustomer | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query('SELECT * FROM customers WHERE id = ?', [id]);
    return result.values && result.values.length > 0 ? this.mapCustomer(result.values[0]) : null;
  }

  async searchCustomers(searchTerm: string): Promise<LocalCustomer[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      SELECT * FROM customers
      WHERE isActive = 1 AND (
        name LIKE ? OR
        documentNumber LIKE ? OR
        email LIKE ?
      )
      ORDER BY name
      LIMIT 50
    `;

    const term = `%${searchTerm}%`;
    const result = await this.db.query(query, [term, term, term]);
    return (result.values || []).map(this.mapCustomer);
  }

  async saveCustomer(customer: LocalCustomer): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT OR REPLACE INTO customers (
        id, name, documentType, documentNumber, customerType, email, phone,
        address, city, country, isActive, createdAt, updatedAt, lastSyncedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(query, [
      customer.id,
      customer.name,
      customer.documentType,
      customer.documentNumber,
      customer.customerType,
      customer.email,
      customer.phone,
      customer.address,
      customer.city,
      customer.country,
      customer.isActive ? 1 : 0,
      customer.createdAt,
      customer.updatedAt,
      customer.lastSyncedAt
    ]);
  }

  // ============================================
  // SALE OPERATIONS
  // ============================================

  async getSales(limit = 100, offset = 0): Promise<LocalSale[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query(
      'SELECT * FROM sales ORDER BY createdAt DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const sales = (result.values || []).map(this.mapSale);

    // Load items for each sale
    for (const sale of sales) {
      sale.items = await this.getSaleItems(sale.id);
    }

    return sales;
  }

  async getSaleById(id: string): Promise<LocalSale | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query('SELECT * FROM sales WHERE id = ? OR localId = ?', [id, id]);

    if (!result.values || result.values.length === 0) {
      return null;
    }

    const sale = this.mapSale(result.values[0]);
    sale.items = await this.getSaleItems(sale.id);

    return sale;
  }

  async getSalesByStatus(status: string): Promise<LocalSale[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query(
      'SELECT * FROM sales WHERE status = ? ORDER BY createdAt DESC',
      [status]
    );

    const sales = (result.values || []).map(this.mapSale);

    for (const sale of sales) {
      sale.items = await this.getSaleItems(sale.id);
    }

    return sales;
  }

  async getSalesBySyncStatus(syncStatus: string): Promise<LocalSale[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query(
      'SELECT * FROM sales WHERE syncStatus = ? ORDER BY createdAt DESC',
      [syncStatus]
    );

    const sales = (result.values || []).map(this.mapSale);

    for (const sale of sales) {
      sale.items = await this.getSaleItems(sale.id);
    }

    return sales;
  }

  async saveSale(sale: LocalSale): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Start transaction
    await this.db.execute('BEGIN TRANSACTION');

    try {
      // Insert or update sale
      const saleQuery = `
        INSERT OR REPLACE INTO sales (
          id, localId, saleNumber, customerId, customerName, customerDocument,
          subtotal, tax, discount, total, paymentMethod, paymentStatus, notes,
          status, syncStatus, syncAttempts, lastSyncAttempt, errorMessage,
          serverId, createdAt, updatedAt, createdBy
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await this.db.run(saleQuery, [
        sale.id,
        sale.localId,
        sale.saleNumber,
        sale.customerId,
        sale.customerName,
        sale.customerDocument,
        sale.subtotal,
        sale.tax,
        sale.discount,
        sale.total,
        sale.paymentMethod,
        sale.paymentStatus,
        sale.notes,
        sale.status,
        sale.syncStatus,
        sale.syncAttempts,
        sale.lastSyncAttempt,
        sale.errorMessage,
        sale.serverId,
        sale.createdAt,
        sale.updatedAt,
        sale.createdBy
      ]);

      // Delete existing items
      await this.db.run('DELETE FROM sale_items WHERE saleId = ?', [sale.id]);

      // Insert sale items
      for (const item of sale.items) {
        await this.saveSaleItem({ ...item, saleId: sale.id });
      }

      await this.db.execute('COMMIT');
    } catch (error) {
      await this.db.execute('ROLLBACK');
      throw error;
    }
  }

  private async getSaleItems(saleId: string): Promise<LocalSaleItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query(
      'SELECT * FROM sale_items WHERE saleId = ?',
      [saleId]
    );

    return (result.values || []).map(this.mapSaleItem);
  }

  private async saveSaleItem(item: LocalSaleItem): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT OR REPLACE INTO sale_items (
        id, saleId, productId, productName, productCode, quantity,
        unitPrice, subtotal, taxRate, taxAmount, discount, total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(query, [
      item.id,
      item.saleId,
      item.productId,
      item.productName,
      item.productCode,
      item.quantity,
      item.unitPrice,
      item.subtotal,
      item.taxRate,
      item.taxAmount,
      item.discount,
      item.total
    ]);
  }

  async updateSaleSyncStatus(
    saleId: string,
    syncStatus: string,
    errorMessage?: string,
    serverId?: string
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const updates: string[] = ['syncStatus = ?', 'updatedAt = ?'];
    const values: any[] = [syncStatus, new Date().toISOString()];

    if (syncStatus === 'syncing' || syncStatus === 'error') {
      updates.push('syncAttempts = syncAttempts + 1');
    }

    updates.push('lastSyncAttempt = ?');
    values.push(new Date().toISOString());

    if (errorMessage !== undefined) {
      updates.push('errorMessage = ?');
      values.push(errorMessage);
    }

    if (serverId !== undefined) {
      updates.push('serverId = ?');
      values.push(serverId);
    }

    values.push(saleId);

    const query = `UPDATE sales SET ${updates.join(', ')} WHERE id = ? OR localId = ?`;
    values.push(saleId);

    await this.db.run(query, values);
  }

  async deleteSale(saleId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Items will be deleted automatically due to CASCADE
    await this.db.run('DELETE FROM sales WHERE id = ? OR localId = ?', [saleId, saleId]);
  }

  // ============================================
  // SYNC LOG OPERATIONS
  // ============================================

  async addSyncLog(log: Omit<SyncLog, 'id' | 'timestamp'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO sync_logs (
        id, entityType, entityId, operation, status, direction,
        errorMessage, requestData, responseData, duration, timestamp, syncedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(query, [
      this.generateId(),
      log.entityType,
      log.entityId,
      log.operation,
      log.status,
      log.direction,
      log.errorMessage,
      log.requestData,
      log.responseData,
      log.duration,
      new Date().toISOString(),
      log.syncedAt
    ]);
  }

  async getSyncLogs(limit = 100): Promise<SyncLog[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query(
      'SELECT * FROM sync_logs ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );

    return (result.values || []).map(this.mapSyncLog);
  }

  async clearOldSyncLogs(daysToKeep = 30): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.db.run(
      'DELETE FROM sync_logs WHERE timestamp < ?',
      [cutoffDate.toISOString()]
    );

    return result.changes?.changes || 0;
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private mapProduct(row: any): LocalProduct {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      price: row.price,
      cost: row.cost,
      stock: row.stock,
      taxRate: row.taxRate,
      category: row.category,
      barcode: row.barcode,
      imageUrl: row.imageUrl,
      isActive: Boolean(row.isActive),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lastSyncedAt: row.lastSyncedAt
    };
  }

  private mapCustomer(row: any): LocalCustomer {
    return {
      id: row.id,
      name: row.name,
      documentType: row.documentType,
      documentNumber: row.documentNumber,
      customerType: row.customerType,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      country: row.country,
      isActive: Boolean(row.isActive),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lastSyncedAt: row.lastSyncedAt
    };
  }

  private mapSale(row: any): LocalSale {
    return {
      id: row.id,
      localId: row.localId,
      saleNumber: row.saleNumber,
      customerId: row.customerId,
      customerName: row.customerName,
      customerDocument: row.customerDocument,
      items: [], // Will be loaded separately
      subtotal: row.subtotal,
      tax: row.tax,
      discount: row.discount,
      total: row.total,
      paymentMethod: row.paymentMethod,
      paymentStatus: row.paymentStatus,
      notes: row.notes,
      status: row.status,
      syncStatus: row.syncStatus,
      syncAttempts: row.syncAttempts,
      lastSyncAttempt: row.lastSyncAttempt,
      errorMessage: row.errorMessage,
      serverId: row.serverId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      createdBy: row.createdBy
    };
  }

  private mapSaleItem(row: any): LocalSaleItem {
    return {
      id: row.id,
      saleId: row.saleId,
      productId: row.productId,
      productName: row.productName,
      productCode: row.productCode,
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      subtotal: row.subtotal,
      taxRate: row.taxRate,
      taxAmount: row.taxAmount,
      discount: row.discount,
      total: row.total
    };
  }

  private mapSyncLog(row: any): SyncLog {
    return {
      id: row.id,
      entityType: row.entityType,
      entityId: row.entityId,
      operation: row.operation,
      status: row.status,
      direction: row.direction,
      errorMessage: row.errorMessage,
      requestData: row.requestData,
      responseData: row.responseData,
      duration: row.duration,
      timestamp: row.timestamp,
      syncedAt: row.syncedAt
    };
  }
}
