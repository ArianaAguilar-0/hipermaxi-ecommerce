import { Link } from 'react-router-dom';
import BannerCarrusel from '@/componentes/tienda/BannerCarrusel';
import SeccionProductos from '@/componentes/tienda/SeccionProductos';
import useCategorias from '@/hooks/useCategorias';

// Cantidad de categorías que se muestran como sección en el inicio
const SECCIONES = 3;

// Página de inicio: banners, accesos a categorías y secciones de productos
export const Inicio = () => {
  const { categorias } = useCategorias();

  return (
    <>
      <BannerCarrusel />

      {/* Accesos rápidos a categorías */}
      {categorias.length > 0 && (
        <section className="mt-4">
          <h2 className="mb-3 !text-xl font-bold text-hiper-navy md:!text-2xl">Compra por categoría</h2>
          <div className="flex flex-wrap gap-2">
            {categorias.map((c) => (
              <Link
                key={c.id}
                to={`/tienda?categoria=${c.id}`}
                className="rounded-full border border-hiper-navy/15 bg-white px-4 py-2 text-sm font-medium text-hiper-navy shadow-sm transition hover:border-hiper-orange hover:text-hiper-orange"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      <SeccionProductos titulo="Novedades" recientes verTodo="/tienda" />

      {categorias.slice(0, SECCIONES).map((c) => (
        <SeccionProductos key={c.id} titulo={c.label} categoria={c.id} verTodo={`/tienda?categoria=${c.id}`} />
      ))}
    </>
  );
};

export default Inicio;
