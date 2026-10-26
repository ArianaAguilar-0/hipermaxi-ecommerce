import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NotFound from '../pages/NotFound';
import MainLayout from '../layouts/MainLayout';
import Login from '../componentes/LoginForm';
import ProductDetail from '../pages/ProductDetail';
import Inicio from '../pages/Inicio';
import Tienda from '../pages/Tienda';
import AdminProductos from '../pages/AdminProductos';
import RutaAdmin from './RutaAdmin';
import Checkout from '../pages/Checkout';
import CompraExitosa from '../pages/CompraExitosa';

// Todas las rutas de la aplicación
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />} >
          <Route path='/login' element={<Login />} />
          <Route index element={<Inicio />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/compra-exitosa" element={<CompraExitosa />} />
          {/* Panel de administrador: solo rol admin */}
          <Route path="/admin/productos" element={<RutaAdmin><AdminProductos /></RutaAdmin>} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
