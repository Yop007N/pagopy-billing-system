import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  async findAll() {
    // TODO: Implement find all users from database
    throw new Error('Method not implemented');
  }

  async findOne(id: string) {
    // TODO: Implement find user by id
    throw new Error('Method not implemented');
  }

  async findByEmail(email: string) {
    // TODO: Implement find user by email
    throw new Error('Method not implemented');
  }

  async create(userData: any) {
    // TODO: Implement create user
    throw new Error('Method not implemented');
  }

  async update(id: string, updateData: any) {
    // TODO: Implement update user
    throw new Error('Method not implemented');
  }

  async remove(id: string) {
    // TODO: Implement delete user
    throw new Error('Method not implemented');
  }
}
