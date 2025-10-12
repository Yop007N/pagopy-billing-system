/**
 * Helper de funciones para manejo de fechas
 */
export class DateHelper {
  private static readonly MONTHS_ES = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];

  private static readonly MONTHS_SHORT_ES = [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ];

  private static readonly DAYS_ES = [
    'domingo',
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
  ];

  private static readonly DAYS_SHORT_ES = [
    'dom',
    'lun',
    'mar',
    'mié',
    'jue',
    'vie',
    'sáb',
  ];

  /**
   * Obtiene la fecha actual
   * @returns Objeto Date con la fecha actual
   */
  static now(): Date {
    return new Date();
  }

  /**
   * Obtiene la fecha de hoy a las 00:00:00
   * @returns Objeto Date con la fecha de hoy sin hora
   */
  static today(): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  /**
   * Obtiene la fecha de ayer
   * @returns Objeto Date con la fecha de ayer
   */
  static yesterday(): Date {
    const date = DateHelper.today();
    date.setDate(date.getDate() - 1);
    return date;
  }

  /**
   * Obtiene la fecha de mañana
   * @returns Objeto Date con la fecha de mañana
   */
  static tomorrow(): Date {
    const date = DateHelper.today();
    date.setDate(date.getDate() + 1);
    return date;
  }

  /**
   * Formatea una fecha al formato DD/MM/YYYY
   * @param date - Fecha a formatear
   * @returns String formateado
   */
  static format(date: Date | string | number): string {
    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return '';
    }

    const day = DateHelper.padZero(d.getDate());
    const month = DateHelper.padZero(d.getMonth() + 1);
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  }

  /**
   * Formatea una fecha y hora al formato DD/MM/YYYY HH:MM
   * @param date - Fecha a formatear
   * @returns String formateado
   */
  static formatDateTime(date: Date | string | number): string {
    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return '';
    }

    const dateStr = DateHelper.format(d);
    const hours = DateHelper.padZero(d.getHours());
    const minutes = DateHelper.padZero(d.getMinutes());

    return `${dateStr} ${hours}:${minutes}`;
  }

  /**
   * Formatea solo la hora al formato HH:MM
   * @param date - Fecha a formatear
   * @returns String formateado
   */
  static formatTime(date: Date | string | number): string {
    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return '';
    }

    const hours = DateHelper.padZero(d.getHours());
    const minutes = DateHelper.padZero(d.getMinutes());

    return `${hours}:${minutes}`;
  }

  /**
   * Formatea una fecha al formato ISO (YYYY-MM-DD)
   * @param date - Fecha a formatear
   * @returns String formateado
   */
  static formatISO(date: Date | string | number): string {
    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return '';
    }

    const year = d.getFullYear();
    const month = DateHelper.padZero(d.getMonth() + 1);
    const day = DateHelper.padZero(d.getDate());

    return `${year}-${month}-${day}`;
  }

  /**
   * Parsea un string de fecha en formato DD/MM/YYYY
   * @param dateStr - String de fecha
   * @returns Objeto Date
   */
  static parse(dateStr: string): Date | null {
    if (!dateStr) {
      return null;
    }

    const parts = dateStr.split('/');

    if (parts.length !== 3) {
      return null;
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Mes es 0-indexed
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);

    if (isNaN(date.getTime())) {
      return null;
    }

    return date;
  }

  /**
   * Parsea un string de fecha ISO (YYYY-MM-DD)
   * @param dateStr - String de fecha ISO
   * @returns Objeto Date
   */
  static parseISO(dateStr: string): Date | null {
    if (!dateStr) {
      return null;
    }

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      return null;
    }

    return date;
  }

  /**
   * Agrega días a una fecha
   * @param date - Fecha base
   * @param days - Número de días a agregar (puede ser negativo)
   * @returns Nueva fecha
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Agrega meses a una fecha
   * @param date - Fecha base
   * @param months - Número de meses a agregar (puede ser negativo)
   * @returns Nueva fecha
   */
  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * Agrega años a una fecha
   * @param date - Fecha base
   * @param years - Número de años a agregar (puede ser negativo)
   * @returns Nueva fecha
   */
  static addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  /**
   * Calcula la diferencia en días entre dos fechas
   * @param date1 - Primera fecha
   * @param date2 - Segunda fecha
   * @returns Número de días de diferencia
   */
  static daysBetween(date1: Date, date2: Date): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    const diffMs = d2.getTime() - d1.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica si una fecha es hoy
   * @param date - Fecha a verificar
   * @returns true si es hoy
   */
  static isToday(date: Date): boolean {
    const today = DateHelper.today();
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    return d.getTime() === today.getTime();
  }

  /**
   * Verifica si una fecha es ayer
   * @param date - Fecha a verificar
   * @returns true si es ayer
   */
  static isYesterday(date: Date): boolean {
    const yesterday = DateHelper.yesterday();
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    return d.getTime() === yesterday.getTime();
  }

  /**
   * Verifica si una fecha es mañana
   * @param date - Fecha a verificar
   * @returns true si es mañana
   */
  static isTomorrow(date: Date): boolean {
    const tomorrow = DateHelper.tomorrow();
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    return d.getTime() === tomorrow.getTime();
  }

  /**
   * Verifica si una fecha está en el pasado
   * @param date - Fecha a verificar
   * @returns true si está en el pasado
   */
  static isPast(date: Date): boolean {
    return date.getTime() < Date.now();
  }

  /**
   * Verifica si una fecha está en el futuro
   * @param date - Fecha a verificar
   * @returns true si está en el futuro
   */
  static isFuture(date: Date): boolean {
    return date.getTime() > Date.now();
  }

  /**
   * Verifica si dos fechas son el mismo día
   * @param date1 - Primera fecha
   * @param date2 - Segunda fecha
   * @returns true si son el mismo día
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  }

  /**
   * Obtiene el primer día del mes
   * @param date - Fecha de referencia
   * @returns Primer día del mes
   */
  static startOfMonth(date: Date): Date {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Obtiene el último día del mes
   * @param date - Fecha de referencia
   * @returns Último día del mes
   */
  static endOfMonth(date: Date): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1, 0);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  /**
   * Obtiene el nombre del mes en español
   * @param date - Fecha
   * @param short - Si debe ser abreviado (default: false)
   * @returns Nombre del mes
   */
  static getMonthName(date: Date, short = false): string {
    const monthIndex = date.getMonth();
    return short
      ? DateHelper.MONTHS_SHORT_ES[monthIndex]
      : DateHelper.MONTHS_ES[monthIndex];
  }

  /**
   * Obtiene el nombre del día de la semana en español
   * @param date - Fecha
   * @param short - Si debe ser abreviado (default: false)
   * @returns Nombre del día
   */
  static getDayName(date: Date, short = false): string {
    const dayIndex = date.getDay();
    return short
      ? DateHelper.DAYS_SHORT_ES[dayIndex]
      : DateHelper.DAYS_ES[dayIndex];
  }

  /**
   * Obtiene la edad en años desde una fecha de nacimiento
   * @param birthDate - Fecha de nacimiento
   * @returns Edad en años
   */
  static getAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Agrega cero a la izquierda si el número es menor a 10
   * @param num - Número a formatear
   * @returns String con cero a la izquierda si es necesario
   */
  private static padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  /**
   * Obtiene el rango de fechas de una semana
   * @param date - Fecha de referencia (default: hoy)
   * @returns Objeto con start (lunes) y end (domingo)
   */
  static getWeekRange(date: Date = new Date()): {
    start: Date;
    end: Date;
  } {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar cuando es domingo

    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  /**
   * Obtiene el rango de fechas de un mes
   * @param date - Fecha de referencia (default: hoy)
   * @returns Objeto con start y end
   */
  static getMonthRange(date: Date = new Date()): {
    start: Date;
    end: Date;
  } {
    return {
      start: DateHelper.startOfMonth(date),
      end: DateHelper.endOfMonth(date),
    };
  }
}
