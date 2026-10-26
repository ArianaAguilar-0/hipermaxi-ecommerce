import { useState } from 'react';
import { Phone, Mail, Clock, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import PaginaInformativa, { Tarjeta } from '@/componentes/tienda/PaginaInformativa';
import CampoTexto from '@/componentes/checkout/CampoTexto';
import { DATOS_CONTACTO } from '@/lib/datosContacto';

const vacio = { nombre: '', correo: '', mensaje: '' };

// Contacto: datos de ejemplo y un formulario que NO envía nada (solo muestra un toast)
export const Contacto = () => {
  const [form, setForm] = useState(vacio);
  const [errores, setErrores] = useState({});
  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const enviar = (e) => {
    e.preventDefault();
    const errs = {};
    if (form.nombre.trim().length < 2) errs.nombre = 'Ingresa tu nombre';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.correo.trim())) errs.correo = 'Correo inválido';
    if (form.mensaje.trim().length < 5) errs.mensaje = 'Escribe tu mensaje';
    setErrores(errs);
    if (Object.keys(errs).length) return;
    toast.success('Mensaje enviado');
    setForm(vacio);
  };

  return (
    <PaginaInformativa titulo="Contacto" subtitulo="Estamos para ayudarte" Icono={MessageSquare}>
      <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
        <Tarjeta titulo="Atención al cliente">
          <p className="flex items-center gap-2"><Phone size={16} className="shrink-0 text-hiper-orange" /> {DATOS_CONTACTO.telefono}</p>
          <p className="flex items-center gap-2"><Mail size={16} className="shrink-0 text-hiper-orange" /> {DATOS_CONTACTO.correo}</p>
          <p className="flex items-center gap-2"><Clock size={16} className="shrink-0 text-hiper-orange" /> {DATOS_CONTACTO.horario}</p>
        </Tarjeta>

        <Tarjeta titulo="Escríbenos">
          <form onSubmit={enviar} className="space-y-4" noValidate>
            <CampoTexto id="contacto-nombre" label="Nombre" value={form.nombre} onChange={set('nombre')} error={errores.nombre} autoComplete="name" />
            <CampoTexto id="contacto-correo" label="Correo electrónico" type="email" value={form.correo} onChange={set('correo')} error={errores.correo} autoComplete="email" />
            <div>
              <label htmlFor="contacto-mensaje" className="mb-1.5 block text-sm font-medium text-gray-700">Mensaje</label>
              <textarea id="contacto-mensaje" rows={4} value={form.mensaje} onChange={set('mensaje')}
                className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-hiper-orange focus:ring-3 focus:ring-hiper-orange/20" />
              {errores.mensaje && <p className="mt-1 text-xs font-medium text-red-600">{errores.mensaje}</p>}
            </div>
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-hiper-orange py-3 text-sm font-bold text-white transition hover:bg-hiper-orange-dark">
              <Send size={16} /> Enviar mensaje
            </button>
          </form>
        </Tarjeta>
      </div>
    </PaginaInformativa>
  );
};

export default Contacto;
