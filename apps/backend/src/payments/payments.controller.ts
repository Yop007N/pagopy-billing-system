import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ValidationPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaymentStatus } from '@prisma/client';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a payment for a sale' })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or payment already exists',
  })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @CurrentUser('id') userId: string,
    @Body(ValidationPipe) createPaymentDto: CreatePaymentDto,
  ) {
    return await this.paymentsService.create(createPaymentDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
  })
  @ApiResponse({
    status: 200,
    description: 'Return all payments with pagination',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: PaymentStatus,
  ) {
    return await this.paymentsService.findAll(
      userId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      status,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: 'clxxx123456789',
  })
  @ApiResponse({ status: 200, description: 'Return payment details' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return await this.paymentsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update payment status and details' })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: 'clxxx123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot update completed or refunded payment',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body(ValidationPipe) updatePaymentDto: UpdatePaymentDto,
  ) {
    return await this.paymentsService.update(id, updatePaymentDto, userId);
  }

  @Get('sale/:saleId')
  @ApiOperation({ summary: 'Get payment for a specific sale' })
  @ApiParam({
    name: 'saleId',
    description: 'Sale ID',
    example: 'clxxx123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Return payment for the sale',
  })
  @ApiResponse({ status: 404, description: 'Sale or payment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findBySaleId(
    @CurrentUser('id') userId: string,
    @Param('saleId') saleId: string,
  ) {
    return await this.paymentsService.findBySaleId(saleId, userId);
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: 'clxxx123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment refunded successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({
    status: 400,
    description: 'Only completed payments can be refunded',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refund(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return await this.paymentsService.refund(id, userId, reason);
  }

  @Post('process-bancard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process Bancard payment (placeholder for gateway integration)',
  })
  @ApiResponse({
    status: 200,
    description: 'Bancard payment processed',
  })
  @ApiResponse({
    status: 501,
    description: 'Bancard integration not implemented',
  })
  async processBancard(@Body() paymentData: any) {
    return await this.paymentsService.processBancardPayment(paymentData);
  }

  @Post('process-sipap')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process SIPAP payment (placeholder for gateway integration)',
  })
  @ApiResponse({
    status: 200,
    description: 'SIPAP payment processed',
  })
  @ApiResponse({
    status: 501,
    description: 'SIPAP integration not implemented',
  })
  async processSipap(@Body() paymentData: any) {
    return await this.paymentsService.processSipapPayment(paymentData);
  }
}
