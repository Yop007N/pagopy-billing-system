import { Pipe, PipeTransform } from '@angular/core';

/**
 * Tipos de formato de fecha disponibles
 */
export type DateFormatType = 'short' | 'medium' | 'long' | 'relative' | 'time';

/**
 * Pipe para formatear fechas en español
 * Soporta múltiples formatos: short, medium, long, relative, time
 */
@Pipe({
  name: 'dateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  private readonly months = [
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

  private readonly monthsShort = [
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

  private readonly days = [
    'domingo',
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
  ];

  /**
   * Transforma una fecha en formato legible en español
   * @param value - Fecha a formatear (Date, string, number)
   * @param format - Tipo de formato: 'short' | 'medium' | 'long' | 'relative' | 'time'
   * @returns String con la fecha formateada
   */
  transform(
    value: Date | string | number | null | undefined,
    format: DateFormatType = 'medium'
  ): string {
    // Manejar valores nulos o undefined
    if (!value) {
      return '';
    }

    // Convertir a objeto Date
    const date = new Date(value);

    // Validar que sea una fecha válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    // Aplicar formato según el tipo
    switch (format) {
      case 'short':
        return this.formatShort(date);
      case 'medium':
        return this.formatMedium(date);
      case 'long':
        return this.formatLong(date);
      case 'relative':
        return this.formatRelative(date);
      case 'time':
        return this.formatTime(date);
      default:
        return this.formatMedium(date);
    }
  }

  /**
   * Formato corto: 15/10/2024
   */
  private formatShort(date: Date): string {
    const day = this.padZero(date.getDate());
    const month = this.padZero(date.getMonth() + 1);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Formato medio: 15 oct 2024
   */
  private formatMedium(date: Date): string {
    const day = date.getDate();
    const month = this.monthsShort[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  /**
   * Formato largo: 15 de octubre de 2024
   */
  private formatLong(date: Date): string {
    const day = date.getDate();
    const month = this.months[date.getMonth()];
    const year = date.getFullYear();
    const dayName = this.days[date.getDay()];
    return `${dayName}, ${day} de ${month} de ${year}`;
  }

  /**
   * Formato relativo: "Hace 2 horas", "Hace 3 días", etc.
   */
  private formatRelative(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // Futuro
    if (diffMs < 0) {
      return 'En el futuro';
    }

    // Menos de 1 minuto
    if (diffSeconds < 60) {
      return 'Justo ahora';
    }

    // Menos de 1 hora
    if (diffMinutes < 60) {
      return diffMinutes === 1
        ? 'Hace 1 minuto'
        : `Hace ${diffMinutes} minutos`;
    }

    // Menos de 1 día
    if (diffHours < 24) {
      return diffHours === 1 ? 'Hace 1 hora' : `Hace ${diffHours} horas`;
    }

    // Menos de 1 semana
    if (diffDays < 7) {
      return diffDays === 1 ? 'Hace 1 día' : `Hace ${diffDays} días`;
    }

    // Menos de 1 mes
    if (diffWeeks < 4) {
      return diffWeeks === 1 ? 'Hace 1 semana' : `Hace ${diffWeeks} semanas`;
    }

    // Menos de 1 año
    if (diffMonths < 12) {
      return diffMonths === 1 ? 'Hace 1 mes' : `Hace ${diffMonths} meses`;
    }

    // Más de 1 año
    return diffYears === 1 ? 'Hace 1 año' : `Hace ${diffYears} años`;
  }

  /**
   * Formato de hora: 14:30
   */
  private formatTime(date: Date): string {
    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());
    return `${hours}:${minutes}`;
  }

  /**
   * Agrega cero a la izquierda si el número es menor a 10
   */
  private padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
}
