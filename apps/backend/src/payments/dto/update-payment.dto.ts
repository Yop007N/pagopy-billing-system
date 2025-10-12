import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsObject, IsDate } from 'class-validator';
import { PaymentStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdatePaymentDto {
  @ApiPropertyOptional({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'Invalid payment status' })
  status?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Transaction ID from payment gateway',
    example: 'TXN-123456789',
  })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({
    description: 'Bank reference number',
    example: 'REF-987654321',
  })
  @IsOptional()
  @IsString()
  bankReference?: string;

  @ApiPropertyOptional({
    description: 'Additional transaction metadata',
    example: { gateway: 'bancard', authCode: 'AUTH123' },
  })
  @IsOptional()
  @IsObject()
  transactionData?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Processor response data',
    example: { responseCode: '00', message: 'Approved' },
  })
  @IsOptional()
  @IsObject()
  processorResponse?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Payment completion timestamp',
    example: '2025-10-11T14:30:00.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paidAt?: Date;
}
