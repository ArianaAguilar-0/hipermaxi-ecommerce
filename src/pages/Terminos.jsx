import { FileText } from 'lucide-react';
import PaginaInformativa, { Tarjeta } from '@/componentes/tienda/PaginaInformativa';
import { DATOS_CONTACTO, enlaceCorreo } from '@/lib/datosContacto';

// Términos y condiciones: texto general (prototipo académico, no es un documento legal)
export const Terminos = () => (
  <PaginaInformativa titulo="Términos y condiciones" subtitulo="Condiciones generales de uso de la tienda en línea" Icono={FileText}>
    <Tarjeta titulo="Precios">
      <p>Los precios se muestran en bolivianos (Bs) e incluyen impuestos. Pueden cambiar sin previo aviso; el precio válido es el que ves al confirmar la compra.</p>
    </Tarjeta>
    <Tarjeta titulo="Disponibilidad">
      <p>Los productos están sujetos al stock disponible. Antes de confirmar la compra se vuelve a revisar el stock; si un producto se agota, te avisaremos para que ajustes tu carrito.</p>
    </Tarjeta>
    <Tarjeta titulo="Entregas">
      <p>Puedes recoger tu pedido en la sucursal elegida o recibirlo en la dirección que indiques. Revisa que la dirección y el teléfono sean correctos para evitar demoras.</p>
    </Tarjeta>
    <Tarjeta titulo="Privacidad de datos">
      <p>Usamos tus datos (nombre, NIT/CI, correo, teléfono y dirección) solo para procesar tu compra, emitir tu factura y coordinar la entrega. No compartimos tus datos con terceros con fines comerciales.</p>
      <p>Los datos de tu tarjeta solo se validan en el formulario y no se guardan.</p>
    </Tarjeta>
    <Tarjeta titulo="Contacto">
      <p>
        Para consultas sobre estas condiciones o tus datos: <a href={enlaceCorreo} className="break-all font-semibold text-hiper-orange hover:underline">{DATOS_CONTACTO.correo}</a> ·{' '}
        <a href={DATOS_CONTACTO.telefonoEnlace} className="font-semibold text-hiper-orange hover:underline">{DATOS_CONTACTO.telefono}</a> · {DATOS_CONTACTO.ubicacion}.
      </p>
    </Tarjeta>
    <p className="px-2 text-xs text-gray-400">Texto general de un prototipo académico; no constituye un documento legal.</p>
  </PaginaInformativa>
);

export default Terminos;
