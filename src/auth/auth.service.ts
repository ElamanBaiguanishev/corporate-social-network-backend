import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UsersService,
  ) { }

  async login(userDto: LoginDto) {
    const user = await this.validateUser(userDto)
    return this.generateToken(user)
  }

  async registration(userDto: CreateUserDto) {
    const candidate = await this.userService.getUserByEmail(userDto.email)

    if (candidate) {
      throw new HttpException('Пользователь с таким email существует', HttpStatus.BAD_REQUEST)
    }

    const hashPassword = await bcrypt.hash(userDto.password, 5)

    const user = await this.userService.create({ ...userDto, password: hashPassword })

    return this.generateToken(user)
  }

  async generateToken(user: User) {
    const { id, email, role = user.role, username } = user
    return {
      id,
      email,
      role,
      username,
      token: this.jwtService.sign({ email, id, role, username }),
    };
  }

  async validateUser(userDto: LoginDto) {
    const user = await this.userService.getUserByEmail(userDto.email);

    // Проверка пароля одновременно с проверкой существования пользователя
    const isValidUser = user && await bcrypt.compare(userDto.password, user.password);

    if (!isValidUser) {
      throw new UnauthorizedException({ message: 'Некорректные учетные данные' });
    }

    return user;
  }
}
