import { ChevronDown, HelpCircle } from 'lucide-react';
import PaginaInformativa, { Tarjeta } from '@/componentes/tienda/PaginaInformativa';
import { DATOS_CONTACTO, enlaceCorreo } from '@/lib/datosContacto';

const PREGUNTAS = [
  {
    pregunta: '¿Cómo compro en la tienda en línea?',
    respuesta: 'Busca tus productos o navega por categorías, presiona "Agregar" y abre el carrito. Cuando estés listo, presiona "Pagar", inicia sesión con tu cuenta, completa tus datos y elige el tipo de entrega y el método de pago.',
  },
  {
    pregunta: '¿Qué métodos de pago aceptan?',
    respuesta: 'Puedes pagar con QR o con tarjeta. Con QR verás el código y el monto a pagar; con tarjeta debes ingresar el número, el nombre, el vencimiento y el CVV. En este prototipo los pagos son simulados.',
  },
  {
    pregunta: '¿Qué tipos de entrega hay?',
    respuesta: 'Puedes recoger tu pedido gratis en la sucursal que elijas o pedir envío a domicilio. El costo del envío se muestra en el resumen antes de confirmar la compra.',
  },
  {
    pregunta: '¿Cómo descargo mi factura?',
    respuesta: 'Al terminar la compra verás la pantalla "¡Gracias por tu compra!" con el número de pedido y de factura. Ahí presiona "Descargar factura (PDF)".',
  },
  {
    pregunta: '¿Qué hago si un producto no tiene stock?',
    respuesta: 'Los productos sin stock muestran "Sin stock" y no se pueden agregar al carrito. Puedes volver más tarde o buscar un producto similar en la misma categoría. Si el stock cambia mientras compras, te avisaremos antes de confirmar.',
  },
];

// Preguntas frecuentes (acordeón con <details>, sin dependencias)
export const PreguntasFrecuentes = () => (
  <PaginaInformativa titulo="Preguntas frecuentes" subtitulo="Resolvemos tus dudas sobre la compra en línea" Icono={HelpCircle}>
    {PREGUNTAS.map(({ pregunta, respuesta }) => (
      <details key={pregunta} className="group rounded-3xl bg-white p-5 shadow-sm open:ring-2 open:ring-hiper-orange/30">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-hiper-navy">
          {pregunta}
          <ChevronDown size={18} className="shrink-0 text-hiper-orange transition group-open:rotate-180" />
        </summary>
        <p className="mt-3 text-sm leading-6 text-gray-600">{respuesta}</p>
      </details>
    ))}
    <Tarjeta titulo="¿Tienes otra duda?">
      <p>
        Llámanos al <a href={DATOS_CONTACTO.telefonoEnlace} className="font-semibold text-hiper-orange hover:underline">{DATOS_CONTACTO.telefono}</a> o
        escríbenos a <a href={enlaceCorreo} className="break-all font-semibold text-hiper-orange hover:underline">{DATOS_CONTACTO.correo}</a>.
        Atendemos {DATOS_CONTACTO.horario.charAt(0).toLowerCase() + DATOS_CONTACTO.horario.slice(1)}.
      </p>
    </Tarjeta>
  </PaginaInformativa>
);

export default PreguntasFrecuentes;
