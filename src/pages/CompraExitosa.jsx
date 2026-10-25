import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, FileDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '@/shimer/pulse/EmptyState';
import FacturasService from '@/services/facturasService';
import { getErrorMessage } from '@/services/dolibarrClient';
import { formatearBs } from '@/lib/formato';

// Descarga un archivo que Dolibarr devuelve en base64
const descargarBase64 = (base64, nombre) => {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
};

// Confirmación de compra: número de pedido, factura, resumen y entrega
export const CompraExitosa = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const compra = state?.compra;
  const [descargando, setDescargando] = useState(false);

  if (!compra) {
    return <EmptyState message="No hay una compra reciente para mostrar." onAction={() => navigate('/')} actionLabel="Volver al inicio" />;
  }

  const descargarPdf = async () => {
    setDescargando(true);
    try {
      const archivo = await FacturasService.descargarPdf(compra.facturaRef);
      descargarBase64(archivo.content, archivo.filename || `${compra.facturaRef}.pdf`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl bg-white p-6 text-center shadow-sm md:p-10">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
        <h1 className="mt-4 !text-2xl font-extrabold text-hiper-navy md:!text-3xl">¡Gracias por tu compra!</h1>
        <p className="mt-2 text-sm text-gray-500">Tu pedido fue registrado y pagado correctamente.</p>

        <dl className="mt-6 grid gap-3 text-left sm:grid-cols-2">
          <div className="rounded-2xl bg-gray-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-gray-400">Pedido</dt>
            <dd className="text-lg font-bold text-gray-900">{compra.pedidoRef}</dd>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-gray-400">Factura</dt>
            <dd className="text-lg font-bold text-gray-900">{compra.facturaRef}</dd>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4 sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-gray-400">Entrega</dt>
            <dd className="text-sm font-medium text-gray-800">{compra.entrega}</dd>
            {compra.expedicionRef && <dd className="mt-1 text-xs text-gray-500">Envío {compra.expedicionRef}</dd>}
          </div>
        </dl>

        <ul className="mt-6 divide-y text-left text-sm">
          {compra.items.map((i) => (
            <li key={i.id} className="flex justify-between py-2">
              <span className="text-gray-700">{i.cantidad} × {i.label}</span>
              <span className="font-medium">{formatearBs(i.precio * i.cantidad)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <span className="font-bold">Total pagado ({compra.pago})</span>
          <span className="text-2xl font-extrabold text-hiper-orange">{formatearBs(compra.total)}</span>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {compra.pdfOk && (
            <button type="button" onClick={descargarPdf} disabled={descargando}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-hiper-navy py-3 text-sm font-bold text-hiper-navy hover:bg-hiper-navy-light disabled:opacity-60">
              {descargando ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />} Descargar factura (PDF)
            </button>
          )}
          <Link to="/tienda" className="flex-1 rounded-xl bg-hiper-orange py-3 text-sm font-bold text-white hover:bg-hiper-orange-dark">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompraExitosa;
