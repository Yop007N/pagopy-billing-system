import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CustomerType } from '@prisma/client';

@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Customer with this document ID already exists',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body(ValidationPipe) createCustomerDto: CreateCustomerDto) {
    return await this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers with filters and pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 50,
    description: 'Number of items per page (max 100)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'Juan',
    description: 'Search by name, document ID, email, or phone',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: CustomerType,
    description: 'Filter by customer type (INDIVIDUAL or BUSINESS)',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    example: true,
    description: 'Filter by active status. Defaults to true (only active customers)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all customers with pagination',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('type') type?: CustomerType,
    @Query('isActive') isActive?: string,
  ) {
    const filters = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
      search,
      type,
      isActive: isActive !== undefined ? isActive === 'true' : true,
    };

    return await this.customersService.findAll(filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get customer statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return customer statistics',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats() {
    return await this.customersService.getStats();
  }

  @Get('document/:documentId')
  @ApiOperation({ summary: 'Get customer by document ID' })
  @ApiResponse({ status: 200, description: 'Return customer details' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByDocument(@Param('documentId') documentId: string) {
    return await this.customersService.findByDocument(documentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 200, description: 'Return customer details with recent sales' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    return await this.customersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Document ID or email already exists',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateCustomerDto: UpdateCustomerDto,
  ) {
    return await this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete customer (deactivate)' })
  @ApiResponse({
    status: 200,
    description: 'Customer deactivated successfully',
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string) {
    return await this.customersService.remove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deactivated customer' })
  @ApiResponse({
    status: 200,
    description: 'Customer restored successfully',
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 400, description: 'Customer is already active' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async restore(@Param('id') id: string) {
    return await this.customersService.restore(id);
  }
}
