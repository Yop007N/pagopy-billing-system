import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsIn,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Product code',
    example: 'PROD-001',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Product code cannot exceed 50 characters' })
  code?: string;

  @ApiPropertyOptional({
    description: 'Product name',
    example: 'Laptop Dell Inspiron 15',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Product name cannot exceed 200 characters' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'Updated laptop description',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Product price',
    example: 4500000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Price must be a valid number' })
  @Min(0, { message: 'Price cannot be negative' })
  price?: number;

  @ApiPropertyOptional({
    description: 'Product cost',
    example: 3500000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Cost must be a valid number' })
  @Min(0, { message: 'Cost cannot be negative' })
  cost?: number;

  @ApiPropertyOptional({
    description: 'Stock quantity',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Stock must be a valid number' })
  @Min(0, { message: 'Stock cannot be negative' })
  stock?: number;

  @ApiPropertyOptional({
    description: 'Tax rate (IVA): 0, 5, or 10',
    example: 10,
    enum: [0, 5, 10],
  })
  @IsOptional()
  @IsNumber({}, { message: 'Tax rate must be a valid number' })
  @IsIn([0, 5, 10], { message: 'Tax rate must be 0, 5, or 10' })
  taxRate?: number;

  @ApiPropertyOptional({
    description: 'Product active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
