import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsInt, Min, IsIn, IsOptional } from 'class-validator';

export class SaleItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: 'clxxx123456789',
  })
  @IsNotEmpty()
  @IsString()
  productId!: string;

  @ApiProperty({
    description: 'Concept/description of the item',
    example: 'Laptop Dell Inspiron 15',
  })
  @IsNotEmpty()
  @IsString()
  concept!: string;

  @ApiProperty({
    description: 'Unit price/amount',
    example: 5500000,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount!: number;

  @ApiProperty({
    description: 'Quantity',
    example: 2,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity!: number;

  @ApiProperty({
    description: 'IVA rate (0%, 5%, or 10%)',
    example: 10,
    enum: [0, 5, 10],
  })
  @IsNotEmpty()
  @IsIn([0, 5, 10], { message: 'IVA must be 0, 5, or 10' })
  iva!: 0 | 5 | 10;
}
