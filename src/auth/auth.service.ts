import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmpleadoRepository } from '../empleado/empleado.repository';
import type { Empleado } from '../empleado/entities/empleado.entity';
import type { NivelAcceso } from '../common/decorators/niveles.decorator';
import type { JwtPayload } from '../common/guards/jwt-auth.guard';
import { verificarPassword } from '../common/utils/password';
import type { LoginDto } from './dto/login.dto';
import type { EmpleadoSesion, LoginResponse } from './dto/auth-response.dto';

const CREDENCIALES_INCORRECTAS = 'DNI o contraseña incorrectos';

@Injectable()
export class AuthService {
  constructor(
    private readonly empleadoRepository: EmpleadoRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    const empleado = await this.empleadoRepository.findByDniConPassword(
      dto.dni,
    );

    if (
      !empleado?.passwordHash ||
      !(await verificarPassword(dto.password, empleado.passwordHash))
    ) {
      throw new UnauthorizedException(CREDENCIALES_INCORRECTAS);
    }

    const sesion = this.empleadoSesion(empleado);
    const payload: JwtPayload = { sub: empleado.id, nivel: sesion.nivel };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      empleado: sesion,
    };
  }

  async me(id: number): Promise<EmpleadoSesion> {
    const empleado = await this.empleadoRepository.findById(id);

    if (!empleado) {
      throw new UnauthorizedException('El empleado de la sesión ya no existe');
    }

    return this.empleadoSesion(empleado);
  }

  private empleadoSesion(empleado: Empleado): EmpleadoSesion {
    const rolNombre = empleado.tipoRol?.nombre ?? '';

    return {
      id: String(empleado.id),
      nombre: empleado.nombre,
      dni: empleado.dni,
      rolNombre,
      nivel: this.nivelDeRol(rolNombre),
    };
  }

  private nivelDeRol(rolNombre: string): NivelAcceso {
    return rolNombre.toLowerCase() === 'admin' ? 'admin' : 'mozo';
  }
}
