'use client';

import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { CartProvider } from '../context/CartContext';

export default function Providers({ children }) {
  return (
    <AppProvider>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </AppProvider>
  );
}
