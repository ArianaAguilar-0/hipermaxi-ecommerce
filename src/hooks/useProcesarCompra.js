import { useState } from 'react';
import ProductosDolibarrService from '../services/productosDolibarrService';
import TercerosService from '../services/tercerosService';
import PedidosService from '../services/pedidosService';
import FacturasService from '../services/facturasService';
import ExpedicionesService from '../services/expedicionesService';
import { getErrorMessage } from '../services/dolibarrClient';
import { CONFIG_TIENDA } from '@/lib/configTienda';

// Pasos del flujo de compra en Dolibarr (en orden)
export const PASOS_COMPRA = [
  { id: 'verificar', texto: 'Verificando stock y precios' },
  { id: 'tercero', texto: 'Registrando cliente' },
  { id: 'pedido', texto: 'Creando pedido' },
  { id: 'validarPedido', texto: 'Validando pedido' },
  { id: 'expedicion', texto: 'Preparando el envío' },
  { id: 'validarExpedicion', texto: 'Validando el envío' },
  { id: 'cerrarExpedicion', texto: 'Cerrando el envío (descuenta stock)' },
  { id: 'factura', texto: 'Creando factura' },
  { id: 'validarFactura', texto: 'Validando factura' },
  { id: 'pago', texto: 'Registrando pago' },
  { id: 'pdf', texto: 'Generando PDF de la factura' },
];

// Si la compra falla a medio camino, el avance se guarda para reintentar
// sin crear un segundo pedido (aunque se recargue la página)
const PROGRESO_KEY = 'hiper_compra_en_curso';

const leerProgreso = () => {
  try {
    return JSON.parse(sessionStorage.getItem(PROGRESO_KEY) || 'null') || {};
  } catch {
    return {};
  }
};

const guardarProgreso = (progreso) => {
  try {
    if (Object.keys(progreso).length) sessionStorage.setItem(PROGRESO_KEY, JSON.stringify(progreso));
    else sessionStorage.removeItem(PROGRESO_KEY);
  } catch {
    // Sin sessionStorage: el avance solo vive en memoria
  }
};

// Error "de negocio" que ya trae un mensaje claro para el usuario
class ErrorCompra extends Error {}

/**
 * Elige de qué almacén sale cada producto:
 * el preferido si alcanza; si no, el que más stock tenga; si ninguno alcanza solo, se reparte.
 * Devuelve [[idAlmacen, cantidad], ...].
 */
const elegirAlmacenes = (stockPorAlmacen, cantidad) => {
  const disponibles = Object.entries(stockPorAlmacen)
    .map(([alm, stock]) => [Number(alm), stock])
    .filter(([, stock]) => stock > 0);
  const preferido = disponibles.find(([alm]) => alm === CONFIG_TIENDA.ALMACEN_ID);
  if (preferido && preferido[1] >= cantidad) return [[preferido[0], cantidad]];

  const reparto = [];
  let falta = cantidad;
  for (const [alm, stock] of disponibles.sort((a, b) => b[1] - a[1])) {
    const tomar = Math.min(stock, falta);
    reparto.push([alm, tomar]);
    falta -= tomar;
    if (falta <= 0) return reparto;
  }
  return null; // no alcanza el stock
};

/**
 * Ejecuta la compra completa en Dolibarr:
 * tercero → pedido → validar → expedición → validar → cerrar (baja stock) → factura → validar → pago → PDF.
 */
