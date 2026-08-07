import { Controller, Get } from '@nestjs/common';

import { HealthService } from './health.service';
import type { EstadoSalud } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  obtenerEstado(): EstadoSalud {
    return this.healthService.obtenerEstado();
  }
}
