import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsIn,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product code (unique identifier)',
    example: 'PROD-001',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Product code is required' })
  @IsString()
  @MaxLength(50, { message: 'Product code cannot exceed 50 characters' })
  code!: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Laptop Dell Inspiron 15',
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString()
  @MaxLength(200, { message: 'Product name cannot exceed 200 characters' })
  name!: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'Laptop with Intel i5, 8GB RAM, 256GB SSD',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @ApiProperty({
    description: 'Product price',
    example: 4500000,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Product price is required' })
  @IsNumber({}, { message: 'Price must be a valid number' })
  @Min(0, { message: 'Price cannot be negative' })
  price!: number;

  @ApiPropertyOptional({
    description: 'Product cost (optional)',
    example: 3500000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Cost must be a valid number' })
  @Min(0, { message: 'Cost cannot be negative' })
  cost?: number;

  @ApiPropertyOptional({
    description: 'Initial stock quantity',
    example: 10,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Stock must be a valid number' })
  @Min(0, { message: 'Stock cannot be negative' })
  stock?: number;

  @ApiProperty({
    description: 'Tax rate (IVA): 0, 5, or 10',
    example: 10,
    enum: [0, 5, 10],
  })
  @IsNotEmpty({ message: 'Tax rate is required' })
  @IsNumber({}, { message: 'Tax rate must be a valid number' })
  @IsIn([0, 5, 10], { message: 'Tax rate must be 0, 5, or 10' })
  taxRate!: number;
}
