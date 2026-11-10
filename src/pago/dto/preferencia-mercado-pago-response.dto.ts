export interface PreferenciaMercadoPagoResponse {
  preferenceId: string;
  checkoutUrl: string;
  expiraEn: string;
}

export type EstadoCobroMercadoPago = 'sin_cobro' | 'pendiente' | 'pagado';

export interface EstadoCobroMercadoPagoResponse {
  estado: EstadoCobroMercadoPago;
  expiraEn?: string;
  total?: number;
}
