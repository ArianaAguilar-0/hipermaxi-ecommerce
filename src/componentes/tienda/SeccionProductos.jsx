import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import GrillaProductos from './GrillaProductos';
import useCatalogo from '@/hooks/useCatalogo';

// Sección del inicio: un título y algunos productos (de una categoría o destacados)
export const SeccionProductos = ({ titulo, categoria = null, recientes = false, limite = 5, verTodo }) => {
  const { productos, loading, error, recargar } = useCatalogo({ categoria, recientes, limit: limite });

  // Si una categoría no tiene productos, la sección no se muestra
  if (!loading && !error && productos.length === 0 && categoria) return null;

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="!text-xl font-bold text-hiper-navy md:!text-2xl">{titulo}</h2>
        {verTodo && (
          <Link to={verTodo} className="inline-flex shrink-0 items-center text-sm font-semibold text-hiper-orange hover:underline">
            Ver todo <ChevronRight size={16} />
          </Link>
        )}
      </div>
      <GrillaProductos
        productos={productos}
        cargando={loading}
        error={error}
        onReintentar={recargar}
        skeletons={limite}
      />
    </section>
  );
};

export default SeccionProductos;
