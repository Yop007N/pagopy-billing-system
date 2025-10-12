import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';
import { CustomerType } from '@prisma/client';

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: CustomerType;
  isActive?: boolean;
}

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    // Check if customer with this documentId already exists
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { documentId: createCustomerDto.documentId },
    });

    if (existingCustomer) {
      throw new ConflictException(
        `Customer with document ID ${createCustomerDto.documentId} already exists`,
      );
    }

    // Validate email uniqueness if provided
    if (createCustomerDto.email) {
      const customerWithEmail = await this.prisma.customer.findFirst({
        where: { email: createCustomerDto.email, isActive: true },
      });

      if (customerWithEmail) {
        throw new ConflictException(
          `Customer with email ${createCustomerDto.email} already exists`,
        );
      }
    }

    // Create customer
    const customer = await this.prisma.customer.create({
      data: {
        type: createCustomerDto.type,
        documentType: createCustomerDto.documentType,
        documentId: createCustomerDto.documentId,
        name: createCustomerDto.name,
        email: createCustomerDto.email,
        phone: createCustomerDto.phone,
        address: createCustomerDto.address,
        city: createCustomerDto.city,
        country: createCustomerDto.country || 'Paraguay',
      },
    });

    return {
      message: 'Customer created successfully',
      data: customer,
    };
  }

  async findAll(filters: CustomerFilters = {}) {
    const {
      page = 1,
      limit = 50,
      search,
      type,
      isActive = true,
    } = filters;

    // Validate pagination parameters
    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Filter by active status
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Filter by customer type
    if (type) {
      where.type = type;
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { documentId: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get customers and total count
    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { sales: true },
          },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            saleNumber: true,
            total: true,
            status: true,
            saleDate: true,
          },
        },
        _count: {
          select: { sales: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return {
      data: customer,
    };
  }

  async findByDocument(documentId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { documentId },
      include: {
        _count: {
          select: { sales: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(
        `Customer with document ID ${documentId} not found`,
      );
    }

    return {
      data: customer,
    };
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    // Check if customer exists
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // If documentId is being changed, check for conflicts
    if (
      updateCustomerDto.documentId &&
      updateCustomerDto.documentId !== existingCustomer.documentId
    ) {
      const duplicateDocument = await this.prisma.customer.findUnique({
        where: { documentId: updateCustomerDto.documentId },
      });

      if (duplicateDocument) {
        throw new ConflictException(
          `Customer with document ID ${updateCustomerDto.documentId} already exists`,
        );
      }
    }

    // If email is being changed, check for conflicts
    if (
      updateCustomerDto.email &&
      updateCustomerDto.email !== existingCustomer.email
    ) {
      const duplicateEmail = await this.prisma.customer.findFirst({
        where: {
          email: updateCustomerDto.email,
          isActive: true,
          id: { not: id },
        },
      });

      if (duplicateEmail) {
        throw new ConflictException(
          `Customer with email ${updateCustomerDto.email} already exists`,
        );
      }
    }

    // Update customer
    const customer = await this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });

    return {
      message: 'Customer updated successfully',
      data: customer,
    };
  }

  async remove(id: string) {
    // Check if customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { sales: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Soft delete - set isActive to false
    const updatedCustomer = await this.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      message: 'Customer deactivated successfully',
      data: updatedCustomer,
    };
  }

  async restore(id: string) {
    // Check if customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    if (customer.isActive) {
      throw new BadRequestException('Customer is already active');
    }

    // Reactivate customer
    const updatedCustomer = await this.prisma.customer.update({
      where: { id },
      data: { isActive: true },
    });

    return {
      message: 'Customer restored successfully',
      data: updatedCustomer,
    };
  }

  async getStats() {
    const [total, active, inactive, individual, business] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.count({ where: { isActive: true } }),
      this.prisma.customer.count({ where: { isActive: false } }),
      this.prisma.customer.count({ where: { type: 'INDIVIDUAL' } }),
      this.prisma.customer.count({ where: { type: 'BUSINESS' } }),
    ]);

    return {
      data: {
        total,
        active,
        inactive,
        byType: {
          individual,
          business,
        },
      },
    };
  }
}
