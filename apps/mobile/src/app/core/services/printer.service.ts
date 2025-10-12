import { Injectable } from '@angular/core';
import { BleClient, numbersToDataView } from '@capacitor-community/bluetooth-le';
import { BehaviorSubject } from 'rxjs';

export interface PrinterDevice {
  id: string;
  name: string;
  address: string;
  connected: boolean;
}

export interface PrinterSettings {
  paperWidth: 58 | 80;
  encoding: 'UTF-8' | 'ISO-8859-1';
  charsPerLine: number;
}

@Injectable({
  providedIn: 'root'
})
export class PrinterService {
  private connectedDevice$ = new BehaviorSubject<PrinterDevice | null>(null);
  private isInitialized = false;

  // ESC/POS Commands
  private readonly ESC = 0x1b;
  private readonly GS = 0x1d;

  // Command sequences
  private readonly COMMANDS = {
    INIT: [this.ESC, 0x40], // Initialize printer
    LINE_FEED: [0x0a], // Line feed
    CUT_PAPER: [this.GS, 0x56, 0x00], // Cut paper
    ALIGN_LEFT: [this.ESC, 0x61, 0x00],
    ALIGN_CENTER: [this.ESC, 0x61, 0x01],
    ALIGN_RIGHT: [this.ESC, 0x61, 0x02],
    BOLD_ON: [this.ESC, 0x45, 0x01],
    BOLD_OFF: [this.ESC, 0x45, 0x00],
    FONT_SIZE_NORMAL: [this.GS, 0x21, 0x00],
    FONT_SIZE_DOUBLE: [this.GS, 0x21, 0x11],
    FONT_SIZE_LARGE: [this.GS, 0x21, 0x22]
  };

  /**
   * Initialize Bluetooth
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await BleClient.initialize();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing Bluetooth:', error);
      throw new Error('No se pudo inicializar Bluetooth');
    }
  }

  /**
   * Scan for Bluetooth printers
   */
  async scanDevices(timeout = 10000): Promise<PrinterDevice[]> {
    try {
      await this.initialize();

      const devices: PrinterDevice[] = [];

      await BleClient.requestLEScan(
        {
          // Filter for printer services (common UUIDs)
          services: []
        },
        (result) => {
          if (result.device.name) {
            // Filter for likely printer devices
            const name = result.device.name.toLowerCase();
            if (
              name.includes('printer') ||
              name.includes('pos') ||
              name.includes('rpp') ||
              name.includes('mpt') ||
              name.includes('thermal')
            ) {
              devices.push({
                id: result.device.deviceId,
                name: result.device.name || 'Unknown Device',
                address: result.device.deviceId,
                connected: false
              });
            }
          }
        }
      );

      // Stop scanning after timeout
      setTimeout(async () => {
        await BleClient.stopLEScan();
      }, timeout);

      return devices;
    } catch (error) {
      console.error('Error scanning devices:', error);
      throw new Error('Error al escanear dispositivos Bluetooth');
    }
  }

  /**
   * Connect to printer
   */
  async connect(device: PrinterDevice): Promise<void> {
    try {
      await this.initialize();

      // Disconnect if already connected
      if (this.connectedDevice$.value) {
        await this.disconnect();
      }

      // Connect to device
      await BleClient.connect(device.id, (deviceId) => {
        console.log('Device disconnected:', deviceId);
        this.connectedDevice$.next(null);
      });

      device.connected = true;
      this.connectedDevice$.next(device);

      // Save connected device
      localStorage.setItem('connectedPrinter', JSON.stringify(device));
    } catch (error) {
      console.error('Error connecting to printer:', error);
      throw new Error('No se pudo conectar a la impresora');
    }
  }

  /**
   * Disconnect from printer
   */
  async disconnect(): Promise<void> {
    const device = this.connectedDevice$.value;
    if (!device) {
      return;
    }

    try {
      await BleClient.disconnect(device.id);
      this.connectedDevice$.next(null);
      localStorage.removeItem('connectedPrinter');
    } catch (error) {
      console.error('Error disconnecting:', error);
      throw new Error('Error al desconectar impresora');
    }
  }

