import '../index.css';
import Providers from './providers';
import Script from 'next/script';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.benmarket.com.py'),
  title: {
    default: 'Benmarket Express | Supermercado Online en Ciudad del Este',
    template: '%s | Benmarket Express',
  },
  description: 'Hacé tus compras online en BenMarket Express. Calidad, rapidez y los mejores precios directo a tu casa en Ciudad del Este.',
  openGraph: {
    title: 'Benmarket Express - Tu Supermercado Online',
    description: 'Hacé tus compras online con entrega rápida. Calidad y variedad en Ciudad del Este.',
    type: 'website',
    locale: 'es_PY',
    siteName: 'Benmarket Express',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=3" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-surface font-body text-on-surface">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Z9S2PHP0ES"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Z9S2PHP0ES');
          `}
        </Script>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
