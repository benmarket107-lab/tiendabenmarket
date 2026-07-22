'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard';
import useSEO from '../../utils/useSEO';
import { 
  Search, ArrowRight, Sparkles, ShoppingBag, 
  Coffee, Carrot, Cookie, Milk, SearchX, 
  Mail, LayoutGrid, Leaf, Beer, Apple,
  Beef, Egg, Scissors, Baby, Dog, 
  Cross, Cigarette, IceCream, Wheat, GlassWater, ChevronLeft, ChevronRight
} from 'lucide-react';

const getCategoryIcon = (cat) => {
  const normalizedCat = cat.toLowerCase();
  
  if (normalizedCat.includes('bebida') || normalizedCat.includes('gaseosa') || normalizedCat.includes('jugo') || normalizedCat.includes('agua')) return <GlassWater size={20} />;
  if (normalizedCat.includes('cerveza') || normalizedCat.includes('alcohol') || normalizedCat.includes('vino') || normalizedCat.includes('licor')) return <Beer size={20} />;
  if (normalizedCat.includes('snack') || normalizedCat.includes('galletita') || normalizedCat.includes('bocadito')) return <Cookie size={20} />;
  if (normalizedCat.includes('lácteo') || normalizedCat.includes('lacteo') || normalizedCat.includes('leche') || normalizedCat.includes('queso') || normalizedCat.includes('yogur')) return <Milk size={20} />;
  if (normalizedCat.includes('limpieza') || normalizedCat.includes('hogar') || normalizedCat.includes('lavado')) return <Sparkles size={20} />;
  if (normalizedCat.includes('fruta') || normalizedCat.includes('verdura') || normalizedCat.includes('fresco') || normalizedCat.includes('vegetal')) return <Apple size={20} />;
  if (normalizedCat.includes('carne') || normalizedCat.includes('pollo') || normalizedCat.includes('cerdo') || normalizedCat.includes('embutido') || normalizedCat.includes('fiambre')) return <Beef size={20} />;
  if (normalizedCat.includes('huevo')) return <Egg size={20} />;
  if (normalizedCat.includes('cuidado personal') || normalizedCat.includes('higiene') || normalizedCat.includes('belleza') || normalizedCat.includes('perfumería')) return <Scissors size={20} />;
  if (normalizedCat.includes('bebé') || normalizedCat.includes('infantil') || normalizedCat.includes('pañal')) return <Baby size={20} />;
  if (normalizedCat.includes('mascota') || normalizedCat.includes('perro') || normalizedCat.includes('gato') || normalizedCat.includes('animal')) return <Dog size={20} />;
  if (normalizedCat.includes('farmacia') || normalizedCat.includes('salud') || normalizedCat.includes('medicamento')) return <Cross size={20} />;
  if (normalizedCat.includes('cigarrillo') || normalizedCat.includes('tabaco') || normalizedCat.includes('vape')) return <Cigarette size={20} />;
  if (normalizedCat.includes('helado') || normalizedCat.includes('postre') || normalizedCat.includes('congelado')) return <IceCream size={20} />;
  if (normalizedCat.includes('panadería') || normalizedCat.includes('pan') || normalizedCat.includes('harina') || normalizedCat.includes('pasta')) return <Wheat size={20} />;
  if (normalizedCat.includes('despensa') || normalizedCat.includes('almacén') || normalizedCat.includes('almacen')) return <ShoppingBag size={20} />;
  
  return <ShoppingBag size={20} />;
};

