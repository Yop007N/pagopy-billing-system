/**
 * Helper de funciones para manejo de facturas electrónicas (e-Kuatia)
 * Según normativa SET Paraguay
 */
export class InvoiceHelper {
  /**
   * Tipos de documento fiscal según SET
   */
  static readonly DOCUMENT_TYPES = {
    FACTURA_ELECTRONICA: 1, // Factura Electrónica
    FACTURA_ELECTRONICA_EXPORTACION: 4, // Factura Electrónica de Exportación
    FACTURA_ELECTRONICA_IMPORTACION: 5, // Factura Electrónica de Importación
    AUTOFACTURA_ELECTRONICA: 6, // Autofactura Electrónica
    NOTA_CREDITO_ELECTRONICA: 7, // Nota de Crédito Electrónica
    NOTA_DEBITO_ELECTRONICA: 7, // Nota de Débito Electrónica
    NOTA_REMISION_ELECTRONICA: 9, // Nota de Remisión Electrónica
  } as const;

  /**
   * Formatos de número de factura según SET
   * Formato: XXX-XXX-XXXXXXX (Establecimiento-PuntoExpedicion-NumeroFactura)
   */
  static readonly INVOICE_NUMBER_REGEX =
    /^(\d{3})-(\d{3})-(\d{7})$/;

  /**
   * Formato de timbrado SET
   * Formato: 8 dígitos
   */
  static readonly TIMBRADO_REGEX = /^\d{8}$/;

  /**
   * Formatea un número de factura al formato estándar
   * @param establishment - Código de establecimiento (001-999)
   * @param expeditionPoint - Punto de expedición (001-999)
   * @param invoiceNumber - Número de factura (0000001-9999999)
   * @returns Número de factura formateado (XXX-XXX-XXXXXXX)
   */
  static formatInvoiceNumber(
    establishment: number,
    expeditionPoint: number,
    invoiceNumber: number
  ): string {
    const est = InvoiceHelper.padNumber(establishment, 3);
    const exp = InvoiceHelper.padNumber(expeditionPoint, 3);
    const num = InvoiceHelper.padNumber(invoiceNumber, 7);

    return `${est}-${exp}-${num}`;
  }

  /**
   * Parsea un número de factura formateado
   * @param invoiceNumber - Número de factura formateado (XXX-XXX-XXXXXXX)
   * @returns Objeto con los componentes del número de factura
   */
  static parseInvoiceNumber(invoiceNumber: string): {
    establishment: number;
    expeditionPoint: number;
    invoiceNumber: number;
  } | null {
    const match = invoiceNumber.match(InvoiceHelper.INVOICE_NUMBER_REGEX);

    if (!match) {
      return null;
    }

    return {
      establishment: parseInt(match[1], 10),
      expeditionPoint: parseInt(match[2], 10),
      invoiceNumber: parseInt(match[3], 10),
    };
  }

  /**
   * Valida un número de factura
   * @param invoiceNumber - Número de factura a validar
   * @returns true si es válido
   */
  static isValidInvoiceNumber(invoiceNumber: string): boolean {
    return InvoiceHelper.INVOICE_NUMBER_REGEX.test(invoiceNumber);
  }

  /**
   * Valida un número de timbrado
   * @param timbrado - Timbrado a validar
   * @returns true si es válido
   */
  static isValidTimbrado(timbrado: string): boolean {
    return InvoiceHelper.TIMBRADO_REGEX.test(timbrado);
  }

  /**
   * Genera el siguiente número de factura
   * @param currentInvoiceNumber - Número de factura actual
   * @returns Siguiente número de factura formateado
   */
  static getNextInvoiceNumber(currentInvoiceNumber: string): string | null {
    const parsed = InvoiceHelper.parseInvoiceNumber(currentInvoiceNumber);

    if (!parsed) {
      return null;
    }

    // Incrementar el número de factura
    const nextNumber = parsed.invoiceNumber + 1;

    // Validar que no exceda el máximo (9999999)
    if (nextNumber > 9999999) {
      return null;
    }

    return InvoiceHelper.formatInvoiceNumber(
      parsed.establishment,
      parsed.expeditionPoint,
      nextNumber
    );
  }

