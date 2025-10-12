import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto, UpdateSaleDto, SaleItemDto } from './dto';
import { SaleStatus, PaymentStatus, Prisma } from '@prisma/client';

interface CalculatedTotals {
  subtotalGravado10: number;
  subtotalGravado5: number;
  subtotalExento: number;
  iva10: number;
  iva5: number;
  totalIva: number;
  subtotal: number;
  total: number;
}

interface SaleFilters {
  page?: number;
  limit?: number;
  status?: SaleStatus;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate IVA totals for sale items
   * Separates IVA 10%, 5%, and exempt amounts
   */
  private calculateSaleTotals(
    items: SaleItemDto[],
    discount: number = 0,
  ): CalculatedTotals {
    let subtotalGravado10 = 0;
    let subtotalGravado5 = 0;
    let subtotalExento = 0;
    let iva10 = 0;
    let iva5 = 0;

    items.forEach((item) => {
      const itemSubtotal = item.amount * item.quantity;

      if (item.iva === 10) {
        subtotalGravado10 += itemSubtotal;
        iva10 += itemSubtotal * 0.1;
      } else if (item.iva === 5) {
        subtotalGravado5 += itemSubtotal;
        iva5 += itemSubtotal * 0.05;
      } else if (item.iva === 0) {
        subtotalExento += itemSubtotal;
      }
    });

    const subtotal = subtotalGravado10 + subtotalGravado5 + subtotalExento;
    const totalIva = iva10 + iva5;
    const total = subtotal + totalIva - discount;

    return {
      subtotalGravado10,
      subtotalGravado5,
      subtotalExento,
      iva10,
      iva5,
      totalIva,
      subtotal,
      total,
    };
  }

  /**
   * Generate sequential sale number
   */
  private async generateSaleNumber(): Promise<string> {
    const lastSale = await this.prisma.sale.findFirst({
      orderBy: { saleNumber: 'desc' },
      select: { saleNumber: true },
    });

    if (!lastSale) {
      return 'V-00001';
    }

    const lastNumber = parseInt(lastSale.saleNumber.split('-')[1]);
    const nextNumber = lastNumber + 1;
    return `V-${nextNumber.toString().padStart(5, '0')}`;
  }

  /**
   * Create a new sale with items
   */
  async create(userId: string, createSaleDto: CreateSaleDto) {
    const { items, paymentMethod, discount = 0, customerId, notes } = createSaleDto;

    // Validate that items are not empty
    if (!items || items.length === 0) {
      throw new BadRequestException('Items cannot be empty');
    }

    // Validate all products exist
    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found or inactive');
    }

    // Calculate totals
    const totals = this.calculateSaleTotals(items, discount);

    // Generate sale number
    const saleNumber = await this.generateSaleNumber();

    // Create sale with items in transaction
    try {
      const sale = await this.prisma.$transaction(async (tx) => {
        // Create sale
        const newSale = await tx.sale.create({
          data: {
            saleNumber,
            status: SaleStatus.PENDING,
            subtotal: new Prisma.Decimal(totals.subtotal),
            tax: new Prisma.Decimal(totals.totalIva),
            discount: new Prisma.Decimal(discount),
            total: new Prisma.Decimal(totals.total),
            paymentMethod,
            notes,
            userId,
            customerId,
            saleDate: new Date(),
          },
        });

        // Create sale items
        const saleItemsData = items.map((item) => {
          const itemSubtotal = item.amount * item.quantity;
          const itemTax = itemSubtotal * (item.iva / 100);
          const itemTotal = itemSubtotal + itemTax;

          return {
            saleId: newSale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.amount),
            taxRate: new Prisma.Decimal(item.iva),
            subtotal: new Prisma.Decimal(itemSubtotal),
            tax: new Prisma.Decimal(itemTax),
            total: new Prisma.Decimal(itemTotal),
          };
        });

        await tx.saleItem.createMany({
          data: saleItemsData,
        });

        // Create payment record
        await tx.payment.create({
          data: {
            saleId: newSale.id,
            amount: new Prisma.Decimal(totals.total),
            method: paymentMethod,
            status: PaymentStatus.PENDING,
          },
        });

        // Update product stock
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        return newSale;
      });

