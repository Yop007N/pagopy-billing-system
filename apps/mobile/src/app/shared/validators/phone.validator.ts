import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Tipos de teléfono paraguayo
 */
export type PhoneType = 'mobile' | 'landline' | 'any';

/**
 * Validador de teléfono paraguayo para formularios reactivos
 * Formatos válidos:
 * - Móvil: 09XX-XXXXXX (09 + 2 dígitos de operadora + 6 dígitos)
 * - Fijo: 0XX-XXXXXX (código de área + número)
 */
export class PhoneValidator {
  // Prefijos válidos para móviles en Paraguay
  private static readonly MOBILE_PREFIXES = [
    '0961', // Tigo
    '0962', // Personal
    '0963', // Claro
    '0964', // Tigo
    '0965', // Personal
    '0966', // Claro
    '0967', // Vox (Copaco)
    '0968', // Tigo
    '0969', // Personal
    '0971', // Tigo
    '0972', // Personal
    '0973', // Claro
    '0974', // Tigo
    '0975', // Personal
    '0976', // Claro
    '0977', // Vox (Copaco)
    '0978', // Tigo
    '0979', // Personal
    '0981', // Tigo
    '0982', // Personal
    '0983', // Claro
    '0984', // Tigo
    '0985', // Personal
    '0986', // Claro
    '0991', // Tigo
    '0992', // Personal
    '0994', // Tigo
    '0995', // Personal
  ];

  // Códigos de área válidos para líneas fijas
  private static readonly LANDLINE_AREA_CODES = [
    '021', // Asunción
    '024', // Caaguazú
    '025', // Pedro Juan Caballero
    '027', // Concepción
    '031', // Coronel Oviedo
    '032', // Villarrica
    '033', // Caazapá
    '036', // Encarnación
    '038', // Pilar
    '039', // Ciudad del Este
    '041', // San Juan Bautista
    '042', // San Ignacio
    '043', // Ayolas
    '044', // Villa Florida
    '045', // Salto del Guairá
    '046', // Bella Vista
    '047', // Fuerte Olimpo
    '048', // Mariscal Estigarribia
    '049', // Filadelfia
    '051', // San Estanislao
    '052', // Horqueta
    '053', // San Pedro
    '054', // San Lorenzo
    '061', // Paraguarí
    '071', // Itauguá
    '081', // Areguá
    '0210', // Fernando de la Mora
    '0220', // Lambaré
    '0228', // Luque
  ];

