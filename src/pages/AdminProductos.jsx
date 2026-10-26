import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, Search, Pencil, Trash2, RefreshCw, ChevronLeft, ChevronRight, Package, Wrench, Barcode, Loader2, ShieldCheck,
} from 'lucide-react';
import useProductosDolibarr from '../hooks/useProductosDolibarr';
import useCategorias from '../hooks/useCategorias';
import ProductoFormModal from '../componentes/dolibarr/ProductoFormModal';
import ConfirmarEliminarProducto from '../componentes/admin/ConfirmarEliminarProducto';
import ProductosDolibarrService from '../services/productosDolibarrService';
import { getErrorMessage } from '../services/dolibarrClient';
import ErrorMessage from '../shimer/pulse/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { formatearBs } from '../lib/formato';

const LIMIT = 10;

const Insignia = ({ activa, children }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
    activa ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${activa ? 'bg-emerald-500' : 'bg-gray-400'}`} />{children}
  </span>
);

// Panel de administrador: consultar, crear, editar y eliminar productos.
// Todas las operaciones usan el token del administrador, no la key de servicio.
export const AdminProductos = () => {
  const { user, esAdmin } = useAuth();
  const { categorias } = useCategorias();
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState(null); // { producto, categoria }
  const [abriendo, setAbriendo] = useState(null);
  const [texto, setTexto] = useState('');
  // Producto a eliminar y error de Dolibarr al intentarlo
  const [aEliminar, setAEliminar] = useState(null);
  const [errorEliminar, setErrorEliminar] = useState('');

  const {
    productos, page, setPage, buscar, loading, isSubmitting, error, recargar,
    crearProducto, actualizarProducto, eliminarProducto, hasNextPage,
  } = useProductosDolibarr({ limit: LIMIT });

  // Búsqueda con debounce (nombre, referencia o código de barras)
  useEffect(() => {
    const t = setTimeout(() => buscar(texto), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto]);

  const abrirNuevo = () => { setEditando(null); setFormOpen(true); };

  const abrirEditar = async (p) => {
    // Detalle completo y categoría actual del producto
    setAbriendo(p.id);
    try {
      const [detalle, idsCategorias] = await Promise.all([
        ProductosDolibarrService.getProductoById(p.id),
        ProductosDolibarrService.getCategoriasDeProducto(p.id),
      ]);
      const categoria = idsCategorias.find((id) => categorias.some((c) => c.id === id)) || '';
      setEditando({ producto: detalle, categoria });
      setFormOpen(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAbriendo(null);
    }
  };

  const handleSubmit = async (form) => {
    const res = editando
      ? await actualizarProducto(editando.producto.id, form, editando.categoria, editando.producto)
      : await crearProducto(form);
    if (res.ok) {
      toast.success(editando ? 'Producto actualizado' : `Producto creado (ID ${res.data})`);
      setFormOpen(false);
    } else {
      toast.error(res.error, { duration: 9000 });
      // Si el producto llegó a crearse, se cierra el formulario para no crearlo dos veces
      if (res.creado) setFormOpen(false);
    }
  };

  const abrirEliminar = (p) => { setErrorEliminar(''); setAEliminar(p); };

  const confirmarEliminar = async () => {
    const res = await eliminarProducto(aEliminar.id);
    if (res.ok) {
      toast.success('Producto eliminado');
      setAEliminar(null);
      return;
    }
    // Si Dolibarr lo rechaza, el producto sigue en la lista y se explica el motivo
    setErrorEliminar(
      res.status === 403
        ? 'No tienes permiso para eliminar productos en Dolibarr (Productos → Eliminar productos).'
        : `Dolibarr no permitió eliminarlo: ${res.error}. Si el producto ya tiene pedidos, facturas o movimientos de stock, no se puede borrar; puedes dejarlo "fuera de venta" editándolo.`
    );
  };

  return (
    <section className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 rounded-3xl bg-hiper-navy p-6 text-white md:flex-row md:items-end md:justify-between md:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
            <ShieldCheck size={14} /> Administrador: {user?.nombre}
          </span>
          <h1 className="mt-3 !text-2xl font-extrabold md:!text-3xl">Gestión de productos</h1>
          <p className="mt-1 text-sm text-white/70">Los cambios se guardan en Dolibarr con tu usuario.</p>
        </div>
        <button id="btn-nuevo-producto" onClick={abrirNuevo}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-hiper-orange px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-hiper-orange-dark">
          <Plus className="h-4 w-4" /> Nuevo producto
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input id="buscar-producto" type="search" value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={60}
            placeholder="Buscar por nombre, referencia o código de barras…"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm outline-none transition focus:border-hiper-orange focus:ring-4 focus:ring-hiper-orange/15" />
        </div>
        <button id="btn-recargar" onClick={recargar} disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Recargar
        </button>
      </div>

      {error && <ErrorMessage titulo="No se pudo cargar la lista" errorDetail={error} onRetry={recargar} />}

      {/* Tabla */}
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Producto</th>
                <th className="px-5 py-3">Código de barras</th>
                <th className="px-5 py-3 text-right">Precio</th>
                <th className="px-5 py-3 text-right">Stock</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 animate-pulse rounded bg-gray-100" /></td>
                  ))}
                </tr>
              ))}

              {!loading && productos.map((p) => {
                const servicio = String(p.type) === '1';
                const stock = Number(p.stock_reel || 0);
                return (
                  <tr key={p.id} className="transition hover:bg-hiper-orange-light/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          servicio ? 'bg-amber-100 text-amber-600' : 'bg-hiper-navy-light text-hiper-navy'}`}>
                          {servicio ? <Wrench className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-800">{p.label}</p>
                          <p className="text-xs text-gray-400">{p.ref} · #{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {p.barcode ? <span className="inline-flex items-center gap-1 font-mono text-xs"><Barcode className="h-3.5 w-3.5" />{p.barcode}</span> : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="font-bold text-hiper-orange">{formatearBs(p.price_ttc)}</p>
                      <p className="text-xs text-gray-400">sin IVA {formatearBs(p.price)}</p>
                    </td>
                    <td className={`px-5 py-4 text-right font-semibold ${!servicio && stock <= 0 ? 'text-red-500' : 'text-gray-600'}`}>
                      {servicio ? '—' : stock <= 0 ? 'Sin stock' : stock}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        <Insignia activa={String(p.status) === '1'}>Venta</Insignia>
                        <Insignia activa={String(p.status_buy) === '1'}>Compra</Insignia>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button id={`btn-editar-${p.id}`} onClick={() => abrirEditar(p)} title="Editar" disabled={abriendo === p.id}
                          className="rounded-lg p-2 text-hiper-navy transition hover:bg-hiper-navy-light disabled:opacity-50">
                          {abriendo === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
                        </button>
                        {esAdmin && (
                          <button id={`btn-eliminar-${p.id}`} onClick={() => abrirEliminar(p)} title="Eliminar"
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && !error && productos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-gray-500">No hay productos que coincidan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm text-gray-500">
          <span>Página <b className="text-gray-700">{page + 1}</b></span>
          <div className="flex gap-2">
            <button id="btn-pagina-anterior" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0 || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 font-medium transition hover:bg-gray-50 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            <button id="btn-pagina-siguiente" onClick={() => setPage((p) => p + 1)} disabled={!hasNextPage || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 font-medium transition hover:bg-gray-50 disabled:opacity-40">
              Siguiente <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {formOpen && (
        <ProductoFormModal
          key={editando?.producto?.id ?? 'nuevo'}
          producto={editando?.producto ?? null}
          categoriaInicial={editando?.categoria ?? ''}
          categorias={categorias}
          isSubmitting={isSubmitting}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      {aEliminar && (
        <ConfirmarEliminarProducto
          key={aEliminar.id}
          producto={aEliminar}
          eliminando={isSubmitting}
          error={errorEliminar}
          onConfirmar={confirmarEliminar}
          onCerrar={() => setAEliminar(null)}
        />
      )}
    </section>
  );
};

export default AdminProductos;
