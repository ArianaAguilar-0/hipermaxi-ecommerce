import { useEffect, useState } from 'react';
import { X, Save, Loader2, Package, Wrench } from 'lucide-react';
import { productoVacio, fromDolibarr } from '../../services/productosDolibarrService';

const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-hiper-orange focus:ring-4 focus:ring-hiper-orange/15 disabled:opacity-60';
const labelCls = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500';

const Field = ({ label, htmlFor, error, children, className = '' }) => (
  <div className={className}>
    <label htmlFor={htmlFor} className={labelCls}>{label}</label>
    {children}
    {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
  </div>
);

const Toggle = ({ id, checked, onChange, label, disabled }) => (
  <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <span className="relative inline-flex items-center">
      <input id={id} type="checkbox" className="peer sr-only" checked={checked} disabled={disabled}
        onChange={(e) => onChange(e.target.checked)} />
      <span className="h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-hiper-orange" />
      <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
    </span>
  </label>
);

const validar = (f, esEdicion) => {
  const e = {};
  if (!f.ref.trim()) e.ref = 'La referencia (código) es obligatoria';
  if (!f.label.trim()) e.label = 'El nombre es obligatorio';
  if (!esEdicion && !f.categoria) e.categoria = 'Elige una categoría';
  const price = parseFloat(f.price);
  const priceMin = parseFloat(f.price_min);
  if (f.price === '' || isNaN(price) || price <= 0) e.price = 'Ingresa un precio mayor a 0';
  if (f.price_min !== '' && (isNaN(priceMin) || priceMin < 0)) e.price_min = 'Precio mínimo inválido';
  if (!e.price && !e.price_min && f.price !== '' && f.price_min !== '' && priceMin > price)
    e.price_min = 'No puede ser mayor que el precio de venta';
  if (f.weight !== '' && (isNaN(parseFloat(f.weight)) || parseFloat(f.weight) < 0)) e.weight = 'Peso inválido';
  if (f.barcode.trim() && !f.barcode_type) e.barcode_type = 'Elige el tipo de código de barras';
  return e;
};

/**
 * Montar solo cuando esté abierto y con `key` distinta por producto,
 * así el estado inicial se toma directamente de las props.
 */
export const ProductoFormModal = ({ producto, categorias = [], categoriaInicial = '', onClose, onSubmit, isSubmitting }) => {
  const [form, setForm] = useState(() => ({
    ...(producto ? fromDolibarr(producto) : productoVacio),
    categoria: categoriaInicial,
  }));
  const [errors, setErrors] = useState({});
  const esEdicion = Boolean(producto);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !isSubmitting && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isSubmitting, onClose]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v?.target ? v.target.value : v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validar(form, esEdicion);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    await onSubmit(form);
  };

  const precioTTC = (parseFloat(form.price) || 0) * (1 + (parseFloat(form.tva_tx) || 0) / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm animate-in fade-in" onClick={() => !isSubmitting && onClose()} />
      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95"
      >
        <header className="flex items-center justify-between bg-hiper-navy px-6 py-4 text-white">
          <div>
            <h2 className="!text-lg font-bold">{esEdicion ? 'Editar producto' : 'Nuevo producto'}</h2>
            <p className="text-xs text-white/80">
              {esEdicion ? `ID #${producto.id} · ${producto.ref}` : 'Se registrará en Dolibarr'}
            </p>
          </div>
          <button type="button" id="btn-cerrar-modal" onClick={onClose} disabled={isSubmitting}
            className="rounded-full p-2 transition hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-6 md:grid-cols-6">
          {/* Tipo */}
          <div className="md:col-span-6 grid grid-cols-2 gap-3">
            {[
              { v: '0', t: 'Producto', I: Package },
              { v: '1', t: 'Servicio', I: Wrench },
            ].map(({ v, t, I }) => (
              <button key={v} type="button" id={`tipo-${v}`} onClick={() => set('type')(v)}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
                  form.type === v
                    ? 'border-hiper-orange bg-hiper-orange-light text-hiper-orange'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}>
                <I className="h-4 w-4" /> {t}
              </button>
            ))}
          </div>

          <Field label="Referencia (código) *" htmlFor="ref" error={errors.ref} className="md:col-span-2">
            <input id="ref" className={inputCls} value={form.ref} onChange={set('ref')}
              placeholder="ABA-100" disabled={isSubmitting} />
          </Field>
          <Field label="Nombre *" htmlFor="label" error={errors.label} className="md:col-span-4">
            <input id="label" className={inputCls} value={form.label} onChange={set('label')}
              placeholder="Fideo tallarín 400 g" disabled={isSubmitting} />
          </Field>

          <Field label={esEdicion ? 'Categoría' : 'Categoría *'} htmlFor="categoria" error={errors.categoria} className="md:col-span-6">
            <select id="categoria" className={inputCls} value={form.categoria} onChange={set('categoria')} disabled={isSubmitting}>
              <option value="">{esEdicion ? 'Sin categoría' : 'Elige una categoría'}</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Descripción" htmlFor="description" className="md:col-span-6">
            <textarea id="description" rows={3} className={inputCls} value={form.description}
              onChange={set('description')} placeholder="Descripción breve del producto."
              disabled={isSubmitting} />
          </Field>

          <Field label="Precio de venta (Bs) *" htmlFor="price" error={errors.price} className="md:col-span-2">
            <input id="price" type="number" step="0.01" min="0" className={inputCls} value={form.price}
              onChange={set('price')} placeholder="12.50" disabled={isSubmitting} />
          </Field>
          <Field label="Precio mínimo" htmlFor="price_min" error={errors.price_min} className="md:col-span-2">
            <input id="price_min" type="number" step="0.01" min="0" className={inputCls} value={form.price_min}
              onChange={set('price_min')} placeholder="0.00" disabled={isSubmitting} />
          </Field>
          <Field label="Base de precio" htmlFor="price_base_type" className="md:col-span-1">
            <select id="price_base_type" className={inputCls} value={form.price_base_type}
              onChange={set('price_base_type')} disabled={isSubmitting}>
              <option value="HT">HT (sin IVA)</option>
              <option value="TTC">TTC (con IVA)</option>
            </select>
          </Field>
          <Field label="IVA %" htmlFor="tva_tx" className="md:col-span-1">
            <input id="tva_tx" type="number" step="0.01" min="0" className={inputCls} value={form.tva_tx}
              onChange={set('tva_tx')} disabled={isSubmitting} />
          </Field>

          {form.price_base_type === 'HT' && form.price !== '' && (
            <p className="md:col-span-6 -mt-2 text-xs text-gray-500">
              Precio con IVA estimado: <b className="text-gray-700">{precioTTC.toFixed(2)}</b>
            </p>
          )}

          <Field label="Código de barras" htmlFor="barcode" className="md:col-span-3">
            <input id="barcode" className={inputCls} value={form.barcode} onChange={set('barcode')}
              placeholder="7772000000000" disabled={isSubmitting} />
          </Field>
          <Field label="Tipo de código" htmlFor="barcode_type" error={errors.barcode_type} className="md:col-span-3">
            <select id="barcode_type" className={inputCls} value={form.barcode_type}
              onChange={set('barcode_type')} disabled={isSubmitting || !form.barcode.trim()}>
              <option value="">{form.barcode.trim() ? 'Elige el tipo' : 'Sin código de barras'}</option>
              <option value="1">EAN8</option>
              <option value="2">EAN13</option>
              <option value="3">UPC</option>
              <option value="4">ISBN</option>
              <option value="5">C39</option>
              <option value="6">C128</option>
            </select>
          </Field>

          <Field label="Peso" htmlFor="weight" error={errors.weight} className="md:col-span-3">
            <input id="weight" type="number" step="0.001" min="0" className={inputCls} value={form.weight}
              onChange={set('weight')} placeholder="2.5" disabled={isSubmitting} />
          </Field>
          <Field label="Unidad de peso" htmlFor="weight_units" className="md:col-span-3">
            <select id="weight_units" className={inputCls} value={form.weight_units}
              onChange={set('weight_units')} disabled={isSubmitting}>
              <option value="0">kg</option>
              <option value="-3">g</option>
              <option value="-6">mg</option>
              <option value="3">t</option>
              <option value="99">lb</option>
              <option value="98">oz</option>
            </select>
          </Field>

          <div className="md:col-span-3">
            <Toggle id="status" label="En venta" checked={form.status} onChange={set('status')} disabled={isSubmitting} />
          </div>
          <div className="md:col-span-3">
            <Toggle id="status_buy" label="En compra" checked={form.status_buy} onChange={set('status_buy')} disabled={isSubmitting} />
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button type="button" id="btn-cancelar" onClick={onClose} disabled={isSubmitting}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-200">
            Cancelar
          </button>
          <button type="submit" id="btn-guardar-producto" disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-hiper-orange px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-hiper-orange-dark active:scale-[.98] disabled:opacity-60">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSubmitting ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default ProductoFormModal;
