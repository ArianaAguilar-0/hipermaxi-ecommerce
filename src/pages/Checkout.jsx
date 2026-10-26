import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { QrCode, CreditCard, AlertTriangle, Loader2, BadgeCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import FormularioFacturacion from '@/componentes/checkout/FormularioFacturacion';
import OpcionesEntrega from '@/componentes/checkout/OpcionesEntrega';
import PagoTarjeta from '@/componentes/checkout/PagoTarjeta';
import QrDemo from '@/componentes/checkout/QrDemo';
import ResumenPedido from '@/componentes/checkout/ResumenPedido';
import ProgresoCompra from '@/componentes/checkout/ProgresoCompra';
import { validarCliente, validarEntrega, validarTarjeta } from '@/componentes/checkout/validaciones';
import EmptyState from '@/shimer/pulse/EmptyState';
import useProcesarCompra from '@/hooks/useProcesarCompra';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CONFIG_TIENDA } from '@/lib/configTienda';
import { formatearBs } from '@/lib/formato';

const Paso = ({ numero, titulo, children }) => (
  <section className="rounded-3xl bg-white p-5 shadow-sm md:p-6">
    <h2 className="mb-4 flex items-center gap-3 !text-lg font-bold text-hiper-navy">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-hiper-orange text-sm text-white">{numero}</span>
      {titulo}
    </h2>
    {children}
  </section>
);

const clienteVacio = { nombre: '', nit: '', email: '', telefono: '', direccion: '' };
const tarjetaVacia = { numero: '', nombre: '', vencimiento: '', cvv: '' };

