/**
 * Models Index
 * Export all models from a single entry point for easier imports
 *
 * Usage:
 * import { User, Customer, Product, Sale } from '@app/models';
 */

// Core business models
export * from './user.model';
export * from './customer.model';
export * from './product.model';
export * from './sale.model';
export * from './invoice.model';
export * from './payment.model';
export * from './category.model';

// Offline-specific models
export * from './offline-sale.model';
