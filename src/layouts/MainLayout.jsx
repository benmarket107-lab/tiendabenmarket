import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BottomNavigation from '../components/BottomNavigation';
import logoImg from '../images/logo.png';
import { Instagram, Facebook, Phone } from 'lucide-react'; // Phone es la mejor alternativa nativa para Whatsapp en lucide

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface font-body text-on-surface">
      <Navbar />
      <main className="flex-1 mt-24 sm:mt-28 pb-20 md:pb-0">
        <Outlet />
      </main>
        <footer className="bg-black py-6 sm:py-8 px-6 md:px-12 border-t border-white/10 text-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-8 text-center sm:text-left">
          <div className="col-span-1 sm:col-span-2 md:col-span-1 flex flex-col items-center sm:items-start">
            <img 
              src={logoImg} 
              alt="Logo Benmarket" 
              className="h-12 w-auto object-contain object-center sm:object-left mb-3 sm:mb-3"
            />
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-medium mb-4 max-w-[280px] sm:max-w-none">Av. Julio Cesar Riquelme, km 7 Barrio Ciudad Nueva, Ciudad del Este 7000</p>
            <div className="flex gap-5 sm:gap-4 justify-center sm:justify-start">
              <a href="https://www.instagram.com/benmarket24/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/70 hover:text-primary hover:scale-110 transition-all p-2 sm:p-0">
                <Instagram className="w-6 h-6 sm:w-5 sm:h-5" />
              </a>
              <a href="https://www.facebook.com/benmarket24" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white/70 hover:text-primary hover:scale-110 transition-all p-2 sm:p-0">
                <Facebook className="w-6 h-6 sm:w-5 sm:h-5" />
              </a>
              <a href="#" aria-label="WhatsApp" className="text-white/70 hover:text-primary hover:scale-110 transition-all p-2 sm:p-0">
                <Phone className="w-6 h-6 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>
          <div className="pt-4 sm:pt-0 border-t border-white/10 sm:border-0">
            <p className="font-bold mb-4 sm:mb-4 text-xs uppercase tracking-widest text-white">Nosotros</p>
            <ul className="space-y-3 sm:space-y-2 text-sm text-white/70 font-medium">
              <li><Link className="hover:text-primary transition-colors block py-1 sm:py-0" to="/about">Nuestra Historia</Link></li>
              <li><Link className="hover:text-primary transition-colors block py-1 sm:py-0" to="/jobs">Trabaja con nosotros</Link></li>
            </ul>
          </div>
          <div className="pt-4 sm:pt-0 border-t border-white/10 sm:border-0">
            <p className="font-bold mb-4 sm:mb-4 text-xs uppercase tracking-widest text-white">Ayuda</p>
            <ul className="space-y-3 sm:space-y-2 text-sm text-white/70 font-medium">
              <li><Link className="hover:text-primary transition-colors block py-1 sm:py-0" to="/shipping">Envíos y Entregas</Link></li>
              <li><Link className="hover:text-primary transition-colors block py-1 sm:py-0" to="/faq">Preguntas Frecuentes</Link></li>
              <li><Link className="hover:text-primary transition-colors block py-1 sm:py-0" to="/contact">Contacto</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 sm:mt-8 pt-6 sm:pt-5 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-white/50 font-bold gap-4 sm:gap-0">
          <span className="text-center md:text-left">© {new Date().getFullYear()} Benmarket - Tu Mercado de Confianza</span>
          <div className="flex gap-6 sm:gap-8 flex-wrap justify-center">
            <a href="#" className="hover:text-primary transition-colors">Política de Privacidad</a>
            <a href="#" className="hover:text-primary transition-colors">Términos y Condiciones</a>
          </div>
        </div>
      </footer>
      <BottomNavigation />
    </div>
  );
}