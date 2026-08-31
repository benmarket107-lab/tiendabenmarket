import Navbar from '../../components/Navbar';
import BottomNavigation from '../../components/BottomNavigation';
import { Instagram, Facebook, Phone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ClientLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface font-body text-on-surface">
      <Navbar />
      <main className="flex-1 mt-20 sm:mt-28 pb-20 md:pb-0">
        {children}
      </main>
      <footer className="bg-[rgb(47,47,47)] pt-6 sm:pt-8 pb-24 sm:pb-8 px-6 md:px-12 border-t border-white/10 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-8 text-center sm:text-left">
          <div className="col-span-1 sm:col-span-2 md:col-span-1 flex flex-col items-center sm:items-start">
            {/* Logo principal + logos del grupo */}
            <div className="flex items-center gap-0 mb-3">
              <Image 
                src="/logo.webp" 
                alt="Logo Benmarket" 
                width={130}
                height={36}
                className="h-9 w-auto object-contain object-center sm:object-left"
              />

              {/* Separador */}
              <div className="w-px h-8 bg-white/20 mx-3 shrink-0" />

              {/* Logos marcas hermanas */}
              <div className="flex items-center gap-3">
                {/* Benmarket Garage */}
                <a
                  href="#"
                  title="Benmarket Garage"
                  className="group relative flex items-center justify-center rounded-2xl transition-all duration-200 opacity-75 hover:opacity-100 hover:scale-110"
                >
                  <Image
                    src="/logogarage.webp"
                    alt="Benmarket Garage"
                    width={120}
                    height={120}
                    quality={100}
                    className="h-10 w-auto object-contain rounded-xl"
                  />
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] font-semibold whitespace-nowrap px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                    Garage
                  </span>
                </a>

                {/* Separador entre Garage y e-ben */}
                <div className="w-px h-8 bg-white/20 shrink-0" />

                {/* e-ben marketplace */}
                <a
                  href="/eben"
                  title="e-ben marketplace"
                  className="group relative flex flex-col items-center justify-center rounded-2xl transition-all duration-200 opacity-75 hover:opacity-100 hover:scale-110"
                >
                  <Image
                    src="/logo-eben-nobg.png"
                    alt="e-ben marketplace"
                    width={120}
                    height={120}
                    quality={100}
                    className="h-9 w-auto object-contain neon-flash-img"
                  />
                  <span className="proximamente-flash text-[8px] font-bold tracking-widest uppercase text-teal-300 leading-none -mt-3">
                    Próximamente
                  </span>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] font-semibold whitespace-nowrap px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                    e-ben
                  </span>
                </a>
              </div>
            </div>

            <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-medium mb-4 max-w-[280px] sm:max-w-none">Av. Julio Cesar Riquelme, km 7 Barrio Ciudad Nueva, Ciudad del Este 7000</p>
            <div className="flex gap-5 sm:gap-4 justify-center sm:justify-start">
              <a href="https://www.instagram.com/benmarket24/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/70 hover:text-primary hover:scale-110 transition-all p-2 sm:p-0">
                <Instagram className="w-6 h-6 sm:w-5 sm:h-5" />
              </a>
              <a href="https://www.facebook.com/benmarket24" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white/70 hover:text-primary hover:scale-110 transition-all p-2 sm:p-0">
                <Facebook className="w-6 h-6 sm:w-5 sm:h-5" />
              </a>
              <a href="https://wa.me/595981309030" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-white/70 hover:text-primary hover:scale-110 transition-all p-2 sm:p-0">
                <Phone className="w-6 h-6 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>
          <div className="pt-4 sm:pt-0 border-t border-white/10 sm:border-0">
            <p className="font-bold mb-4 sm:mb-4 text-xs uppercase tracking-widest text-white">Nosotros</p>
            <ul className="space-y-3 sm:space-y-2 text-sm text-white/70 font-medium">
              <li><Link className="hover:text-primary transition-colors block py-1 sm:py-0" href="/about">Nuestra Historia</Link></li>
              <li className="hidden"><Link className="hover:text-primary transition-colors block py-1 sm:py-0" href="/jobs">Trabaja con nosotros</Link></li>
            </ul>
          </div>
          <div className="pt-4 sm:pt-0 border-t border-white/10 sm:border-0">
            <p className="font-bold mb-4 sm:mb-4 text-xs uppercase tracking-widest text-white">Ayuda</p>
            <ul className="space-y-3 sm:space-y-2 text-sm text-white/70 font-medium">
              <li className="hidden"><Link className="hover:text-primary transition-colors block py-1 sm:py-0" href="/shipping">Envíos y Entregas</Link></li>
              <li className="hidden"><Link className="hover:text-primary transition-colors block py-1 sm:py-0" href="/faq">Preguntas Frecuentes</Link></li>
              <li><Link className="hover:text-primary transition-colors block py-1 sm:py-0" href="/contact">Contacto</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 sm:mt-8 pt-6 sm:pt-5 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-white/50 font-bold gap-4 sm:gap-0">
          <span className="text-center md:text-left">© {new Date().getFullYear()} Benmarket - Derechos Reservados. | Desarrollado por <a href="https://nexabyte-portafolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">Nexabyte</a></span>
          <div className="flex gap-6 sm:gap-8 flex-wrap justify-center">
            <Link href="/privacidad" className="hover:text-primary transition-colors">Política de Privacidad</Link>
            <Link href="/terminos" className="hover:text-primary transition-colors">Términos y Condiciones</Link>
          </div>
        </div>
      </footer>
      <BottomNavigation />
    </div>
  );
}
