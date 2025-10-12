import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';

@Injectable()
export class UsersService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        ruc: true,
        razonSocial: true,
        direccion: true,
        telefono: true,
        timbrado: true,
        timbradoVence: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
    return users;
  }

  async findOne(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        ruc: true,
        razonSocial: true,
        direccion: true,
        telefono: true,
        timbrado: true,
        timbradoVence: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async create(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    ruc: string;
    razonSocial: string;
    direccion?: string;
    telefono?: string;
    timbrado: string;
    timbradoVence: Date;
    role?: 'ADMIN' | 'SELLER' | 'CASHIER' | 'VIEWER';
  }): Promise<User> {
    const existingUser = await this.findByEmail(userData.email);

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        ruc: userData.ruc,
        razonSocial: userData.razonSocial,
        direccion: userData.direccion,
        telefono: userData.telefono,
        timbrado: userData.timbrado,
        timbradoVence: userData.timbradoVence,
        role: userData.role || 'SELLER',
      },
    });

    return user;
  }

  async update(
    id: string,
    updateData: {
      email?: string;
      firstName?: string;
      lastName?: string;
      razonSocial?: string;
      direccion?: string;
      telefono?: string;
      timbrado?: string;
      timbradoVence?: Date;
      role?: 'ADMIN' | 'SELLER' | 'CASHIER' | 'VIEWER';
      isActive?: boolean;
    },
  ): Promise<Omit<User, 'password'>> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.findByEmail(updateData.email);
      if (existingUser) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        ruc: true,
        razonSocial: true,
        direccion: true,
        telefono: true,
        timbrado: true,
        timbradoVence: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
