import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NotFound from '../pages/NotFound';
import MainLayout from '../layouts/MainLayout';
import Login from '../componentes/LoginForm';
import ProductDetail from '../pages/ProductDetail';
import Inicio from '../pages/Inicio';
import Tienda from '../pages/Tienda';
import ProductosDolibarr from '../pages/ProductosDolibarr';
import Checkout from '../pages/Checkout';
import CompraExitosa from '../pages/CompraExitosa';

// Todas las rutas de la aplicación
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route element={<MainLayout />} >
          <Route index element={<Inicio />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/compra-exitosa" element={<CompraExitosa />} />
          {/* Panel de administrador (se protege por rol en la Fase 3) */}
          <Route path="/admin/productos" element={<ProductosDolibarr />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
