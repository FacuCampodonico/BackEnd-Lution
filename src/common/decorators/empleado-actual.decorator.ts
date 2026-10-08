import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { NivelAcceso } from './niveles.decorator';

export interface EmpleadoAutenticado {
  id: number;
  nivel: NivelAcceso;
}

export interface RequestAutenticado extends Request {
  user?: EmpleadoAutenticado;
}

export const EmpleadoActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): EmpleadoAutenticado | undefined =>
    ctx.switchToHttp().getRequest<RequestAutenticado>().user,
);
