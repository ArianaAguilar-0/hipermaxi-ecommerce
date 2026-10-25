import { Link, useLocation, useSearchParams } from 'react-router-dom';
import useCategorias from '@/hooks/useCategorias';

// Lista de categorías de Dolibarr. `vertical` se usa en el menú desplegable del celular.
export const MenuCategorias = ({ vertical = false, onElegir }) => {
  const { categorias, loading, error, recargar } = useCategorias();
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  // Categoría activa (solo en /tienda); null = "Todas"
  const actual = pathname === '/tienda' ? params.get('categoria') : undefined;

  const clase = (activa) =>
    vertical
      ? `block rounded-lg px-3 py-2 text-sm ${activa ? 'bg-hiper-orange text-white' : 'text-gray-700 hover:bg-hiper-orange-light'}`
      : `block whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition ${activa ? 'bg-hiper-orange text-white' : 'text-white/90 hover:bg-white/15'}`;

  if (error) {
    return (
      <button
        type="button"
        onClick={recargar}
        className={`text-sm underline ${vertical ? 'px-3 py-2 text-red-600' : 'py-2.5 text-white/80'}`}
      >
        No se pudieron cargar las categorías. Reintentar
      </button>
    );
  }

  return (
    <ul className={vertical ? 'space-y-1' : 'flex items-center gap-1 py-2'}>
      <li>
        <Link to="/tienda" onClick={onElegir} className={clase(actual === null)}>
          Todas
        </Link>
      </li>
      {loading && Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className={`h-7 animate-pulse rounded-full ${vertical ? 'bg-gray-100' : 'w-24 bg-white/15'}`} />
      ))}
      {categorias.map((c) => (
        <li key={c.id}>
          <Link to={`/tienda?categoria=${c.id}`} onClick={onElegir} className={clase(actual === c.id)}>
            {c.label}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default MenuCategorias;
