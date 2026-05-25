import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import { ArrowLeft, ShoppingCart, Plus, Minus, Heart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById } = useAppContext();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;

    const run = async () => {
      try {
        const found = await getProductById(id);
        if (cancelled) return;
        if (found) {
          setProduct(found);
          setQuantity(1);
          setIsAdded(false);
        } else {
          setProduct(null);
        }
      } catch (e) {
        if (!cancelled) setProduct(null);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [id, getProductById]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Buscando producto...</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Botón volver */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-primary mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Volver
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        
        {/* Columna Izquierda: Imagen del producto */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100 flex items-center justify-center relative group min-h-[300px] sm:min-h-[500px]">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full max-w-md max-h-[400px] object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          />
          <button className="absolute top-6 right-6 h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm">
            <Heart className="w-6 h-6" />
          </button>
        </div>

        {/* Columna Derecha: Detalles del producto */}
        <div className="flex flex-col justify-center">
          <span className="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest mb-3 bg-primary/10 w-fit px-3 py-1 rounded-full">{product.category}</span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl font-black text-slate-900">{formatCurrency(product.price)}</span>
          </div>



          {/* Estado del stock */}
          <div className="mb-8">
            {product.stock > 5 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-bold border border-green-200">
                <ShieldCheck className="w-4 h-4" /> En Stock ({product.stock} disponibles)
              </span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-700 text-sm font-bold border border-yellow-200">
                <ShieldCheck className="w-4 h-4" /> ¡Últimas {product.stock} unidades!
              </span>
            )}
            {product.stock === 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-sm font-bold border border-red-200">
                Agotado
              </span>
            )}
          </div>

          {/* Controles de compra */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 w-full sm:w-36 h-14 shadow-sm">
              <button 
                onClick={decreaseQuantity}
                disabled={quantity <= 1 || product.stock === 0}
                className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="flex-1 text-center font-bold text-lg">{quantity}</span>
              <button 
                onClick={increaseQuantity}
                disabled={quantity >= product.stock || product.stock === 0}
                className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all ${
                product.stock === 0 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isAdded
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                    : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25 hover:-translate-y-1'
              }`}
            >
              <ShoppingCart className="w-6 h-6" /> 
              {product.stock === 0 ? 'Sin Stock' : isAdded ? '¡Agregado!' : 'Agregar al carrito'}
            </button>
          </div>

          {/* Beneficios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-t border-slate-200 mt-auto">
            <div className="flex items-center gap-4 text-slate-700">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <span className="block font-bold text-sm">Envíos a Ciudad del Este</span>
                <span className="text-xs text-slate-500">Llega seguro y rápido</span>
              </div>
            </div>
            </div>

        </div>
      </div>

      {/* Sticky Buy Bar for Mobile */}
      {showStickyBar && product.stock > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-slate-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] p-3.5 flex items-center justify-between gap-4 md:hidden animate-in slide-in-from-bottom duration-300 will-change-transform">
          <div className="flex items-center gap-2.5 min-w-0">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-12 h-12 object-contain rounded-lg border border-slate-100 bg-white p-1 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest line-clamp-1">{product.category}</p>
              <h4 className="font-bold text-sm text-slate-800 line-clamp-1 leading-tight">{product.name}</h4>
              <p className="font-extrabold text-base text-primary tracking-tight mt-0.5">{formatCurrency(product.price)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Controles de cantidad simplificados */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5 h-10 w-24">
              <button 
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-30"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="flex-1 text-center font-bold text-sm">{quantity}</span>
              <button 
                onClick={increaseQuantity}
                disabled={quantity >= product.stock}
                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {/* Botón comprar */}
            <button
              onClick={handleAddToCart}
              className={`h-10 px-4 rounded-xl flex items-center justify-center gap-1.5 font-bold text-sm transition-all ${
                isAdded
                  ? 'bg-green-500 text-white'
                  : 'bg-primary text-white active:scale-95 shadow-sm'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {isAdded ? '¡Listo!' : 'Agregar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
