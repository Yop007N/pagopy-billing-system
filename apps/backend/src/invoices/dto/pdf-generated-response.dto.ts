import { ApiProperty } from '@nestjs/swagger';

export class PdfGeneratedResponseDto {
  @ApiProperty({
    description: 'Invoice ID',
    example: 'clxyz123abc',
  })
  invoiceId!: string;

  @ApiProperty({
    description: 'Invoice number',
    example: '001-001-0000123',
  })
  invoiceNumber!: string;

  @ApiProperty({
    description: 'URL to access the generated PDF',
    example: '/uploads/invoices/factura-001-001-0000123-1697123456789.pdf',
  })
  pdfUrl!: string;

  @ApiProperty({
    description: 'Timestamp when PDF was generated',
    example: '2024-10-11T14:30:00.000Z',
  })
  generatedAt!: Date;

  @ApiProperty({
    description: 'Success message',
    example: 'PDF invoice generated successfully',
  })
  message!: string;
}
