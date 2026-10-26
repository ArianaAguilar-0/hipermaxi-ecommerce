import { useState } from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import CampoTexto from '@/componentes/checkout/CampoTexto';

/**
 * Confirmación para eliminar un producto: hay que escribir su referencia
 * para habilitar "Eliminar definitivamente". `error` muestra el rechazo de Dolibarr.
 */
export const ConfirmarEliminarProducto = ({ producto, eliminando, error, onConfirmar, onCerrar }) => {
  const [texto, setTexto] = useState('');
  const coincide = texto.trim() === String(producto.ref);

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !eliminando && onCerrar()}>
      <DialogContent className="bg-white p-6 sm:max-w-md" showCloseButton={!eliminando}>
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle />
          </div>
          <DialogTitle className="text-center !text-lg font-bold text-hiper-navy">¿Eliminar este producto?</DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-600">
            <b className="text-gray-900">{producto.label}</b> (ref. <b className="font-mono text-gray-900">{producto.ref}</b>).
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <CampoTexto
          id="confirmar-ref"
          label={`Escribe la referencia "${producto.ref}" para confirmar`}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          autoComplete="off"
          disabled={eliminando}
        />

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>
        )}

        <DialogFooter className="gap-2 sm:justify-end">
          <button type="button" onClick={onCerrar} disabled={eliminando}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50">
            Cancelar
          </button>
          <button type="button" onClick={onConfirmar} disabled={!coincide || eliminando}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40">
            {eliminando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {eliminando ? 'Eliminando…' : 'Eliminar definitivamente'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmarEliminarProducto;
