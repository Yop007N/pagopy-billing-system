/**
 * Helper de funciones para manejo de Storage
 * Proporciona funciones de utilidad para serialización, validación y manejo de errores
 */
export class StorageHelper {
  /**
   * Serializa un objeto a JSON de forma segura
   * @param data - Objeto a serializar
   * @returns String JSON o null si hay error
   */
  static serialize<T>(data: T): string | null {
    try {
      return JSON.stringify(data);
    } catch (error) {
      console.error('Error serializing data:', error);
      return null;
    }
  }

  /**
   * Deserializa un string JSON de forma segura
   * @param json - String JSON a deserializar
   * @returns Objeto deserializado o null si hay error
   */
  static deserialize<T>(json: string): T | null {
    try {
      return JSON.parse(json);
    } catch (error) {
      console.error('Error deserializing data:', error);
      return null;
    }
  }

  /**
   * Valida si un string es JSON válido
   * @param json - String a validar
   * @returns true si es JSON válido
   */
  static isValidJSON(json: string): boolean {
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Calcula el tamaño aproximado en bytes de un objeto serializado
   * @param data - Objeto a medir
   * @returns Tamaño en bytes
   */
  static getSize(data: any): number {
    const json = StorageHelper.serialize(data);
    if (!json) {
      return 0;
    }
    // Aproximación: cada carácter = 2 bytes en UTF-16
    return json.length * 2;
  }

  /**
   * Formatea el tamaño de storage en formato legible
   * @param bytes - Tamaño en bytes
   * @returns String formateado (ej: "1.5 KB")
   */
  static formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
  }

  /**
   * Genera una clave de storage con prefijo
   * @param prefix - Prefijo de la clave
   * @param key - Clave base
   * @returns Clave completa
   */
  static generateKey(prefix: string, key: string): string {
    return `${prefix}:${key}`;
  }

  /**
   * Extrae el prefijo de una clave de storage
   * @param key - Clave completa
   * @returns Prefijo o null si no tiene
   */
  static extractPrefix(key: string): string | null {
    const parts = key.split(':');
    return parts.length > 1 ? parts[0] : null;
  }

  /**
   * Extrae la clave base (sin prefijo) de una clave de storage
   * @param key - Clave completa
   * @returns Clave base
   */
  static extractBaseKey(key: string): string {
    const parts = key.split(':');
    return parts.length > 1 ? parts.slice(1).join(':') : key;
  }

  /**
   * Valida si una clave tiene un prefijo específico
   * @param key - Clave a validar
   * @param prefix - Prefijo esperado
   * @returns true si la clave tiene el prefijo
   */
  static hasPrefix(key: string, prefix: string): boolean {
    return key.startsWith(`${prefix}:`);
  }

  /**
   * Filtra un array de claves por prefijo
   * @param keys - Array de claves
   * @param prefix - Prefijo a filtrar
   * @returns Array de claves filtradas
   */
  static filterByPrefix(keys: string[], prefix: string): string[] {
    return keys.filter((key) => StorageHelper.hasPrefix(key, prefix));
  }

  /**
   * Crea un objeto de metadatos para storage
   * @param data - Datos a almacenar
   * @returns Objeto con metadatos
   */
  static createMetadata<T>(data: T): {
    data: T;
    timestamp: number;
    version: string;
  } {
    return {
      data,
      timestamp: Date.now(),
      version: '1.0',
    };
  }

  /**
   * Valida si los metadatos están expirados
   * @param metadata - Objeto con metadatos
   * @param expirationMs - Tiempo de expiración en milisegundos
   * @returns true si está expirado
   */
  static isExpired(
    metadata: { timestamp: number },
    expirationMs: number
  ): boolean {
    const now = Date.now();
    return now - metadata.timestamp > expirationMs;
  }

  /**
   * Extrae los datos de un objeto con metadatos
   * @param metadata - Objeto con metadatos
   * @returns Datos sin metadatos
   */
  static extractData<T>(metadata: { data: T }): T {
    return metadata.data;
  }

  /**
   * Comprime un string usando codificación base64
   * @param data - String a comprimir
   * @returns String comprimido
   */
  static compress(data: string): string {
    try {
      return btoa(encodeURIComponent(data));
    } catch (error) {
      console.error('Error compressing data:', error);
      return data;
    }
  }

