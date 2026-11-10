import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { Publico } from '../common/decorators/publico.decorator';
import { MercadoPagoService } from '../pago/mercado-pago.service';
import { PedidoService } from './pedido.service';

interface NotificacionMercadoPago {
  type?: string;
  topic?: string;
  data?: { id?: string | number };
}

/** Webhook de Mercado Pago: público, pero cada pago se verifica contra la API antes de usarlo. */
@Controller('mercadopago')
export class MercadoPagoWebhookController {
  constructor(
    private readonly pedidoService: PedidoService,
    private readonly mercadoPagoService: MercadoPagoService,
  ) {}

  @Publico()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async recibir(
    @Query() query: Record<string, string | undefined>,
    @Body() body: NotificacionMercadoPago | undefined,
    @Headers('x-signature') xSignature?: string,
    @Headers('x-request-id') xRequestId?: string,
  ) {
    const tipo = query.type ?? query.topic ?? body?.type ?? body?.topic;
    if (tipo !== 'payment') return { recibido: true };

    const dataId = String(query['data.id'] ?? body?.data?.id ?? '');
    if (!/^\d+$/.test(dataId)) return { recibido: true };

    if (
      !this.mercadoPagoService.firmaWebhookValida({
        xSignature,
        xRequestId,
        dataId,
      })
    ) {
      throw new UnauthorizedException('Firma de Mercado Pago inválida');
    }

    await this.pedidoService.notificarPagoMercadoPago(dataId);
    return { recibido: true };
  }
}
