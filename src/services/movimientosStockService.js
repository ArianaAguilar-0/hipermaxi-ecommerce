import dolibarrClient from './dolibarrClient';

export const MovimientosStockService = {
  /**
   * Registra un movimiento manual de stock (POST /stockmovements) con el token del administrador.
   * `cantidad` positiva = entrada (suma); negativa = salida (resta). `etiqueta` es el motivo.
   */
  registrar: async ({ productoId, almacenId, cantidad, etiqueta }) => {
    const { data } = await dolibarrClient.post('/stockmovements', {
      product_id: Number(productoId),
      warehouse_id: Number(almacenId),
      qty: Number(cantidad),
      label: etiqueta,
    }, { conToken: true });
    return data; // ID del movimiento
  },
};

export default MovimientosStockService;