export default function HomeClient() {
  const { categories, rawCategories, globalSearchQuery, setGlobalSearchQuery, banners, bannersReady, fetchProductsPage } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState('Productos Recomendados');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(globalSearchQuery);
  const gridRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Volver a la primera página cuando cambie la categoría o la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, globalSearchQuery]);

  const scrollCategories = (direction) => {
    if (scrollContainerRef.current) {
      const amount = 300;
      scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current && categories.length > 0) {
      const ele = scrollContainerRef.current;
      // Centrar el scroll en el segundo set para que se pueda hacer scroll a la izquierda
      if (ele.scrollLeft === 0) {
        // Necesitamos esperar un momento para que scrollWidth se calcule correctamente
        setTimeout(() => {
          if (ele) ele.scrollLeft = ele.scrollWidth / 4;
        }, 100);
      }
    }
  }, [categories]);

  const handleCategoryScroll = () => {
    const ele = scrollContainerRef.current;
    if (!ele || ele.isDown) return;
    
    const setWidth = ele.scrollWidth / 4;
    
    if (ele.scrollLeft >= setWidth * 3) {
      ele.scrollLeft -= setWidth;
    } else if (ele.scrollLeft <= 0) {
      ele.scrollLeft += setWidth;
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(globalSearchQuery), 250);
    return () => clearTimeout(t);
  }, [globalSearchQuery]);

  const activeBanners = banners.filter(b => b.active);
  const slides = activeBanners.length > 1 ? [...activeBanners, activeBanners[0]] : activeBanners;

  useEffect(() => {
    if (bannersReady) {
      setIsTransitioning(false);
      setCurrentSlide(0);
      const t = setTimeout(() => setIsTransitioning(true), 0);
      return () => clearTimeout(t);
    }
  }, [bannersReady]);

  // Auto-play del slider
  useEffect(() => {
    if (bannersReady && !globalSearchQuery && activeBanners.length > 1) {
      const timer = setInterval(() => {
        setIsTransitioning(true);
        setCurrentSlide((prev) => prev + 1);
      }, 5000); // Cambia cada 5 segundos
      return () => clearInterval(timer);
    }
  }, [bannersReady, globalSearchQuery, activeBanners.length]);

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

  const pageSize = 24;

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoadingProducts(true);

      try {
        const categoryCode =
          selectedCategory === 'Productos Recomendados'
            ? null
            : rawCategories?.find(c => c.nombre === selectedCategory)?.codigo_categoria || null;

        const { items, hasMore: nextHasMore } = await fetchProductsPage({
          page: currentPage,
          pageSize: 24,
          categoryCode,
          searchQuery: debouncedQuery,
          isRecommendedFilter: selectedCategory === 'Productos Recomendados',
        });

        if (cancelled) return;

        setHasMore(Boolean(nextHasMore));
        setProducts(prev => (currentPage === 1 ? items : [...prev, ...items]));
      } catch (e) {
        if (!cancelled) {
          setHasMore(false);
          setProducts(prev => (currentPage === 1 ? [] : prev));
        }
      } finally {
        if (!cancelled) setIsLoadingProducts(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [fetchProductsPage, rawCategories, selectedCategory, debouncedQuery, currentPage]);

  return (
    <div className="w-full bg-surface">
      {/* H1 semántico para SEO */}
      <h1 className="sr-only">Benmarket Express | Supermercado Online en Ciudad del Este</h1>
      {/* Hero Section / Banner Slider */}
      {!bannersReady ? (
        <section className="mb-8 sm:mb-16 pt-0 relative">
          <div className="relative aspect-[2/1] md:aspect-[12/5] w-full max-w-[1920px] mx-auto overflow-hidden bg-surface-container-lowest shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest via-surface-container-low to-surface-container-lowest animate-pulse" />
          </div>
        </section>
      ) : activeBanners.length > 0 ? (
        <section className="mb-8 sm:mb-16 pt-0 relative">
          <div className="relative aspect-[2/1] md:aspect-[12/5] w-full max-w-[1920px] mx-auto overflow-hidden bg-slate-900 shadow-sm">
            {/* Slider Container */}
            <div 
              className={`absolute inset-0 flex w-full h-full ${isTransitioning ? 'transition-transform duration-1000 ease-in-out' : 'transition-none'}`}
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((banner, index) => (
                <div key={`${banner.id}-${index}`} className="w-full h-full shrink-0 relative bg-slate-900 overflow-hidden">
                  {/* Blurred Background */}
                  <img 
                    src={banner.image}
                    alt="" 
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-50 scale-110"
                  />
                  {/* Main Banner */}
                  <img 
                    src={banner.image}
                    alt={banner.name || `Banner ${index + 1}`} 
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-contain object-center z-10"
                  />
                  {/* Overlay oscuro opcional para que se vean mejor los indicadores */}
                  <div className="absolute inset-0 bg-black/20 z-20 pointer-events-none"></div>
                </div>
              ))}
            </div>

            {/* Dots Indicators */}
            {activeBanners.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
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
      ) : null}

      {/* Categories Scroller */}
      {!globalSearchQuery && (
        <section className="mb-4 sm:mb-6 max-w-7xl mx-auto relative">
          <h2 className="sr-only">Nuestros Productos</h2>
          
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto hide-scrollbar gap-2.5 sm:gap-4 px-4 sm:px-6 pb-6 pt-2 snap-x cursor-grab active:cursor-grabbing"
            onScroll={handleCategoryScroll}
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
              const walk = (x - ele.startX) * 2;
              ele.scrollLeft = ele.scrollLeftStart - walk;
            }}
          >
            {[...Array(4)].flatMap(() => ['Productos Recomendados', ...categories]).map((cat, index) => (
              <button
                key={`${cat}-${index}`}
                onClick={() => setSelectedCategory(cat)}
                className={`snap-start flex-none flex flex-col items-center gap-2 transition-all duration-300 active:scale-95 group w-20 sm:w-24`}
              >
                <div 
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-2 transition-all shadow-sm ${
                    selectedCategory === cat 
                      ? 'border-primary bg-primary/10 shadow-md shadow-primary/20 scale-105' 
                      : 'border-slate-200 bg-white group-hover:border-primary/50 group-hover:shadow-md'
                  }`}
                >
                  {cat === 'Productos Recomendados' ? (
                    <LayoutGrid size={28} className={selectedCategory === cat ? 'text-primary' : 'text-slate-500 group-hover:text-primary'} />
                  ) : (() => {
                    const categoryObj = rawCategories?.find(c => c.nombre === cat);
                    if (categoryObj?.foto_url) {
                      return <img src={categoryObj.foto_url} alt={cat} className="w-full h-full object-cover rounded-full p-0.5" />;
                    }
                    return <div className={selectedCategory === cat ? 'text-primary' : 'text-slate-500 group-hover:text-primary'}>{getCategoryIcon(cat)}</div>;
                  })()}
                </div>
                <span className={`text-xs sm:text-sm font-bold text-center leading-tight line-clamp-2 ${
                  selectedCategory === cat ? 'text-primary' : 'text-slate-600'
                }`}>
                  {cat}
                </span>
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-2">
            <button 
              onClick={() => scrollCategories('left')} 
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm hover:bg-slate-50 hover:text-primary active:scale-95 transition-all"
              aria-label="Desplazar a la izquierda"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scrollCategories('right')} 
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm hover:bg-slate-50 hover:text-primary active:scale-95 transition-all"
              aria-label="Desplazar a la derecha"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </section>
      )}

      {/* Product Grid */}
      <section ref={gridRef} className="px-4 sm:px-6 mb-20 sm:mb-24 max-w-7xl mx-auto scroll-mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-2 sm:mb-4 gap-3 sm:gap-4">
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
        </div>
        
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 md:grid-cols-3 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-12">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            <div className="flex justify-center items-center mt-12 sm:mt-16">
              {hasMore ? (
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={isLoadingProducts}
                  className="px-6 py-3 rounded-xl font-bold bg-primary text-on-primary shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all active:scale-95"
                >
                  {isLoadingProducts ? 'Cargando...' : 'Cargar más productos'}
                </button>
              ) : (
                <span className="text-sm sm:text-base text-on-surface-variant font-medium">
                  {isLoadingProducts ? 'Cargando...' : 'No hay más productos para mostrar'}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="w-full py-16 sm:py-24 flex flex-col items-center justify-center text-outline bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-outline-variant/20 shadow-sm px-4 text-center">
            <div className="bg-surface-container-high p-4 sm:p-6 rounded-full mb-4 sm:mb-6">
              <SearchX className="w-8 h-8 sm:w-12 sm:h-12 text-outline-variant" strokeWidth={1.5} />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-on-surface mb-2 font-headline">
              {isLoadingProducts ? 'Cargando productos...' : 'No encontramos lo que buscas'}
            </p>
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