  /**
   * Descomprime un string codificado en base64
   * @param compressed - String comprimido
   * @returns String descomprimido
   */
  static decompress(compressed: string): string {
    try {
      return decodeURIComponent(atob(compressed));
    } catch (error) {
      console.error('Error decompressing data:', error);
      return compressed;
    }
  }

  /**
   * Encripta un string usando una clave simple (XOR)
   * NOTA: Esta es una encriptación básica, no segura para datos sensibles
   * @param data - String a encriptar
   * @param key - Clave de encriptación
   * @returns String encriptado
   */
  static encrypt(data: string, key: string): string {
    try {
      let result = '';
      for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(
          data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return btoa(result);
    } catch (error) {
      console.error('Error encrypting data:', error);
      return data;
    }
  }

  /**
   * Desencripta un string encriptado con encrypt()
   * @param encrypted - String encriptado
   * @param key - Clave de encriptación
   * @returns String desencriptado
   */
  static decrypt(encrypted: string, key: string): string {
    try {
      const data = atob(encrypted);
      let result = '';
      for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(
          data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return result;
    } catch (error) {
      console.error('Error decrypting data:', error);
      return encrypted;
    }
  }

  /**
   * Crea un hash simple de un string (para validación de integridad)
   * @param data - String a hashear
   * @returns Hash numérico
   */
  static hash(data: string): number {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convertir a entero de 32 bits
    }
    return hash;
  }

  /**
   * Valida la integridad de datos usando hash
   * @param data - Datos a validar
   * @param expectedHash - Hash esperado
   * @returns true si el hash coincide
   */
  static validateIntegrity(data: string, expectedHash: number): boolean {
    return StorageHelper.hash(data) === expectedHash;
  }

  /**
   * Crea un backup de datos en formato exportable
   * @param data - Datos a respaldar
   * @param metadata - Metadatos adicionales
   * @returns Objeto de backup
   */
  static createBackup<T>(
    data: T,
    metadata?: Record<string, any>
  ): {
    version: string;
    timestamp: number;
    data: T;
    metadata?: Record<string, any>;
  } {
    return {
      version: '1.0',
      timestamp: Date.now(),
      data,
      metadata,
    };
  }

  /**
   * Restaura datos desde un backup
   * @param backup - Objeto de backup
   * @returns Datos restaurados o null si hay error
   */
  static restoreBackup<T>(backup: {
    version: string;
    timestamp: number;
    data: T;
  }): T | null {
    try {
      if (!backup.version || !backup.timestamp || !backup.data) {
        return null;
      }
      return backup.data;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return null;
    }
  }

  /**
   * Limpia caracteres especiales de una clave de storage
   * @param key - Clave a limpiar
   * @returns Clave limpia
   */
  static sanitizeKey(key: string): string {
    return key.replace(/[^a-zA-Z0-9:_-]/g, '_');
  }

  /**
   * Valida si una clave de storage es válida
   * @param key - Clave a validar
   * @returns true si es válida
   */
  static isValidKey(key: string): boolean {
    return (
      key.length > 0 &&
      key.length <= 255 &&
      /^[a-zA-Z0-9:_-]+$/.test(key)
    );
  }

  /**
   * Convierte un objeto a un formato plano (flatten)
   * @param obj - Objeto a aplanar
   * @param prefix - Prefijo para las claves
   * @returns Objeto plano
   */
  static flatten(
    obj: any,
    prefix = ''
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(result, StorageHelper.flatten(obj[key], newKey));
        } else {
          result[newKey] = obj[key];
        }
      }
    }

    return result;
  }

  /**
   * Convierte un objeto plano de vuelta a objeto anidado (unflatten)
   * @param obj - Objeto plano
   * @returns Objeto anidado
   */
  static unflatten(obj: Record<string, any>): any {
    const result: any = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const keys = key.split('.');
        let current = result;

        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];

          if (i === keys.length - 1) {
            current[k] = obj[key];
          } else {
            current[k] = current[k] || {};
            current = current[k];
          }
        }
      }
    }

    return result;
  }
}
