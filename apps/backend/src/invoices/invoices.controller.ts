import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { PdfGeneratedResponseDto } from './dto/pdf-generated-response.dto';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Return all invoices' })
  async findAll(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // TODO: Implement get all invoices
    return { message: 'Get all invoices - To be implemented' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Return invoice' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async findOne(@Param('id') id: string) {
    // TODO: Implement get invoice by id
    return { message: `Get invoice ${id} - To be implemented` };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate invoice from sale' })
  @ApiResponse({ status: 201, description: 'Invoice created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createInvoiceDto: any) {
    // TODO: Implement create invoice
    return { message: 'Create invoice - To be implemented' };
  }

  @Post(':id/send-to-set')
  @ApiOperation({ summary: 'Send invoice to SET e-Kuatia' })
  @ApiResponse({ status: 200, description: 'Invoice sent to SET' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async sendToSet(@Param('id') id: string) {
    // TODO: Implement send to SET
    return { message: `Send invoice ${id} to SET - To be implemented` };
  }

  @Post(':id/send-to-customer')
  @ApiOperation({ summary: 'Send invoice to customer via email/SMS' })
  @ApiResponse({ status: 200, description: 'Invoice sent to customer' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async sendToCustomer(@Param('id') id: string) {
    // TODO: Implement send to customer
    return { message: `Send invoice ${id} to customer - To be implemented` };
  }

  @Post(':id/generate-pdf')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate PDF invoice' })
  @ApiResponse({
    status: 200,
    description: 'PDF generated successfully',
    type: PdfGeneratedResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 500, description: 'Internal server error during PDF generation' })
  async generatePdf(@Param('id') id: string) {
    return this.invoicesService.generatePdf(id);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download invoice as PDF' })
  @ApiResponse({ status: 200, description: 'Return PDF file' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async downloadPdf(@Param('id') id: string) {
    // TODO: Implement PDF download/streaming
    return { message: `Download invoice ${id} PDF - To be implemented` };
  }

  @Get(':id/xml')
  @ApiOperation({ summary: 'Download invoice XML' })
  @ApiResponse({ status: 200, description: 'Return XML file' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async downloadXml(@Param('id') id: string) {
    // TODO: Implement XML download
    return { message: `Download invoice ${id} XML - To be implemented` };
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel invoice' })
  @ApiResponse({ status: 200, description: 'Invoice cancelled' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async cancel(@Param('id') id: string, @Body() cancelDto: any) {
    // TODO: Implement cancel invoice
    return { message: `Cancel invoice ${id} - To be implemented` };
  }
}
