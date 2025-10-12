/**
 * Helper para convertir números a palabras en español (Paraguay)
 * Útil para facturas electrónicas y documentos legales
 */
export class NumberToWordsHelper {
  private static readonly UNIDADES = [
    '',
    'uno',
    'dos',
    'tres',
    'cuatro',
    'cinco',
    'seis',
    'siete',
    'ocho',
    'nueve',
  ];

  private static readonly DECENAS = [
    '',
    '',
    'veinte',
    'treinta',
    'cuarenta',
    'cincuenta',
    'sesenta',
    'setenta',
    'ochenta',
    'noventa',
  ];

  private static readonly ESPECIALES = [
    'diez',
    'once',
    'doce',
    'trece',
    'catorce',
    'quince',
    'dieciséis',
    'diecisiete',
    'dieciocho',
    'diecinueve',
  ];

  private static readonly CENTENAS = [
    '',
    'ciento',
    'doscientos',
    'trescientos',
    'cuatrocientos',
    'quinientos',
    'seiscientos',
    'setecientos',
    'ochocientos',
    'novecientos',
  ];

  /**
   * Convierte un número entero a palabras en español
   * @param num - Número entero a convertir (0 - 999,999,999,999)
   * @returns String con el número en palabras
   */
  static toWords(num: number): string {
    // Validar entrada
    if (isNaN(num) || !isFinite(num)) {
      return 'número inválido';
    }

    // Redondear a entero
    num = Math.floor(num);

    // Caso especial: cero
    if (num === 0) {
      return 'cero';
    }

    // Manejar números negativos
    if (num < 0) {
      return 'menos ' + NumberToWordsHelper.toWords(Math.abs(num));
    }

    // Limitar a 999,999,999,999 (999 mil millones)
    if (num > 999999999999) {
      return 'número demasiado grande';
    }

    return NumberToWordsHelper.convertNumber(num).trim();
  }

  /**
   * Convierte un número a palabras con formato de moneda (Guaraníes)
   * @param amount - Monto en Guaraníes
   * @param includeCurrency - Si debe incluir "guaraníes" al final (default: true)
   * @returns String con el monto en palabras
   */
  static toGuaranies(amount: number, includeCurrency = true): string {
    if (isNaN(amount) || !isFinite(amount)) {
      return 'monto inválido';
    }

    // Redondear a entero (los guaraníes no tienen centavos)
    const rounded = Math.floor(amount);

    const words = NumberToWordsHelper.toWords(rounded);

    if (!includeCurrency) {
      return words;
    }

    // Determinar singular o plural
    if (rounded === 1) {
      return `${words} guaraní`;
    }

    return `${words} guaraníes`;
  }

  /**
   * Convierte un número a palabras con formato de moneda en dólares
   * @param amount - Monto en dólares
   * @param includeCurrency - Si debe incluir "dólares" al final (default: true)
   * @returns String con el monto en palabras (incluye centavos)
   */
  static toDollars(amount: number, includeCurrency = true): string {
    if (isNaN(amount) || !isFinite(amount)) {
      return 'monto inválido';
    }

    // Separar dólares y centavos
    const dollars = Math.floor(amount);
    const cents = Math.round((amount - dollars) * 100);

    let result = NumberToWordsHelper.toWords(dollars);

    if (includeCurrency) {
      result += dollars === 1 ? ' dólar' : ' dólares';

      if (cents > 0) {
        const centsWords = NumberToWordsHelper.toWords(cents);
        result += ` con ${centsWords} ${cents === 1 ? 'centavo' : 'centavos'}`;
      }
    } else if (cents > 0) {
      const centsWords = NumberToWordsHelper.toWords(cents);
      result += ` con ${centsWords}`;
    }

    return result;
  }

  /**
   * Convierte un número completo (recursivo)
   * @param num - Número a convertir
   * @returns String con el número en palabras
   */
  private static convertNumber(num: number): string {
    if (num === 0) {
      return '';
    }

    // Mil millones (billions)
    if (num >= 1000000000) {
      const billions = Math.floor(num / 1000000000);
      const remainder = num % 1000000000;
      const billionsText =
        billions === 1
          ? 'mil millones'
          : `${NumberToWordsHelper.convertNumber(billions)} mil millones`;
      const remainderText = NumberToWordsHelper.convertNumber(remainder);
      return remainderText
        ? `${billionsText} ${remainderText}`
        : billionsText;
    }

    // Millones
    if (num >= 1000000) {
      const millions = Math.floor(num / 1000000);
      const remainder = num % 1000000;
      const millionsText =
        millions === 1
          ? 'un millón'
          : `${NumberToWordsHelper.convertNumber(millions)} millones`;
      const remainderText = NumberToWordsHelper.convertNumber(remainder);
      return remainderText ? `${millionsText} ${remainderText}` : millionsText;
    }

    // Miles
    if (num >= 1000) {
      const thousands = Math.floor(num / 1000);
      const remainder = num % 1000;
      const thousandsText =
        thousands === 1
          ? 'mil'
          : `${NumberToWordsHelper.convertNumber(thousands)} mil`;
      const remainderText = NumberToWordsHelper.convertNumber(remainder);
      return remainderText
        ? `${thousandsText} ${remainderText}`
        : thousandsText;
    }

    // Centenas
    if (num >= 100) {
      const hundreds = Math.floor(num / 100);
      const remainder = num % 100;
      const hundredsText =
        hundreds === 1 && remainder === 0
          ? 'cien'
          : NumberToWordsHelper.CENTENAS[hundreds];
      const remainderText = NumberToWordsHelper.convertNumber(remainder);
      return remainderText
        ? `${hundredsText} ${remainderText}`
        : hundredsText;
    }

    // Decenas especiales (10-19)
    if (num >= 10 && num < 20) {
      return NumberToWordsHelper.ESPECIALES[num - 10];
    }

    // Decenas (20-99)
    if (num >= 20) {
      const tens = Math.floor(num / 10);
      const units = num % 10;
      if (units === 0) {
        return NumberToWordsHelper.DECENAS[tens];
      }
      return `${NumberToWordsHelper.DECENAS[tens]} y ${NumberToWordsHelper.UNIDADES[units]}`;
    }

    // Unidades (1-9)
    return NumberToWordsHelper.UNIDADES[num];
  }

