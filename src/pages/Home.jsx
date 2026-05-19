import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import tiendaImg from '../images/tienda.jpg';
import bannerImg from '../images/banner.png';
import { 
  Search, ArrowRight, Sparkles, ShoppingBag, 
  Coffee, Carrot, Cookie, Milk, SearchX, 
  Mail, LayoutGrid, Leaf
} from 'lucide-react';

const getCategoryIcon = (cat) => {
  switch (cat) {
    case 'Todos': return <LayoutGrid size={20} />;
    case 'Comida': return <Carrot size={20} />;
    case 'Bebidas': return <Coffee size={20} />;
    case 'Snacks': return <Cookie size={20} />;
    case 'Lácteos': return <Milk size={20} />;
    case 'Limpieza': return <Sparkles size={20} />;
    case 'Despensa': return <ShoppingBag size={20} />;
    case 'Frescos': return <Leaf size={20} />;
    default: return <ShoppingBag size={20} />;
  }
};

export default function Home() {
  const { products, categories, globalSearchQuery, setGlobalSearchQuery, banners } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState('Productos Recomendados');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Volver a la primera página cuando cambie la categoría o la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, globalSearchQuery]);

  const activeBanners = banners.filter(b => b.active);
  const slides = activeBanners.length > 1 ? [...activeBanners, activeBanners[0]] : activeBanners;

  // Auto-play del slider
  useEffect(() => {
    if (!globalSearchQuery && activeBanners.length > 1) {
      const timer = setInterval(() => {
        setIsTransitioning(true);
        setCurrentSlide((prev) => prev + 1);
      }, 5000); // Cambia cada 5 segundos
      return () => clearInterval(timer);
    }
  }, [globalSearchQuery, activeBanners.length]);

  // Resetear al primer slide sin animación cuando llegamos al slide duplicado
  useEffect(() => {
    if (currentSlide === activeBanners.length && activeBanners.length > 1) {
      const jumpTimer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(0);
      }, 1000); // Duración de la transición (1s)
      return () => clearTimeout(jumpTimer);
    }
  }, [currentSlide, activeBanners.length]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Cuando cambia la búsqueda global, scrolleamos hacia abajo suavemente
  useEffect(() => {
    if (globalSearchQuery?.length === 1 && gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [globalSearchQuery]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Productos Recomendados' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(globalSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const ITEMS_PER_PAGE = 24;
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full bg-surface">
      {/* Hero Section / Banner Slider */}
      {activeBanners.length > 0 && (
        <section className="mb-8 sm:mb-16 pt-0 relative">
          <div className="relative h-[220px] sm:h-[380px] md:h-[500px] lg:h-[600px] w-full mx-auto overflow-hidden bg-surface-container-lowest shadow-sm">
            {/* Slider Container */}
            <div 
              className={`flex w-full h-full ${isTransitioning ? 'transition-transform duration-1000 ease-in-out' : 'transition-none'}`}
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((banner, index) => (
                <div key={`${banner.id}-${index}`} className="w-full h-full shrink-0 relative">
                  <img 
                    src={banner.image}
                    alt={banner.name || `Banner ${index + 1}`} 
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                  {/* Overlay oscuro opcional para que se vean mejor los indicadores, pero sin texto */}
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
              ))}
            </div>

            {/* Dots Indicators */}
            {activeBanners.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {activeBanners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsTransitioning(true);
                      setCurrentSlide(index);
                    }}
                    className={`transition-all duration-300 rounded-full ${
                      (currentSlide % activeBanners.length) === index 
                        ? 'w-8 h-2.5 bg-primary shadow-[0_0_10px_rgba(239,68,68,0.6)]' 
                        : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Ir a la diapositiva ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories Scroller */}
      {!globalSearchQuery && (
        <section className="mb-10 sm:mb-16 max-w-7xl mx-auto relative">
          <div className="flex items-center justify-between px-4 sm:px-6 mb-4 sm:mb-6">
            <h2 className="font-headline text-xl sm:text-2xl font-bold tracking-tight text-on-surface">Nuestros Productos</h2>
          </div>
          
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto hide-scrollbar gap-2.5 sm:gap-4 px-4 sm:px-6 pb-6 pt-2 snap-x scroll-smooth cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => {
              const ele = scrollContainerRef.current;
              if (!ele) return;
              ele.isDown = true;
              ele.startX = e.pageX - ele.offsetLeft;
              ele.scrollLeftStart = ele.scrollLeft;
            }}
            onMouseLeave={() => {
              if (scrollContainerRef.current) scrollContainerRef.current.isDown = false;
            }}
            onMouseUp={() => {
              if (scrollContainerRef.current) scrollContainerRef.current.isDown = false;
            }}
            onMouseMove={(e) => {
              const ele = scrollContainerRef.current;
              if (!ele || !ele.isDown) return;
              e.preventDefault();
              const x = e.pageX - ele.offsetLeft;
              const walk = (x - ele.startX) * 2; // Multiplicador para velocidad de arrastre
              ele.scrollLeft = ele.scrollLeftStart - walk;
            }}
          >
            {['Productos Recomendados', ...categories].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`snap-start flex-none px-5 sm:px-8 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 sm:gap-3 transition-all duration-300 active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 -translate-y-1'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/20 hover:shadow-md'
                }`}
              >
                <div className={selectedCategory === cat ? 'text-on-primary' : 'text-primary'}>
                  {cat === 'Productos Recomendados' ? <LayoutGrid size={20} /> : getCategoryIcon(cat)}
                </div>
                {cat}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Product Grid */}
      <section ref={gridRef} className="px-4 sm:px-6 mb-20 sm:mb-24 max-w-7xl mx-auto scroll-mt-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-10 gap-3 sm:gap-4">
          <div>
            {globalSearchQuery && (
              <>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <Sparkles className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="font-headline text-2xl sm:text-4xl font-extrabold tracking-tight text-on-surface">
                    Resultados de búsqueda
                  </h2>
                </div>
                <p className="text-on-surface-variant font-medium text-sm sm:text-lg">
                  Mostrando resultados para "{globalSearchQuery}"
                </p>
              </>
            )}
          </div>
          {!globalSearchQuery && (
            <button className="text-primary font-bold text-sm sm:text-base flex items-center gap-1.5 sm:gap-2 group bg-primary/5 hover:bg-primary/10 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-colors w-full sm:w-auto justify-center">
              Ver Todo 
              <ArrowRight className="w-4 h-4 sm:w-[18px] sm:h-[18px] transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>
        
        {currentProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 md:grid-cols-3 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-12">
              {currentProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 sm:mt-16">
                <button 
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl font-bold bg-surface-container border border-outline-variant/30 text-on-surface disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-container-high transition-all active:scale-95 shadow-sm"
                >
                  Anterior
                </button>
                <span className="font-semibold text-slate-500 text-sm sm:text-base">
                  Página {currentPage} de {totalPages}
                </span>
                <button 
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl font-bold bg-primary text-on-primary shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all active:scale-95"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="w-full py-16 sm:py-24 flex flex-col items-center justify-center text-outline bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-outline-variant/20 shadow-sm px-4 text-center">
            <div className="bg-surface-container-high p-4 sm:p-6 rounded-full mb-4 sm:mb-6">
              <SearchX className="w-8 h-8 sm:w-12 sm:h-12 text-outline-variant" strokeWidth={1.5} />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-on-surface mb-2 font-headline">No encontramos lo que buscas</p>
            <p className="text-on-surface-variant text-sm sm:text-base font-medium max-w-md">
              Intenta con otro término de búsqueda o selecciona otra categoría para ver más productos.
            </p>
            <button 
              onClick={() => { setGlobalSearchQuery(''); setSelectedCategory('Productos Recomendados'); }}
              className="mt-6 sm:mt-8 bg-primary text-on-primary px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 text-sm sm:text-base"
            >
              Ver todos los productos
            </button>
          </div>
        )}
      </section>
    </div>
  );
}