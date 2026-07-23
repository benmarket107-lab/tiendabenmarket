import '../index.css';
import Providers from './providers';

export const metadata = {
  title: 'Benmarket Express',
  description: 'Hacé tus compras online en BenMarket Express. Calidad, rapidez y los mejores precios directo a tu casa en Ciudad del Este.',
  openGraph: {
    title: 'Benmarket Express - Tu Supermercado Online',
    description: 'Hacé tus compras online con entrega rápida. Calidad y variedad en Ciudad del Este.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" 
          rel="stylesheet" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-surface font-body text-on-surface">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
