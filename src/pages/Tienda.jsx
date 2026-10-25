import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import GrillaProductos from '@/componentes/tienda/GrillaProductos';
import useCatalogo from '@/hooks/useCatalogo';
import useCategorias from '@/hooks/useCategorias';
import { useAuth } from '@/context/AuthContext';
import ErrorMessage from '@/shimer/pulse/ErrorMessage';

const POR_PAGINA = 15;

// Listado de productos: filtra por categoría (?categoria=) y por búsqueda (?q=)
export const Tienda = () => {
  const [params] = useSearchParams();
  const categoria = params.get('categoria');
  const texto = params.get('q') || '';
  const { esAdmin } = useAuth();
  const { categorias } = useCategorias();

  const { productos, total, loading, error, hayMas, cargarMas, recargar } = useCatalogo({
    categoria, texto, esAdmin, limit: POR_PAGINA,
  });

  const nombreCategoria = categorias.find((c) => c.id === categoria)?.label;
  const titulo = texto
    ? `Resultados para “${texto}”`
    : nombreCategoria || (categoria ? 'Categoría' : 'Todos los productos');

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="!text-2xl font-extrabold text-hiper-navy md:!text-3xl">{titulo}</h1>
          {texto && nombreCategoria && <p className="text-sm text-gray-500">en {nombreCategoria}</p>}
        </div>
        {!loading && !error && total > 0 && (
          <p className="text-sm text-gray-500">
            Mostrando {productos.length} de {total} productos
          </p>
        )}
      </div>

      <GrillaProductos
        productos={productos}
        cargando={loading}
        error={error}
        onReintentar={recargar}
        skeletons={POR_PAGINA}
        mensajeVacio={texto ? `No hay productos que coincidan con “${texto}”.` : 'Esta categoría todavía no tiene productos.'}
      />

      {/* Error al cargar más páginas: los productos ya cargados se mantienen */}
      {error && productos.length > 0 && <ErrorMessage errorDetail={error} onRetry={recargar} />}

      {hayMas && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={cargarMas}
            className="rounded-full border-2 border-hiper-orange px-8 py-2.5 text-sm font-bold text-hiper-orange transition hover:bg-hiper-orange hover:text-white"
          >
            Cargar más productos
          </button>
        </div>
      )}
      {loading && productos.length > 0 && (
        <p className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
        </p>
      )}
    </section>
  );
};

export default Tienda;
