import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}

  async set(key: string, value: any): Promise<void> {
    try {
      await Preferences.set({
        key,
        value: JSON.stringify(value)
      });
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const { value } = await Preferences.get({ key });
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error('Error removing from storage:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  async keys(): Promise<string[]> {
    try {
      const { keys } = await Preferences.keys();
      return keys;
    } catch (error) {
      console.error('Error getting keys from storage:', error);
      return [];
    }
  }

  // Specific methods for common operations
  async setAuthToken(token: string): Promise<void> {
    await this.set('auth_token', token);
  }

  async getAuthToken(): Promise<string | null> {
    return await this.get<string>('auth_token');
  }

  async removeAuthToken(): Promise<void> {
    await this.remove('auth_token');
  }

  async setPendingSales(sales: any[]): Promise<void> {
    await this.set('pending_sales', sales);
  }

  async getPendingSales(): Promise<any[]> {
    const sales = await this.get<any[]>('pending_sales');
    return sales || [];
  }
}
