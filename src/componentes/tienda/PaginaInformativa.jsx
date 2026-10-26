// Estructura común de las páginas informativas (Quiénes somos, Sucursales, etc.)
export const PaginaInformativa = ({ titulo, subtitulo, Icono, children }) => (
  <section className="mx-auto max-w-4xl">
    <div className="mb-6 flex items-center gap-4 rounded-3xl bg-hiper-navy p-6 text-white md:p-8">
      {Icono && (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
          <Icono className="h-6 w-6 text-hiper-orange" />
        </div>
      )}
      <div>
        <h1 className="!text-2xl font-extrabold md:!text-3xl">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-white/75">{subtitulo}</p>}
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

// Tarjeta blanca con título opcional
export const Tarjeta = ({ titulo, children, className = '' }) => (
  <div className={`rounded-3xl bg-white p-5 shadow-sm md:p-6 ${className}`}>
    {titulo && <h2 className="mb-3 !text-lg font-bold text-hiper-navy">{titulo}</h2>}
    <div className="space-y-2 text-sm leading-6 text-gray-600">{children}</div>
  </div>
);

export default PaginaInformativa;