  /**
   * Get connected device
   */
  getConnectedDevice() {
    return this.connectedDevice$.asObservable();
  }

  /**
   * Check if printer is connected
   */
  isConnected(): boolean {
    return this.connectedDevice$.value !== null;
  }

  /**
   * Print sale ticket
   */
  async printSaleTicket(sale: any, settings?: Partial<PrinterSettings>): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Impresora no conectada');
    }

    const printerSettings: PrinterSettings = {
      paperWidth: settings?.paperWidth || 58,
      encoding: settings?.encoding || 'UTF-8',
      charsPerLine: settings?.charsPerLine || (settings?.paperWidth === 80 ? 48 : 32)
    };

    try {
      const commands: number[] = [];

      // Initialize
      commands.push(...this.COMMANDS.INIT);

      // Header - Store name
      commands.push(...this.COMMANDS.ALIGN_CENTER);
      commands.push(...this.COMMANDS.FONT_SIZE_LARGE);
      commands.push(...this.COMMANDS.BOLD_ON);
      commands.push(...this.textToBytes('MI NEGOCIO', printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.BOLD_OFF);
      commands.push(...this.COMMANDS.FONT_SIZE_NORMAL);

      // Store info
      commands.push(...this.textToBytes('RUC: 80012345-6', printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.textToBytes('Tel: 0981-123456', printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.textToBytes('Asuncion, Paraguay', printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.LINE_FEED);

      // Sale info
      commands.push(...this.COMMANDS.ALIGN_LEFT);
      commands.push(...this.textToBytes(this.padLine('TICKET DE VENTA', '', printerSettings.charsPerLine), printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.textToBytes(this.padLine('No:', sale.saleNumber || 'N/A', printerSettings.charsPerLine), printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.textToBytes(this.padLine('Fecha:', new Date().toLocaleString('es-PY'), printerSettings.charsPerLine), printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.textToBytes(this.padLine('Vendedor:', sale.seller || 'N/A', printerSettings.charsPerLine), printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);

      // Separator
      commands.push(...this.textToBytes('-'.repeat(printerSettings.charsPerLine), printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);

      // Items
      commands.push(...this.COMMANDS.BOLD_ON);
      commands.push(...this.textToBytes(this.padLine('DESCRIPCION', 'TOTAL', printerSettings.charsPerLine), printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.BOLD_OFF);

      for (const item of sale.items || []) {
        // Item name
        commands.push(...this.textToBytes(item.productName || item.name, printerSettings.encoding));
        commands.push(...this.COMMANDS.LINE_FEED);

        // Quantity and price
        const qtyPrice = `${item.quantity} x Gs. ${this.formatPrice(item.price)}`;
        const total = `Gs. ${this.formatPrice(item.quantity * item.price)}`;
        commands.push(...this.textToBytes(this.padLine(qtyPrice, total, printerSettings.charsPerLine), printerSettings.encoding));
        commands.push(...this.COMMANDS.LINE_FEED);
      }

      // Separator
      commands.push(...this.textToBytes('-'.repeat(printerSettings.charsPerLine), printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);

      // Totals
      commands.push(...this.COMMANDS.FONT_SIZE_DOUBLE);
      commands.push(...this.COMMANDS.BOLD_ON);
      commands.push(...this.COMMANDS.ALIGN_RIGHT);
      commands.push(...this.textToBytes(`TOTAL: Gs. ${this.formatPrice(sale.total)}`, printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.BOLD_OFF);
      commands.push(...this.COMMANDS.FONT_SIZE_NORMAL);
      commands.push(...this.COMMANDS.ALIGN_LEFT);

      // Payment method
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.textToBytes(`Forma de Pago: ${sale.paymentMethod || 'Efectivo'}`, printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);

      // Footer
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.ALIGN_CENTER);
      commands.push(...this.textToBytes('Gracias por su compra!', printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.LINE_FEED);

      // Cut paper
      commands.push(...this.COMMANDS.CUT_PAPER);

      // Send to printer
      await this.sendToPrinter(commands);
    } catch (error) {
      console.error('Error printing ticket:', error);
      throw new Error('Error al imprimir ticket');
    }
  }

  /**
   * Print invoice (Factura Electrónica)
   * Implements full Paraguayan electronic invoice format with SET e-Kuatia compliance
   * Supports 58mm and 80mm thermal paper widths
   */
  async printInvoice(invoice: any, settings?: Partial<PrinterSettings>): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Impresora no conectada');
    }

    const printerSettings: PrinterSettings = {
      paperWidth: settings?.paperWidth || 58,
      encoding: settings?.encoding || 'UTF-8',
      charsPerLine: settings?.charsPerLine || (settings?.paperWidth === 80 ? 48 : 32)
    };

    try {
      const commands: number[] = [];

      // Initialize printer
      commands.push(...this.COMMANDS.INIT);

      // ========================================
      // HEADER - Company Information
      // ========================================
      commands.push(...this.COMMANDS.ALIGN_CENTER);
      commands.push(...this.COMMANDS.FONT_SIZE_LARGE);
      commands.push(...this.COMMANDS.BOLD_ON);
      commands.push(...this.textToBytes('FACTURA ELECTRONICA', printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.BOLD_OFF);
      commands.push(...this.COMMANDS.FONT_SIZE_NORMAL);
      commands.push(...this.COMMANDS.LINE_FEED);

      // Company name
      commands.push(...this.COMMANDS.BOLD_ON);
      commands.push(...this.textToBytes(invoice.companyName || 'MI NEGOCIO S.A.', printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.BOLD_OFF);

      // Company RUC
      commands.push(...this.textToBytes(`RUC: ${invoice.companyRuc || '80012345-6'}`, printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);

      // Company address
      if (invoice.companyAddress) {
        commands.push(...this.textToBytes(invoice.companyAddress, printerSettings.encoding));
        commands.push(...this.COMMANDS.LINE_FEED);
      }

      // Company city
      if (invoice.companyCity) {
        commands.push(...this.textToBytes(invoice.companyCity, printerSettings.encoding));
        commands.push(...this.COMMANDS.LINE_FEED);
      }

      // Company phone
      if (invoice.companyPhone) {
        commands.push(...this.textToBytes(`Tel: ${invoice.companyPhone}`, printerSettings.encoding));
        commands.push(...this.COMMANDS.LINE_FEED);
      }

      commands.push(...this.COMMANDS.LINE_FEED);

      // ========================================
      // TIMBRADO INFORMATION
      // ========================================
      if (invoice.timbradoNumber || invoice.timbrado) {
        commands.push(...this.COMMANDS.BOLD_ON);
        commands.push(...this.textToBytes(`Timbrado: ${invoice.timbradoNumber || invoice.timbrado}`, printerSettings.encoding));
        commands.push(...this.COMMANDS.LINE_FEED);
        commands.push(...this.COMMANDS.BOLD_OFF);

        // Timbrado validity dates
        if (invoice.timbradoStart) {
          commands.push(...this.textToBytes(`Inicio Vigencia: ${this.formatDate(invoice.timbradoStart)}`, printerSettings.encoding));
          commands.push(...this.COMMANDS.LINE_FEED);
        }
        if (invoice.timbradoEnd) {
          commands.push(...this.textToBytes(`Fin Vigencia: ${this.formatDate(invoice.timbradoEnd)}`, printerSettings.encoding));
          commands.push(...this.COMMANDS.LINE_FEED);
        }

        commands.push(...this.COMMANDS.LINE_FEED);
      }

      // ========================================
      // INVOICE NUMBER AND DATE
      // ========================================
      commands.push(...this.COMMANDS.ALIGN_LEFT);
      commands.push(...this.COMMANDS.BOLD_ON);
      commands.push(...this.textToBytes(`Factura No: ${invoice.invoiceNumber}`, printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.BOLD_OFF);

      // Invoice date
      const invoiceDate = invoice.date || invoice.createdAt || new Date();
      commands.push(...this.textToBytes(`Fecha: ${this.formatDateTime(invoiceDate)}`, printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);

      // Condition of sale
      const saleCondition = invoice.saleCondition || invoice.paymentMethod || 'CONTADO';
      commands.push(...this.textToBytes(`Condicion: ${saleCondition}`, printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.LINE_FEED);

      // ========================================
      // CDC (Código de Control)
      // ========================================
      if (invoice.cdc) {
        commands.push(...this.COMMANDS.BOLD_ON);
        commands.push(...this.textToBytes('CDC:', printerSettings.encoding));
        commands.push(...this.COMMANDS.LINE_FEED);
        commands.push(...this.COMMANDS.BOLD_OFF);

        // Split CDC into chunks for better readability on small paper
        const cdcChunks = this.splitTextIntoChunks(invoice.cdc, printerSettings.charsPerLine);
        for (const chunk of cdcChunks) {
          commands.push(...this.textToBytes(chunk, printerSettings.encoding));
          commands.push(...this.COMMANDS.LINE_FEED);
        }
        commands.push(...this.COMMANDS.LINE_FEED);
      }

      // KUDE (if available)
      if (invoice.kude) {
        commands.push(...this.textToBytes(`KUDE: ${invoice.kude}`, printerSettings.encoding));
        commands.push(...this.COMMANDS.LINE_FEED);
        commands.push(...this.COMMANDS.LINE_FEED);
      }

      // ========================================
      // CUSTOMER INFORMATION
      // ========================================
      commands.push(...this.COMMANDS.BOLD_ON);
      commands.push(...this.textToBytes('DATOS DEL CLIENTE:', printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.BOLD_OFF);

      if (invoice.customer) {
        // Customer name
        commands.push(...this.textToBytes(`Nombre: ${invoice.customer.name}`, printerSettings.encoding));
        commands.push(...this.COMMANDS.LINE_FEED);

        // Customer document
        if (invoice.customer.documentType && invoice.customer.documentId) {
          commands.push(...this.textToBytes(`${invoice.customer.documentType}: ${invoice.customer.documentId}`, printerSettings.encoding));
          commands.push(...this.COMMANDS.LINE_FEED);
        }

        // Customer address
        if (invoice.customer.address) {
          commands.push(...this.textToBytes(`Direccion: ${invoice.customer.address}`, printerSettings.encoding));
          commands.push(...this.COMMANDS.LINE_FEED);
        }

        // Customer phone
        if (invoice.customer.phone) {
          commands.push(...this.textToBytes(`Telefono: ${invoice.customer.phone}`, printerSettings.encoding));
          commands.push(...this.COMMANDS.LINE_FEED);
        }
      } else {
        commands.push(...this.textToBytes('Cliente General', printerSettings.encoding));
        commands.push(...this.COMMANDS.LINE_FEED);
      }

      commands.push(...this.COMMANDS.LINE_FEED);

      // ========================================
      // ITEMS TABLE
      // ========================================
      commands.push(...this.textToBytes('='.repeat(printerSettings.charsPerLine), printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);

      // Table header
      commands.push(...this.COMMANDS.BOLD_ON);
      if (printerSettings.paperWidth === 80) {
        // 80mm: More detailed columns
        commands.push(...this.textToBytes(this.padMultiColumn(['CANT', 'DESCRIPCION', 'P.UNIT', 'TOTAL'], [4, 20, 10, 10], printerSettings.charsPerLine), printerSettings.encoding));
      } else {
        // 58mm: Simplified layout
        commands.push(...this.textToBytes(this.padLine('DESCRIPCION', 'TOTAL', printerSettings.charsPerLine), printerSettings.encoding));
      }
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.textToBytes('-'.repeat(printerSettings.charsPerLine), printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.BOLD_OFF);

      // Items
      let totalTaxable = 0;
      let totalExempt = 0;
      let totalTax = 0;

      for (const item of invoice.items || []) {
        const itemQuantity = item.quantity || 1;
        const itemPrice = item.unitPrice || item.price || 0;
        const itemTotal = item.total || (itemQuantity * itemPrice);
        const itemTax = item.tax || 0;
        const itemTaxRate = item.taxRate || 0;

        // Accumulate taxable/exempt amounts
        if (itemTaxRate > 0) {
          totalTaxable += itemTotal;
          totalTax += itemTax;
        } else {
          totalExempt += itemTotal;
        }

        if (printerSettings.paperWidth === 80) {
          // 80mm: Show quantity, description, unit price, total on one line
          const itemName = this.truncateText(item.name || item.productName || 'Producto', 20);
          commands.push(...this.textToBytes(
            this.padMultiColumn(
              [
                itemQuantity.toString(),
                itemName,
                this.formatPrice(itemPrice),
                this.formatPrice(itemTotal)
              ],
              [4, 20, 10, 10],
              printerSettings.charsPerLine
            ),
            printerSettings.encoding
          ));
          commands.push(...this.COMMANDS.LINE_FEED);

          // Show tax rate if applicable
          if (itemTaxRate > 0) {
            commands.push(...this.textToBytes(`    IVA ${itemTaxRate}%`, printerSettings.encoding));
            commands.push(...this.COMMANDS.LINE_FEED);
          }
        } else {
          // 58mm: Multi-line format for each item
          // Item name
          commands.push(...this.textToBytes(item.name || item.productName || 'Producto', printerSettings.encoding));
          commands.push(...this.COMMANDS.LINE_FEED);

          // Quantity x Price = Total
          const qtyPrice = `${itemQuantity} x Gs. ${this.formatPrice(itemPrice)}`;
          const totalFormatted = `Gs. ${this.formatPrice(itemTotal)}`;
          commands.push(...this.textToBytes(this.padLine(qtyPrice, totalFormatted, printerSettings.charsPerLine), printerSettings.encoding));
          commands.push(...this.COMMANDS.LINE_FEED);

          // Show tax rate if applicable
          if (itemTaxRate > 0) {
            commands.push(...this.textToBytes(`  IVA ${itemTaxRate}%`, printerSettings.encoding));
            commands.push(...this.COMMANDS.LINE_FEED);
          }
        }
      }

      // ========================================
      // TOTALS SECTION
      // ========================================
      commands.push(...this.textToBytes('='.repeat(printerSettings.charsPerLine), printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);

      // Taxable and exempt breakdown
      if (totalTaxable > 0) {
        commands.push(...this.textToBytes(this.padLine('Total Gravado 10%:', `Gs. ${this.formatPrice(totalTaxable)}`, printerSettings.charsPerLine), printerSettings.encoding));
        commands.push(...this.COMMANDS.LINE_FEED);
      }

      if (totalExempt > 0) {
        commands.push(...this.textToBytes(this.padLine('Total Exento:', `Gs. ${this.formatPrice(totalExempt)}`, printerSettings.charsPerLine), printerSettings.encoding));
        commands.push(...this.COMMANDS.LINE_FEED);
      }

      // Subtotal
      const subtotal = invoice.subtotal || (invoice.total - (invoice.tax || 0));
      commands.push(...this.textToBytes(this.padLine('Subtotal:', `Gs. ${this.formatPrice(subtotal)}`, printerSettings.charsPerLine), printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);

      // Tax (IVA)
      if (invoice.tax && invoice.tax > 0) {
        commands.push(...this.textToBytes(this.padLine('IVA 10%:', `Gs. ${this.formatPrice(invoice.tax)}`, printerSettings.charsPerLine), printerSettings.encoding));
        commands.push(...this.COMMANDS.LINE_FEED);
      } else if (totalTax > 0) {
        commands.push(...this.textToBytes(this.padLine('IVA 10%:', `Gs. ${this.formatPrice(totalTax)}`, printerSettings.charsPerLine), printerSettings.encoding));
        commands.push(...this.COMMANDS.LINE_FEED);
      }

      // Discount (if applicable)
      if (invoice.discount && invoice.discount > 0) {
        commands.push(...this.textToBytes(this.padLine('Descuento:', `- Gs. ${this.formatPrice(invoice.discount)}`, printerSettings.charsPerLine), printerSettings.encoding));
        commands.push(...this.COMMANDS.LINE_FEED);
      }

      // Grand total
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.FONT_SIZE_DOUBLE);
      commands.push(...this.COMMANDS.BOLD_ON);
      const total = invoice.total || 0;
      commands.push(...this.textToBytes(this.padLine('TOTAL:', `Gs. ${this.formatPrice(total)}`, Math.floor(printerSettings.charsPerLine / 2)), printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.BOLD_OFF);
      commands.push(...this.COMMANDS.FONT_SIZE_NORMAL);

      commands.push(...this.textToBytes('='.repeat(printerSettings.charsPerLine), printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);

      // ========================================
      // PAYMENT INFORMATION
      // ========================================
      commands.push(...this.COMMANDS.LINE_FEED);
      const paymentMethod = invoice.paymentMethod || 'EFECTIVO';
      commands.push(...this.textToBytes(`Forma de Pago: ${paymentMethod}`, printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);

      // ========================================
      // QR CODE SECTION
      // ========================================
      if (invoice.qrCode || invoice.cdc) {
        commands.push(...this.COMMANDS.LINE_FEED);
        commands.push(...this.COMMANDS.ALIGN_CENTER);
        commands.push(...this.textToBytes('[-- CODIGO QR --]', printerSettings.encoding));
        commands.push(...this.COMMANDS.LINE_FEED);
        commands.push(...this.textToBytes('Escanear para verificar', printerSettings.encoding));
        commands.push(...this.COMMANDS.LINE_FEED);
        commands.push(...this.textToBytes('en el portal de SET', printerSettings.encoding));
        commands.push(...this.COMMANDS.LINE_FEED);
        commands.push(...this.COMMANDS.LINE_FEED);
      }

      // ========================================
      // LEGAL FOOTER
      // ========================================
      commands.push(...this.COMMANDS.ALIGN_CENTER);
      commands.push(...this.COMMANDS.BOLD_ON);
      commands.push(...this.textToBytes('ORIGINAL - CLIENTE', printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.BOLD_OFF);
      commands.push(...this.COMMANDS.LINE_FEED);

      // Legal text - wrap for readability
      commands.push(...this.COMMANDS.ALIGN_CENTER);
      const legalText = 'Documento Tributario Electronico autorizado por la SET. Consulte su validez en www.set.gov.py';
      const legalLines = this.wrapText(legalText, printerSettings.charsPerLine);
      for (const line of legalLines) {
        commands.push(...this.textToBytes(line, printerSettings.encoding));
        commands.push(...this.COMMANDS.LINE_FEED);
      }

      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.textToBytes('Gracias por su preferencia!', printerSettings.encoding));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.LINE_FEED);

      // ========================================
      // CUT PAPER
      // ========================================
      commands.push(...this.COMMANDS.CUT_PAPER);

      // Send to printer
      await this.sendToPrinter(commands);
    } catch (error) {
      console.error('Error printing invoice:', error);
      throw new Error('Error al imprimir factura');
    }
  }

  /**
   * Test printer connection
   */
  async testPrint(): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Impresora no conectada');
    }

    try {
      const commands: number[] = [];

      commands.push(...this.COMMANDS.INIT);
      commands.push(...this.COMMANDS.ALIGN_CENTER);
      commands.push(...this.COMMANDS.FONT_SIZE_LARGE);
      commands.push(...this.COMMANDS.BOLD_ON);
      commands.push(...this.textToBytes('PRUEBA DE IMPRESION', 'UTF-8'));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.FONT_SIZE_NORMAL);
      commands.push(...this.COMMANDS.BOLD_OFF);
      commands.push(...this.textToBytes('Impresora conectada correctamente', 'UTF-8'));
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.LINE_FEED);
      commands.push(...this.COMMANDS.CUT_PAPER);

      await this.sendToPrinter(commands);
    } catch (error) {
      console.error('Error in test print:', error);
      throw new Error('Error en prueba de impresión');
    }
  }

  /**
   * Send data to printer via Bluetooth
   */
  private async sendToPrinter(data: number[]): Promise<void> {
    const device = this.connectedDevice$.value;
    if (!device) {
      throw new Error('No hay impresora conectada');
    }

    try {
      // Convert to DataView for Bluetooth transmission
      numbersToDataView(data);

      // Send in chunks to avoid buffer overflow
      const chunkSize = 512;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        const chunkView = numbersToDataView(chunk);

        // Write to printer (this requires knowing the printer's service and characteristic UUIDs)
        // These UUIDs are printer-specific and may need to be discovered
        // For now, we'll use a generic approach
        await BleClient.write(
          device.id,
          '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Generic printer service UUID
          '49535343-8841-43f4-a8d4-ecbe34729bb3', // Generic printer characteristic UUID
          chunkView
        );

        // Small delay between chunks
        await this.delay(50);
      }
    } catch (error) {
      console.error('Error sending data to printer:', error);
      throw new Error('Error al enviar datos a la impresora');
    }
  }

  /**
   * Convert text to byte array
   */
  private textToBytes(text: string, _encoding = 'UTF-8'): number[] {
    const encoder = new TextEncoder();
    return Array.from(encoder.encode(text));
  }

  /**
   * Format price with thousands separator
   */
  private formatPrice(price: number): string {
    return price.toLocaleString('es-PY', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  /**
   * Pad line to fit printer width
   */
  private padLine(left: string, right: string, width: number): string {
    const totalLength = left.length + right.length;
    const padding = width - totalLength;

    if (padding <= 0) {
      return left + right;
    }

    return left + ' '.repeat(padding) + right;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Format date only (DD/MM/YYYY)
   */
  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-PY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Format date and time (DD/MM/YYYY HH:MM)
   */
  private formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('es-PY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  /**
   * Split text into chunks of specified length
   */
  private splitTextIntoChunks(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Truncate text to specified length with ellipsis
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Wrap text to fit within specified width
   */
  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;

      if (testLine.length <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Pad multi-column layout for tables
   * @param columns Array of column values
   * @param widths Array of column widths
   * @param totalWidth Total width available
   */
  private padMultiColumn(columns: string[], widths: number[], _totalWidth: number): string {
    let result = '';

    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const width = widths[i];

      // Truncate if too long
      const truncated = column.length > width
        ? column.substring(0, width)
        : column;

      // Right-align for numeric columns (price and total), left-align for others
      const isNumeric = i >= 2; // Assuming last 2 columns are numeric

      if (isNumeric) {
        result += truncated.padStart(width, ' ');
      } else {
        result += truncated.padEnd(width, ' ');
      }

      // Add space between columns (except last one)
      if (i < columns.length - 1) {
        result += ' ';
      }
    }

    return result;
  }

  /**
   * Get saved printer from storage
   */
  async getSavedPrinter(): Promise<PrinterDevice | null> {
    try {
      const saved = localStorage.getItem('connectedPrinter');
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch (error) {
      console.error('Error getting saved printer:', error);
      return null;
    }
  }

  /**
   * Auto-reconnect to saved printer
   */
  async autoReconnect(): Promise<boolean> {
    try {
      const saved = await this.getSavedPrinter();
      if (!saved) {
        return false;
      }

      await this.connect(saved);
      return true;
    } catch (error) {
      console.error('Error auto-reconnecting:', error);
      return false;
    }
  }
}
