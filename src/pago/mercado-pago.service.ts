import {
  BadGatewayException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const API_URL = 'https://api.mercadopago.com';

export interface ItemPreferencia {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
}

export interface DatosPreferencia {
  items: ItemPreferencia[];
  externalReference: string;
  /** Ruta del frontend a la que vuelve el checkout, ej. `/mesas/2/pago`. */
  rutaRetorno: string;
}

export interface PreferenciaCreada {
  id: string;
  checkoutUrl: string;
}

export interface PagoMercadoPago {
  id: number;
  status: string;
  status_detail?: string;
  external_reference: string | null;
  transaction_amount: number;
}

@Injectable()
export class MercadoPagoService {
  constructor(private readonly config: ConfigService) {}

  async crearPreferencia(datos: DatosPreferencia): Promise<PreferenciaCreada> {
    const urlRetorno = `${this.config.get<string>('frontendUrl')}${datos.rutaRetorno}`;
    const preferencia = await this.request<{
      id: string;
      init_point: string;
      sandbox_init_point: string;
    }>('/checkout/preferences', {
      method: 'POST',
      body: JSON.stringify({
        items: datos.items.map((item) => ({ ...item, currency_id: 'ARS' })),
        external_reference: datos.externalReference,
        back_urls: {
          success: urlRetorno,
          failure: urlRetorno,
          pending: urlRetorno,
        },
        // Mercado Pago rechaza auto_return cuando la URL de retorno es localhost.
        ...(esLocal(urlRetorno) ? {} : { auto_return: 'approved' }),
      }),
    });

    const sandbox = this.config.get<boolean>('mercadoPago.sandbox', true);
    return {
      id: preferencia.id,
      checkoutUrl: sandbox
        ? preferencia.sandbox_init_point
        : preferencia.init_point,
    };
  }

  obtenerPago(paymentId: string): Promise<PagoMercadoPago> {
    return this.request<PagoMercadoPago>(
      `/v1/payments/${encodeURIComponent(paymentId)}`,
      { method: 'GET' },
      `El pago ${paymentId} no existe en Mercado Pago`,
    );
  }

  private async request<T>(
    ruta: string,
    init: RequestInit,
    mensajeNoEncontrado?: string,
  ): Promise<T> {
    const accessToken = this.config.get<string>('mercadoPago.accessToken');
    if (!accessToken) {
      throw new ServiceUnavailableException(
        'Mercado Pago no está configurado (falta MP_ACCESS_TOKEN)',
      );
    }

    let respuesta: Response;
    try {
      respuesta = await fetch(`${API_URL}${ruta}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch {
      throw new BadGatewayException('No se pudo conectar con Mercado Pago');
    }

    if (respuesta.status === 404 && mensajeNoEncontrado) {
      throw new NotFoundException(mensajeNoEncontrado);
    }

    if (!respuesta.ok) {
      const cuerpo = (await respuesta.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new BadGatewayException(
        `Mercado Pago respondió ${respuesta.status}${cuerpo?.message ? `: ${cuerpo.message}` : ''}`,
      );
    }

    return (await respuesta.json()) as T;
  }
}

function esLocal(url: string): boolean {
  const { hostname } = new URL(url);
  return hostname === 'localhost' || hostname === '127.0.0.1';
}
