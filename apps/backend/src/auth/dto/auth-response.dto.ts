import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({
    example: 'clu1234567890',
    description: 'ID del usuario',
  })
  id!: string;

  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Email del usuario',
  })
  email!: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
  })
  firstName!: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
  })
  lastName!: string;

  @ApiProperty({
    enum: UserRole,
    example: 'SELLER',
    description: 'Rol del usuario en el sistema',
  })
  role!: UserRole;

  @ApiProperty({
    example: true,
    description: 'Estado activo del usuario',
  })
  isActive!: boolean;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Fecha de creación',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Fecha de última actualización',
  })
  updatedAt!: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    type: UserResponseDto,
    description: 'Datos del usuario autenticado',
  })
  user!: UserResponseDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de acceso JWT (válido por 7 días)',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de actualización JWT (válido por 30 días)',
  })
  refreshToken!: string;
}
