import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Publico } from '../common/decorators/publico.decorator';
import { Niveles } from '../common/decorators/niveles.decorator';
import {
  EmpleadoActual,
  type EmpleadoAutenticado,
} from '../common/decorators/empleado-actual.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Publico()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @Niveles('admin', 'mozo')
  me(@EmpleadoActual() empleado: EmpleadoAutenticado) {
    return this.authService.me(empleado.id);
  }
}
