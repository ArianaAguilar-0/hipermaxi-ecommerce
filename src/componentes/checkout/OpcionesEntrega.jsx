import { useEffect, useState } from 'react';
import { Store, Truck } from 'lucide-react';
import AlmacenesService from '@/services/almacenesService';
import { getErrorMessage } from '@/services/dolibarrClient';
import CampoTexto from './CampoTexto';
import { CONFIG_TIENDA } from '@/lib/configTienda';
import { formatearBs } from '@/lib/formato';

const Opcion = ({ activa, onClick, Icono, titulo, detalle, deshabilitado }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={deshabilitado}
    className={`flex flex-1 items-center gap-3 rounded-2xl border-2 p-4 text-left transition disabled:opacity-60 ${
      activa ? 'border-hiper-orange bg-hiper-orange-light' : 'border-gray-200 bg-white hover:border-gray-300'
    }`}
  >
    <Icono className={activa ? 'text-hiper-orange' : 'text-gray-400'} />
    <span>
      <span className="block text-sm font-bold text-gray-800">{titulo}</span>
      <span className="block text-xs text-gray-500">{detalle}</span>
    </span>
  </button>
);

// Tipo de entrega: recoger en una sucursal (almacenes de Dolibarr) o envío a domicilio
export const OpcionesEntrega = ({ valores, errores, onChange, deshabilitado }) => {
  const [sucursales, setSucursales] = useState({ lista: [], error: '', cargando: true });

  useEffect(() => {
    const controller = new AbortController();
    AlmacenesService.getSucursales(controller.signal)
      .then((lista) => setSucursales({ lista, error: '', cargando: false }))
      .catch((err) => {
        if (!controller.signal.aborted) setSucursales({ lista: [], error: getErrorMessage(err), cargando: false });
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Opcion activa={valores.tipo === 'tienda'} onClick={() => onChange({ ...valores, tipo: 'tienda' })}
          Icono={Store} titulo="Recoger en tienda" detalle="Gratis" deshabilitado={deshabilitado} />
        <Opcion activa={valores.tipo === 'domicilio'} onClick={() => onChange({ ...valores, tipo: 'domicilio' })}
          Icono={Truck} titulo="Envío a domicilio" detalle={formatearBs(CONFIG_TIENDA.COSTO_ENVIO)} deshabilitado={deshabilitado} />
      </div>

      {valores.tipo === 'tienda' && (
        <div>
          <label htmlFor="sucursal" className="mb-1.5 block text-sm font-medium text-gray-700">Sucursal</label>
          <select
            id="sucursal"
            value={valores.sucursal}
            onChange={(e) => onChange({ ...valores, sucursal: e.target.value })}
            disabled={deshabilitado || sucursales.cargando}
            className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-hiper-orange"
          >
            <option value="">{sucursales.cargando ? 'Cargando sucursales…' : 'Elige una sucursal'}</option>
            {sucursales.lista.map((s) => (
              <option key={s.id} value={s.nombre}>{s.nombre}</option>
            ))}
          </select>
          {sucursales.error && <p className="mt-1 text-xs text-red-600">{sucursales.error}</p>}
          {errores.sucursal && <p className="mt-1 text-xs font-medium text-red-600">{errores.sucursal}</p>}
        </div>
      )}

      {valores.tipo === 'domicilio' && (
        <CampoTexto id="direccion-entrega" label="Dirección de entrega" value={valores.direccion}
          onChange={(e) => onChange({ ...valores, direccion: e.target.value })}
          error={errores.direccionEntrega} disabled={deshabilitado} placeholder="Calle, número, zona y referencia" />
      )}
      {valores.tipo === 'domicilio' && (
        <p className="-mt-2 text-xs text-gray-500">Esta dirección se guarda solo en este pedido.</p>
      )}
    </div>
  );
};

export default OpcionesEntrega;