  /**
   * Validador de teléfono paraguayo
   * @param phoneType - Tipo de teléfono a validar ('mobile', 'landline', 'any')
   * @returns ValidatorFn que valida el formato del teléfono
   */
  static validate(phoneType: PhoneType = 'any'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      // Si no hay valor, no validar (usar Validators.required para campo obligatorio)
      if (!value) {
        return null;
      }

      // Limpiar el teléfono (remover espacios, guiones, paréntesis, etc.)
      const cleanPhone = value.replace(/\D/g, '');

      // Validar según el tipo
      switch (phoneType) {
        case 'mobile':
          return PhoneValidator.validateMobile(cleanPhone);
        case 'landline':
          return PhoneValidator.validateLandline(cleanPhone);
        case 'any': {
          // Intentar validar como móvil primero, luego como fijo
          const mobileError = PhoneValidator.validateMobile(cleanPhone);
          if (!mobileError) {
            return null;
          }
          const landlineError = PhoneValidator.validateLandline(cleanPhone);
          if (!landlineError) {
            return null;
          }
          return {
            phoneInvalid: {
              message: 'Número de teléfono inválido',
            },
          };
        }
        default:
          return {
            phoneInvalid: {
              message: 'Tipo de teléfono no reconocido',
            },
          };
      }
    };
  }

  /**
   * Valida un número de móvil paraguayo
   * @param phone - Teléfono limpio (solo dígitos)
   * @returns ValidationErrors o null si es válido
   */
  private static validateMobile(phone: string): ValidationErrors | null {
    // Debe tener 10 dígitos (09XX-XXXXXX)
    if (phone.length !== 10) {
      return {
        phoneInvalid: {
          message: 'Número de móvil debe tener 10 dígitos',
        },
      };
    }

    // Debe empezar con 09
    if (!phone.startsWith('09')) {
      return {
        phoneInvalid: {
          message: 'Número de móvil debe empezar con 09',
        },
      };
    }

    // Validar prefijo de operadora
    const prefix = phone.substring(0, 4);
    if (!PhoneValidator.MOBILE_PREFIXES.includes(prefix)) {
      return {
        phoneInvalid: {
          message: 'Prefijo de operadora no válido',
        },
      };
    }

    return null;
  }

  /**
   * Valida un número de línea fija paraguayo
   * @param phone - Teléfono limpio (solo dígitos)
   * @returns ValidationErrors o null si es válido
   */
  private static validateLandline(phone: string): ValidationErrors | null {
    // Debe tener entre 9 y 10 dígitos
    if (phone.length < 9 || phone.length > 10) {
      return {
        phoneInvalid: {
          message: 'Número de línea fija debe tener 9-10 dígitos',
        },
      };
    }

    // Debe empezar con 0
    if (!phone.startsWith('0')) {
      return {
        phoneInvalid: {
          message: 'Número de línea fija debe empezar con 0',
        },
      };
    }

    // Validar código de área
    let isValidAreaCode = false;
    for (const areaCode of PhoneValidator.LANDLINE_AREA_CODES) {
      if (phone.startsWith(areaCode)) {
        isValidAreaCode = true;
        break;
      }
    }

    if (!isValidAreaCode) {
      return {
        phoneInvalid: {
          message: 'Código de área no válido',
        },
      };
    }

    return null;
  }

  /**
   * Valida un teléfono sin usar el formulario reactivo
   * @param phone - Teléfono a validar
   * @param phoneType - Tipo de teléfono ('mobile', 'landline', 'any')
   * @returns true si es válido, false si no
   */
  static isValid(phone: string, phoneType: PhoneType = 'any'): boolean {
    if (!phone) {
      return false;
    }

    const cleanPhone = phone.replace(/\D/g, '');

    switch (phoneType) {
      case 'mobile':
        return PhoneValidator.validateMobile(cleanPhone) === null;
      case 'landline':
        return PhoneValidator.validateLandline(cleanPhone) === null;
      case 'any':
        return (
          PhoneValidator.validateMobile(cleanPhone) === null ||
          PhoneValidator.validateLandline(cleanPhone) === null
        );
      default:
        return false;
    }
  }

  /**
   * Formatea un número de teléfono al formato estándar
   * @param phone - Teléfono a formatear
   * @returns Teléfono formateado o string vacío si es inválido
   */
  static format(phone: string): string {
    if (!phone) {
      return '';
    }

    const cleanPhone = phone.replace(/\D/g, '');

    // Formatear móvil (09XX-XXXXXX)
    if (cleanPhone.length === 10 && cleanPhone.startsWith('09')) {
      return `${cleanPhone.substring(0, 4)}-${cleanPhone.substring(4)}`;
    }

    // Formatear fijo (0XX-XXXXXX o 0XXX-XXXXXX)
    if (cleanPhone.length >= 9 && cleanPhone.startsWith('0')) {
      // Buscar código de área
      for (const areaCode of PhoneValidator.LANDLINE_AREA_CODES) {
        if (cleanPhone.startsWith(areaCode)) {
          return `${areaCode}-${cleanPhone.substring(areaCode.length)}`;
        }
      }
    }

    return phone;
  }

  /**
   * Determina el tipo de teléfono
   * @param phone - Teléfono a analizar
   * @returns 'mobile', 'landline' o null si es inválido
   */
  static getPhoneType(phone: string): 'mobile' | 'landline' | null {
    if (!phone) {
      return null;
    }

    const cleanPhone = phone.replace(/\D/g, '');

    if (PhoneValidator.validateMobile(cleanPhone) === null) {
      return 'mobile';
    }

    if (PhoneValidator.validateLandline(cleanPhone) === null) {
      return 'landline';
    }

    return null;
  }
}
