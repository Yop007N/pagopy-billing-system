import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, ruc, razonSocial, timbrado, timbradoVence, firstName, lastName } = registerDto;

    // Validar formato RUC paraguayo
    const rucRegex = /^\d{6,8}-\d$/;
    if (!rucRegex.test(ruc)) {
      throw new ConflictException('Formato de RUC inválido. Debe ser: ######-# o ########-#');
    }

    // Verificar si el email ya está registrado
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear password con bcrypt (saltRounds: 12)
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Parse timbradoVence to Date if it's a string
    const timbradoVenceDate = typeof timbradoVence === 'string' ? new Date(timbradoVence) : timbradoVence;

    // Crear usuario en Prisma con todos los datos fiscales
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      ruc,
      razonSocial,
      timbrado,
      timbradoVence: timbradoVenceDate,
      role: 'SELLER',
    });

    // Generar tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Retornar usuario sin password + tokens
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Buscar usuario por email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar password con bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar JWT tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Retornar AuthResponse sin password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async validateUser(userId: string): Promise<any> {
    // Usado por Passport JWT strategy
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Retornar usuario sin password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: userId,
      email,
      role,
    };

    // Access Token (7 días)
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '7d',
    });

    // Refresh Token (30 días)
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
      });

      // Validar que el usuario sigue activo
      const user = await this.validateUser(payload.sub);

      // Generar nuevo access token
      const newAccessToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '7d',
        },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }
}
