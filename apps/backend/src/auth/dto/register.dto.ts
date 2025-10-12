import { IsEmail, IsString, MinLength, Matches, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Email del usuario',
  })
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario (mínimo 8 caracteres)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;

  @ApiProperty({
    example: '80012345-1',
    description: 'RUC paraguayo (formato: 6-8 dígitos, guión, dígito verificador)',
  })
  @IsString()
  @Matches(/^\d{6,8}-\d$/, {
    message: 'RUC inválido. Formato esperado: ######-# o ########-#',
  })
  ruc!: string;

  @ApiProperty({
    example: 'Empresa Demo S.A.',
    description: 'Razón social de la empresa',
  })
  @IsString()
  @MinLength(3, { message: 'La razón social debe tener al menos 3 caracteres' })
  razonSocial!: string;

  @ApiProperty({
    example: '12345678',
    description: 'Número de timbrado SET',
  })
  @IsString()
  @MinLength(8, { message: 'El timbrado debe tener al menos 8 caracteres' })
  timbrado!: string;

  @ApiProperty({
    example: '2025-12-31',
    description: 'Fecha de vencimiento del timbrado (formato ISO)',
  })
  @IsDateString({}, { message: 'Fecha de vencimiento inválida' })
  timbradoVence!: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
  })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  firstName!: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
  })
  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  lastName!: string;
}
