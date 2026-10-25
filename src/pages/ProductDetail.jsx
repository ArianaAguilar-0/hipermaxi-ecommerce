import { useParams, useNavigate } from "react-router-dom";
import EmptyState from "../shimer/pulse/EmptyState";

// Detalle de producto: se conecta a GET /products/{id} en la Fase 1
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-3xl">
      <EmptyState
        message={`El detalle del producto ${id} se cargará desde Dolibarr en la Fase 1.`}
        onAction={() => navigate('/')}
        actionLabel="Volver a la tienda"
      />
    </section>
  );
};

export default ProductDetail;