// Checkout: facturación, entrega, pago simulado y compra en Dolibarr
export const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, vaciar, actualizarItem } = useCart();
  const { isAutenticated, esCliente, user, cliente: clienteSesion } = useAuth();
  // Un cliente con tercero vinculado compra con los datos de su cuenta
  const socidCliente = esCliente ? user?.socid : null;
  const { procesar, pasoActual, fallo, progreso, bloqueada, reiniciar } = useProcesarCompra({ items, actualizarItem });

  const [cliente, setCliente] = useState(() => ({ ...clienteVacio, ...(clienteSesion || {}) }));
  const [entrega, setEntrega] = useState({ tipo: 'tienda', sucursal: '', direccion: '' });
  const [metodo, setMetodo] = useState('qr');
  const [tarjeta, setTarjeta] = useState(tarjetaVacia);
  const [errores, setErrores] = useState({});

  const procesando = pasoActual !== null;
  const envio = entrega.tipo === 'domicilio' ? CONFIG_TIENDA.COSTO_ENVIO : 0;
  const total = subtotal + envio;

  // Al elegir envío a domicilio, se propone la dirección de facturación
  const cambiarEntrega = (nueva) => {
    if (nueva.tipo === 'domicilio' && !nueva.direccion) nueva = { ...nueva, direccion: cliente.direccion };
    setEntrega(nueva);
  };

  if (!items.length && !bloqueada) {
    return <EmptyState message="Tu carrito está vacío." onAction={() => navigate('/tienda')} actionLabel="Ir a la tienda" />;
  }

  // Sin sesión: se abre el login y luego se vuelve al checkout
  if (!isAutenticated) {
    return <Navigate to="/login" replace state={{ volver: '/checkout' }} />;
  }

  const confirmar = async () => {
    if (!bloqueada) {
      const errs = {
        // Los datos de un cliente registrado vienen de su tercero en Dolibarr
        ...(socidCliente ? {} : validarCliente(cliente)),
        ...validarEntrega(entrega),
        ...(metodo === 'tarjeta' ? Object.fromEntries(Object.entries(validarTarjeta(tarjeta)).map(([k, v]) => [`tarjeta_${k}`, v])) : {}),
      };
      setErrores(errs);
      if (Object.keys(errs).length) {
        toast.error('Revisa los datos marcados en rojo');
        return;
      }
    }

    // Copia del resumen antes de vaciar el carrito
    const itemsCompra = items.map((i) => ({ ...i }));
    const resultado = await procesar({ cliente, entrega, pago: metodo, socid: socidCliente });
    if (!resultado) {
      toast.error('No se pudo completar la compra');
      return;
    }

    setTarjeta(tarjetaVacia); // los datos de la tarjeta se descartan
    navigate('/compra-exitosa', {
      replace: true,
      state: {
        compra: {
          pedidoRef: resultado.pedidoRef,
          facturaRef: resultado.facturaRef,
          expedicionRef: resultado.expedicionRef,
          total: resultado.total ?? total,
          entrega: resultado.entregaTxt,
          pago: (resultado.modoPagoId ?? (metodo === 'qr' ? CONFIG_TIENDA.PAGO_QR_ID : CONFIG_TIENDA.PAGO_TARJETA_ID)) === CONFIG_TIENDA.PAGO_QR_ID ? 'QR' : 'Tarjeta',
          pdfOk: resultado.pdfOk,
          items: itemsCompra,
        },
      },
    });
    vaciar();
    toast.success('¡Compra realizada!');
  };

  const erroresTarjeta = Object.fromEntries(
    Object.entries(errores).filter(([k]) => k.startsWith('tarjeta_')).map(([k, v]) => [k.slice(8), v])
  );

  return (
    <div>
      <h1 className="mb-1 !text-2xl font-extrabold text-hiper-navy md:!text-3xl">Finalizar compra</h1>
      <p className="mb-5 text-sm text-gray-500">Comprando como <b className="text-gray-700">{user?.nombre}</b></p>

      {/* Falló un paso: explicación y reintento */}
      {fallo && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="flex items-center gap-2 font-semibold"><AlertTriangle size={18} /> No se pudo completar la compra</p>
          <p className="mt-1">{fallo.mensaje}</p>
          {bloqueada && (
            <p className="mt-2 text-red-600/80">
              El pedido ya se creó en Dolibarr (ID {progreso.pedidoId}{progreso.pedidoRef ? `, ${progreso.pedidoRef}` : ''}).
              Al reintentar se continúa desde el paso que falló, sin crear otro pedido. Tu carrito no se vació.
            </p>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Paso numero={1} titulo="Datos de facturación">
            {socidCliente && (
              <p className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                <BadgeCheck size={16} /> Datos de tu cuenta de cliente en Dolibarr. Para cambiarlos, contacta a la tienda.
              </p>
            )}
            <FormularioFacturacion valores={cliente} errores={errores} onChange={setCliente}
              deshabilitado={procesando || bloqueada || Boolean(socidCliente)} />
          </Paso>

          <Paso numero={2} titulo="Tipo de entrega">
            <OpcionesEntrega valores={entrega} errores={errores} onChange={cambiarEntrega} deshabilitado={procesando || bloqueada} />
          </Paso>

          <Paso numero={3} titulo="Pago">
            <div className="mb-5 flex gap-3">
              {[
                { id: 'qr', texto: 'QR', Icono: QrCode },
                { id: 'tarjeta', texto: 'Tarjeta', Icono: CreditCard },
              ].map(({ id, texto, Icono }) => (
                <button key={id} type="button" onClick={() => setMetodo(id)} disabled={procesando || bloqueada}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 py-3 text-sm font-bold transition disabled:opacity-60 ${
                    metodo === id ? 'border-hiper-orange bg-hiper-orange-light text-hiper-orange' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <Icono size={18} /> {texto}
                </button>
              ))}
            </div>

            {metodo === 'qr' ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-hiper-navy-light p-6 text-center">
                <QrDemo semilla={Math.round(total * 100)} />
                <p className="text-sm text-gray-600">Monto a pagar</p>
                <p className="text-3xl font-extrabold text-hiper-navy">{formatearBs(total)}</p>
                <p className="text-xs text-gray-500">QR genérico de demostración: no es un QR bancario real.</p>
              </div>
            ) : (
              <PagoTarjeta valores={tarjeta} errores={erroresTarjeta} onChange={setTarjeta} deshabilitado={procesando || bloqueada} />
            )}
          </Paso>
        </div>

        <ResumenPedido items={items} subtotal={subtotal} envio={envio}>
          <button type="button" onClick={confirmar} disabled={procesando}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-hiper-orange py-3.5 text-base font-bold text-white transition hover:bg-hiper-orange-dark disabled:opacity-70">
            {procesando && <Loader2 size={18} className="animate-spin" />}
            {fallo ? 'Reintentar' : metodo === 'qr' ? 'Validar pago' : 'Comprar'}
          </button>
          {bloqueada && !procesando && (
            <button type="button" onClick={() => { if (window.confirm('El pedido creado quedará en Dolibarr sin factura pagada. ¿Empezar de nuevo?')) reiniciar(); }}
              className="mt-2 w-full text-center text-xs text-gray-500 underline">
              Cancelar y empezar de nuevo
            </button>
          )}
          {(procesando || fallo) && (
            <div className="mt-5 border-t pt-4"><ProgresoCompra pasoActual={pasoActual} fallo={fallo} /></div>
          )}
        </ResumenPedido>
      </div>
    </div>
  );
};

export default Checkout;
