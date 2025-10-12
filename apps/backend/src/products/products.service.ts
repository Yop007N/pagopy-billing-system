import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { Prisma } from '@prisma/client';

interface ProductFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new product
   */
  async create(userId: string, createProductDto: CreateProductDto) {
    const { code, name, description, price, cost, stock, taxRate } = createProductDto;

    // Validate IVA rate
    if (![0, 5, 10].includes(taxRate)) {
      throw new BadRequestException('Tax rate must be 0, 5, or 10');
    }

    // Validate price is positive
    if (price < 0) {
      throw new BadRequestException('Price must be a positive number');
    }

    // Check if product code already exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { code },
    });

    if (existingProduct) {
      throw new ConflictException(`Product with code '${code}' already exists`);
    }

    // Create product
    const product = await this.prisma.product.create({
      data: {
        code,
        name,
        description,
        price: new Prisma.Decimal(price),
        cost: cost !== undefined ? new Prisma.Decimal(cost) : null,
        stock: stock || 0,
        taxRate: new Prisma.Decimal(taxRate),
        userId,
        isActive: true,
      },
    });

    return product;
  }

  /**
   * Find all products for a user with optional filters
   */
  async findAll(userId: string, filters?: ProductFilters) {
    const { search, isActive, page = 1, limit = 50 } = filters || {};

    const skip = (page - 1) * limit;
    const take = limit;

    const where: Prisma.ProductWhereInput = {
      userId,
    };

    // Filter by active status (default: only active products)
    if (isActive !== undefined) {
      where.isActive = isActive;
    } else {
      where.isActive = true; // Default to active products only
    }

    // Search by name or code
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find product by ID
   */
  async findOne(id: string, userId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  /**
   * Find product by code
   */
  async findByCode(code: string, userId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        code,
        userId,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with code ${code} not found`);
    }

    return product;
  }

  /**
   * Update product
   */
  async update(id: string, userId: string, updateProductDto: UpdateProductDto) {
    // Verify product exists and belongs to user
    await this.findOne(id, userId);

    const { code, price, cost, taxRate, stock, ...otherFields } = updateProductDto;

    // Validate tax rate if provided
    if (taxRate !== undefined && ![0, 5, 10].includes(taxRate)) {
      throw new BadRequestException('Tax rate must be 0, 5, or 10');
    }

    // Validate price if provided
    if (price !== undefined && price < 0) {
      throw new BadRequestException('Price must be a positive number');
    }

    // Check if code is being updated and if it already exists
    if (code) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { code },
      });

      if (existingProduct && existingProduct.id !== id) {
        throw new ConflictException(`Product with code '${code}' already exists`);
      }
    }

    // Build update data
    const updateData: any = { ...otherFields };

    if (code) updateData.code = code;
    if (price !== undefined) updateData.price = new Prisma.Decimal(price);
    if (cost !== undefined) updateData.cost = new Prisma.Decimal(cost);
    if (taxRate !== undefined) updateData.taxRate = new Prisma.Decimal(taxRate);
    if (stock !== undefined) updateData.stock = stock;

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
    });

    return product;
  }

  /**
   * Soft delete product (set isActive to false)
   */
  async remove(id: string, userId: string) {
    // Verify product exists and belongs to user
    await this.findOne(id, userId);

    const product = await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return product;
  }

  /**
   * Update product stock
   */
  async updateStock(id: string, userId: string, quantity: number) {
    // Verify product exists and belongs to user
    const product = await this.findOne(id, userId);

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    return await this.prisma.product.update({
      where: { id },
      data: { stock: newStock },
    });
  }
}
