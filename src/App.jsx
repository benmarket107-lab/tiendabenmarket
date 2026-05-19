import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AppProvider } from './context/AppContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Confirm from './pages/Confirm';
import Bienvenida from './pages/Bienvenida';
import About from './pages/About';
import Jobs from './pages/Jobs';
import Shipping from './pages/Shipping';
import Faq from './pages/Faq';
import Contact from './pages/Contact';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import UsersManager from './pages/UsersManager';
import ProductsManager from './pages/ProductsManager';
import ThemeManager from './pages/ThemeManager';

// Cajero Pages
import SalesHistory from './pages/SalesHistory';
import DeliveryManager from './pages/DeliveryManager';
import BannersManager from './pages/BannersManager';

// Tesoreria Pages
import TesoreriaDashboard from './pages/TesoreriaDashboard';
import ValidarArqueos from './pages/ValidarArqueos';

// Componente para proteger rutas según rol
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

// Enrutador del Dashboard según rol
const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'Admin':
      return (
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/theme" element={<ThemeManager />} />
          <Route path="/delivery" element={<DeliveryManager />} />
          <Route path="/users" element={<UsersManager />} />
          <Route path="/products" element={<ProductsManager />} />
          <Route path="/banners" element={<BannersManager />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
    case 'Cajero':
      return (
        <Routes>
          <Route path="/" element={<SalesHistory />} />
          <Route path="/delivery" element={<DeliveryManager />} />
          <Route path="/products" element={<ProductsManager />} />
          <Route path="/banners" element={<BannersManager />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
    case 'Tesoreria':
      return (
        <Routes>
          <Route path="/" element={<TesoreriaDashboard />} />
          <Route path="/validations" element={<ValidarArqueos />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
    default:
      return <Navigate to="/" replace />;
  }
};

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Rutas Públicas / Cliente */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="cart" element={<Cart />} />
                <Route path="product/:id" element={<ProductDetails />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="about" element={<About />} />
                <Route path="jobs" element={<Jobs />} />
                <Route path="shipping" element={<Shipping />} />
                <Route path="faq" element={<Faq />} />
                <Route path="contact" element={<Contact />} />
              </Route>

              {/* Ruta de Login independiente */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/confirm" element={<Confirm />} />
              <Route path="/bienvenida" element={<Bienvenida />} />

              {/* Rutas Privadas / Staff */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route path="*" element={<DashboardRouter />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </AppProvider>
  );
}