      // Fetch complete sale with relations
      return await this.findOne(sale.id, userId);
    } catch (error) {
      console.error('Error creating sale:', error);
      throw new InternalServerErrorException('Failed to create sale');
    }
  }

  /**
   * Find all sales with filters and pagination
   */
  async findAll(userId: string, filters?: SaleFilters) {
    const { page = 1, limit = 10, status, startDate, endDate } = filters || {};

    const skip = (page - 1) * limit;
    const take = limit;

    const where: Prisma.SaleWhereInput = {
      userId,
    };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) {
        where.saleDate.gte = startDate;
      }
      if (endDate) {
        where.saleDate.lte = endDate;
      }
    }

    const [sales, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              documentId: true,
              email: true,
            },
          },
          payment: true,
        },
      }),
      this.prisma.sale.count({ where }),
    ]);

    return {
      data: sales,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find one sale by ID
   */
  async findOne(id: string, userId: string) {
    const sale = await this.prisma.sale.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                description: true,
              },
            },
          },
        },
        customer: true,
        payment: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(id: string, status: PaymentStatus) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    if (!sale.payment) {
      throw new BadRequestException('Sale does not have a payment record');
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id: sale.payment.id },
      data: {
        status,
        paidAt: status === PaymentStatus.COMPLETED ? new Date() : null,
      },
    });

    // Update sale status if payment is completed
    if (status === PaymentStatus.COMPLETED) {
      await this.prisma.sale.update({
        where: { id },
        data: { status: SaleStatus.COMPLETED },
      });
    }

    return updatedPayment;
  }

  /**
   * Get sales summary statistics
   */
  async getSummary(userId: string) {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todaySales, weekSales, monthSales, totalSales] = await Promise.all([
      this.prisma.sale.aggregate({
        where: {
          userId,
          saleDate: { gte: startOfToday },
          status: { not: SaleStatus.CANCELLED },
        },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.sale.aggregate({
        where: {
          userId,
          saleDate: { gte: startOfWeek },
          status: { not: SaleStatus.CANCELLED },
        },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.sale.aggregate({
        where: {
          userId,
          saleDate: { gte: startOfMonth },
          status: { not: SaleStatus.CANCELLED },
        },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.sale.aggregate({
        where: {
          userId,
          status: { not: SaleStatus.CANCELLED },
        },
        _sum: { total: true },
        _count: true,
      }),
    ]);

    return {
      today: {
        count: todaySales._count,
        total: todaySales._sum.total || 0,
      },
      week: {
        count: weekSales._count,
        total: weekSales._sum.total || 0,
      },
      month: {
        count: monthSales._count,
        total: monthSales._sum.total || 0,
      },
      allTime: {
        count: totalSales._count,
        total: totalSales._sum.total || 0,
      },
    };
  }

  /**
   * Get daily sales statistics for last N days
   */
  async getDailyStats(userId: string, days: number = 7) {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const sales = await this.prisma.sale.findMany({
      where: {
        userId,
        saleDate: { gte: startDate },
        status: { not: SaleStatus.CANCELLED },
      },
      select: {
        saleDate: true,
        total: true,
      },
    });

    // Group sales by date
    const dailyStats = new Map<string, { count: number; total: number }>();

    // Initialize all days with zero values
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      dailyStats.set(dateKey, { count: 0, total: 0 });
    }

    // Aggregate sales by date
    sales.forEach((sale) => {
      const dateKey = sale.saleDate.toISOString().split('T')[0];
      const current = dailyStats.get(dateKey) || { count: 0, total: 0 };
      dailyStats.set(dateKey, {
        count: current.count + 1,
        total: current.total + Number(sale.total),
      });
    });

    // Convert to array and sort by date
    return Array.from(dailyStats.entries())
      .map(([date, stats]) => ({
        date,
        count: stats.count,
        total: stats.total,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Cancel a sale and restore stock
   */
  async cancel(id: string, userId: string) {
    const sale = await this.findOne(id, userId);

    if (sale.status === SaleStatus.CANCELLED) {
      throw new BadRequestException('Sale is already cancelled');
    }

    if (sale.status === SaleStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed sale');
    }

    await this.prisma.$transaction(async (tx) => {
      // Update sale status
      await tx.sale.update({
        where: { id },
        data: { status: SaleStatus.CANCELLED },
      });

      // Restore product stock
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Update payment status
      if (sale.payment) {
        await tx.payment.update({
          where: { id: sale.payment.id },
          data: { status: PaymentStatus.FAILED },
        });
      }
    });

    return await this.findOne(id, userId);
  }
}
