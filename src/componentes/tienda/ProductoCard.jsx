import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import ImagenProducto from './ImagenProducto';
import { useCart } from '@/context/CartContext';
import { formatearBs } from '@/lib/formato';

// Tarjeta de producto: imagen, nombre, precio en Bs, stock y botón "Agregar"
export const ProductoCard = ({ producto }) => {
  const { agregar } = useCart();
  const sinStock = producto.stock <= 0;

  const handleAgregar = () => {
    const res = agregar(producto, 1);
    if (res.ok) toast.success(res.mensaje);
    else toast.error(res.mensaje);
  };

  return (
    <article className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/producto/${producto.id}`} className="relative block">
        <ImagenProducto producto={producto} className="transition group-hover:scale-[1.02]" />
        {sinStock && (
          <span className="absolute left-2 top-2 rounded-full bg-gray-800/80 px-2 py-0.5 text-[11px] font-semibold text-white">
            Sin stock
          </span>
        )}
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <Link
          to={`/producto/${producto.id}`}
          className="line-clamp-2 min-h-10 text-sm font-medium leading-5 text-gray-800 hover:text-hiper-navy"
        >
          {producto.label}
        </Link>

        <p className="mt-2 text-lg font-extrabold text-hiper-orange">{formatearBs(producto.precio)}</p>
        <p className={`text-xs ${sinStock ? 'text-red-500' : 'text-gray-400'}`}>
          {sinStock ? 'Sin stock' : `${producto.stock} disponibles`}
        </p>

        <button
          type="button"
          onClick={handleAgregar}
          disabled={sinStock}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-hiper-orange py-2 text-sm font-semibold text-white transition hover:bg-hiper-orange-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
        >
          {sinStock ? 'Sin stock' : (<><Plus size={16} /> Agregar</>)}
        </button>
      </div>
    </article>
  );
};

export default ProductoCard;
