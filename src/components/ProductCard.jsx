import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import { Heart, Plus, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(product.id);

  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-surface-container-low rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 transition-all duration-300 hover:bg-surface-container-high hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full cursor-pointer border border-outline-variant/20"
    >
      <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-5 bg-white shadow-sm">
        <img 
          src={product.image} 
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain p-3 sm:p-5 transition-transform duration-700 group-hover:scale-110 mix-blend-multiply"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1.5 sm:gap-2 z-10">
          {product.stock <= 5 && product.stock > 0 && (
            <span className="bg-tertiary text-on-tertiary text-[9px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 backdrop-blur-md bg-tertiary/90">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white"></span>
              </span>
              ¡Solo {product.stock}!
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-surface-variant/90 backdrop-blur-md text-on-surface text-[9px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider shadow-sm">
              Agotado
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (!user) {
              navigate('/login?redirect=/favorites');
              return;
            }
            toggleFavorite(product);
          }}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 h-7 w-7 sm:h-9 sm:w-9 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-all z-10 ${
            fav ? 'text-red-500 hover:bg-red-50' : 'text-outline hover:text-primary hover:bg-white'
          }`}
          aria-label={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] transition-colors ${fav ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      <div className="flex flex-col flex-grow px-0.5 sm:px-1">
        <p className="text-[9px] sm:text-xs text-primary font-bold mb-1 sm:mb-1.5 uppercase tracking-widest">{product.category}</p>
        <h3 className="text-sm sm:text-lg font-bold text-on-surface leading-tight sm:leading-snug mb-2 sm:mb-3 font-headline line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
        
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-outline-variant/20">
          <div className="flex flex-col">
            <span className="text-base sm:text-xl font-black text-on-surface tracking-tight">{formatCurrency(product.price)}</span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            disabled={product.stock === 0}
            className={`h-8 w-8 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 ${
              product.stock === 0 
                ? 'bg-surface-variant text-outline cursor-not-allowed opacity-70'
                : 'bg-primary text-on-primary hover:bg-primary-container hover:shadow-lg hover:shadow-primary/30 group-hover:-translate-y-1'
            }`}
            aria-label="Agregar al carrito"
          >
            {product.stock === 0 ? <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" /> : <Plus className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />}
          </button>
        </div>
      </div>
    </div>
  );
}
