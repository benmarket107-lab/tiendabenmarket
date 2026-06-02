'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, SearchX, Trash2, ShoppingCart } from 'lucide-react';
import { useFavorites } from '../../../context/FavoritesContext';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useAppContext } from '../../../context/AppContext';
import { formatCurrency } from '../../../utils/currency';

export default function FavoritesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { addToCart } = useCart();
  const { getProductById } = useAppContext();
  const { favorites, removeFavorite } = useFavorites();
  const [resolved, setResolved] = useState({});

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const next = {};
      for (const f of favorites) {
        try {
          const fresh = await getProductById(f.id);
          if (fresh) next[f.id] = fresh;
        } catch (e) {
        }
      }
      if (!cancelled) setResolved(next);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [favorites, getProductById]);

  useEffect(() => {
    if (!user) {
      router.replace('/login?redirect=/favorites');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="w-full bg-surface min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 mb-20 md:mb-0">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h1 className="font-headline text-3xl sm:text-5xl font-black text-on-surface tracking-tight">Mis Favoritos</h1>
            <p className="text-on-surface-variant text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Guardá los productos que te gustan para encontrarlos rápido la próxima vez.
            </p>
          </div>
          <Link
            href="/"
            className="hidden sm:inline-flex bg-primary text-on-primary px-5 py-3 rounded-xl font-bold hover:bg-primary-container transition-colors"
          >
            Seguir comprando
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm p-10 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary mb-4">
              <SearchX className="w-8 h-8" />
            </div>
            <p className="font-headline text-xl font-black text-on-surface">Todavía no tenés favoritos</p>
            <p className="text-on-surface-variant text-sm mt-2 max-w-md mx-auto">
              Tocá el corazón en cualquier producto para guardarlo acá.
            </p>
            <Link
              href="/"
              className="inline-flex mt-6 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:bg-primary-container transition-colors"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10">
            {favorites.map((fav) => {
              const product = resolved[fav.id] || fav;
              return (
                <div
                  key={fav.id}
                  className="group bg-surface-container-low rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 transition-all duration-300 hover:bg-surface-container-high hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full cursor-pointer border border-outline-variant/20"
                  onClick={() => router.push(`/product/${fav.id}`)}
                >
                  <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-5 bg-white shadow-sm">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain p-3 sm:p-5 transition-transform duration-700 group-hover:scale-110 mix-blend-multiply"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(fav.id);
                      }}
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 h-8 w-8 sm:h-10 sm:w-10 bg-white/85 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 shadow-sm active:scale-90 transition-all z-10"
                      aria-label="Quitar de favoritos"
                      title="Quitar de favoritos"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 h-8 w-8 sm:h-10 sm:w-10 bg-white/85 backdrop-blur-md rounded-full flex items-center justify-center text-primary shadow-sm">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                    </div>
                  </div>

                  <div className="flex flex-col flex-grow px-0.5 sm:px-1">
                    <p className="text-[9px] sm:text-xs text-primary font-bold mb-1 sm:mb-1.5 uppercase tracking-widest">
                      {product.category || ''}
                    </p>
                    <h3 className="text-sm sm:text-lg font-bold text-on-surface leading-tight sm:leading-snug mb-2 sm:mb-3 font-headline line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>

                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-outline-variant/20">
                      <span className="text-base sm:text-xl font-black text-on-surface tracking-tight">
                        {formatCurrency(Number(product.price) || 0)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 bg-primary text-on-primary hover:bg-primary-container hover:shadow-lg hover:shadow-primary/30"
                        aria-label="Agregar al carrito"
                        title="Agregar al carrito"
                      >
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="sm:hidden mt-8">
          <Link
            href="/"
            className="w-full inline-flex justify-center bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:bg-primary-container transition-colors"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
