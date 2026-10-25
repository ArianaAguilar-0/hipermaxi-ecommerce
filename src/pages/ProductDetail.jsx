import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Minus, Plus, ShoppingCart, Barcode } from "lucide-react";
import toast from "react-hot-toast";
import ProductosDolibarrService from "@/services/productosDolibarrService";
import { getErrorMessage } from "@/services/dolibarrClient";
import ImagenProducto from "@/componentes/tienda/ImagenProducto";
import EmptyState from "@/shimer/pulse/EmptyState";
import ErrorMessage from "@/shimer/pulse/ErrorMessage";
import { useCart } from "@/context/CartContext";
import { formatearBs } from "@/lib/formato";

// Detalle de un producto (GET /products/{id})
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregar } = useCart();
  const [intento, setIntento] = useState(0);
  const [resultado, setResultado] = useState({ clave: null, producto: null, error: "", noExiste: false });
  const [cantidad, setCantidad] = useState(1);

  const clave = `${id}|${intento}`;

  useEffect(() => {
    const controller = new AbortController();
    ProductosDolibarrService.getProductoDetalle(id, controller.signal)
      .then((producto) => setResultado({ clave, producto, error: "", noExiste: false }))
      .catch((err) => {
        if (controller.signal.aborted) return;
        const noExiste = err?.response?.status === 404;
        setResultado({ clave, producto: null, error: getErrorMessage(err), noExiste });
      });
    return () => controller.abort();
  }, [id, clave]);

  const loading = resultado.clave !== clave;
  const { producto, error, noExiste } = resultado;

  if (loading) {
    return (
      <div className="grid animate-pulse gap-8 md:grid-cols-2">
        <div className="aspect-square rounded-3xl bg-gray-200" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded bg-gray-200" />
          <div className="h-10 w-1/3 rounded bg-gray-200" />
          <div className="h-24 rounded bg-gray-100" />
          <div className="h-12 rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  // Los servicios y productos fuera de venta no se muestran en la tienda
  if (noExiste || (producto && (!producto.enVenta || producto.tipo !== "0"))) {
    return (
      <EmptyState
        message="Este producto no existe o no está a la venta."
        onAction={() => navigate("/tienda")}
        actionLabel="Volver a la tienda"
      />
    );
  }

  if (error) {
    return <ErrorMessage errorDetail={error} onRetry={() => setIntento((n) => n + 1)} />;
  }

  const sinStock = producto.stock <= 0;

  const handleAgregar = () => {
    const res = agregar(producto, cantidad);
    if (res.ok) toast.success(res.mensaje);
    else toast.error(res.mensaje);
  };

  return (
    <section>
      <Link to="/tienda" className="mb-4 inline-flex items-center text-sm font-medium text-gray-500 hover:text-hiper-orange">
        <ChevronLeft size={16} /> Volver a la tienda
      </Link>

      <div className="grid gap-8 rounded-3xl bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">
        <ImagenProducto producto={producto} tamano="lg" className="rounded-2xl" />

        <div className="flex flex-col">
          <h1 className="!text-2xl font-extrabold text-hiper-navy md:!text-3xl">{producto.label}</h1>
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
            Ref. {producto.ref}
            {producto.barcode && (<><span className="mx-1">·</span><Barcode size={13} /> {producto.barcode}</>)}
          </p>

          <p className="mt-5 text-4xl font-extrabold text-hiper-orange">{formatearBs(producto.precio)}</p>
          <p className="text-xs text-gray-400">Precio con impuestos incluidos</p>

          <p className={`mt-3 text-sm font-semibold ${sinStock ? "text-red-500" : "text-emerald-600"}`}>
            {sinStock ? "Sin stock" : `${producto.stock} unidades disponibles`}
          </p>

          {producto.descripcion && (
            <p className="mt-5 whitespace-pre-line text-sm leading-6 text-gray-600">{producto.descripcion}</p>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row">
            {/* Selector de cantidad (máximo = stock) */}
            <div className="flex items-center justify-between rounded-xl border border-gray-300 sm:w-36">
              <button type="button" onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                disabled={sinStock || cantidad <= 1} className="p-3 text-gray-600 disabled:opacity-30" aria-label="Disminuir cantidad">
                <Minus size={16} />
              </button>
              <span className="font-semibold">{cantidad}</span>
              <button type="button" onClick={() => setCantidad((c) => Math.min(producto.stock, c + 1))}
                disabled={sinStock || cantidad >= producto.stock} className="p-3 text-gray-600 disabled:opacity-30" aria-label="Aumentar cantidad">
                <Plus size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAgregar}
              disabled={sinStock}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-hiper-orange py-3 font-bold text-white transition hover:bg-hiper-orange-dark disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
            >
              <ShoppingCart size={18} /> {sinStock ? "Sin stock" : "Agregar al carrito"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;
