import dolibarrClient from './dolibarrClient';
import { CONFIG_TIENDA } from '@/lib/configTienda';

const ahora = () => Math.floor(Date.now() / 1000);

export const PedidosService = {
  /**
   * Crea un pedido de cliente en borrador (POST /orders).
   * `lineas`: [{ fk_product, qty, subprice, tva_tx }] y opcionalmente la línea libre del envío.
   */
  crearPedido: async ({ socid, lineas, nota, modoPagoId }) => {
    const { data } = await dolibarrClient.post('/orders', {
      socid,
      date: ahora(),
      mode_reglement_id: modoPagoId,
      cond_reglement_id: CONFIG_TIENDA.CONDICION_PAGO_ID,
      // Cuenta bancaria: evita el aviso "modo de pago VIR sin información" en el PDF
      fk_account: CONFIG_TIENDA.CUENTA_BANCARIA_ID,
      note_public: nota,
      lines: lineas,
    });
    return data; // ID del pedido
  },

  /** Valida el pedido (en esta instancia el stock no baja aquí, sino al cerrar la expedición). */
  validarPedido: async (id) => {
    const { data } = await dolibarrClient.post(`/orders/${id}/validate`, { notrigger: 0 });
    return data;
  },

  getPedido: async (id) => {
    const { data } = await dolibarrClient.get(`/orders/${id}`);
    return data;
  },
};

export default PedidosService;
