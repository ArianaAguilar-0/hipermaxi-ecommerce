import SliderModulo from 'react-slick';
import { Link } from 'react-router-dom';
import { Truck, Store, Percent } from 'lucide-react';

// react-slick es CommonJS: según cómo lo empaquete Vite, el componente viene en .default
const Slider = SliderModulo.default ?? SliderModulo;

// Banners genéricos (sin imágenes externas): degradado + ícono
const BANNERS = [
  {
    titulo: 'Tu súper, a un clic',
    texto: 'Productos con precios actualizados al instante.',
    boton: 'Ver productos',
    Icono: Percent,
    fondo: 'from-hiper-orange to-hiper-orange-dark',
  },
  {
    titulo: 'Envío a domicilio',
    texto: 'Recibe tu pedido en casa, sin filas ni esperas.',
    boton: 'Comprar ahora',
    Icono: Truck,
    fondo: 'from-hiper-navy to-hiper-navy-dark',
  },
  {
    titulo: 'Recoge en tienda',
    texto: 'Compra en línea y pasa por tu sucursal más cercana.',
    boton: 'Empezar',
    Icono: Store,
    fondo: 'from-hiper-navy via-hiper-navy-dark to-hiper-orange',
  },
];

const configuracion = {
  dots: true,
  arrows: false,
  infinite: true,
  autoplay: true,
  autoplaySpeed: 5000,
  speed: 600,
  slidesToShow: 1,
  slidesToScroll: 1,
  dotsClass: 'slick-dots custom-dots',
  customPaging: () => <button type="button" className="custom-dot" aria-label="Ir al banner" />,
};

// Carrusel de banners del inicio (react-slick)
export const BannerCarrusel = () => (
  <div className="pb-6">
    <Slider {...configuracion}>
      {BANNERS.map(({ titulo, texto, boton, Icono, fondo }) => (
        <div key={titulo}>
          <div className={`relative flex h-44 items-center overflow-hidden rounded-3xl bg-gradient-to-br px-6 text-white sm:h-64 sm:px-12 ${fondo}`}>
            <div className="relative z-10 max-w-md">
              <h2 className="!text-2xl font-extrabold sm:!text-4xl">{titulo}</h2>
              <p className="mt-2 text-sm text-white/85 sm:text-base">{texto}</p>
              <Link
                to="/tienda"
                className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-hiper-navy shadow transition hover:scale-105"
              >
                {boton}
              </Link>
            </div>
            <Icono className="absolute -right-6 bottom-0 h-40 w-40 text-white/15 sm:right-10 sm:h-56 sm:w-56" strokeWidth={1.2} />
          </div>
        </div>
      ))}
    </Slider>
  </div>
);

export default BannerCarrusel;