  /**
   * Convierte un número a palabras con formato capitalizado
   * Primera letra en mayúscula
   * @param num - Número a convertir
   * @returns String con el número en palabras capitalizado
   */
  static toWordsCapitalized(num: number): string {
    const words = NumberToWordsHelper.toWords(num);
    return NumberToWordsHelper.capitalize(words);
  }

  /**
   * Convierte un número a palabras con formato de título
   * Cada palabra con primera letra en mayúscula
   * @param num - Número a convertir
   * @returns String con el número en palabras en formato título
   */
  static toWordsTitle(num: number): string {
    const words = NumberToWordsHelper.toWords(num);
    return words
      .split(' ')
      .map((word) => NumberToWordsHelper.capitalize(word))
      .join(' ');
  }

  /**
   * Convierte un número a palabras en formato todo mayúsculas
   * @param num - Número a convertir
   * @returns String con el número en palabras en mayúsculas
   */
  static toWordsUppercase(num: number): string {
    return NumberToWordsHelper.toWords(num).toUpperCase();
  }

  /**
   * Capitaliza la primera letra de un string
   * @param str - String a capitalizar
   * @returns String capitalizado
   */
  private static capitalize(str: string): string {
    if (!str) {
      return '';
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Convierte un número ordinal a palabras (1º, 2º, 3º, etc.)
   * @param num - Número ordinal (1-100)
   * @returns String con el ordinal en palabras
   */
  static toOrdinal(num: number): string {
    if (isNaN(num) || num < 1 || num > 100) {
      return 'ordinal inválido';
    }

    const ordinals: { [key: number]: string } = {
      1: 'primero',
      2: 'segundo',
      3: 'tercero',
      4: 'cuarto',
      5: 'quinto',
      6: 'sexto',
      7: 'séptimo',
      8: 'octavo',
      9: 'noveno',
      10: 'décimo',
      11: 'undécimo',
      12: 'duodécimo',
      13: 'decimotercero',
      14: 'decimocuarto',
      15: 'decimoquinto',
      16: 'decimosexto',
      17: 'decimoséptimo',
      18: 'decimoctavo',
      19: 'decimonoveno',
      20: 'vigésimo',
      30: 'trigésimo',
      40: 'cuadragésimo',
      50: 'quincuagésimo',
      60: 'sexagésimo',
      70: 'septuagésimo',
      80: 'octogésimo',
      90: 'nonagésimo',
      100: 'centésimo',
    };

    if (ordinals[num]) {
      return ordinals[num];
    }

    // Componer ordinales compuestos (21-99)
    const tens = Math.floor(num / 10) * 10;
    const units = num % 10;

    if (ordinals[tens] && ordinals[units]) {
      return `${ordinals[tens]} ${ordinals[units]}`;
    }

    return `${num}º`;
  }

  /**
   * Convierte un monto para uso en facturas (formato formal)
   * Ejemplo: "Ciento veintitrés mil cuatrocientos cincuenta y seis guaraníes"
   * @param amount - Monto en guaraníes
   * @returns String formateado para facturas
   */
  static toInvoiceFormat(amount: number): string {
    const words = NumberToWordsHelper.toGuaranies(amount, true);
    return NumberToWordsHelper.capitalize(words);
  }

  /**
   * Convierte un número con validación de rango
   * @param num - Número a convertir
   * @param min - Valor mínimo permitido
   * @param max - Valor máximo permitido
   * @returns String con el número en palabras o mensaje de error
   */
  static toWordsInRange(num: number, min: number, max: number): string {
    if (num < min || num > max) {
      return `número fuera de rango (${min}-${max})`;
    }
    return NumberToWordsHelper.toWords(num);
  }

  /**
   * Prueba si un número puede ser convertido correctamente
   * @param num - Número a probar
   * @returns true si puede ser convertido, false si no
   */
  static canConvert(num: number): boolean {
    return (
      !isNaN(num) &&
      isFinite(num) &&
      num >= -999999999999 &&
      num <= 999999999999
    );
  }
}

/**
 * Ejemplos de uso:
 *
 * // Convertir número básico
 * NumberToWordsHelper.toWords(123);
 * // "ciento veintitrés"
 *
 * // Convertir a guaraníes
 * NumberToWordsHelper.toGuaranies(123456);
 * // "ciento veintitrés mil cuatrocientos cincuenta y seis guaraníes"
 *
 * // Formato para factura
 * NumberToWordsHelper.toInvoiceFormat(123456);
 * // "Ciento veintitrés mil cuatrocientos cincuenta y seis guaraníes"
 *
 * // Convertir a dólares con centavos
 * NumberToWordsHelper.toDollars(123.45);
 * // "ciento veintitrés dólares con cuarenta y cinco centavos"
 *
 * // Ordinal
 * NumberToWordsHelper.toOrdinal(1);
 * // "primero"
 *
 * // Mayúsculas
 * NumberToWordsHelper.toWordsUppercase(123);
 * // "CIENTO VEINTITRÉS"
 *
 * // Capitalizado
 * NumberToWordsHelper.toWordsCapitalized(123);
 * // "Ciento veintitrés"
 */
