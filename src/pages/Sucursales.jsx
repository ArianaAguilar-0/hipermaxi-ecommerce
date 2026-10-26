import { useEffect, useState } from 'react';
import { MapPin, Clock, Store } from 'lucide-react';
import PaginaInformativa from '@/componentes/tienda/PaginaInformativa';
import AlmacenesService from '@/services/almacenesService';
import { getErrorMessage } from '@/services/dolibarrClient';
import ErrorMessage from '@/shimer/pulse/ErrorMessage';
import EmptyState from '@/shimer/pulse/EmptyState';

// Horario de atención de las sucursales
const HORARIO_EJEMPLO = 'Lunes a domingo, 8:00 a 21:00';

// Sucursales: las mismas que el checkout ofrece para "Recoger en tienda" (almacenes de Dolibarr)
export const Sucursales = () => {
  const [estado, setEstado] = useState({ lista: [], cargando: true, error: '' });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    AlmacenesService.getSucursales(controller.signal)
      .then((lista) => setEstado({ lista, cargando: false, error: '' }))
      .catch((err) => {
        if (!controller.signal.aborted) setEstado({ lista: [], cargando: false, error: getErrorMessage(err) });
      });
    return () => controller.abort();
  }, [intento]);

  const reintentar = () => {
    setEstado({ lista: [], cargando: true, error: '' });
    setIntento((n) => n + 1);
  };

  return (
    <PaginaInformativa titulo="Sucursales" subtitulo="Puedes elegir cualquiera para recoger tu pedido" Icono={Store}>
      {estado.error && <ErrorMessage titulo="No se pudieron cargar las sucursales" errorDetail={estado.error} onRetry={reintentar} />}
      {!estado.cargando && !estado.error && estado.lista.length === 0 && <EmptyState message="No hay sucursales disponibles." />}

      <div className="grid gap-4 sm:grid-cols-2">
        {estado.cargando && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-3xl bg-white shadow-sm" />
        ))}
        {estado.lista.map((s) => (
          <article key={s.id} className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="!text-base font-bold text-hiper-navy">{s.nombre}</h2>
            <p className="mt-3 flex items-start gap-2 text-sm text-gray-600">
              <MapPin size={16} className="mt-0.5 shrink-0 text-hiper-orange" /> Dirección de ejemplo: Av. Principal s/n, {s.nombre}
            </p>
            <p className="mt-1 flex items-start gap-2 text-sm text-gray-600">
              <Clock size={16} className="mt-0.5 shrink-0 text-hiper-orange" /> {HORARIO_EJEMPLO}
            </p>
            <span className="mt-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Disponible para recoger en tienda
            </span>
          </article>
        ))}
      </div>
    </PaginaInformativa>
  );
};

export default Sucursales;
