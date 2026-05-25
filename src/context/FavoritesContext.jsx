import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

const buildStorageKey = (userId) => {
  return userId ? `bm_favorites_${userId}` : 'bm_favorites_guest';
};

const safeParse = (raw, fallback) => {
  try {
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
};

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const storageKey = useMemo(() => buildStorageKey(user?.id || null), [user?.id]);

  const [itemsById, setItemsById] = useState({});

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? safeParse(raw, null) : null;
    if (parsed && typeof parsed === 'object') {
      setItemsById(parsed);
    } else {
      setItemsById({});
    }
  }, [storageKey]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== storageKey) return;
      const next = e.newValue ? safeParse(e.newValue, {}) : {};
      setItemsById(next && typeof next === 'object' ? next : {});
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey]);

  const persist = (next) => {
    setItemsById(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const isFavorite = (productId) => {
    if (!productId) return false;
    return Boolean(itemsById[productId]);
  };

  const toggleFavorite = (product) => {
    if (!product?.id) return;
    const id = String(product.id);
    const next = { ...itemsById };
    if (next[id]) {
      delete next[id];
    } else {
      next[id] = {
        id,
        name: product.name || '',
        price: product.price || 0,
        image: product.image || '',
        category: product.category || ''
      };
    }
    persist(next);
  };

  const removeFavorite = (productId) => {
    const id = String(productId);
    if (!itemsById[id]) return;
    const next = { ...itemsById };
    delete next[id];
    persist(next);
  };

  const favorites = useMemo(() => {
    return Object.values(itemsById);
  }, [itemsById]);

  const count = favorites.length;

  return (
    <FavoritesContext.Provider value={{ favorites, count, isFavorite, toggleFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return ctx;
}

