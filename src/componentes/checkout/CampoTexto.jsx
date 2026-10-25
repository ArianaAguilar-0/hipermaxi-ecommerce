import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Campo de formulario (shadcn Input + Label) con mensaje de error
export const CampoTexto = ({ id, label, error, className = '', ...props }) => (
  <div className={className}>
    <Label htmlFor={id} className="mb-1.5 text-gray-700">{label}</Label>
    <Input
      id={id}
      aria-invalid={Boolean(error) || undefined}
      className="h-10 rounded-xl bg-white px-3 focus-visible:border-hiper-orange focus-visible:ring-hiper-orange/20"
      {...props}
    />
    {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
  </div>
);

export default CampoTexto;
