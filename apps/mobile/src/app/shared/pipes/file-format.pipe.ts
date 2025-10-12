import { Pipe, PipeTransform } from '@angular/core';

/**
 * Unidades de tamaño de archivo
 */
type FileSizeUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB';

/**
 * Pipe para formatear tamaños de archivo
 * Convierte bytes a formato legible: B, KB, MB, GB, TB
 */
@Pipe({
  name: 'fileFormat',
  standalone: true,
})
export class FileFormatPipe implements PipeTransform {
  private readonly units: FileSizeUnit[] = ['B', 'KB', 'MB', 'GB', 'TB'];
  private readonly divisor = 1024;

  /**
   * Transforma bytes en formato legible
   * @param value - Tamaño en bytes
   * @param decimals - Número de decimales a mostrar (default: 2)
   * @param locale - Formato de número ('es' para español, 'en' para inglés)
   * @returns String formateado (ej: "1.5 MB")
   */
  transform(
    value: number | string | null | undefined,
    decimals = 2,
    locale: 'es' | 'en' = 'es'
  ): string {
    // Manejar valores nulos o undefined
    if (value === null || value === undefined || value === '') {
      return '0 B';
    }

    // Convertir a número si es string
    const bytes = typeof value === 'string' ? parseFloat(value) : value;

    // Validar que sea un número válido
    if (isNaN(bytes) || bytes < 0) {
      return '0 B';
    }

    // Si es 0, retornar directamente
    if (bytes === 0) {
      return '0 B';
    }

    // Calcular el índice de la unidad
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(this.divisor));

    // Limitar al máximo de unidades disponibles
    const safeUnitIndex = Math.min(unitIndex, this.units.length - 1);

    // Calcular el valor en la unidad correspondiente
    const size = bytes / Math.pow(this.divisor, safeUnitIndex);

    // Formatear el número según el locale
    const formattedSize = this.formatNumber(size, decimals, locale);

    // Retornar con la unidad
    return `${formattedSize} ${this.units[safeUnitIndex]}`;
  }

  /**
   * Formatea un número según el locale especificado
   * @param value - Valor numérico
   * @param decimals - Número de decimales
   * @param locale - Formato de número
   * @returns String formateado
   */
  private formatNumber(
    value: number,
    decimals: number,
    locale: 'es' | 'en'
  ): string {
    // Redondear al número de decimales especificado
    const rounded = value.toFixed(decimals);

    // Si el locale es español, usar coma como separador decimal
    if (locale === 'es') {
      return rounded.replace('.', ',');
    }

    return rounded;
  }

  /**
   * Método estático para convertir bytes a formato legible sin usar el pipe
   * @param bytes - Tamaño en bytes
   * @param decimals - Número de decimales (default: 2)
   * @returns String formateado
   */
  static formatBytes(bytes: number, decimals = 2): string {
    const pipe = new FileFormatPipe();
    return pipe.transform(bytes, decimals);
  }

  /**
   * Método estático para convertir formato legible a bytes
   * @param value - String formateado (ej: "1.5 MB")
   * @returns Número de bytes
   */
  static parseToBytes(value: string): number {
    // Extraer número y unidad
    const match = value.match(/^([\d.,]+)\s*([A-Z]+)$/i);

    if (!match) {
      return 0;
    }

    const [, numStr, unit] = match;
    const num = parseFloat(numStr.replace(',', '.'));
    const unitUpper = unit.toUpperCase() as FileSizeUnit;

    // Encontrar el índice de la unidad
    const units: FileSizeUnit[] = ['B', 'KB', 'MB', 'GB', 'TB'];
    const unitIndex = units.indexOf(unitUpper);

    if (unitIndex === -1) {
      return 0;
    }

    // Calcular bytes
    return num * Math.pow(1024, unitIndex);
  }
}
