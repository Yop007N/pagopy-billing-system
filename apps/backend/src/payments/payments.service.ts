import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto';
import { PaymentStatus, SaleStatus, Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new payment for a sale
   * Validates sale exists, amount matches, and prevents overpayment
   */
  async create(createPaymentDto: CreatePaymentDto, userId: string) {
    const { saleId, method, amount, transactionId, bankReference, transactionData } = createPaymentDto;

    // Validate sale exists and belongs to user
    const sale = await this.prisma.sale.findFirst({
      where: {
        id: saleId,
        userId,
      },
      include: {
        payment: true,
      },
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${saleId} not found`);
    }

    // Check if payment already exists for this sale
    if (sale.payment) {
      throw new BadRequestException('Payment already exists for this sale');
    }

    // Validate payment amount matches sale total
    const saleTotal = Number(sale.total);
    if (amount !== saleTotal) {
      throw new BadRequestException(
        `Payment amount (${amount}) does not match sale total (${saleTotal})`,
      );
    }

    // Validate sale is not cancelled
    if (sale.status === SaleStatus.CANCELLED) {
      throw new BadRequestException('Cannot create payment for cancelled sale');
    }

    // Create payment
    try {
      const payment = await this.prisma.payment.create({
        data: {
          saleId,
          method,
          amount: new Prisma.Decimal(amount),
          status: PaymentStatus.PENDING,
          transactionId,
          bankReference,
          transactionData: transactionData as Prisma.InputJsonValue,
        },
        include: {
          sale: {
            select: {
              id: true,
              saleNumber: true,
              total: true,
              status: true,
            },
          },
        },
      });

      return payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new InternalServerErrorException('Failed to create payment');
    }
  }

  /**
   * Get all payments for a user
   * Returns payments with pagination
   */
  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: PaymentStatus,
  ) {
    const skip = (page - 1) * limit;
    const take = limit;

    const where: Prisma.PaymentWhereInput = {
      sale: {
        userId,
      },
    };

    if (status) {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          sale: {
            select: {
              id: true,
              saleNumber: true,
              total: true,
              status: true,
              saleDate: true,
              customer: {
                select: {
                  id: true,
                  name: true,
                  documentId: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get payment by ID
   * Validates user has access to the payment
   */
  async findOne(id: string, userId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        sale: {
          userId,
        },
      },
      include: {
        sale: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                documentId: true,
                email: true,
                phone: true,
              },
            },
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
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
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  /**
   * Get all payments for a specific sale
   */
  async findBySaleId(saleId: string, userId: string) {
    // Validate sale exists and belongs to user
    const sale = await this.prisma.sale.findFirst({
      where: {
        id: saleId,
        userId,
      },
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${saleId} not found`);
    }

    const payment = await this.prisma.payment.findUnique({
      where: { saleId },
      include: {
        sale: {
          select: {
            id: true,
            saleNumber: true,
            total: true,
            status: true,
            saleDate: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`No payment found for sale ${saleId}`);
    }

    return payment;
  }

  /**
   * Update payment status and related data
   * When payment is completed, updates sale status
   */
  async update(id: string, updatePaymentDto: UpdatePaymentDto, userId: string) {
    const { status, transactionId, bankReference, transactionData, processorResponse, paidAt } =
      updatePaymentDto;

    // Validate payment exists and user has access
    const payment = await this.findOne(id, userId);

    // Prevent updating completed or refunded payments
    if (
      payment.status === PaymentStatus.COMPLETED ||
      payment.status === PaymentStatus.REFUNDED
    ) {
      throw new BadRequestException(
        `Cannot update payment with status ${payment.status}`,
      );
    }

    // Update payment in transaction
    try {
      const updatedPayment = await this.prisma.$transaction(async (tx) => {
        // Update payment
        const updated = await tx.payment.update({
          where: { id },
          data: {
            ...(status && { status }),
            ...(transactionId && { transactionId }),
            ...(bankReference && { bankReference }),
            ...(transactionData && {
              transactionData: transactionData as Prisma.InputJsonValue,
            }),
            ...(processorResponse && {
              processorResponse: processorResponse as Prisma.InputJsonValue,
            }),
            ...(paidAt && { paidAt }),
            // Auto-set paidAt when status changes to COMPLETED
            ...(status === PaymentStatus.COMPLETED && !paidAt && { paidAt: new Date() }),
          },
          include: {
            sale: true,
          },
        });

        // Update sale status when payment is completed
        if (status === PaymentStatus.COMPLETED) {
          await tx.sale.update({
            where: { id: payment.saleId },
            data: { status: SaleStatus.COMPLETED },
          });
        }

        // Update sale status when payment fails
        if (status === PaymentStatus.FAILED) {
          await tx.sale.update({
            where: { id: payment.saleId },
            data: { status: SaleStatus.PENDING },
          });
        }

        // Handle refunded payments
        if (status === PaymentStatus.REFUNDED) {
          await tx.sale.update({
            where: { id: payment.saleId },
            data: { status: SaleStatus.REFUNDED },
          });
        }

        return updated;
      });

      return updatedPayment;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw new InternalServerErrorException('Failed to update payment');
    }
  }

  /**
   * Process Bancard payment
   * Placeholder for Bancard integration
   */
  async processBancardPayment(paymentData: any) {
    // TODO: Implement Bancard integration
    // This would involve:
    // 1. Call Bancard API
    // 2. Validate response
    // 3. Update payment status
    // 4. Return result
    throw new Error('Bancard integration not implemented');
  }

  /**
   * Process SIPAP payment
   * Placeholder for SIPAP integration
   */
  async processSipapPayment(paymentData: any) {
    // TODO: Implement SIPAP integration
    // This would involve:
    // 1. Call SIPAP API
    // 2. Validate response
    // 3. Update payment status
    // 4. Return result
    throw new Error('SIPAP integration not implemented');
  }

  /**
   * Refund a payment
   * Changes payment status to REFUNDED and updates sale status
   */
  async refund(id: string, userId: string, reason?: string) {
    // Validate payment exists and user has access
    const payment = await this.findOne(id, userId);

    // Only completed payments can be refunded
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    try {
      const refundedPayment = await this.prisma.$transaction(async (tx) => {
        // Update payment status to REFUNDED
        const updated = await tx.payment.update({
          where: { id },
          data: {
            status: PaymentStatus.REFUNDED,
            processorResponse: {
              refundedAt: new Date(),
              refundReason: reason || 'Refund requested by user',
            } as Prisma.InputJsonValue,
          },
          include: {
            sale: true,
          },
        });

        // Update sale status to REFUNDED
        await tx.sale.update({
          where: { id: payment.saleId },
          data: { status: SaleStatus.REFUNDED },
        });

        return updated;
      });

      return refundedPayment;
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw new InternalServerErrorException('Failed to refund payment');
    }
  }
}
