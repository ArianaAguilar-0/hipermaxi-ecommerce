import { Link } from 'react-router-dom';
import { Store, HeartHandshake, ShoppingBasket, Truck } from 'lucide-react';
import PaginaInformativa, { Tarjeta } from '@/componentes/tienda/PaginaInformativa';

const COMPROMISOS = [
  { Icono: ShoppingBasket, titulo: 'Variedad para tu hogar', texto: 'Abarrotes, frescos, limpieza, cuidado personal y mucho más en un solo lugar.' },
  { Icono: HeartHandshake, titulo: 'Atención cercana', texto: 'Te ayudamos antes, durante y después de tu compra.' },
  { Icono: Truck, titulo: 'Compra a tu manera', texto: 'Recibe tu pedido en casa o recógelo en la sucursal que prefieras.' },
];

// Quiénes somos: descripción general del supermercado
export const QuienesSomos = () => (
  <PaginaInformativa titulo="Quiénes somos" subtitulo="Tu supermercado, ahora también en línea" Icono={Store}>
    <Tarjeta>
      <p>
        Somos un supermercado pensado para las familias: reunimos los productos de todos los días para que hacer
        las compras sea simple, rápido y cómodo.
      </p>
      <p>
        Con nuestra tienda en línea puedes elegir tus productos, pagar de forma segura y decidir cómo recibir
        tu pedido, sin salir de casa.
      </p>
    </Tarjeta>

    <div className="grid gap-4 sm:grid-cols-3">
      {COMPROMISOS.map(({ Icono, titulo, texto }) => (
        <div key={titulo} className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-hiper-orange-light text-hiper-orange">
            <Icono size={20} />
          </div>
          <h2 className="mt-3 !text-base font-bold text-hiper-navy">{titulo}</h2>
          <p className="mt-1 text-sm text-gray-600">{texto}</p>
        </div>
      ))}
    </div>

    <Tarjeta titulo="Nuestro compromiso">
      <p>
        Trabajamos para ofrecerte precios claros, productos en buen estado y un servicio amable. Si algo no sale
        como esperabas, queremos saberlo: <Link to="/contacto" className="font-semibold text-hiper-orange hover:underline">escríbenos</Link>.
      </p>
    </Tarjeta>
  </PaginaInformativa>
);

export default QuienesSomos;
