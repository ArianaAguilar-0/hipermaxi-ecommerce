import dolibarrClient from './dolibarrClient';
import { CONFIG_TIENDA } from '@/lib/configTienda';

export const FacturasService = {
  /** Crea la factura (borrador) a partir de un pedido. Devuelve el objeto factura. */
  crearDesdePedido: async (pedidoId) => {
    const { data } = await dolibarrClient.post(`/invoices/createfromorder/${pedidoId}`);
    return data;
  },

  /**
   * Asigna la cuenta bancaria a la factura (PUT /invoices/{id}).
   * Sin ella, el PDF de una factura con pago VIR (QR) muestra un aviso de configuración.
   */
  asignarCuenta: async (id) => {
    const { data } = await dolibarrClient.put(`/invoices/${id}`, { fk_account: CONFIG_TIENDA.CUENTA_BANCARIA_ID });
    return data;
  },

  /** Valida la factura (le asigna número definitivo). */
  validarFactura: async (id) => {
    const { data } = await dolibarrClient.post(`/invoices/${id}/validate`, { notrigger: 0 });
    return data;
  },

  /**
   * Registra el pago por el saldo pendiente y cierra la factura (POST /invoices/{id}/payments).
   * No se envía ningún dato de la tarjeta: solo el tipo de pago.
   */
  registrarPago: async (id, modoPagoId) => {
    const { data } = await dolibarrClient.post(`/invoices/${id}/payments`, {
      datepaye: Math.floor(Date.now() / 1000),
      paymentid: modoPagoId,
      closepaidinvoices: 'yes',
      accountid: CONFIG_TIENDA.CUENTA_BANCARIA_ID,
      comment: 'Pago simulado desde la tienda en línea',
    });
    return data; // ID del pago
  },

  getFactura: async (id) => {
    const { data } = await dolibarrClient.get(`/invoices/${id}`);
    return data;
  },

  /** Genera el PDF de la factura (PUT /documents/builddoc). */
  generarPdf: async (ref) => {
    const { data } = await dolibarrClient.put('/documents/builddoc', {
      modulepart: 'invoice',
      original_file: `${ref}/${ref}.pdf`,
    });
    return data; // { filename, content (base64), ... }
  },

  /** Descarga el PDF ya generado (GET /documents/download). */
  descargarPdf: async (ref) => {
    const { data } = await dolibarrClient.get('/documents/download', {
      params: { modulepart: 'invoice', original_file: `${ref}/${ref}.pdf` },
    });
    return data;
  },
};

export default FacturasService;
