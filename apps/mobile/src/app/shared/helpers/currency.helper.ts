/**
 * Helper de funciones para manejo de moneda paraguaya (Guaraníes)
 */
export class CurrencyHelper {
  /**
   * Formatea un número como moneda paraguaya
   * @param value - Valor numérico
   * @param showSymbol - Si se debe mostrar el símbolo "Gs." (default: true)
   * @param decimals - Número de decimales (default: 0)
   * @returns String formateado como moneda
   */
  static format(
    value: number,
    showSymbol = true,
    decimals = 0
  ): string {
    if (value === null || value === undefined || isNaN(value)) {
      return showSymbol ? 'Gs. 0' : '0';
    }

    const formatted = CurrencyHelper.formatNumber(value, decimals);
    return showSymbol ? `Gs. ${formatted}` : formatted;
  }

  /**
   * Formatea un número con separadores de miles y decimales
   * @param value - Valor numérico
   * @param decimals - Número de decimales
   * @returns String formateado
   */
  private static formatNumber(value: number, decimals: number): string {
    const rounded = value.toFixed(decimals);
    const [integerPart, decimalPart] = rounded.split('.');

    // Agregar separadores de miles (punto como separador)
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    if (decimals > 0 && decimalPart) {
      return `${formattedInteger},${decimalPart}`;
    }

    return formattedInteger;
  }

