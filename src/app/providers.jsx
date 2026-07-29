'use client';

import { useEffect } from 'react';
import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { CartProvider } from '../context/CartContext';

export default function Providers({ children }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('PWA Service Worker registrado con éxito:', registration.scope);
        } catch (error) {
          console.warn('Service Worker no disponible:', error?.message || error);
        }
      };
      
      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
        return () => window.removeEventListener('load', registerSW);
      }
    }
  }, []);

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
