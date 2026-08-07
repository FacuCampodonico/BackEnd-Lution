import { Injectable } from '@nestjs/common';

export interface EstadoSalud {
  status: 'ok';
  uptime: number;
  timestamp: string;
}

@Injectable()
export class HealthService {
  obtenerEstado(): EstadoSalud {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
