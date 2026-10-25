import CampoTexto from './CampoTexto';
import { formatearNumeroTarjeta, formatearVencimiento } from './validaciones';

// Formulario de tarjeta: solo se valida el formato.
// Estos datos viven en memoria del navegador y NO se envían a Dolibarr ni a ningún otro lado.
export const PagoTarjeta = ({ valores, errores, onChange, deshabilitado }) => {
  const set = (campo, formato = (v) => v) => (e) => onChange({ ...valores, [campo]: formato(e.target.value) });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CampoTexto id="tarjeta-numero" label="Número de tarjeta" value={valores.numero}
        onChange={set('numero', formatearNumeroTarjeta)} error={errores.numero} disabled={deshabilitado}
        inputMode="numeric" autoComplete="off" placeholder="4111 1111 1111 1111" className="sm:col-span-2" />
      <CampoTexto id="tarjeta-nombre" label="Nombre en la tarjeta" value={valores.nombre}
        onChange={set('nombre')} error={errores.nombre} disabled={deshabilitado} autoComplete="off" className="sm:col-span-2" />
      <CampoTexto id="tarjeta-vencimiento" label="Vencimiento (MM/AA)" value={valores.vencimiento}
        onChange={set('vencimiento', formatearVencimiento)} error={errores.vencimiento} disabled={deshabilitado}
        inputMode="numeric" autoComplete="off" placeholder="08/29" />
      <CampoTexto id="tarjeta-cvv" label="CVV" value={valores.cvv}
        onChange={set('cvv', (v) => v.replace(/\D/g, '').slice(0, 4))} error={errores.cvv} disabled={deshabilitado}
        type="password" inputMode="numeric" autoComplete="off" placeholder="123" />
      <p className="text-xs text-gray-500 sm:col-span-2">
        Pago simulado: los datos de la tarjeta solo se validan aquí y no se guardan ni se envían.
      </p>
    </div>
  );
};

export default PagoTarjeta;
