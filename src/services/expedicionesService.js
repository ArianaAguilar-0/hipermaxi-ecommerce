import dolibarrClient from './dolibarrClient';

export const ExpedicionesService = {
  /**
   * Crea la expedición (envío) de un pedido validado (POST /shipments).
   * `lineas`: [{ origin_line_id, fk_product, qty, entrepot_id }] — cada línea indica su almacén.
   */
  crearDesdePedido: async ({ socid, pedidoId, lineas }) => {
    const { data } = await dolibarrClient.post('/shipments', {
      socid,
      origin: 'commande',
      origin_type: 'commande',
      origin_id: pedidoId,
      date_delivery: Math.floor(Date.now() / 1000),
      lines: lineas,
    });
    return data; // ID de la expedición
  },

  validarExpedicion: async (id) => {
    const { data } = await dolibarrClient.post(`/shipments/${id}/validate`, { notrigger: 0 });
    return data;
  },

  /** Cierra la expedición ("Entregada"). Con la configuración actual de Dolibarr, aquí baja el stock. */
  cerrarExpedicion: async (id) => {
    const { data } = await dolibarrClient.post(`/shipments/${id}/close`, { notrigger: 0 });
    return data;
  },

  getExpedicion: async (id) => {
    const { data } = await dolibarrClient.get(`/shipments/${id}`);
    return data;
  },
};

export default ExpedicionesService;
