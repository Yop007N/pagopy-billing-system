import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Get sales report' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'Return sales report' })
  async salesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    // TODO: Implement sales report
    return { message: 'Sales report - To be implemented' };
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue report' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'Return revenue report' })
  async revenueReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    // TODO: Implement revenue report
    return { message: 'Revenue report - To be implemented' };
  }

  @Get('products')
  @ApiOperation({ summary: 'Get products report (best sellers, low stock)' })
  @ApiResponse({ status: 200, description: 'Return products report' })
  async productsReport() {
    // TODO: Implement products report
    return { message: 'Products report - To be implemented' };
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get invoices report' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'Return invoices report' })
  async invoicesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    // TODO: Implement invoices report
    return { message: 'Invoices report - To be implemented' };
  }
}
