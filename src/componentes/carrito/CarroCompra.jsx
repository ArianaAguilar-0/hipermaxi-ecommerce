import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { DrawerCloseButton } from '@/components/ui/drawer';
import ImagenProducto from '@/componentes/tienda/ImagenProducto';
import { useCart } from '@/context/CartContext';
import { formatearBs } from '@/lib/formato';

// Contenido del panel lateral del carrito
export default function CarroCompra() {
  const { items, totalItems, subtotal, cambiarCantidad, quitar, setAbierto } = useCart();

  const navigate = useNavigate();

  // "Pagar": cierra el panel y va al checkout (si no hay sesión, allí se pide iniciarla)
  const handlePagar = () => {
    setAbierto(false);
    navigate('/checkout');
  };

  return (
    <div className="flex h-full flex-col">
      {/* Encabezado */}
      <div className="relative border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-hiper-orange-light text-hiper-orange">
            <ShoppingBag size={21} />
          </div>
          <div>
            <h2 className="!text-lg font-bold text-hiper-navy">Mi carrito</h2>
            <p className="text-sm text-gray-500">
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            </p>
          </div>
        </div>
        <DrawerCloseButton />
      </div>

      {items.length === 0 ? (
        // Carrito vacío
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <ShoppingBag size={36} />
          </div>
          <h3 className="!text-lg font-semibold text-gray-800">Tu carrito está vacío</h3>
          <p className="mt-2 max-w-xs text-sm text-gray-500">Agrega productos para comenzar tu compra.</p>
          <Link
            to="/tienda"
            onClick={() => setAbierto(false)}
            className="mt-5 rounded-full bg-hiper-orange px-5 py-2 text-sm font-semibold text-white hover:bg-hiper-orange-dark"
          >
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <>
          {/* Lista de productos */}
          <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3 border-b pb-4 last:border-b-0">
                <div className="w-20 shrink-0">
                  <ImagenProducto producto={item} />
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <h3 className="!text-sm font-medium leading-5 text-gray-900">{item.label}</h3>
                    <button
                      type="button"
                      onClick={() => quitar(item.id)}
                      className="shrink-0 text-gray-400 transition hover:text-red-500"
                      aria-label={`Quitar ${item.label}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <p className="mt-0.5 text-xs text-gray-500">{formatearBs(item.precio)} c/u</p>

                  <div className="mt-2 flex items-center justify-between">
                    {/* Selector de cantidad (máximo = stock) */}
                    <div className="flex items-center rounded-lg border border-gray-300">
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                        disabled={item.cantidad <= 1}
                        className="p-1.5 text-gray-600 transition hover:bg-gray-100 disabled:opacity-30"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="min-w-8 text-center text-sm font-medium">{item.cantidad}</span>
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                        disabled={item.cantidad >= item.stock}
                        className="p-1.5 text-gray-600 transition hover:bg-gray-100 disabled:opacity-30"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    <span className="font-bold text-gray-900">{formatearBs(item.precio * item.cantidad)}</span>
                  </div>
                  {item.cantidad >= item.stock && (
                    <p className="mt-1 text-[11px] text-amber-600">Máximo disponible: {item.stock}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Resumen */}
          <div className="border-t bg-gray-50 px-6 py-5">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-700">Subtotal</span>
              <span className="text-xl font-extrabold text-hiper-orange">{formatearBs(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">El costo de envío se calcula al pagar.</p>
            <button
              type="button"
              onClick={handlePagar}
              className="mt-4 w-full rounded-xl bg-hiper-orange px-4 py-3 font-bold text-white transition hover:bg-hiper-orange-dark active:scale-[0.99]"
            >
              Pagar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
