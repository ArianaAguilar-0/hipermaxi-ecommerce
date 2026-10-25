import "@fortawesome/fontawesome-free/css/all.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
        {/* Notificaciones de toda la app */}
        <Toaster position="top-center" toastOptions={{ style: { borderRadius: '14px', fontSize: '14px' } }} />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
