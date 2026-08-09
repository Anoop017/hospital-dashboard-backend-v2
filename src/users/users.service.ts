import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: { roles: { permissions: true } },
    });
  }
  async findByNumber(number: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { mobile: number },
      relations: { roles: { permissions: true } }
    })
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { roles: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(userData: Partial<User>): Promise<User> {
    if (!userData.email) {
      throw new ConflictException('Email is required');
    }
    if (!userData.mobile) {
      throw new ConflictException('Mobile is required')
    }
    const existing = await this.findByEmail(userData.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const numberExisting = await this.findByNumber(userData.mobile);
    if (numberExisting) {
      throw new ConflictException("number already exists")
    }

    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }
}
