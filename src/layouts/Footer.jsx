import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa6';
import { DATOS_CONTACTO } from '../lib/datosContacto';

// Páginas informativas de la tienda
const SOBRE_NOSOTROS = [
  { to: '/quienes-somos', texto: 'Quiénes somos' },
  { to: '/sucursales', texto: 'Sucursales' },
  { to: '/preguntas-frecuentes', texto: 'Preguntas frecuentes' },
  { to: '/terminos', texto: 'Términos y condiciones' },
  { to: '/contacto', texto: 'Contacto' },
];

// Simulación: cada ícono abre la página principal de la red (sin login ni SDK)
const REDES = [
  { nombre: 'Facebook', url: 'https://www.facebook.com', Icono: FaFacebookF },
  { nombre: 'Instagram', url: 'https://www.instagram.com', Icono: FaInstagram },
  { nombre: 'YouTube', url: 'https://www.youtube.com', Icono: FaYoutube },
  { nombre: 'TikTok', url: 'https://www.tiktok.com', Icono: FaTiktok },
];

// Pie de página: sobre nosotros, contacto, redes sociales y copyright
export function Footer() {
  return (
    <footer className="mt-16 bg-hiper-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="!text-base font-bold uppercase tracking-wide text-hiper-orange">Sobre nosotros</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {SOBRE_NOSOTROS.map(({ to, texto }) => (
              <li key={to}>
                <Link to={to} className="transition hover:text-white hover:underline">{texto}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="!text-base font-bold uppercase tracking-wide text-hiper-orange">Contacto</h3>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li className="flex items-center gap-2"><Phone size={16} className="shrink-0" /> {DATOS_CONTACTO.telefono}</li>
            <li className="flex items-center gap-2"><Mail size={16} className="shrink-0" /> {DATOS_CONTACTO.correo}</li>
            <li className="flex items-center gap-2"><Clock size={16} className="shrink-0" /> {DATOS_CONTACTO.horario}</li>
            <li className="flex items-center gap-2"><MapPin size={16} className="shrink-0" /> {DATOS_CONTACTO.ubicacion}</li>
          </ul>
        </div>

        <div>
          <h3 className="!text-base font-bold uppercase tracking-wide text-hiper-orange">Síguenos</h3>
          <div className="mt-4 flex gap-3">
            {REDES.map(({ nombre, url, Icono }) => (
              <a
                key={nombre}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={nombre}
                title={nombre}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-hiper-orange"
              >
                <Icono size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-white/60">
          &copy; {new Date().getFullYear()} Hipermaxi · Prototipo académico UCATEC. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
