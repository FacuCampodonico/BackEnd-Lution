import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';

const API_URL = 'https://api.mercadopago.com';

export const MINUTOS_VIGENCIA_QR = 15;

const RUTA_PAGO_RECIBIDO = '/pago-recibido';

export interface ItemPreferencia {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
}

export interface DatosPreferencia {
  items: ItemPreferencia[];
  externalReference: string;
}

export interface PreferenciaCreada {
  id: string;
  checkoutUrl: string;
  expiraEn: Date;
}

export interface DatosFirmaWebhook {
  xSignature?: string;
  xRequestId?: string;
  dataId: string;
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
  private readonly logger = new Logger(MercadoPagoService.name);

  constructor(private readonly config: ConfigService) {}

  async crearPreferencia(datos: DatosPreferencia): Promise<PreferenciaCreada> {
    const urlRetorno = `${this.config.get<string>('frontendUrl')}${RUTA_PAGO_RECIBIDO}`;
    const notificationUrl = this.urlWebhook();
    const ahora = new Date();
    const expiraEn = new Date(ahora.getTime() + MINUTOS_VIGENCIA_QR * 60_000);
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
        ...(notificationUrl ? { notification_url: notificationUrl } : {}),
        expires: true,
        expiration_date_from: fechaMercadoPago(ahora),
        expiration_date_to: fechaMercadoPago(expiraEn),
      }),
    });

    const sandbox = this.config.get<boolean>('mercadoPago.sandbox', true);
    return {
      id: preferencia.id,
      checkoutUrl: sandbox
        ? preferencia.sandbox_init_point
        : preferencia.init_point,
      expiraEn,
    };
  }

  async expirarPreferencia(preferenceId: string): Promise<void> {
    try {
      await this.request(
        `/checkout/preferences/${encodeURIComponent(preferenceId)}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            expires: true,
            expiration_date_to: fechaMercadoPago(new Date()),
          }),
        },
      );
    } catch (error) {
      this.logger.warn(
        `No se pudo vencer la preferencia ${preferenceId}: ${String(error)}`,
      );
    }
  }

  async buscarPagosPorReferencia(
    externalReference: string,
  ): Promise<PagoMercadoPago[]> {
    const params = new URLSearchParams({
      external_reference: externalReference,
      sort: 'date_created',
      criteria: 'desc',
      limit: '10',
    });
    const respuesta = await this.request<{ results?: PagoMercadoPago[] }>(
      `/v1/payments/search?${params.toString()}`,
      { method: 'GET' },
    );
    return respuesta.results ?? [];
  }


  firmaWebhookValida({
    xSignature,
    xRequestId,
    dataId,
  }: DatosFirmaWebhook): boolean {
    const secreto = this.config.get<string>('mercadoPago.webhookSecret');
    if (!secreto) return true;
    if (!xSignature) return false;

    const partes = Object.fromEntries(
      xSignature.split(',').map((parte) => {
        const [clave, ...valor] = parte.trim().split('=');
        return [clave, valor.join('=')];
      }),
    ) as Record<string, string | undefined>;
    if (!partes.ts || !partes.v1) return false;

    const manifiesto =
      `id:${dataId.toLowerCase()};` +
      (xRequestId ? `request-id:${xRequestId};` : '') +
      `ts:${partes.ts};`;
    const esperada = createHmac('sha256', secreto)
      .update(manifiesto)
      .digest('hex');
    const recibida = Buffer.from(partes.v1);
    const calculada = Buffer.from(esperada);
    return (
      recibida.length === calculada.length &&
      timingSafeEqual(recibida, calculada)
    );
  }

  private urlWebhook(): string | null {
    const base = this.config.get<string>('apiPublicUrl');
    if (!base || esLocal(base)) return null;
    // source_news=webhooks: solo webhooks, sin las notificaciones IPN viejas.
    return `${base}/mercadopago/webhook?source_news=webhooks`;
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

/** Mercado Pago pide ISO 8601 con offset (`2026-11-10T12:00:00.000-03:00`), hora de Argentina. */
function fechaMercadoPago(fecha: Date): string {
  const argentina = new Date(fecha.getTime() - 3 * 3_600_000);
  return argentina.toISOString().replace('Z', '-03:00');
}
