import { Phone, Mail, MapPin } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa6';

// Enlaces de ejemplo (no llevan a páginas reales)
const SOBRE_NOSOTROS = ['Quiénes somos', 'Nuestras sucursales', 'Trabaja con nosotros', 'Términos y condiciones'];

const REDES = [
  { nombre: 'Facebook', Icono: FaFacebookF },
  { nombre: 'Instagram', Icono: FaInstagram },
  { nombre: 'YouTube', Icono: FaYoutube },
  { nombre: 'TikTok', Icono: FaTiktok },
];

// Pie de página: sobre nosotros, contacto, redes sociales y copyright
export function Footer() {
  return (
    <footer className="mt-16 bg-hiper-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="!text-base font-bold uppercase tracking-wide text-hiper-orange">Sobre nosotros</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {SOBRE_NOSOTROS.map((t) => (
              <li key={t}>
                <a href="#" className="transition hover:text-white hover:underline">{t}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="!text-base font-bold uppercase tracking-wide text-hiper-orange">Contacto</h3>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li className="flex items-center gap-2"><Phone size={16} /> +591 3 000 0000 (ejemplo)</li>
            <li className="flex items-center gap-2"><Mail size={16} /> contacto@ejemplo.com</li>
            <li className="flex items-center gap-2"><MapPin size={16} /> Santa Cruz de la Sierra, Bolivia</li>
          </ul>
        </div>

        <div>
          <h3 className="!text-base font-bold uppercase tracking-wide text-hiper-orange">Síguenos</h3>
          <div className="mt-4 flex gap-3">
            {REDES.map(({ nombre, Icono }) => (
              <a
                key={nombre}
                href="#"
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
