import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { V3 } from 'paseto';
interface Request extends FastifyRequest {
  user: object;
}
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: FastifyReply, next: () => void) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Unauthorized, No Bearer Token');
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = await V3.decrypt(
        token,
        process.env.TOKEN_SECRET,
      );
      req.user = payload;
      next();
    } catch (err) {
      throw new UnauthorizedException('Unauthorized, Invalid Token!');
    }
  }
}
