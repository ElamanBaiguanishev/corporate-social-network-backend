import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PayloadUser } from './PayloadUser';

@Injectable()
export class WsAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const client: Socket = context.switchToWs().getClient<Socket>();
            const token = this.extractTokenFromQuery(client);

            if (!token) {
                throw new UnauthorizedException('Token not found');
            }

            const user = this.jwtService.verify<PayloadUser>(token);
            client.data.user = user;

            return true;
        } catch (error) {
            throw new WsException('Unauthorized');
        }
    }

    private extractTokenFromQuery(client: Socket): string | null {
        const token = client.handshake.query.token;
        return token ? String(token) : null;
    }
} 