import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, Search, Pencil, RefreshCw, ChevronLeft, ChevronRight,
  Package, Wrench, AlertTriangle, Barcode, ShoppingCart, Boxes,
} from 'lucide-react';
import useProductosDolibarr from '../hooks/useProductosDolibarr';
import ProductoFormModal from '../componentes/dolibarr/ProductoFormModal';
import ProductosDolibarrService from '../services/productosDolibarrService';

const LIMIT = 10;
const money = (v) =>
  Number(v || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Badge = ({ on, children }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
    on ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-emerald-500' : 'bg-slate-400'}`} />{children}
  </span>
);

/* ---------- Página principal ---------- */
export const ProductosDolibarr = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [texto, setTexto] = useState('');

  const {
    productos, page, setPage, buscar, loading, isSubmitting, error, recargar,
    crearProducto, actualizarProducto, hasNextPage,
  } = useProductosDolibarr({ limit: LIMIT });

  // Búsqueda con debounce
  useEffect(() => {
    const t = setTimeout(() => buscar(texto), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto]);

  const abrirNuevo = () => { setEditando(null); setFormOpen(true); };
  const abrirEditar = async (p) => {
    // Se obtiene el detalle completo (GET /products/{id})
    try {
      const detalle = await ProductosDolibarrService.getProductoById(p.id);
      setEditando(detalle);
    } catch {
      setEditando(p);
    }
    setFormOpen(true);
  };

  const handleSubmit = async (form) => {
    const res = editando ? await actualizarProducto(editando.id, form) : await crearProducto(form);
    if (res.ok) {
      toast.success(editando ? 'Producto actualizado' : `Producto creado (ID ${res.data})`);
      setFormOpen(false);
    } else {
      toast.error(res.error);
    }
  };

  const enVenta = productos.filter((p) => String(p.status) === '1').length;
  const stats = [
    { label: 'En esta página', value: productos.length, I: Boxes, c: 'from-indigo-500 to-violet-500' },
    { label: 'En venta', value: enVenta, I: ShoppingCart, c: 'from-emerald-500 to-teal-500' },
    { label: 'Página', value: page + 1, I: Package, c: 'from-fuchsia-500 to-pink-500' },
  ];

  return (
    <section className="mx-auto max-w-7xl space-y-6">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className={`h-2 w-2 rounded-full ${!error ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {error ? 'Error de conexión' : 'Conectado a Dolibarr'}
            </span>
            <h1 className="mt-3 !text-3xl font-extrabold tracking-tight md:!text-4xl">Gestión de Productos</h1>
            <p className="mt-1 text-sm text-indigo-200">CRUD conectado a la API REST de Dolibarr</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button id="btn-nuevo-producto" onClick={abrirNuevo}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50">
              <Plus className="h-4 w-4" /> Nuevo producto
            </button>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map(({ label, value, I, c }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur ring-1 ring-white/10">
              <div className={`rounded-xl bg-gradient-to-br ${c} p-2.5 shadow-lg`}><I className="h-5 w-5" /></div>
              <div>
                <p className="text-2xl font-bold leading-none">{value}</p>
                <p className="mt-1 text-xs text-indigo-200">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input id="buscar-producto" value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar por referencia o etiqueta..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15" />
        </div>
        <button id="btn-recargar" onClick={recargar} disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Recargar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">No se pudo cargar la lista</p>
            <p className="text-rose-600/80">{error}</p>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Producto</th>
                <th className="px-5 py-3">Código</th>
                <th className="px-5 py-3 text-right">Precio</th>
                <th className="px-5 py-3 text-right">Stock</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 animate-pulse rounded bg-slate-100" /></td>
                  ))}
                </tr>
              ))}

              {!loading && productos.map((p) => {
                const servicio = String(p.type) === '1';
                return (
                  <tr key={p.id} className="group transition hover:bg-indigo-50/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          servicio ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                          {servicio ? <Wrench className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">{p.label}</p>
                          <p className="text-xs text-slate-400">{p.ref} · #{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {p.barcode ? <span className="inline-flex items-center gap-1 font-mono text-xs"><Barcode className="h-3.5 w-3.5" />{p.barcode}</span> : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="font-semibold text-slate-800">{money(p.price)}</p>
                      <p className="text-xs text-slate-400">TTC {money(p.price_ttc)}</p>
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-slate-600">
                      {servicio ? '—' : Number(p.stock_reel || 0)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        <Badge on={String(p.status) === '1'}>Venta</Badge>
                        <Badge on={String(p.status_buy) === '1'}>Compra</Badge>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1 opacity-70 transition group-hover:opacity-100">
                        <button id={`btn-editar-${p.id}`} onClick={() => abrirEditar(p)} title="Editar"
                          className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-100">
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && !error && productos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Boxes className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-2 font-semibold text-slate-600">
                      No hay productos
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
          <span>Página <b className="text-slate-700">{page + 1}</b></span>
          <div className="flex gap-2">
            <button id="btn-pagina-anterior" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0 || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            <button id="btn-pagina-siguiente" onClick={() => setPage((p) => p + 1)} disabled={!hasNextPage || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:opacity-40">
              Siguiente <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {formOpen && (
        <ProductoFormModal key={editando?.id ?? 'nuevo'} producto={editando} isSubmitting={isSubmitting}
          onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
      )}
    </section>
  );
};

export default ProductosDolibarr;
