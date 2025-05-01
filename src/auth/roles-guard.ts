import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from './roles-auth.decorator';
import { PayloadUser } from './PayloadUser';
import { RoleTypes } from 'src/roles/entities/role.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) { }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const token = this.extractToken(req);

      const user = this.validateToken(token);

      req.user = user;

      const requiredRoles = this.getRequiredRoles(context);

      if (!requiredRoles) {
        return true;
      }

      return this.checkRoles(requiredRoles, user.role.type);
    } catch (error) {
      this.logger.error('Ошибка проверки доступа', error);
      throw new HttpException('Нет доступа', HttpStatus.FORBIDDEN);
    }
  }

  /**
   * Извлекает список необходимых ролей из метаданных
   */
  private getRequiredRoles(context: ExecutionContext): RoleTypes[] | null {
    return this.reflector.getAllAndOverride<RoleTypes[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  /**
   * Извлекает и проверяет наличие токена в заголовках
   */
  private extractToken(req: any): string {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException({ message: 'Пользователь не авторизован' });
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException({ message: 'Неверный формат токена' });
    }

    return token;
  }

  /**
   * Проверяет токен JWT и возвращает данные пользователя
   */
  private validateToken(token: string): PayloadUser {
    try {
      return this.jwtService.verify<PayloadUser>(token);
    } catch (error) {
      throw new UnauthorizedException({ message: 'Невалидный токен' });
    }
  }

  /**
   * Проверяет, есть ли у пользователя хотя бы одна необходимая роль
   */
  private checkRoles(requiredRoles: RoleTypes[], userRole: RoleTypes): boolean {
    return requiredRoles.includes(userRole);
  }
}
