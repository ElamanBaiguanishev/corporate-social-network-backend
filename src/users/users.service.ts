import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcryptjs';   

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) { }

  async create(createUserDto: CreateUserDto) {
    const existUser = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existUser) {
      throw new BadRequestException('This email already exists');
    }

    const newUser = {
      email: createUserDto.email,
      password: createUserDto.password,
      username: createUserDto.username,
      role: { id: createUserDto.roleId }
    }

    return await this.userRepository.save(newUser);
  }

  async getAllUsers() {
    return this.userRepository.find({ relations: ['role'] });
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role']
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Логика обновления пользователя
  }

  async changePassword(id: number, newPassword: string) {
    const user = await this.getUserById(id)

    const hashPassword = await bcrypt.hash(newPassword, 5)

    user.password = hashPassword

    return await this.userRepository.save(user)
  }

  async remove(id: number) {
    await this.userRepository.delete(id);
    return `User with id #${id} removed`;
  }

  async getUserByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['role']
    });
  }

  async searchUsers(query: string) {
    if (!query) {
      return [];
    }

    return this.userRepository.find({
      where: [
        { username: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) }
      ],
      select: ['id', 'username', 'email'],
      relations: ['role']
    });
  }
}
