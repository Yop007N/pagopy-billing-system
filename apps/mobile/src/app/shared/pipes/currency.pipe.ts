import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para formatear moneda paraguaya (Guaraníes)
 * Formato: Gs. X.XXX.XXX
 */
@Pipe({
  name: 'currency',
  standalone: true,
})
export class CurrencyPipe implements PipeTransform {
  /**
   * Transforma un número en formato de moneda paraguaya
   * @param value - Valor numérico a formatear
   * @param showSymbol - Si se debe mostrar el símbolo "Gs." (default: true)
   * @param decimals - Número de decimales a mostrar (default: 0)
   * @returns String formateado como moneda paraguaya
   */
  transform(
    value: number | string | null | undefined,
    showSymbol = true,
    decimals = 0
  ): string {
    // Manejar valores nulos o undefined
    if (value === null || value === undefined || value === '') {
      return showSymbol ? 'Gs. 0' : '0';
    }

    // Convertir a número si es string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    // Validar que sea un número válido
    if (isNaN(numValue)) {
      return showSymbol ? 'Gs. 0' : '0';
    }

    // Formatear el número con separadores de miles
    const formatted = this.formatNumber(numValue, decimals);

    // Retornar con o sin símbolo
    return showSymbol ? `Gs. ${formatted}` : formatted;
  }

  /**
   * Formatea un número con separadores de miles y decimales
   * @param value - Valor numérico
   * @param decimals - Número de decimales
   * @returns String formateado
   */
  private formatNumber(value: number, decimals: number): string {
    // Redondear al número de decimales especificado
    const rounded = value.toFixed(decimals);
    const [integerPart, decimalPart] = rounded.split('.');

    // Agregar separadores de miles (punto como separador)
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Retornar con o sin parte decimal
    if (decimals > 0 && decimalPart) {
      return `${formattedInteger},${decimalPart}`;
    }

    return formattedInteger;
  }
}
