import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from './pdf.service';
import { PdfGeneratedResponseDto } from './dto/pdf-generated-response.dto';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  async findAll(filters?: any) {
    // TODO: Implement find all invoices with filters
    throw new Error('Method not implemented');
  }

  async findOne(id: string) {
    // TODO: Implement find invoice by id
    throw new Error('Method not implemented');
  }

  async create(invoiceData: { saleId: string }) {
    // 1. Get sale data with all relations
    const sale = await this.prisma.sale.findUnique({
      where: { id: invoiceData.saleId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
        user: true,
        customer: true,
      },
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${invoiceData.saleId} not found`);
    }

    // Check if invoice already exists for this sale
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { saleId: sale.id },
    });

    if (existingInvoice) {
      throw new Error('Invoice already exists for this sale');
    }

    // 2. Generate invoice number (format: XXX-XXX-XXXXXXX)
    const invoiceCount = await this.prisma.invoice.count();
    const invoiceNumber = this.generateInvoiceNumber(invoiceCount + 1);

    // 3. Get user's timbrado (from user fiscal data)
    const timbradoNumber = sale.user.timbrado || '12345678'; // Fallback if not set

    // 4. Create invoice record
    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        timbradoNumber,
        saleId: sale.id,
        status: 'DRAFT', // Initial status
      },
      include: {
        sale: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
            user: true,
            customer: true,
            payment: true,
          },
        },
      },
    });

    return invoice;
  }

  /**
   * Generate invoice number in format: XXX-XXX-XXXXXXX
   */
  private generateInvoiceNumber(sequence: number): string {
    const establishmentCode = '001'; // Point of sale code
    const pointOfSale = '001'; // Cash register/terminal code
    const sequenceStr = sequence.toString().padStart(7, '0');
    return `${establishmentCode}-${pointOfSale}-${sequenceStr}`;
  }

  async sendToSet(id: string) {
    // TODO: Implement send invoice to SET e-Kuatia
    // 1. Get invoice and validate
    // 2. Generate XML if not exists
    // 3. Send to SET API
    // 4. Process response and update invoice
    throw new Error('Method not implemented');
  }

  async sendToCustomer(id: string) {
    // TODO: Implement send invoice to customer
    // 1. Get invoice and customer data
    // 2. Generate PDF
    // 3. Send via email/SMS
    throw new Error('Method not implemented');
  }

  /**
   * Generate PDF invoice for a given invoice ID
   */
  async generatePdf(id: string): Promise<PdfGeneratedResponseDto> {
    // Verify invoice exists
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        invoiceNumber: true,
        pdfGenerated: true,
        pdfUrl: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    // Generate PDF using PDF service
    const pdfUrl = await this.pdfService.generateInvoicePdf(id);

    // Return response DTO
    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      pdfUrl: pdfUrl,
      generatedAt: new Date(),
      message: 'PDF invoice generated successfully',
    };
  }

  async generateXml(invoiceData: any) {
    // TODO: Implement XML generation for SET
    throw new Error('Method not implemented');
  }

  async cancel(id: string, reason: string) {
    // TODO: Implement cancel invoice
    // 1. Update status
    // 2. Notify SET if already sent
    throw new Error('Method not implemented');
  }
}
