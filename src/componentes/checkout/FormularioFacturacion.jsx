import CampoTexto from './CampoTexto';

// Datos de facturación: se guardan como tercero (cliente) en Dolibarr
export const FormularioFacturacion = ({ valores, errores, onChange, deshabilitado }) => {
  const set = (campo) => (e) => onChange({ ...valores, [campo]: e.target.value });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CampoTexto id="fac-nombre" label="Nombre o razón social" value={valores.nombre} onChange={set('nombre')}
        error={errores.nombre} disabled={deshabilitado} autoComplete="name" className="sm:col-span-2" />
      <CampoTexto id="fac-nit" label="NIT / CI" value={valores.nit} onChange={set('nit')}
        error={errores.nit} disabled={deshabilitado} inputMode="numeric" placeholder="1234567" />
      <CampoTexto id="fac-telefono" label="Teléfono" value={valores.telefono} onChange={set('telefono')}
        error={errores.telefono} disabled={deshabilitado} type="tel" autoComplete="tel" placeholder="70000000" />
      <CampoTexto id="fac-email" label="Correo electrónico" value={valores.email} onChange={set('email')}
        error={errores.email} disabled={deshabilitado} type="email" autoComplete="email" className="sm:col-span-2" />
      <CampoTexto id="fac-direccion" label="Dirección" value={valores.direccion} onChange={set('direccion')}
        error={errores.direccion} disabled={deshabilitado} autoComplete="street-address" className="sm:col-span-2" />
    </div>
  );
};

export default FormularioFacturacion;
