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
  ValidationPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 409, description: 'Conflict - Product code already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @CurrentUser('id') userId: string,
    @Body(ValidationPipe) createProductDto: CreateProductDto,
  ) {
    return await this.productsService.create(userId, createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'laptop' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    example: true,
    description: 'Filter by active status. Defaults to true (only active products)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all products with pagination',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const filters = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
      search,
      isActive: isActive !== undefined ? isActive === 'true' : true, // Default to active only
    };

    return await this.productsService.findAll(userId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Return product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return await this.productsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 409, description: 'Conflict - Product code already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body(ValidationPipe) updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.update(id, userId, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete product (deactivate)' })
  @ApiResponse({
    status: 200,
    description: 'Product deactivated successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return await this.productsService.remove(id, userId);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Update product stock' })
  @ApiQuery({
    name: 'quantity',
    required: true,
    type: Number,
    example: 10,
    description: 'Quantity to add (positive) or subtract (negative)',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateStock(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Query('quantity') quantity: number,
  ) {
    return await this.productsService.updateStock(id, userId, Number(quantity));
  }
}