export const useProcesarCompra = ({ items, actualizarItem }) => {
  const [progreso, setProgreso] = useState(leerProgreso);
  const [pasoActual, setPasoActual] = useState(null);
  const [fallo, setFallo] = useState(null); // { paso, mensaje }

  // Con un pedido ya creado, los datos de la compra ya no se pueden cambiar
  const bloqueada = Boolean(progreso.pedidoId);

  const avanzar = (cambios, acumulado) => {
    const nuevo = { ...acumulado, ...cambios };
    guardarProgreso(nuevo);
    setProgreso(nuevo);
    return nuevo;
  };

  const reiniciar = () => {
    guardarProgreso({});
    setProgreso({});
    setFallo(null);
  };

  /**
   * datos: { socid (si el cliente inició sesión), cliente: {nombre, nit, email, telefono, direccion},
   *          entrega: {tipo: 'tienda'|'domicilio', sucursal, direccion},
   *          pago: 'qr'|'tarjeta' }
   * Devuelve el resumen de la compra o null si falló.
   */
  const procesar = async (datos) => {
    let p = { ...progreso };
    const modoPagoId = datos.pago === 'qr' ? CONFIG_TIENDA.PAGO_QR_ID : CONFIG_TIENDA.PAGO_TARJETA_ID;
    setFallo(null);
    let paso = 'verificar';

    try {
      // 1. Stock y precios actuales (solo si todavía no hay pedido)
      let lineas = p.lineas;
      if (!p.pedidoId) {
        setPasoActual(paso);
        lineas = [];
        for (const item of items) {
          const actual = await ProductosDolibarrService.getProductoDetalle(item.id);
          if (!actual.enVenta || actual.stock < item.cantidad) {
            actualizarItem(item.id, { precio: actual.precio, stock: actual.stock });
            throw new ErrorCompra(
              actual.stock <= 0
                ? `${item.label} ya no tiene stock. Quítalo del carrito para continuar.`
                : `Solo quedan ${actual.stock} unidades de ${item.label}. Ajustamos tu carrito.`
            );
          }
          if (Math.abs(actual.precio - item.precio) > 0.001) {
            actualizarItem(item.id, { precio: actual.precio, stock: actual.stock });
            throw new ErrorCompra(`El precio de ${item.label} cambió. Revisa el total y vuelve a confirmar.`);
          }
          lineas.push({
            fk_product: Number(item.id),
            qty: item.cantidad,
            subprice: actual.precioSinImpuesto,
            tva_tx: actual.tva_tx,
            product_type: 0,
          });
        }
        if (datos.entrega.tipo === 'domicilio') {
          // Costo de envío como línea libre (sin producto asociado)
          lineas.push({
            desc: 'Envío a domicilio',
            qty: 1,
            subprice: CONFIG_TIENDA.COSTO_ENVIO,
            tva_tx: 0,
            product_type: 1,
          });
        }
      }

      // 2. Buscar el tercero por correo o crearlo
      paso = 'tercero';
      if (!p.socid && datos.socid) {
        // Cliente con sesión: se usa su propio tercero
        p = avanzar({ socid: Number(datos.socid), terceroNuevo: false }, p);
      }
      if (!p.socid) {
        setPasoActual(paso);
        const existente = await TercerosService.buscarPorEmail(datos.cliente.email);
        const socid = existente ? Number(existente.id) : Number(await TercerosService.crearCliente(datos.cliente));
        p = avanzar({ socid, terceroNuevo: !existente }, p);
      }

      // 3. Crear el pedido con las líneas, la nota de entrega y el método de pago
      paso = 'pedido';
      if (!p.pedidoId) {
        setPasoActual(paso);
        const entregaTxt =
          datos.entrega.tipo === 'tienda'
            ? `Recoger en tienda: ${datos.entrega.sucursal}`
            : `Envío a domicilio: ${datos.entrega.direccion}`;
        const nota = [
          entregaTxt,
          `Pago: ${datos.pago === 'qr' ? 'QR' : 'Tarjeta'} (simulado)`,
          `Teléfono: ${datos.cliente.telefono}`,
          'Pedido realizado desde la tienda en línea.',
        ].join('\n');
        const pedidoId = Number(await PedidosService.crearPedido({ socid: p.socid, lineas, nota, modoPagoId }));
        p = avanzar({ pedidoId, lineas, entregaTxt, modoPagoId }, p);
      }

      // 4. Validar el pedido
      paso = 'validarPedido';
      if (!p.pedidoRef) {
        setPasoActual(paso);
        await PedidosService.validarPedido(p.pedidoId);
        const pedido = await PedidosService.getPedido(p.pedidoId);
        p = avanzar({ pedidoRef: pedido.ref }, p);
      }

      // 5. Expedición: cada línea desde el almacén con stock suficiente
      paso = 'expedicion';
      if (!p.expedicionId) {
        setPasoActual(paso);
        const pedido = await PedidosService.getPedido(p.pedidoId);
        const lineasEnvio = [];
        for (const linea of pedido.lines || []) {
          // Las líneas libres y los servicios (envío a domicilio) no se despachan
          if (String(linea.product_type) !== '0' || !linea.fk_product) continue;
          const producto = await ProductosDolibarrService.getProductoDetalle(linea.fk_product);
          const reparto = elegirAlmacenes(producto.stockPorAlmacen, Number(linea.qty));
          if (!reparto) {
            throw new ErrorCompra(`No hay stock suficiente de ${producto.label} en los almacenes para despachar el pedido.`);
          }
          for (const [almacen, qty] of reparto) {
            lineasEnvio.push({
              origin_line_id: Number(linea.id),
              fk_product: Number(linea.fk_product),
              qty,
              entrepot_id: almacen,
            });
          }
        }
        const expedicionId = Number(
          await ExpedicionesService.crearDesdePedido({ socid: p.socid, pedidoId: p.pedidoId, lineas: lineasEnvio })
        );
        p = avanzar({ expedicionId }, p);
      }

      // 6. Validar la expedición
      paso = 'validarExpedicion';
      if (!p.expedicionRef) {
        setPasoActual(paso);
        await ExpedicionesService.validarExpedicion(p.expedicionId);
        const expedicion = await ExpedicionesService.getExpedicion(p.expedicionId);
        p = avanzar({ expedicionRef: expedicion.ref }, p);
      }

      // 7. Cerrar la expedición: con la configuración de Dolibarr, aquí baja el stock
      paso = 'cerrarExpedicion';
      if (!p.expedicionCerrada) {
        setPasoActual(paso);
        await ExpedicionesService.cerrarExpedicion(p.expedicionId);
        p = avanzar({ expedicionCerrada: true }, p);
      }

      // 8. Crear la factura desde el pedido
      paso = 'factura';
      if (!p.facturaId) {
        setPasoActual(paso);
        const factura = await FacturasService.crearDesdePedido(p.pedidoId);
        const facturaId = Number(factura?.id ?? factura);
        // Si la factura no heredó la cuenta bancaria del pedido, se le asigna (para el PDF)
        if (Number(factura?.fk_account) !== CONFIG_TIENDA.CUENTA_BANCARIA_ID) {
          await FacturasService.asignarCuenta(facturaId);
        }
        p = avanzar({ facturaId }, p);
      }

      // 9. Validar la factura
      paso = 'validarFactura';
      if (!p.facturaRef) {
        setPasoActual(paso);
        await FacturasService.validarFactura(p.facturaId);
        const factura = await FacturasService.getFactura(p.facturaId);
        p = avanzar({ facturaRef: factura.ref, total: Number(factura.total_ttc) }, p);
      }

      // 10. Registrar el pago (la factura queda pagada)
      paso = 'pago';
      if (!p.pagoOk) {
        setPasoActual(paso);
        await FacturasService.registrarPago(p.facturaId, p.modoPagoId ?? modoPagoId);
        p = avanzar({ pagoOk: true }, p);
      }

      // 11. PDF de la factura: si falla, la compra igual está completa
      paso = 'pdf';
      setPasoActual(paso);
      let pdfOk = false;
      try {
        await FacturasService.generarPdf(p.facturaRef);
        pdfOk = true;
      } catch {
        pdfOk = false;
      }

      const resumen = { ...p, pdfOk };
      reiniciar();
      setPasoActual(null);
      return resumen;
    } catch (error) {
      const mensaje = error instanceof ErrorCompra ? error.message : getErrorMessage(error);
      setFallo({ paso, mensaje });
      setPasoActual(null);
      return null;
    }
  };

  return { procesar, pasoActual, fallo, progreso, bloqueada, reiniciar };
};

export default useProcesarCompra;
