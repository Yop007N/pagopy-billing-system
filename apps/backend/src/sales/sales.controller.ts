import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseEnumPipe,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto, UpdateSaleDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SaleStatus, PaymentStatus } from '@prisma/client';

@ApiTags('sales')
@ApiBearerAuth()
@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new sale' })
  @ApiResponse({
    status: 201,
    description: 'Sale created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @CurrentUser('id') userId: string,
    @Body(ValidationPipe) createSaleDto: CreateSaleDto,
  ) {
    return await this.salesService.create(userId, createSaleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SaleStatus,
    example: SaleStatus.COMPLETED,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2025-10-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2025-10-11',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all sales with pagination',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: SaleStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    return await this.salesService.findAll(userId, filters);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get sales summary statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return sales statistics for today, week, month, and all time',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSummary(@CurrentUser('id') userId: string) {
    return await this.salesService.getSummary(userId);
  }

  @Get('daily-stats')
  @ApiOperation({ summary: 'Get daily sales statistics for last N days' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 7 })
  @ApiResponse({
    status: 200,
    description: 'Return daily sales statistics',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDailyStats(
    @CurrentUser('id') userId: string,
    @Query('days') days?: number,
  ) {
    const daysToFetch = days ? Number(days) : 7;
    return await this.salesService.getDailyStats(userId, daysToFetch);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by ID' })
  @ApiResponse({ status: 200, description: 'Return sale details' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return await this.salesService.findOne(id, userId);
  }

  @Patch(':id/payment')
  @ApiOperation({ summary: 'Update payment status' })
  @ApiQuery({
    name: 'status',
    required: true,
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  @ApiResponse({ status: 400, description: 'Invalid payment status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updatePaymentStatus(
    @Param('id') id: string,
    @Query('status', new ParseEnumPipe(PaymentStatus)) status: PaymentStatus,
  ) {
    return await this.salesService.updatePaymentStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel sale and restore stock' })
  @ApiResponse({
    status: 200,
    description: 'Sale cancelled successfully',
  })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel completed or already cancelled sale',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async cancel(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return await this.salesService.cancel(id, userId);
  }
}