  /**
   * Parsea un string de moneda a número
   * @param value - String con formato de moneda
   * @returns Número parseado
   */
  static parse(value: string): number {
    if (!value) {
      return 0;
    }

    // Remover símbolo de moneda y espacios
    let cleaned = value.replace(/Gs\.?/gi, '').trim();

    // Remover separadores de miles (puntos)
    cleaned = cleaned.replace(/\./g, '');

    // Reemplazar coma decimal por punto
    cleaned = cleaned.replace(',', '.');

    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Valida si un string es un formato de moneda válido
   * @param value - String a validar
   * @returns true si es válido, false si no
   */
  static isValid(value: string): boolean {
    if (!value) {
      return false;
    }

    const num = CurrencyHelper.parse(value);
    return !isNaN(num) && num >= 0;
  }

  /**
   * Suma dos valores de moneda con precisión
   * @param values - Valores a sumar
   * @returns Suma total
   */
  static add(...values: number[]): number {
    return values.reduce((acc, val) => {
      if (isNaN(val)) {
        return acc;
      }
      // Multiplicar por 100 para evitar problemas de precisión con decimales
      return acc + val;
    }, 0);
  }

  /**
   * Resta dos valores de moneda con precisión
   * @param minuend - Valor del cual se resta
   * @param subtrahend - Valor a restar
   * @returns Diferencia
   */
  static subtract(minuend: number, subtrahend: number): number {
    if (isNaN(minuend) || isNaN(subtrahend)) {
      return 0;
    }
    return minuend - subtrahend;
  }

  /**
   * Multiplica un valor por un factor
   * @param value - Valor base
   * @param factor - Factor multiplicador
   * @param decimals - Número de decimales en el resultado (default: 0)
   * @returns Producto
   */
  static multiply(
    value: number,
    factor: number,
    decimals = 0
  ): number {
    if (isNaN(value) || isNaN(factor)) {
      return 0;
    }

    const result = value * factor;
    return CurrencyHelper.round(result, decimals);
  }

  /**
   * Divide un valor por un divisor
   * @param value - Valor a dividir
   * @param divisor - Divisor
   * @param decimals - Número de decimales en el resultado (default: 0)
   * @returns Cociente
   */
  static divide(value: number, divisor: number, decimals = 0): number {
    if (isNaN(value) || isNaN(divisor) || divisor === 0) {
      return 0;
    }

    const result = value / divisor;
    return CurrencyHelper.round(result, decimals);
  }

  /**
   * Redondea un valor al número de decimales especificado
   * @param value - Valor a redondear
   * @param decimals - Número de decimales (default: 0)
   * @returns Valor redondeado
   */
  static round(value: number, decimals = 0): number {
    if (isNaN(value)) {
      return 0;
    }

    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  /**
   * Calcula el porcentaje de un valor
   * @param total - Valor total
   * @param percentage - Porcentaje a calcular (0-100)
   * @param decimals - Número de decimales en el resultado (default: 0)
   * @returns Valor del porcentaje
   */
  static percentage(
    total: number,
    percentage: number,
    decimals = 0
  ): number {
    if (isNaN(total) || isNaN(percentage)) {
      return 0;
    }

    return CurrencyHelper.multiply(total, percentage / 100, decimals);
  }

  /**
   * Calcula el subtotal sin IVA (IVA 10% en Paraguay)
   * @param total - Valor total con IVA
   * @param taxRate - Tasa de IVA (default: 10)
   * @param decimals - Número de decimales en el resultado (default: 0)
   * @returns Subtotal sin IVA
   */
  static removeIva(
    total: number,
    taxRate = 10,
    decimals = 0
  ): number {
    if (isNaN(total)) {
      return 0;
    }

    const subtotal = total / (1 + taxRate / 100);
    return CurrencyHelper.round(subtotal, decimals);
  }

  /**
   * Calcula el IVA de un subtotal (IVA 10% en Paraguay)
   * @param subtotal - Subtotal sin IVA
   * @param taxRate - Tasa de IVA (default: 10)
   * @param decimals - Número de decimales en el resultado (default: 0)
   * @returns Valor del IVA
   */
  static calculateIva(
    subtotal: number,
    taxRate = 10,
    decimals = 0
  ): number {
    return CurrencyHelper.percentage(subtotal, taxRate, decimals);
  }

  /**
   * Calcula el total con IVA incluido
   * @param subtotal - Subtotal sin IVA
   * @param taxRate - Tasa de IVA (default: 10)
   * @param decimals - Número de decimales en el resultado (default: 0)
   * @returns Total con IVA
   */
  static addIva(
    subtotal: number,
    taxRate = 10,
    decimals = 0
  ): number {
    if (isNaN(subtotal)) {
      return 0;
    }

    const iva = CurrencyHelper.calculateIva(subtotal, taxRate, decimals);
    return CurrencyHelper.add(subtotal, iva);
  }

  /**
   * Compara dos valores de moneda con tolerancia para errores de precisión
   * @param value1 - Primer valor
   * @param value2 - Segundo valor
   * @param tolerance - Tolerancia de diferencia (default: 0.01)
   * @returns true si son iguales dentro de la tolerancia
   */
  static equals(
    value1: number,
    value2: number,
    tolerance = 0.01
  ): boolean {
    if (isNaN(value1) || isNaN(value2)) {
      return false;
    }

    return Math.abs(value1 - value2) <= tolerance;
  }

  /**
   * Convierte un valor de dólares a guaraníes
   * @param dollars - Valor en dólares
   * @param exchangeRate - Tasa de cambio (Gs. por USD)
   * @param decimals - Número de decimales (default: 0)
   * @returns Valor en guaraníes
   */
  static usdToGs(
    dollars: number,
    exchangeRate: number,
    decimals = 0
  ): number {
    return CurrencyHelper.multiply(dollars, exchangeRate, decimals);
  }

  /**
   * Convierte un valor de guaraníes a dólares
   * @param guaranies - Valor en guaraníes
   * @param exchangeRate - Tasa de cambio (Gs. por USD)
   * @param decimals - Número de decimales (default: 2)
   * @returns Valor en dólares
   */
  static gsToUsd(
    guaranies: number,
    exchangeRate: number,
    decimals = 2
  ): number {
    return CurrencyHelper.divide(guaranies, exchangeRate, decimals);
  }

  /**
   * Formatea un rango de precios
   * @param min - Precio mínimo
   * @param max - Precio máximo
   * @param showSymbol - Si se debe mostrar el símbolo (default: true)
   * @returns String formateado con el rango
   */
  static formatRange(
    min: number,
    max: number,
    showSymbol = true
  ): string {
    const formattedMin = CurrencyHelper.format(min, showSymbol);
    const formattedMax = CurrencyHelper.format(max, false);

    return showSymbol ? `${formattedMin} - ${formattedMax}` : formattedMin;
  }
}
