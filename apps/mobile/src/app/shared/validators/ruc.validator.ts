import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador de RUC paraguayo para formularios reactivos
 * Formato: XXXXXXX-X (7 dígitos + guión + 1 dígito verificador)
 */
export class RucValidator {
  /**
   * Validador de RUC paraguayo
   * @returns ValidatorFn que valida el formato y dígito verificador del RUC
   */
  static validate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      // Si no hay valor, no validar (usar Validators.required para campo obligatorio)
      if (!value) {
        return null;
      }

      // Limpiar el RUC (remover espacios, guiones, etc.)
      const cleanRuc = value.replace(/\D/g, '');

      // Validar longitud (debe tener 8 dígitos en total)
      if (cleanRuc.length !== 8) {
        return { rucInvalid: { message: 'RUC debe tener 8 dígitos' } };
      }

      // Extraer base y dígito verificador
      const base = cleanRuc.substring(0, 7);
      const verifier = parseInt(cleanRuc.substring(7, 8), 10);

      // Calcular dígito verificador
      const calculatedVerifier = RucValidator.calculateVerifier(base);

      // Verificar si el dígito verificador es correcto
      if (calculatedVerifier !== verifier) {
        return {
          rucInvalid: { message: 'Dígito verificador del RUC inválido' },
        };
      }

      return null;
    };
  }

  /**
   * Calcula el dígito verificador del RUC paraguayo
   * Algoritmo: módulo 11 con serie base 2-9
   * @param base - Los primeros 7 dígitos del RUC
   * @returns Dígito verificador calculado
   */
  private static calculateVerifier(base: string): number {
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
   * Valida un RUC sin usar el formulario reactivo
   * @param ruc - RUC a validar
   * @returns true si es válido, false si no
   */
  static isValid(ruc: string): boolean {
    if (!ruc) {
      return false;
    }

    const cleanRuc = ruc.replace(/\D/g, '');

    if (cleanRuc.length !== 8) {
      return false;
    }

    const base = cleanRuc.substring(0, 7);
    const verifier = parseInt(cleanRuc.substring(7, 8), 10);
    const calculatedVerifier = RucValidator.calculateVerifier(base);

    return calculatedVerifier === verifier;
  }

  /**
   * Formatea un RUC al formato estándar XXXXXXX-X
   * @param ruc - RUC a formatear
   * @returns RUC formateado o string vacío si es inválido
   */
  static format(ruc: string): string {
    if (!ruc) {
      return '';
    }

    const cleanRuc = ruc.replace(/\D/g, '');

    if (cleanRuc.length !== 8) {
      return ruc;
    }

    const base = cleanRuc.substring(0, 7);
    const verifier = cleanRuc.substring(7, 8);

    return `${base}-${verifier}`;
  }
}
