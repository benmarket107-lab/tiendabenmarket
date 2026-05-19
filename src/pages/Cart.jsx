import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { useAppContext } from '../context/AppContext';
import { ArrowRight } from 'lucide-react';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { user } = useAuth();
  const { deliveryPrice } = useAppContext();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100 mt-10">
        <div className="bg-benmarket-50 p-6 rounded-full mb-6 text-benmarket-500">
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Tu carrito está vacío</h2>
        <p className="text-slate-500 mb-8 max-w-md text-center">Parece que aún no has añadido nada a tu carrito. ¡Explora nuestro catálogo y descubre ofertas increíbles!</p>
        <Link to="/" className="btn-primary flex items-center gap-2 text-lg px-6 py-3">
          Ir de compras <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-900">Carrito de Compras</h1>
        <button 
          onClick={clearCart}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
        >
          <Trash2 className="w-4 h-4" /> Vaciar Carrito
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="card p-4 flex flex-col sm:flex-row items-center gap-6 group hover:border-benmarket-200 transition-colors">
              <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden shrink-0 relative">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow text-center sm:text-left">
                <p className="text-xs font-semibold text-benmarket-600 mb-1">{item.category}</p>
                <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{item.name}</h3>
                <p className="text-slate-500 font-medium">{formatCurrency(item.price)} c/u</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-1 hover:bg-white rounded shadow-sm text-slate-600 disabled:opacity-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-slate-800">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  className="p-1 hover:bg-white rounded shadow-sm text-slate-600 disabled:opacity-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="text-right sm:min-w-[120px]">
                <p className="font-bold text-lg text-slate-900 mb-2">{formatCurrency(item.price * item.quantity)}</p>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium mx-auto sm:ml-auto sm:mr-0"
                  title="Eliminar producto"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24 bg-slate-50 border-benmarket-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-200">Resumen del pedido</h3>
            <div className="space-y-4 mb-6 text-slate-600 font-medium">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} items)</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Envío (CDE)</span>
                <span>{formatCurrency(deliveryPrice)}</span>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4 mb-8">
              <div className="flex flex-col mb-2">
                <span className="text-lg font-bold text-slate-900">Total a pagar</span>
                <span className="text-3xl font-black text-benmarket-600 text-right mt-2">{formatCurrency(total + deliveryPrice)}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-right">Impuestos incluidos</p>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full flex justify-center items-center gap-3 py-4 rounded-xl text-white text-lg font-bold shadow-lg transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
              </svg>
              Continuar con el pedido
            </button>
            <div className="mt-4 text-center">
              <Link to="/" className="text-sm font-medium text-slate-500 hover:text-benmarket-600 hover:underline">
                Continuar comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}