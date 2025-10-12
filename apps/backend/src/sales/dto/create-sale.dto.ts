import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsArray,
  IsEnum,
  IsString,
  IsOptional,
  IsEmail,
  ValidateNested,
  ArrayMinSize,
  Matches,
  ValidateIf,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SaleItemDto } from './sale-item.dto';

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  QR = 'QR',
  BANCARD = 'BANCARD',
  SIPAP = 'SIPAP',
}

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
}

export class CreateSaleDto {
  @ApiProperty({
    description: 'Array of items to be sold',
    type: [SaleItemDto],
    minItems: 1,
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1, { message: 'Items array cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items!: SaleItemDto[];

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod, { message: 'Invalid payment method' })
  paymentMethod!: PaymentMethod;

  @ApiProperty({
    description: 'Customer type',
    enum: CustomerType,
    example: CustomerType.INDIVIDUAL,
  })
  @IsNotEmpty()
  @IsEnum(CustomerType, { message: 'Invalid customer type' })
  customerType!: CustomerType;

  @ApiPropertyOptional({
    description: 'Customer RUC (required for BUSINESS type)',
    example: '80012345-6',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.customerType === CustomerType.BUSINESS)
  @IsNotEmpty({ message: 'RUC is required for BUSINESS customers' })
  @Matches(/^\d{6,8}-\d{1}$/, {
    message: 'Invalid RUC format. Expected format: XXXXXXXX-X',
  })
  customerRuc?: string;

  @ApiPropertyOptional({
    description: 'Customer name',
    example: 'Juan Perez',
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({
    description: 'Customer email',
    example: 'juan.perez@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  customerEmail?: string;

  @ApiPropertyOptional({
    description: 'Customer phone',
    example: '+595981234567',
  })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({
    description: 'Customer ID (if existing customer)',
    example: 'clxxx123456789',
  })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Entregar antes de las 18:00',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Discount amount',
    example: 50000,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Discount cannot be negative' })
  discount?: number;
}
