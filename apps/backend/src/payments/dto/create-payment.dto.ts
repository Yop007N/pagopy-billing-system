import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  IsObject,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Sale ID to link payment to',
    example: 'clxxx123456789',
  })
  @IsNotEmpty({ message: 'Sale ID is required' })
  @IsString()
  saleId!: string;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsNotEmpty({ message: 'Payment method is required' })
  @IsEnum(PaymentMethod, { message: 'Invalid payment method' })
  method!: PaymentMethod;

  @ApiProperty({
    description: 'Payment amount',
    example: 250000,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber()
  @Min(0, { message: 'Amount must be positive' })
  amount!: number;

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
}
