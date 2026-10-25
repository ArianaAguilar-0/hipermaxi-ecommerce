import ProductoCard from './ProductoCard';
import CardSkeleton from '@/Moleculas/CardSkeleton';
import EmptyState from '@/shimer/pulse/EmptyState';
import ErrorMessage from '@/shimer/pulse/ErrorMessage';

const COLUMNAS = 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5';

/**
 * Grilla de productos con estados de carga, vacío y error.
 * Mientras carga "más", los skeletons se agregan debajo de los productos ya visibles.
 */
export const GrillaProductos = ({
  productos = [],
  cargando = false,
  error = '',
  onReintentar,
  mensajeVacio = 'No encontramos productos',
  skeletons = 10,
}) => {
  if (error && productos.length === 0) {
    return <ErrorMessage errorDetail={error} onRetry={onReintentar} />;
  }

  if (!cargando && productos.length === 0) {
    return <EmptyState message={mensajeVacio} />;
  }

  return (
    <div className={COLUMNAS}>
      {productos.map((p) => (
        <ProductoCard key={p.id} producto={p} />
      ))}
      {cargando && Array.from({ length: productos.length ? 5 : skeletons }).map((_, i) => (
        <CardSkeleton key={`sk-${i}`} />
      ))}
    </div>
  );
};

export default GrillaProductos;
