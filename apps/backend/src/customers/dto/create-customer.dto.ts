import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export enum DocumentType {
  RUC = 'RUC',
  CI = 'CI',
  PASSPORT = 'PASSPORT',
}

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
}

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Customer type',
    enum: CustomerType,
    example: CustomerType.INDIVIDUAL,
  })
  @IsNotEmpty({ message: 'Customer type is required' })
  @IsEnum(CustomerType, {
    message: 'Customer type must be either INDIVIDUAL or BUSINESS',
  })
  type!: CustomerType;

  @ApiProperty({
    description: 'Document type',
    enum: DocumentType,
    example: DocumentType.CI,
  })
  @IsNotEmpty({ message: 'Document type is required' })
  @IsString()
  @MaxLength(20, { message: 'Document type cannot exceed 20 characters' })
  documentType!: string;

  @ApiProperty({
    description: 'Document ID (RUC, CI, or Passport number)',
    example: '4567890-1',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Document ID is required' })
  @IsString()
  @MaxLength(50, { message: 'Document ID cannot exceed 50 characters' })
  @MinLength(3, { message: 'Document ID must be at least 3 characters' })
  documentId!: string;

  @ApiProperty({
    description: 'Customer full name or business name',
    example: 'Juan Pérez',
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @MaxLength(200, { message: 'Name cannot exceed 200 characters' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name!: string;

  @ApiPropertyOptional({
    description: 'Customer email',
    example: 'juan.perez@example.com',
    maxLength: 100,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(100, { message: 'Email cannot exceed 100 characters' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '+595981234567',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Phone cannot exceed 20 characters' })
  @Matches(/^[\d\s\+\-\(\)]+$/, {
    message: 'Phone number contains invalid characters',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Customer address',
    example: 'Av. Mariscal López 1234, Asunción',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Address cannot exceed 500 characters' })
  address?: string;

  @ApiPropertyOptional({
    description: 'City',
    example: 'Asunción',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'City cannot exceed 100 characters' })
  city?: string;

  @ApiPropertyOptional({
    description: 'Country',
    example: 'Paraguay',
    maxLength: 100,
    default: 'Paraguay',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Country cannot exceed 100 characters' })
  country?: string;
}
