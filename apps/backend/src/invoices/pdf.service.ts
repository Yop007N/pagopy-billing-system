import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'invoices');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a PDF invoice following Paraguayan format standards
   */
  async generateInvoicePdf(invoiceId: string): Promise<string> {
    // Fetch invoice with all related data
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        sale: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
            customer: true,
            user: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    try {
      // Generate unique filename
      const filename = `factura-${invoice.invoiceNumber}-${Date.now()}.pdf`;
      const filepath = path.join(this.uploadsDir, filename);

      // Ensure directory exists
      if (!fs.existsSync(this.uploadsDir)) {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
      }

      // Create PDF document
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const writeStream = fs.createWriteStream(filepath);
      doc.pipe(writeStream);

      // Generate PDF content
      this.buildPdfContent(doc, invoice);

      // Finalize PDF
      doc.end();

      // Wait for file to be written
      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      // Generate relative URL for storage
      const pdfUrl = `/uploads/invoices/${filename}`;

      // Update invoice with PDF info
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          pdfGenerated: true,
          pdfUrl: pdfUrl,
          updatedAt: new Date(),
        },
      });

      return pdfUrl;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to generate PDF: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Builds the PDF content with Paraguayan invoice format
   */
  private buildPdfContent(doc: PDFKit.PDFDocument, invoice: any): void {
    const sale = invoice.sale;
    const customer = sale.customer;

    // Page dimensions
    const pageWidth = doc.page.width;
    const leftMargin = 50;
    const rightMargin = pageWidth - 50;
    let yPosition = 50;

    // ===== HEADER SECTION =====
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('FACTURA', leftMargin, yPosition, { align: 'center' });
    yPosition += 30;

    // Company information (placeholder - should come from configuration)
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('EMPRESA DE EJEMPLO S.A.', leftMargin, yPosition, { align: 'center' });
    yPosition += 20;

    doc
      .fontSize(10)
      .font('Helvetica')
      .text('RUC: 80000000-0', leftMargin, yPosition, { align: 'center' });
    yPosition += 15;

    doc.text('Dirección: Asunción, Paraguay', leftMargin, yPosition, { align: 'center' });
    yPosition += 15;

    doc.text('Tel: +595 21 000000', leftMargin, yPosition, { align: 'center' });
    yPosition += 25;

    // Timbrado and invoice details box
    if (invoice.timbradoNumber) {
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .text(`Timbrado N°: ${invoice.timbradoNumber}`, leftMargin, yPosition);
      yPosition += 15;
    }

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(`Factura N°: ${invoice.invoiceNumber}`, leftMargin, yPosition);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Fecha: ${this.formatDate(sale.saleDate)}`, rightMargin - 150, yPosition);
    yPosition += 30;

    // Horizontal line
    doc
      .moveTo(leftMargin, yPosition)
      .lineTo(rightMargin, yPosition)
      .stroke();
    yPosition += 20;

    // ===== CUSTOMER INFORMATION =====
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('DATOS DEL CLIENTE', leftMargin, yPosition);
    yPosition += 20;

    if (customer) {
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Nombre/Razón Social: ${customer.name}`, leftMargin, yPosition);
      yPosition += 15;

      doc.text(`${customer.documentType}: ${customer.documentId}`, leftMargin, yPosition);
      yPosition += 15;

      if (customer.address) {
        doc.text(`Dirección: ${customer.address}`, leftMargin, yPosition);
        yPosition += 15;
      }

      if (customer.phone) {
        doc.text(`Teléfono: ${customer.phone}`, leftMargin, yPosition);
        yPosition += 15;
      }
    } else {
      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Consumidor Final', leftMargin, yPosition);
      yPosition += 15;
    }

    yPosition += 10;

    // Horizontal line
    doc
      .moveTo(leftMargin, yPosition)
      .lineTo(rightMargin, yPosition)
      .stroke();
    yPosition += 20;

    // ===== ITEMS TABLE =====
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('DETALLE DE LA VENTA', leftMargin, yPosition);
    yPosition += 20;

    // Table headers
    const table = {
      x: leftMargin,
      y: yPosition,
      headers: ['Concepto', 'Cant.', 'Precio Unit.', 'IVA', 'Subtotal'],
      widths: [220, 50, 80, 50, 80],
    };

    // Draw header row
    doc.fontSize(9).font('Helvetica-Bold');
    let xPos = table.x;
    table.headers.forEach((header, i) => {
      doc.text(header, xPos, table.y, {
        width: table.widths[i],
        align: i === 0 ? 'left' : 'right',
      });
      xPos += table.widths[i];
    });
    yPosition += 20;

    // Draw header line
    doc
      .moveTo(leftMargin, yPosition)
      .lineTo(rightMargin, yPosition)
      .stroke();
    yPosition += 10;

    // Table rows
    doc.fontSize(9).font('Helvetica');
    sale.items.forEach((item: any) => {
      xPos = table.x;

      // Concepto
      doc.text(item.product.name, xPos, yPosition, {
        width: table.widths[0],
        align: 'left',
      });
      xPos += table.widths[0];

      // Cantidad
      doc.text(item.quantity.toString(), xPos, yPosition, {
        width: table.widths[1],
        align: 'right',
      });
      xPos += table.widths[1];

      // Precio Unitario
      doc.text(this.formatCurrency(item.unitPrice), xPos, yPosition, {
        width: table.widths[2],
        align: 'right',
      });
      xPos += table.widths[2];

      // IVA %
      doc.text(`${item.taxRate.toString()}%`, xPos, yPosition, {
        width: table.widths[3],
        align: 'right',
      });
      xPos += table.widths[3];

      // Subtotal
      doc.text(this.formatCurrency(item.total), xPos, yPosition, {
        width: table.widths[4],
        align: 'right',
      });

      yPosition += 20;
    });

    yPosition += 10;

    // Draw line before totals
    doc
      .moveTo(leftMargin, yPosition)
      .lineTo(rightMargin, yPosition)
      .stroke();
    yPosition += 20;

    // ===== TAX BREAKDOWN SECTION =====
    const taxBreakdown = this.calculateTaxBreakdown(sale.items);

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('DESGLOSE DE IMPUESTOS', leftMargin, yPosition);
    yPosition += 20;

    doc.fontSize(9).font('Helvetica');

    // Gravado 10%
    if (taxBreakdown.gravado10 > 0) {
      doc.text('Gravado 10%:', leftMargin + 250, yPosition);
      doc.text(this.formatCurrency(taxBreakdown.gravado10), rightMargin - 80, yPosition, {
        width: 80,
        align: 'right',
      });
      yPosition += 15;

      doc.text('IVA 10%:', leftMargin + 250, yPosition);
      doc.text(this.formatCurrency(taxBreakdown.iva10), rightMargin - 80, yPosition, {
        width: 80,
        align: 'right',
      });
      yPosition += 15;
    }

    // Gravado 5%
    if (taxBreakdown.gravado5 > 0) {
      doc.text('Gravado 5%:', leftMargin + 250, yPosition);
      doc.text(this.formatCurrency(taxBreakdown.gravado5), rightMargin - 80, yPosition, {
        width: 80,
        align: 'right',
      });
      yPosition += 15;

      doc.text('IVA 5%:', leftMargin + 250, yPosition);
      doc.text(this.formatCurrency(taxBreakdown.iva5), rightMargin - 80, yPosition, {
        width: 80,
        align: 'right',
      });
      yPosition += 15;
    }

    // Exento
    if (taxBreakdown.exento > 0) {
      doc.text('Exento:', leftMargin + 250, yPosition);
      doc.text(this.formatCurrency(taxBreakdown.exento), rightMargin - 80, yPosition, {
        width: 80,
        align: 'right',
      });
      yPosition += 15;
    }

    yPosition += 10;

    // Subtotal
    doc.font('Helvetica-Bold');
    doc.text('Subtotal:', leftMargin + 250, yPosition);
    doc.text(this.formatCurrency(sale.subtotal), rightMargin - 80, yPosition, {
      width: 80,
      align: 'right',
    });
    yPosition += 15;

    // Total IVA
    doc.text('Total IVA:', leftMargin + 250, yPosition);
    doc.text(this.formatCurrency(sale.tax), rightMargin - 80, yPosition, {
      width: 80,
      align: 'right',
    });
    yPosition += 15;

    // Discount if any
    if (parseFloat(sale.discount.toString()) > 0) {
      doc.text('Descuento:', leftMargin + 250, yPosition);
      doc.text(`-${this.formatCurrency(sale.discount)}`, rightMargin - 80, yPosition, {
        width: 80,
        align: 'right',
      });
      yPosition += 15;
    }

    yPosition += 10;

    // Draw line before total
    doc
      .moveTo(leftMargin + 250, yPosition)
      .lineTo(rightMargin, yPosition)
      .stroke();
    yPosition += 15;

    // ===== TOTAL =====
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('TOTAL:', leftMargin + 250, yPosition);
    doc.text(`${this.formatCurrency(sale.total)} Gs.`, rightMargin - 100, yPosition, {
      width: 100,
      align: 'right',
    });
    yPosition += 30;

    // ===== PAYMENT METHOD =====
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Forma de Pago: ${this.formatPaymentMethod(sale.paymentMethod)}`, leftMargin, yPosition);
    yPosition += 30;

    // ===== FOOTER =====
    if (invoice.cdc) {
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(`CDC: ${invoice.cdc}`, leftMargin, yPosition, { align: 'center' });
      yPosition += 15;
    }

    if (invoice.kude) {
      doc.text(`KUDE: ${invoice.kude}`, leftMargin, yPosition, { align: 'center' });
      yPosition += 15;
    }

    // QR Code placeholder (if qrCode data exists)
    if (invoice.qrCode) {
      doc
        .fontSize(8)
        .text('Escanee el código QR para verificar', leftMargin, yPosition + 20, {
          align: 'center',
        });
      // Note: Actual QR code generation would require additional library like qrcode
    }

    // Footer text
    yPosition = doc.page.height - 80;
    doc
      .fontSize(8)
      .font('Helvetica')
      .text('Original: Cliente | Duplicado: Emisor', leftMargin, yPosition, {
        align: 'center',
      });
  }

  /**
   * Calculates tax breakdown by rate (10%, 5%, Exento)
   */
  private calculateTaxBreakdown(items: any[]): {
    gravado10: number;
    iva10: number;
    gravado5: number;
    iva5: number;
    exento: number;
  } {
    let gravado10 = 0;
    let iva10 = 0;
    let gravado5 = 0;
    let iva5 = 0;
    let exento = 0;

    items.forEach((item) => {
      const taxRate = parseFloat(item.taxRate.toString());
      const subtotal = parseFloat(item.subtotal.toString());
      const tax = parseFloat(item.tax.toString());

      if (taxRate === 10) {
        gravado10 += subtotal;
        iva10 += tax;
      } else if (taxRate === 5) {
        gravado5 += subtotal;
        iva5 += tax;
      } else {
        exento += subtotal;
      }
    });

    return { gravado10, iva10, gravado5, iva5, exento };
  }

  /**
   * Formats date to Paraguayan format (dd/MM/yyyy)
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Formats currency to Paraguayan Guaraní format (1.000.000)
   */
  private formatCurrency(amount: any): string {
    const num = parseFloat(amount.toString());
    return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  /**
   * Formats payment method to Spanish
   */
  private formatPaymentMethod(method: string): string {
    const methods: Record<string, string> = {
      CASH: 'Efectivo',
      CARD: 'Tarjeta',
      TRANSFER: 'Transferencia',
      QR: 'Código QR',
      BANCARD: 'Bancard',
      SIPAP: 'SIPAP',
    };
    return methods[method] || method;
  }

  /**
   * Deletes a PDF file from the filesystem
   */
  async deletePdf(pdfUrl: string): Promise<void> {
    try {
      const filename = path.basename(pdfUrl);
      const filepath = path.join(this.uploadsDir, filename);

      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      // Log error but don't throw - file deletion is not critical
      console.error(`Failed to delete PDF: ${(error as Error).message}`);
    }
  }
}
