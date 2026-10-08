import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ES_PUBLICO_KEY } from '../decorators/publico.decorator';
import { NIVELES_KEY, type NivelAcceso } from '../decorators/niveles.decorator';
import type { RequestAutenticado } from '../decorators/empleado-actual.decorator';

const NIVELES_POR_DEFECTO: NivelAcceso[] = ['admin'];

@Injectable()
export class NivelesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const objetivos = [context.getHandler(), context.getClass()];

    if (this.reflector.getAllAndOverride<boolean>(ES_PUBLICO_KEY, objetivos)) {
      return true;
    }

    const niveles =
      this.reflector.getAllAndOverride<NivelAcceso[]>(NIVELES_KEY, objetivos) ??
      NIVELES_POR_DEFECTO;

    const { user } = context.switchToHttp().getRequest<RequestAutenticado>();

    if (!user) {
      throw new UnauthorizedException('Falta el token de acceso');
    }

    if (!niveles.includes(user.nivel)) {
      throw new ForbiddenException('No tenés permisos para esta acción');
    }

    return true;
  }
}
