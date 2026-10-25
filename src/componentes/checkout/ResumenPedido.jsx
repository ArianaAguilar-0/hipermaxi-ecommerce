import ImagenProducto from '@/componentes/tienda/ImagenProducto';
import { formatearBs } from '@/lib/formato';

// Resumen lateral del checkout: productos, subtotal, envío y total
export const ResumenPedido = ({ items, subtotal, envio, children }) => (
  <aside className="rounded-3xl bg-white p-5 shadow-sm lg:sticky lg:top-40">
    <h2 className="!text-lg font-bold text-hiper-navy">Resumen del pedido</h2>
    <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
      {items.map((i) => (
        <li key={i.id} className="flex items-center gap-3">
          <div className="w-12 shrink-0"><ImagenProducto producto={i} /></div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-gray-800">{i.label}</p>
            <p className="text-xs text-gray-500">{i.cantidad} × {formatearBs(i.precio)}</p>
          </div>
          <span className="text-sm font-semibold">{formatearBs(i.precio * i.cantidad)}</span>
        </li>
      ))}
    </ul>
    <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
      <div className="flex justify-between text-gray-600"><dt>Subtotal</dt><dd>{formatearBs(subtotal)}</dd></div>
      <div className="flex justify-between text-gray-600">
        <dt>Envío</dt><dd>{envio > 0 ? formatearBs(envio) : 'Gratis'}</dd>
      </div>
      <div className="flex items-center justify-between border-t pt-3">
        <dt className="text-base font-bold text-gray-900">Total</dt>
        <dd className="text-2xl font-extrabold text-hiper-orange">{formatearBs(subtotal + envio)}</dd>
      </div>
    </dl>
    {children}
  </aside>
);

export default ResumenPedido;
