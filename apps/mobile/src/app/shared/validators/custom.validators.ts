import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Colección de validadores personalizados para formularios reactivos
 */
export class CustomValidators {
  /**
   * Validador de cédula de identidad paraguaya (CI)
   * Formato: X.XXX.XXX
   * @returns ValidatorFn que valida el formato de CI
   */
  static ci(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      // Limpiar la CI (remover puntos)
      const cleanCi = value.replace(/\D/g, '');

      // Validar longitud (debe tener entre 6 y 8 dígitos)
      if (cleanCi.length < 6 || cleanCi.length > 8) {
        return {
          ciInvalid: {
            message: 'Cédula de Identidad debe tener entre 6 y 8 dígitos',
          },
        };
      }

      return null;
    };
  }

  /**
   * Validador de número de timbrado de SET
   * Formato: 8 dígitos
   * @returns ValidatorFn que valida el formato de timbrado
   */
  static timbrado(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      // Limpiar el timbrado
      const cleanTimbrado = value.replace(/\D/g, '');

      // Validar longitud (debe tener 8 dígitos)
      if (cleanTimbrado.length !== 8) {
        return {
          timbradoInvalid: {
            message: 'Timbrado debe tener 8 dígitos',
          },
        };
      }

      return null;
    };
  }

  /**
   * Validador de rango de fechas
   * @param minDate - Fecha mínima permitida
   * @param maxDate - Fecha máxima permitida
   * @returns ValidatorFn que valida el rango de fechas
   */
  static dateRange(minDate?: Date, maxDate?: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const date = new Date(value);

      // Validar que sea una fecha válida
      if (isNaN(date.getTime())) {
        return {
          dateInvalid: {
            message: 'Fecha inválida',
          },
        };
      }

      // Validar fecha mínima
      if (minDate && date < minDate) {
        return {
          dateMin: {
            message: `Fecha debe ser mayor o igual a ${minDate.toLocaleDateString()}`,
          },
        };
      }

      // Validar fecha máxima
      if (maxDate && date > maxDate) {
        return {
          dateMax: {
            message: `Fecha debe ser menor o igual a ${maxDate.toLocaleDateString()}`,
          },
        };
      }

      return null;
    };
  }

  /**
   * Validador de número positivo
   * @param allowZero - Si se permite el valor 0 (default: false)
   * @returns ValidatorFn que valida números positivos
   */
  static positiveNumber(allowZero = false): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value === null || value === undefined || value === '') {
        return null;
      }

      const num = parseFloat(value);

      if (isNaN(num)) {
        return {
          notANumber: {
            message: 'Debe ser un número válido',
          },
        };
      }

      if (allowZero && num < 0) {
        return {
          notPositive: {
            message: 'Debe ser un número mayor o igual a 0',
          },
        };
      }

      if (!allowZero && num <= 0) {
        return {
          notPositive: {
            message: 'Debe ser un número mayor a 0',
          },
        };
      }

      return null;
    };
  }

  /**
   * Validador de rango numérico
   * @param min - Valor mínimo (inclusive)
   * @param max - Valor máximo (inclusive)
   * @returns ValidatorFn que valida el rango numérico
   */
  static numberRange(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value === null || value === undefined || value === '') {
        return null;
      }

      const num = parseFloat(value);

      if (isNaN(num)) {
        return {
          notANumber: {
            message: 'Debe ser un número válido',
          },
        };
      }

      if (num < min) {
        return {
          numberMin: {
            message: `Debe ser mayor o igual a ${min}`,
          },
        };
      }

      if (num > max) {
        return {
          numberMax: {
            message: `Debe ser menor o igual a ${max}`,
          },
        };
      }

      return null;
    };
  }

  /**
   * Validador de contraseña segura
   * @param minLength - Longitud mínima (default: 8)
   * @returns ValidatorFn que valida contraseñas seguras
   */
  static securePassword(minLength = 8): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const errors: any = {};

      // Validar longitud mínima
      if (value.length < minLength) {
        errors.minLength = {
          message: `La contraseña debe tener al menos ${minLength} caracteres`,
        };
      }

      // Validar al menos una letra mayúscula
      if (!/[A-Z]/.test(value)) {
        errors.uppercase = {
          message: 'La contraseña debe contener al menos una letra mayúscula',
        };
      }

      // Validar al menos una letra minúscula
      if (!/[a-z]/.test(value)) {
        errors.lowercase = {
          message: 'La contraseña debe contener al menos una letra minúscula',
        };
      }

      // Validar al menos un número
      if (!/\d/.test(value)) {
        errors.number = {
          message: 'La contraseña debe contener al menos un número',
        };
      }

      // Validar al menos un carácter especial
      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
        errors.special = {
          message:
            'La contraseña debe contener al menos un carácter especial',
        };
      }

      return Object.keys(errors).length > 0
        ? { securePassword: errors }
        : null;
    };
  }

  /**
   * Validador de confirmación de contraseña
   * @param passwordField - Nombre del campo de contraseña a comparar
   * @returns ValidatorFn que valida que las contraseñas coincidan
   */
  static confirmPassword(passwordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const password = control.parent?.get(passwordField)?.value;

      if (password && value !== password) {
        return {
          confirmPassword: {
            message: 'Las contraseñas no coinciden',
          },
        };
      }

      return null;
    };
  }

  /**
   * Validador de porcentaje
   * @param allowZero - Si se permite 0% (default: true)
   * @param allowHundred - Si se permite 100% (default: true)
   * @returns ValidatorFn que valida porcentajes (0-100)
   */
  static percentage(
    allowZero = true,
    allowHundred = true
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value === null || value === undefined || value === '') {
        return null;
      }

      const num = parseFloat(value);

      if (isNaN(num)) {
        return {
          notANumber: {
            message: 'Debe ser un número válido',
          },
        };
      }

      const min = allowZero ? 0 : 0.01;
      const max = allowHundred ? 100 : 99.99;

      if (num < min) {
        return {
          percentageMin: {
            message: `Porcentaje debe ser mayor ${allowZero ? 'o igual ' : ''}a ${min}`,
          },
        };
      }

      if (num > max) {
        return {
          percentageMax: {
            message: `Porcentaje debe ser menor ${allowHundred ? 'o igual ' : ''}a ${max}`,
          },
        };
      }

      return null;
    };
  }

  /**
   * Validador de código de barras
   * Soporta EAN-13, EAN-8, UPC-A
   * @returns ValidatorFn que valida códigos de barras
   */
  static barcode(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      // Limpiar el código
      const cleanCode = value.replace(/\D/g, '');

      // Validar longitud (8 o 13 dígitos)
      if (cleanCode.length !== 8 && cleanCode.length !== 13) {
        return {
          barcodeInvalid: {
            message: 'Código de barras debe tener 8 o 13 dígitos',
          },
        };
      }

      // Validar dígito verificador
      if (!CustomValidators.validateBarcodeCheckDigit(cleanCode)) {
        return {
          barcodeInvalid: {
            message: 'Dígito verificador del código de barras inválido',
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida el dígito verificador de un código de barras
   * @param barcode - Código de barras limpio
   * @returns true si es válido, false si no
   */
  private static validateBarcodeCheckDigit(barcode: string): boolean {
    const digits = barcode.split('').map((d) => parseInt(d, 10));
    const checkDigit = digits.pop()!;

    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      // Multiplicar por 3 los dígitos en posiciones impares (contando desde la derecha)
      const multiplier = i % 2 === 0 ? 1 : 3;
      sum += digits[i] * multiplier;
    }

    const calculatedCheckDigit = (10 - (sum % 10)) % 10;
    return calculatedCheckDigit === checkDigit;
  }

  /**
   * Validador de CDC (Código de Control) de facturas electrónicas SET
   * El CDC debe tener 44 dígitos numéricos
   * @returns ValidatorFn que valida el formato de CDC
   */
  static cdc(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      // Limpiar el CDC (remover guiones y espacios)
      const cleanCdc = value.replace(/[\s-]/g, '');

      // Validar longitud (debe tener 44 dígitos)
      if (cleanCdc.length !== 44) {
        return {
          cdcInvalid: {
            message: 'CDC debe tener 44 dígitos',
          },
        };
      }

      // Validar que solo contenga dígitos
      if (!/^\d{44}$/.test(cleanCdc)) {
        return {
          cdcInvalid: {
            message: 'CDC debe contener solo números',
          },
        };
      }

      return null;
    };
  }

  /**
   * Validador de número de factura paraguayo
   * Formato: XXX-XXX-XXXXXXX (Establecimiento-PuntoExpedicion-NumeroFactura)
   * @returns ValidatorFn que valida el formato de número de factura
   */
  static invoiceNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      // Validar formato con regex
      const regex = /^(\d{3})-(\d{3})-(\d{7})$/;
      if (!regex.test(value)) {
        return {
          invoiceNumberInvalid: {
            message: 'Número de factura debe tener formato XXX-XXX-XXXXXXX',
          },
        };
      }

      return null;
    };
  }

  /**
   * Validador estático para CDC sin usar formularios
   * @param cdc - CDC a validar
   * @returns true si es válido, false si no
   */
  static isValidCDC(cdc: string): boolean {
    if (!cdc) {
      return false;
    }

    const cleanCdc = cdc.replace(/[\s-]/g, '');
    return /^\d{44}$/.test(cleanCdc);
  }

  /**
   * Validador estático para número de factura sin usar formularios
   * @param invoiceNumber - Número de factura a validar
   * @returns true si es válido, false si no
   */
  static isValidInvoiceNumber(invoiceNumber: string): boolean {
    if (!invoiceNumber) {
      return false;
    }

    return /^(\d{3})-(\d{3})-(\d{7})$/.test(invoiceNumber);
  }
}
