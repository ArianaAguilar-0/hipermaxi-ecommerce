import { Check, Loader2, X } from 'lucide-react';
import { PASOS_COMPRA } from '@/hooks/useProcesarCompra';

// Lista de pasos del flujo en Dolibarr con su estado (hecho, en curso, falló)
export const ProgresoCompra = ({ pasoActual, fallo }) => {
  const activo = pasoActual ?? fallo?.paso;
  const indiceActivo = PASOS_COMPRA.findIndex((p) => p.id === activo);

  return (
    <ol className="space-y-2">
      {PASOS_COMPRA.map((p, i) => {
        const fallado = fallo?.paso === p.id;
        const hecho = i < indiceActivo;
        const enCurso = pasoActual === p.id;
        return (
          <li key={p.id} className={`flex items-center gap-2 text-sm ${hecho ? 'text-emerald-700' : fallado ? 'text-red-600' : enCurso ? 'text-hiper-navy font-semibold' : 'text-gray-400'}`}>
            {hecho && <Check size={16} />}
            {enCurso && <Loader2 size={16} className="animate-spin" />}
            {fallado && <X size={16} />}
            {!hecho && !enCurso && !fallado && <span className="inline-block h-4 w-4 rounded-full border border-gray-300" />}
            {p.texto}
          </li>
        );
      })}
    </ol>
  );
};

export default ProgresoCompra;
