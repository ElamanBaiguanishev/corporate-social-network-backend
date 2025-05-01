import { Controller, Get, Post, Body, UseGuards, UsePipes, ValidationPipe, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RoleTypes } from 'src/roles/entities/role.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Roles } from './roles-auth.decorator';
import { RolesGuard } from './roles-guard';
import { ReqPayloadUser } from './PayloadUser';

@UsePipes(ValidationPipe)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/login')
  login(@Body() userDto: LoginDto) {
    console.log(userDto)
    return this.authService.login(userDto)
  }

  @Roles(RoleTypes.ADMIN)
  @UseGuards(RolesGuard)
  @Post('/registration')
  registration(@Body() userDto: CreateUserDto) {
    console.log(userDto)
    return this.authService.registration(userDto)
  }

  @Get('/profile')
  @UseGuards(RolesGuard)
  getProfile(@Request() req: ReqPayloadUser) {
    console.log(req.user)
    return req.user;
  }
}