  /**
   * Calcula el rango de números de factura disponibles
   * @param firstInvoice - Primer número de factura
   * @param lastInvoice - Último número de factura
   * @returns Cantidad de facturas disponibles o null si es inválido
   */
  static calculateInvoiceRange(
    firstInvoice: string,
    lastInvoice: string
  ): number | null {
    const first = InvoiceHelper.parseInvoiceNumber(firstInvoice);
    const last = InvoiceHelper.parseInvoiceNumber(lastInvoice);

    if (!first || !last) {
      return null;
    }

    // Validar que sean del mismo establecimiento y punto de expedición
    if (
      first.establishment !== last.establishment ||
      first.expeditionPoint !== last.expeditionPoint
    ) {
      return null;
    }

    // Validar que el último sea mayor que el primero
    if (last.invoiceNumber < first.invoiceNumber) {
      return null;
    }

    return last.invoiceNumber - first.invoiceNumber + 1;
  }

  /**
   * Valida si un número de factura está dentro de un rango
   * @param invoiceNumber - Número de factura a validar
   * @param firstInvoice - Primer número del rango
   * @param lastInvoice - Último número del rango
   * @returns true si está dentro del rango
   */
  static isInvoiceInRange(
    invoiceNumber: string,
    firstInvoice: string,
    lastInvoice: string
  ): boolean {
    const current = InvoiceHelper.parseInvoiceNumber(invoiceNumber);
    const first = InvoiceHelper.parseInvoiceNumber(firstInvoice);
    const last = InvoiceHelper.parseInvoiceNumber(lastInvoice);

    if (!current || !first || !last) {
      return false;
    }

    // Validar que sean del mismo establecimiento y punto de expedición
    if (
      current.establishment !== first.establishment ||
      current.expeditionPoint !== first.expeditionPoint ||
      current.establishment !== last.establishment ||
      current.expeditionPoint !== last.expeditionPoint
    ) {
      return false;
    }

    return (
      current.invoiceNumber >= first.invoiceNumber &&
      current.invoiceNumber <= last.invoiceNumber
    );
  }

  /**
   * Formatea un CDC (Código de Control) para visualización
   * El CDC es generado por el SET después de aprobar la factura
   * @param cdc - CDC de 44 caracteres
   * @returns CDC formateado en grupos de 4 dígitos
   */
  static formatCDC(cdc: string): string {
    if (!cdc || cdc.length !== 44) {
      return cdc;
    }

    // Formatear en grupos de 4 dígitos separados por guión
    return cdc.match(/.{1,4}/g)?.join('-') || cdc;
  }

  /**
   * Valida el formato de un CDC (44 caracteres numéricos)
   * @param cdc - CDC a validar
   * @returns true si es válido
   */
  static isValidCDC(cdc: string): boolean {
    if (!cdc) {
      return false;
    }

    // El CDC debe tener 44 dígitos
    return /^\d{44}$/.test(cdc);
  }

  /**
   * Parsea un CDC para extraer información
   * Estructura del CDC (44 caracteres):
   * - Pos 1-2: Tipo de documento
   * - Pos 3-10: RUC del emisor
   * - Pos 11: Dígito verificador del RUC
   * - Pos 12-19: Fecha (YYYYMMDD)
   * - Pos 20-28: Número de documento (9 dígitos sin guiones)
   * - Pos 29-36: Serie
   * - Pos 37-44: Número de control
   * @param cdc - CDC a parsear
   * @returns Objeto con la información parseada o null si es inválido
   */
  static parseCDC(cdc: string): {
    documentType: string;
    ruc: string;
    rucVerifier: string;
    date: string;
    documentNumber: string;
    series: string;
    controlNumber: string;
  } | null {
    if (!InvoiceHelper.isValidCDC(cdc)) {
      return null;
    }

    return {
      documentType: cdc.substring(0, 2),
      ruc: cdc.substring(2, 10),
      rucVerifier: cdc.substring(10, 11),
      date: cdc.substring(11, 19),
      documentNumber: cdc.substring(19, 28),
      series: cdc.substring(28, 36),
      controlNumber: cdc.substring(36, 44),
    };
  }

