/**
 * Helper de funciones para cálculo de impuestos en Paraguay
 * Soporta IVA (10%, 5%, Exento) y otros impuestos paraguayos
 */
export class TaxHelper {
  /**
   * Tasas de IVA en Paraguay
   */
  static readonly TAX_RATES = {
    IVA_10: 10, // IVA Tasa General
    IVA_5: 5, // IVA Tasa Reducida
    EXENTO: 0, // Exento de IVA
  } as const;

  /**
   * Tipos de IVA según SET Paraguay
   */
  static readonly IVA_TYPES = {
    GRAVADO_10: 1, // Gravado IVA 10%
    GRAVADO_5: 2, // Gravado IVA 5%
    EXENTO: 3, // Exento
    GRAVADO_PARCIAL: 4, // Gravado Parcial (mezcla 10% y 5%)
  } as const;

  /**
   * Calcula el IVA de un subtotal
   * @param subtotal - Subtotal sin IVA
   * @param taxRate - Tasa de IVA (default: 10)
   * @param decimals - Número de decimales (default: 0 para Guaraníes)
   * @returns Monto del IVA
   */
  static calculateIva(
    subtotal: number,
    taxRate: number = TaxHelper.TAX_RATES.IVA_10,
    decimals = 0
  ): number {
    if (isNaN(subtotal) || subtotal < 0) {
      return 0;
    }

    if (isNaN(taxRate) || taxRate < 0) {
      return 0;
    }

    const iva = subtotal * (taxRate / 100);
    return TaxHelper.round(iva, decimals);
  }

  /**
   * Calcula el total con IVA incluido
   * @param subtotal - Subtotal sin IVA
   * @param taxRate - Tasa de IVA (default: 10)
   * @param decimals - Número de decimales (default: 0)
   * @returns Total con IVA
   */
  static addIva(
    subtotal: number,
    taxRate: number = TaxHelper.TAX_RATES.IVA_10,
    decimals = 0
  ): number {
    if (isNaN(subtotal) || subtotal < 0) {
      return 0;
    }

    const iva = TaxHelper.calculateIva(subtotal, taxRate, decimals);
    return TaxHelper.round(subtotal + iva, decimals);
  }

  /**
   * Extrae el subtotal sin IVA de un total que incluye IVA
   * @param total - Total con IVA incluido
   * @param taxRate - Tasa de IVA (default: 10)
   * @param decimals - Número de decimales (default: 0)
   * @returns Subtotal sin IVA
   */
  static removeIva(
    total: number,
    taxRate: number = TaxHelper.TAX_RATES.IVA_10,
    decimals = 0
  ): number {
    if (isNaN(total) || total < 0) {
      return 0;
    }

    if (isNaN(taxRate) || taxRate < 0) {
      return total;
    }

    const subtotal = total / (1 + taxRate / 100);
    return TaxHelper.round(subtotal, decimals);
  }

  /**
   * Extrae el IVA de un total que incluye IVA
   * @param total - Total con IVA incluido
   * @param taxRate - Tasa de IVA (default: 10)
   * @param decimals - Número de decimales (default: 0)
   * @returns Monto del IVA
   */
  static extractIva(
    total: number,
    taxRate: number = TaxHelper.TAX_RATES.IVA_10,
    decimals = 0
  ): number {
    if (isNaN(total) || total < 0) {
      return 0;
    }

    const subtotal = TaxHelper.removeIva(total, taxRate, decimals);
    return TaxHelper.round(total - subtotal, decimals);
  }

  /**
   * Calcula el desglose completo de impuestos
   * @param subtotal - Subtotal sin IVA
   * @param taxRate - Tasa de IVA (default: 10)
   * @param decimals - Número de decimales (default: 0)
   * @returns Objeto con el desglose completo
   */
  static calculateTaxBreakdown(
    subtotal: number,
    taxRate: number = TaxHelper.TAX_RATES.IVA_10,
    decimals = 0
  ): {
    subtotal: number;
    iva: number;
    taxRate: number;
    total: number;
  } {
    if (isNaN(subtotal) || subtotal < 0) {
      return {
        subtotal: 0,
        iva: 0,
        taxRate: taxRate,
        total: 0,
      };
    }

    const iva = TaxHelper.calculateIva(subtotal, taxRate, decimals);
    const total = TaxHelper.round(subtotal + iva, decimals);

    return {
      subtotal: TaxHelper.round(subtotal, decimals),
      iva,
      taxRate,
      total,
    };
  }

