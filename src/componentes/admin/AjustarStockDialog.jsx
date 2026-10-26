import { useEffect, useState } from 'react';
import { Boxes, Loader2, Minus, Plus } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import CampoTexto from '@/componentes/checkout/CampoTexto';
import ProductosDolibarrService from '@/services/productosDolibarrService';
import { getErrorMessage } from '@/services/dolibarrClient';

const selectCls = 'h-10 w-full rounded-xl border border-input bg-white px-3 text-sm text-gray-900 outline-none focus:border-hiper-orange';

/**
 * Ajuste manual de stock: muestra el stock por almacén y registra una entrada o salida.
 * No permite una salida mayor al stock del almacén elegido.
 */
export const AjustarStockDialog = ({ producto, almacenes, almacenPorDefecto, guardando, onGuardar, onCerrar }) => {
  // Stock actual por almacén (se lee con el token del administrador)
  const [stock, setStock] = useState({ porAlmacen: null, error: '' });
  const [form, setForm] = useState({ almacenId: almacenPorDefecto, tipo: 'entrada', cantidad: '', motivo: '' });
  const [errores, setErrores] = useState({});
  const [errorDolibarr, setErrorDolibarr] = useState('');

  useEffect(() => {
    let activo = true;
    ProductosDolibarrService.getProductoById(producto.id)
      .then((p) => {
        if (!activo) return;
        const porAlmacen = Object.fromEntries(
          Object.entries(p?.stock_warehouse || {}).map(([id, s]) => [String(id), Number(s?.real) || 0])
        );
        setStock({ porAlmacen, error: '' });
      })
      .catch((err) => activo && setStock({ porAlmacen: {}, error: getErrorMessage(err) }));
    return () => { activo = false; };
  }, [producto.id]);

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  const disponible = stock.porAlmacen?.[String(form.almacenId)] ?? 0;

  const guardar = async () => {
    const e = {};
    if (!form.almacenId) e.almacenId = 'Elige un almacén';
    if (!/^\d+$/.test(form.cantidad.trim()) || Number(form.cantidad) <= 0) e.cantidad = 'Ingresa un número entero mayor que 0';
    else if (form.tipo === 'salida' && Number(form.cantidad) > disponible) {
      e.cantidad = `No puedes sacar más de lo que hay en este almacén (${disponible})`;
    }
    if (form.motivo.trim().length < 3) e.motivo = 'Escribe el motivo (por ejemplo "Reposición")';
    setErrores(e);
    if (Object.keys(e).length) return;
    setErrorDolibarr('');
    const error = await onGuardar({ ...form, cantidad: Number(form.cantidad) });
    if (error) setErrorDolibarr(error);
  };

  const cargando = stock.porAlmacen === null;
  const nombreAlmacen = (id) => almacenes.find((a) => a.id === String(id));

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !guardando && onCerrar()}>
      <DialogContent className="bg-white p-6 sm:max-w-lg" showCloseButton={!guardando}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 !text-lg font-bold text-hiper-navy">
            <Boxes size={20} className="text-hiper-orange" /> Ajustar stock
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            <b className="text-gray-900">{producto.label}</b> (ref. <span className="font-mono">{producto.ref}</span>)
          </DialogDescription>
        </DialogHeader>

        {/* Stock actual por almacén */}
        <div className="rounded-2xl bg-gray-50 p-3 text-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Stock actual por almacén</p>
          {cargando && <p className="flex items-center gap-2 text-gray-500"><Loader2 size={14} className="animate-spin" /> Cargando…</p>}
          {stock.error && <p className="text-red-600">{stock.error}</p>}
          {!cargando && !stock.error && Object.keys(stock.porAlmacen).length === 0 && <p className="text-gray-500">Sin stock en ningún almacén.</p>}
          {!cargando && Object.entries(stock.porAlmacen).map(([id, cant]) => (
            <p key={id} className="flex justify-between text-gray-700">
              <span>{nombreAlmacen(id) ? `${nombreAlmacen(id).ref} · ${nombreAlmacen(id).nombre}` : `Almacén ${id}`}</span>
              <b>{cant}</b>
            </p>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="ajuste-almacen" className="mb-1.5 block text-sm font-medium text-gray-700">Almacén</label>
            <select id="ajuste-almacen" className={selectCls} value={form.almacenId} onChange={set('almacenId')} disabled={guardando}>
              <option value="">Elige un almacén</option>
              {almacenes.map((a) => <option key={a.id} value={a.id}>{a.ref} · {a.nombre}</option>)}
            </select>
            {errores.almacenId && <p className="mt-1 text-xs font-medium text-red-600">{errores.almacenId}</p>}
          </div>

          <div className="sm:col-span-2 grid grid-cols-2 gap-2">
            {[
              { v: 'entrada', t: 'Entrada (sumar)', I: Plus },
              { v: 'salida', t: 'Salida (restar)', I: Minus },
            ].map(({ v, t, I }) => (
              <button key={v} type="button" onClick={() => setForm((f) => ({ ...f, tipo: v }))} disabled={guardando}
                className={`flex items-center justify-center gap-1.5 rounded-xl border-2 py-2 text-sm font-semibold transition ${
                  form.tipo === v ? 'border-hiper-orange bg-hiper-orange-light text-hiper-orange' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                <I size={16} /> {t}
              </button>
            ))}
          </div>

          <CampoTexto id="ajuste-cantidad" label="Cantidad" type="number" min="1" step="1" inputMode="numeric"
            value={form.cantidad} onChange={set('cantidad')} error={errores.cantidad} disabled={guardando} />
          <CampoTexto id="ajuste-motivo" label="Motivo" maxLength={60} placeholder="Reposición"
            value={form.motivo} onChange={set('motivo')} error={errores.motivo} disabled={guardando} />
        </div>

        {form.tipo === 'salida' && form.almacenId && !cargando && (
          <p className="text-xs text-gray-500">Disponible en este almacén: <b>{disponible}</b></p>
        )}
        {errorDolibarr && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{errorDolibarr}</p>
        )}

        <DialogFooter className="gap-2 sm:justify-end">
          <button type="button" onClick={onCerrar} disabled={guardando}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50">
            Cancelar
          </button>
          <button type="button" onClick={guardar} disabled={guardando || cargando}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-hiper-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-hiper-orange-dark disabled:opacity-50">
            {guardando && <Loader2 className="h-4 w-4 animate-spin" />}
            {guardando ? 'Guardando…' : 'Registrar movimiento'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AjustarStockDialog;
