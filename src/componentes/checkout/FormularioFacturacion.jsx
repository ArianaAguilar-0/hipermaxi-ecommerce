import CampoTexto from './CampoTexto';

// Datos de facturación: se guardan como tercero (cliente) en Dolibarr.
// `soloLectura`: cliente con sesión → sus datos vienen de su tercero y no se editan (pero se leen bien).
export const FormularioFacturacion = ({ valores, errores, onChange, deshabilitado, soloLectura = false }) => {
  const set = (campo) => (e) => onChange({ ...valores, [campo]: e.target.value });
  const comun = { disabled: deshabilitado, readOnly: soloLectura };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CampoTexto id="fac-nombre" label="Nombre o razón social" value={valores.nombre} onChange={set('nombre')}
        error={errores.nombre} autoComplete="name" className="sm:col-span-2" {...comun} />
      <CampoTexto id="fac-nit" label="NIT / CI" value={valores.nit} onChange={set('nit')}
        error={errores.nit} inputMode="numeric" placeholder="1234567" {...comun} />
      <CampoTexto id="fac-telefono" label="Teléfono" value={valores.telefono} onChange={set('telefono')}
        error={errores.telefono} type="tel" autoComplete="tel" placeholder="70000000" {...comun} />
      <CampoTexto id="fac-email" label="Correo electrónico" value={valores.email} onChange={set('email')}
        error={errores.email} type="email" autoComplete="email" className="sm:col-span-2" {...comun} />
      <CampoTexto id="fac-direccion" label="Dirección" value={valores.direccion} onChange={set('direccion')}
        error={errores.direccion} autoComplete="street-address" className="sm:col-span-2" {...comun} />
    </div>
  );
};

export default FormularioFacturacion;
