import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para validar y formatear RUC paraguayo
 * Formato: XXXXXXX-X (7 dígitos + guión + 1 dígito verificador)
 */
@Pipe({
  name: 'rucValidator',
  standalone: true,
})
export class RucValidatorPipe implements PipeTransform {
  /**
   * Valida y formatea un RUC paraguayo
   * @param value - RUC a validar/formatear
   * @param mode - 'validate' (retorna boolean) o 'format' (retorna string formateado)
   * @returns Boolean si mode='validate', string formateado si mode='format'
   */
  transform(
    value: string | null | undefined,
    mode: 'validate' | 'format' = 'format'
  ): boolean | string {
    if (!value) {
      return mode === 'validate' ? false : '';
    }

    // Limpiar el RUC (remover espacios, guiones, etc.)
    const cleanRuc = value.replace(/\D/g, '');

    // Validar longitud (debe tener 8 dígitos en total)
    if (cleanRuc.length !== 8) {
      return mode === 'validate' ? false : value;
    }

    // Extraer base y dígito verificador
    const base = cleanRuc.substring(0, 7);
    const verifier = parseInt(cleanRuc.substring(7, 8), 10);

    // Calcular dígito verificador
    const calculatedVerifier = this.calculateVerifier(base);

    // Verificar si el dígito verificador es correcto
    const isValid = calculatedVerifier === verifier;

    if (mode === 'validate') {
      return isValid;
    }

    // Formatear si es válido
    if (isValid) {
      return `${base}-${verifier}`;
    }

    return value;
  }

  /**
   * Calcula el dígito verificador del RUC paraguayo
   * Algoritmo: módulo 11 con serie base 2-9
   * @param base - Los primeros 7 dígitos del RUC
   * @returns Dígito verificador calculado
   */
  private calculateVerifier(base: string): number {
    // Serie base para el cálculo (de derecha a izquierda)
    const baseFactors = [2, 3, 4, 5, 6, 7, 2];

    // Calcular suma ponderada
    let sum = 0;
    for (let i = 0; i < 7; i++) {
      const digit = parseInt(base[i], 10);
      sum += digit * baseFactors[i];
    }

    // Calcular módulo 11
    const mod = sum % 11;

    // El dígito verificador es 11 - módulo
    // Si el resultado es 11, el dígito verificador es 0
    // Si el resultado es 10, el dígito verificador es 1
    const verifier = 11 - mod;

    if (verifier === 11) {
      return 0;
    } else if (verifier === 10) {
      return 1;
    }

    return verifier;
  }

  /**
   * Método estático para validar RUC sin usar el pipe
   * @param ruc - RUC a validar
   * @returns true si es válido, false si no
   */
  static isValidRuc(ruc: string): boolean {
    const pipe = new RucValidatorPipe();
    return pipe.transform(ruc, 'validate') as boolean;
  }

  /**
   * Método estático para formatear RUC sin usar el pipe
   * @param ruc - RUC a formatear
   * @returns RUC formateado
   */
  static formatRuc(ruc: string): string {
    const pipe = new RucValidatorPipe();
    return pipe.transform(ruc, 'format') as string;
  }
}