  /**
   * Calcula el desglose de impuestos desde un total con IVA
   * @param total - Total con IVA incluido
   * @param taxRate - Tasa de IVA (default: 10)
   * @param decimals - Número de decimales (default: 0)
   * @returns Objeto con el desglose completo
   */
  static breakdownFromTotal(
    total: number,
    taxRate: number = TaxHelper.TAX_RATES.IVA_10,
    decimals = 0
  ): {
    subtotal: number;
    iva: number;
    taxRate: number;
    total: number;
  } {
    if (isNaN(total) || total < 0) {
      return {
        subtotal: 0,
        iva: 0,
        taxRate: taxRate,
        total: 0,
      };
    }

    const subtotal = TaxHelper.removeIva(total, taxRate, decimals);
    const iva = TaxHelper.round(total - subtotal, decimals);

    return {
      subtotal,
      iva,
      taxRate,
      total: TaxHelper.round(total, decimals),
    };
  }

  /**
   * Calcula impuestos para múltiples items con diferentes tasas
   * @param items - Array de items con subtotal y taxRate
   * @param decimals - Número de decimales (default: 0)
   * @returns Objeto con totales por tasa y total general
   */
  static calculateMultiRateTax(
    items: Array<{ subtotal: number; taxRate: number }>,
    decimals = 0
  ): {
    subtotalIva10: number;
    ivaIva10: number;
    subtotalIva5: number;
    ivaIva5: number;
    subtotalExento: number;
    totalSubtotal: number;
    totalIva: number;
    total: number;
  } {
    let subtotalIva10 = 0;
    let subtotalIva5 = 0;
    let subtotalExento = 0;

    items.forEach((item) => {
      if (item.taxRate === TaxHelper.TAX_RATES.IVA_10) {
        subtotalIva10 += item.subtotal;
      } else if (item.taxRate === TaxHelper.TAX_RATES.IVA_5) {
        subtotalIva5 += item.subtotal;
      } else if (item.taxRate === TaxHelper.TAX_RATES.EXENTO) {
        subtotalExento += item.subtotal;
      }
    });

    const ivaIva10 = TaxHelper.calculateIva(
      subtotalIva10,
      TaxHelper.TAX_RATES.IVA_10,
      decimals
    );
    const ivaIva5 = TaxHelper.calculateIva(
      subtotalIva5,
      TaxHelper.TAX_RATES.IVA_5,
      decimals
    );

    const totalSubtotal = subtotalIva10 + subtotalIva5 + subtotalExento;
    const totalIva = ivaIva10 + ivaIva5;
    const total = totalSubtotal + totalIva;

    return {
      subtotalIva10: TaxHelper.round(subtotalIva10, decimals),
      ivaIva10: TaxHelper.round(ivaIva10, decimals),
      subtotalIva5: TaxHelper.round(subtotalIva5, decimals),
      ivaIva5: TaxHelper.round(ivaIva5, decimals),
      subtotalExento: TaxHelper.round(subtotalExento, decimals),
      totalSubtotal: TaxHelper.round(totalSubtotal, decimals),
      totalIva: TaxHelper.round(totalIva, decimals),
      total: TaxHelper.round(total, decimals),
    };
  }

  /**
   * Valida si una tasa de IVA es válida en Paraguay
   * @param taxRate - Tasa a validar
   * @returns true si es válida (0, 5 o 10)
   */
  static isValidTaxRate(taxRate: number): boolean {
    return (
      taxRate === TaxHelper.TAX_RATES.IVA_10 ||
      taxRate === TaxHelper.TAX_RATES.IVA_5 ||
      taxRate === TaxHelper.TAX_RATES.EXENTO
    );
  }

  /**
   * Obtiene el tipo de IVA según SET para una tasa dada
   * @param taxRate - Tasa de IVA
   * @returns Código de tipo de IVA según SET
   */
  static getTaxType(taxRate: number): number {
    if (taxRate === TaxHelper.TAX_RATES.IVA_10) {
      return TaxHelper.IVA_TYPES.GRAVADO_10;
    } else if (taxRate === TaxHelper.TAX_RATES.IVA_5) {
      return TaxHelper.IVA_TYPES.GRAVADO_5;
    } else if (taxRate === TaxHelper.TAX_RATES.EXENTO) {
      return TaxHelper.IVA_TYPES.EXENTO;
    }
    return TaxHelper.IVA_TYPES.GRAVADO_10; // Default
  }

  /**
   * Calcula el precio unitario con IVA incluido
   * @param unitPrice - Precio unitario sin IVA
   * @param taxRate - Tasa de IVA (default: 10)
   * @param decimals - Número de decimales (default: 0)
   * @returns Precio unitario con IVA
   */
  static calculateUnitPriceWithTax(
    unitPrice: number,
    taxRate: number = TaxHelper.TAX_RATES.IVA_10,
    decimals = 0
  ): number {
    return TaxHelper.addIva(unitPrice, taxRate, decimals);
  }

  /**
   * Calcula el precio unitario sin IVA desde un precio con IVA
   * @param unitPriceWithTax - Precio unitario con IVA
   * @param taxRate - Tasa de IVA (default: 10)
   * @param decimals - Número de decimales (default: 0)
   * @returns Precio unitario sin IVA
   */
  static calculateUnitPriceWithoutTax(
    unitPriceWithTax: number,
    taxRate: number = TaxHelper.TAX_RATES.IVA_10,
    decimals = 0
  ): number {
    return TaxHelper.removeIva(unitPriceWithTax, taxRate, decimals);
  }