  /**
   * Genera un código QR data string para facturas electrónicas
   * @param cdc - CDC de la factura
   * @param setUrl - URL base del SET (default: https://ekuatia.set.gov.py/consultas)
   * @returns String para generar código QR
   */
  static generateQRData(
    cdc: string,
    setUrl = 'https://ekuatia.set.gov.py/consultas'
  ): string {
    if (!InvoiceHelper.isValidCDC(cdc)) {
      return '';
    }

    return `${setUrl}/qr?cdc=${cdc}`;
  }

  /**
   * Valida la vigencia de un timbrado según fechas
   * @param startDate - Fecha de inicio de vigencia
   * @param endDate - Fecha de fin de vigencia
   * @param referenceDate - Fecha de referencia (default: hoy)
   * @returns true si el timbrado está vigente
   */
  static isTimbradoValid(
    startDate: Date,
    endDate: Date,
    referenceDate: Date = new Date()
  ): boolean {
    return referenceDate >= startDate && referenceDate <= endDate;
  }

  /**
   * Calcula los días restantes de vigencia de un timbrado
   * @param endDate - Fecha de fin de vigencia
   * @param referenceDate - Fecha de referencia (default: hoy)
   * @returns Número de días restantes (negativo si está vencido)
   */
  static getTimbradoDaysRemaining(
    endDate: Date,
    referenceDate: Date = new Date()
  ): number {
    const diffMs = endDate.getTime() - referenceDate.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Valida si un timbrado está próximo a vencer
   * @param endDate - Fecha de fin de vigencia
   * @param warningDays - Días de anticipación para la advertencia (default: 30)
   * @param referenceDate - Fecha de referencia (default: hoy)
   * @returns true si está próximo a vencer
   */
  static isTimbradoExpiringSoon(
    endDate: Date,
    warningDays = 30,
    referenceDate: Date = new Date()
  ): boolean {
    const daysRemaining = InvoiceHelper.getTimbradoDaysRemaining(
      endDate,
      referenceDate
    );
    return daysRemaining > 0 && daysRemaining <= warningDays;
  }

  /**
   * Formatea un RUC al formato estándar con guión
   * @param ruc - RUC sin formato
   * @returns RUC formateado (XXXXXXX-X)
   */
  static formatRUC(ruc: string): string {
    if (!ruc) {
      return '';
    }

    const cleanRuc = ruc.replace(/\D/g, '');

    if (cleanRuc.length !== 8) {
      return ruc;
    }

    return `${cleanRuc.substring(0, 7)}-${cleanRuc.substring(7, 8)}`;
  }

  /**
   * Obtiene el nombre del tipo de documento
   * @param documentType - Código de tipo de documento
   * @returns Nombre descriptivo del tipo de documento
   */
  static getDocumentTypeName(documentType: number): string {
    switch (documentType) {
      case InvoiceHelper.DOCUMENT_TYPES.FACTURA_ELECTRONICA:
        return 'Factura Electrónica';
      case InvoiceHelper.DOCUMENT_TYPES.FACTURA_ELECTRONICA_EXPORTACION:
        return 'Factura Electrónica de Exportación';
      case InvoiceHelper.DOCUMENT_TYPES.FACTURA_ELECTRONICA_IMPORTACION:
        return 'Factura Electrónica de Importación';
      case InvoiceHelper.DOCUMENT_TYPES.AUTOFACTURA_ELECTRONICA:
        return 'Autofactura Electrónica';
      case InvoiceHelper.DOCUMENT_TYPES.NOTA_CREDITO_ELECTRONICA:
        return 'Nota de Crédito Electrónica';
      case InvoiceHelper.DOCUMENT_TYPES.NOTA_DEBITO_ELECTRONICA:
        return 'Nota de Débito Electrónica';
      case InvoiceHelper.DOCUMENT_TYPES.NOTA_REMISION_ELECTRONICA:
        return 'Nota de Remisión Electrónica';
      default:
        return `Tipo ${documentType}`;
    }
  }

  /**
   * Agrega ceros a la izquierda de un número
   * @param num - Número a formatear
   * @param length - Longitud deseada
   * @returns String con ceros a la izquierda
   */
  private static padNumber(num: number, length: number): string {
    return num.toString().padStart(length, '0');
  }

  /**
   * Formatea un número de serie de timbrado
   * @param series - Número de serie
   * @returns Serie formateada (8 dígitos)
   */
  static formatSeries(series: number): string {
    return InvoiceHelper.padNumber(series, 8);
  }

  /**
   * Genera un resumen de factura para auditoría
   * @param invoice - Datos de la factura
   * @returns String con resumen formateado
   */
  static generateInvoiceSummary(invoice: {
    invoiceNumber: string;
    date: Date;
    customerName: string;
    ruc: string;
    total: number;
  }): string {
    const formattedDate = invoice.date.toLocaleDateString('es-PY');
    return `Factura ${invoice.invoiceNumber} | ${formattedDate} | ${invoice.customerName} | RUC: ${invoice.ruc} | Total: Gs. ${invoice.total.toLocaleString('es-PY')}`;
  }

  /**
   * Valida la estructura completa de datos de una factura
   * @param invoice - Datos de la factura a validar
   * @returns Array de errores (vacío si es válida)
   */
  static validateInvoiceData(invoice: {
    invoiceNumber: string;
    timbrado: string;
    date: Date;
    customerName: string;
    ruc?: string;
    items: Array<{ description: string; quantity: number; unitPrice: number }>;
  }): string[] {
    const errors: string[] = [];

    // Validar número de factura
    if (!InvoiceHelper.isValidInvoiceNumber(invoice.invoiceNumber)) {
      errors.push('Número de factura inválido');
    }

    // Validar timbrado
    if (!InvoiceHelper.isValidTimbrado(invoice.timbrado)) {
      errors.push('Número de timbrado inválido');
    }

    // Validar fecha
    if (!(invoice.date instanceof Date) || isNaN(invoice.date.getTime())) {
      errors.push('Fecha inválida');
    }

    // Validar cliente
    if (!invoice.customerName || invoice.customerName.trim() === '') {
      errors.push('Nombre de cliente requerido');
    }

    // Validar items
    if (!invoice.items || invoice.items.length === 0) {
      errors.push('La factura debe tener al menos un item');
    } else {
      invoice.items.forEach((item, index) => {
        if (!item.description || item.description.trim() === '') {
          errors.push(`Item ${index + 1}: Descripción requerida`);
        }
        if (isNaN(item.quantity) || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Cantidad inválida`);
        }
        if (isNaN(item.unitPrice) || item.unitPrice <= 0) {
          errors.push(`Item ${index + 1}: Precio unitario inválido`);
        }
      });
    }

    return errors;
  }
}

/**
 * Ejemplos de uso:
 *
 * // Formatear número de factura
 * const invoiceNum = InvoiceHelper.formatInvoiceNumber(1, 1, 123);
 * // "001-001-0000123"
 *
 * // Parsear número de factura
 * const parsed = InvoiceHelper.parseInvoiceNumber("001-001-0000123");
 * // { establishment: 1, expeditionPoint: 1, invoiceNumber: 123 }
 *
 * // Siguiente número de factura
 * const next = InvoiceHelper.getNextInvoiceNumber("001-001-0000123");
 * // "001-001-0000124"
 *
 * // Formatear CDC
 * const cdc = "01800123456700120240115001001000012300000001012345678";
 * const formatted = InvoiceHelper.formatCDC(cdc);
 * // "0180-0123-4567-0012-0240-1150-0100-1000-0123-0000-0001-0123-4567-8"
 *
 * // Validar CDC
 * const isValid = InvoiceHelper.isValidCDC(cdc); // true
 *
 * // Parsear CDC
 * const cdcData = InvoiceHelper.parseCDC(cdc);
 * // { documentType: "01", ruc: "80012345", ... }
 *
 * // Generar QR data
 * const qrData = InvoiceHelper.generateQRData(cdc);
 * // "https://ekuatia.set.gov.py/consultas/qr?cdc=..."
 *
 * // Validar vigencia de timbrado
 * const isValid = InvoiceHelper.isTimbradoValid(
 *   new Date('2024-01-01'),
 *   new Date('2024-12-31')
 * ); // true si hoy está entre las fechas
 */
