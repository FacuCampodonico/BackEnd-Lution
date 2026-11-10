import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ES_PUBLICO_KEY } from '../decorators/publico.decorator';
import type { NivelAcceso } from '../decorators/niveles.decorator';
import type { RequestAutenticado } from '../decorators/empleado-actual.decorator';

export interface JwtPayload {
  sub: number;
  nivel: NivelAcceso;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const esPublico = this.reflector.getAllAndOverride<boolean>(
      ES_PUBLICO_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (esPublico) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestAutenticado>();
    const token = this.extraerToken(request);

    if (!token) {
      throw new UnauthorizedException('Falta el token de acceso');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('El token es inválido o está vencido');
    }

    const id = Number(payload.sub);
    if (
      !Number.isInteger(id) ||
      (payload.nivel !== 'admin' && payload.nivel !== 'mozo')
    ) {
      throw new UnauthorizedException('El token es inválido o está vencido');
    }

    request.user = { id, nivel: payload.nivel };
    return true;
  }

  private extraerToken(request: RequestAutenticado): string | null {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' && token ? token : null;
  }
}