  /**
   * Calcula el subtotal e IVA para un item de línea
   * @param quantity - Cantidad
   * @param unitPrice - Precio unitario sin IVA
   * @param taxRate - Tasa de IVA (default: 10)
   * @param discount - Porcentaje de descuento (0-100)
   * @param decimals - Número de decimales (default: 0)
   * @returns Objeto con subtotal, IVA y total del item
   */
  static calculateLineItem(
    quantity: number,
    unitPrice: number,
    taxRate: number = TaxHelper.TAX_RATES.IVA_10,
    discount = 0,
    decimals = 0
  ): {
    subtotal: number;
    discount: number;
    subtotalAfterDiscount: number;
    iva: number;
    total: number;
  } {
    if (isNaN(quantity) || quantity < 0) {
      quantity = 0;
    }

    if (isNaN(unitPrice) || unitPrice < 0) {
      unitPrice = 0;
    }

    if (isNaN(discount) || discount < 0 || discount > 100) {
      discount = 0;
    }

    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discount / 100);
    const subtotalAfterDiscount = subtotal - discountAmount;
    const iva = TaxHelper.calculateIva(subtotalAfterDiscount, taxRate, decimals);
    const total = subtotalAfterDiscount + iva;

    return {
      subtotal: TaxHelper.round(subtotal, decimals),
      discount: TaxHelper.round(discountAmount, decimals),
      subtotalAfterDiscount: TaxHelper.round(subtotalAfterDiscount, decimals),
      iva: TaxHelper.round(iva, decimals),
      total: TaxHelper.round(total, decimals),
    };
  }

  /**
   * Calcula el porcentaje de IVA que representa sobre el total
   * @param iva - Monto del IVA
   * @param total - Total con IVA
   * @param decimals - Número de decimales (default: 2)
   * @returns Porcentaje de IVA sobre el total
   */
  static calculateTaxPercentageOfTotal(
    iva: number,
    total: number,
    decimals = 2
  ): number {
    if (isNaN(iva) || isNaN(total) || total === 0) {
      return 0;
    }

    const percentage = (iva / total) * 100;
    return TaxHelper.round(percentage, decimals);
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
   * Obtiene el nombre descriptivo de una tasa de IVA
   * @param taxRate - Tasa de IVA
   * @returns Nombre descriptivo
   */
  static getTaxRateName(taxRate: number): string {
    if (taxRate === TaxHelper.TAX_RATES.IVA_10) {
      return 'IVA 10%';
    } else if (taxRate === TaxHelper.TAX_RATES.IVA_5) {
      return 'IVA 5%';
    } else if (taxRate === TaxHelper.TAX_RATES.EXENTO) {
      return 'Exento';
    }
    return `IVA ${taxRate}%`;
  }

  /**
   * Valida si los cálculos de impuestos son correctos con tolerancia
   * @param subtotal - Subtotal sin IVA
   * @param iva - IVA calculado
   * @param total - Total con IVA
   * @param taxRate - Tasa de IVA
   * @param tolerance - Tolerancia de diferencia (default: 1 Gs.)
   * @returns true si los cálculos son correctos
   */
  static validateTaxCalculation(
    subtotal: number,
    iva: number,
    total: number,
    taxRate: number,
    tolerance = 1
  ): boolean {
    const expectedIva = TaxHelper.calculateIva(subtotal, taxRate);
    const expectedTotal = subtotal + iva;

    const ivaDiff = Math.abs(iva - expectedIva);
    const totalDiff = Math.abs(total - expectedTotal);

    return ivaDiff <= tolerance && totalDiff <= tolerance;
  }
}

/**
 * Ejemplos de uso:
 *
 * // Calcular IVA básico
 * const iva = TaxHelper.calculateIva(100000, 10); // 10000
 * const total = TaxHelper.addIva(100000, 10); // 110000
 *
 * // Extraer IVA de un total
 * const subtotal = TaxHelper.removeIva(110000, 10); // 100000
 * const ivaExtraido = TaxHelper.extractIva(110000, 10); // 10000
 *
 * // Calcular item de línea completo
 * const lineItem = TaxHelper.calculateLineItem(5, 10000, 10, 10);
 * // {
 * //   subtotal: 50000,
 * //   discount: 5000,
 * //   subtotalAfterDiscount: 45000,
 * //   iva: 4500,
 * //   total: 49500
 * // }
 *
 * // Calcular impuestos con tasas múltiples
 * const multiTax = TaxHelper.calculateMultiRateTax([
 *   { subtotal: 100000, taxRate: 10 },
 *   { subtotal: 50000, taxRate: 5 },
 *   { subtotal: 20000, taxRate: 0 }
 * ]);
 */
