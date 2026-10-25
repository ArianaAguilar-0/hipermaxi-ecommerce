// IDs de Dolibarr que usa el checkout (consultados en la API de tu instancia)
export const CONFIG_TIENDA = {
  // GET /setup/dictionary/payment_types
  PAGO_QR_ID: 2, // VIR - Transferencia (no existe un tipo "QR")
  PAGO_TARJETA_ID: 6, // CB - Tarjeta bancaria
  // GET /bankaccounts → CMN-011 Cuenta de Cobros a Clientes
  CUENTA_BANCARIA_ID: 14,
  // GET /warehouses → ALM-CENTRAL: almacén preferido para despachar si tiene stock suficiente
  ALMACEN_ID: 1,
  // GET /setup/dictionary/payment_terms → RECEP (pago al recibir)
  CONDICION_PAGO_ID: 1,
  // GET /setup/dictionary/countries → BO
  PAIS_BOLIVIA_ID: 52,
  // Costo de envío a domicilio (línea libre del pedido, en Bs)
  COSTO_ENVIO: 10,
};

export default CONFIG_TIENDA;
