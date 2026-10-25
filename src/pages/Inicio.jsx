import EmptyState from '../shimer/pulse/EmptyState';

// Página de inicio: el catálogo desde Dolibarr se conecta en la Fase 1
export const Inicio = () => {
  return (
    <section className="mx-auto max-w-5xl">
      <EmptyState message="El catálogo se cargará desde Dolibarr en la Fase 1." />
    </section>
  );
};

export default Inicio;
