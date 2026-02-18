import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { SocialButtons } from '@/components/SocialButtons';

// Importar todas las imágenes
import img1 from '@/assets/hero-bg.jpeg';
import img2 from '@/assets/518358933_1323661119767136_1544069518957269029_n.jpg';
import img3 from '@/assets/496147614_1264495915683657_347437014618624521_n.jpg';
import img4 from '@/assets/495184352_1259169109549671_6460914720082391279_n.jpg';
import img5 from '@/assets/495141945_1259169176216331_4837577139806246558_n.jpg';
import img6 from '@/assets/494238419_1251943680272214_5287191008623553119_n.jpg';
import img7 from '@/assets/493880063_1252245200242062_1664804388654072362_n.jpg';

const IMAGES = [img1, img2, img3, img4, img5, img6, img7];

export const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0])); // Pre-cargar primera imagen

  // Mostrar contenido solo en la primera imagen
  const showContent = currentIndex === 0;

  // Pre-cargar imágenes adyacentes
  useEffect(() => {
    const preloadIndices = new Set([
      currentIndex,
      (currentIndex + 1) % IMAGES.length,
      (currentIndex - 1 + IMAGES.length) % IMAGES.length,
    ]);

    preloadIndices.forEach((index) => {
      if (!loadedImages.has(index)) {
        const img = new Image();
        img.src = IMAGES[index];
        img.onload = () => {
          setLoadedImages((prev) => new Set([...prev, index]));
        };
      }
    });
  }, [currentIndex, loadedImages]);

  // Función para avanzar a la siguiente imagen
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % IMAGES.length);
  }, []);

  // Función para retroceder a la imagen anterior
  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + IMAGES.length) % IMAGES.length);
  }, []);

  // Función para ir a una imagen específica
  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Autoplay: 13 segundos para la primera imagen, 7 segundos para las demás
  useEffect(() => {
    if (isFullscreen) return; // No avanzar en fullscreen

    const delay = currentIndex === 0 ? 13000 : 7000;
    const timer = setTimeout(nextSlide, delay);

    return () => clearTimeout(timer);
  }, [currentIndex, nextSlide, isFullscreen]);

  // Manejo de gestos táctiles para swipe (optimizado con useMemo)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  }, [touchStart, touchEnd, nextSlide, prevSlide]);

  // Cerrar fullscreen con tecla Escape
  useEffect(() => {
    if (!isFullscreen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  // Memoizar el renderizado de indicadores
  const indicators = useMemo(() => (
    IMAGES.map((_, index) => (
      <button
        key={index}
        onClick={(e) => {
          e.stopPropagation();
          goToSlide(index);
        }}
        className={`transition-all duration-300 rounded-full w-3 h-3 ${
          index === currentIndex
            ? 'bg-primary'
            : 'bg-white/60 hover:bg-white/80'
        }`}
        aria-label={`Ir a imagen ${index + 1}`}
      />
    ))
  ), [currentIndex, goToSlide]);

  const fullscreenIndicators = useMemo(() => (
    IMAGES.map((_, index) => (
      <button
        key={index}
        onClick={(e) => {
          e.stopPropagation();
          goToSlide(index);
        }}
        className={`transition-all duration-300 rounded-full w-4 h-4 ${
          index === currentIndex
            ? 'bg-white'
            : 'bg-white/40 hover:bg-white/60'
        }`}
        aria-label={`Ir a imagen ${index + 1}`}
      />
    ))
  ), [currentIndex, goToSlide]);

  return (
    <>
      {/* Carrusel principal */}
      <div 
        className="relative w-full h-[500px] md:h-[600px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Imágenes */}
        {IMAGES.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: index === 0 
                ? `linear-gradient(rgba(242, 242, 242, 0.88), rgba(242, 242, 242, 0.88)), url(${img})`
                : `url(${img})`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              willChange: index === currentIndex ? 'opacity' : 'auto',
            }}
            onClick={() => setIsFullscreen(true)}
          >
            {/* Overlay para cursor pointer */}
            <div className="absolute inset-0 cursor-pointer" />
          </div>
        ))}

        {/* Contenido (solo visible en primera imagen) */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            showContent ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="absolute inset-0 gradient-subtle opacity-40" />
          <div className="container mx-auto px-4 relative h-full flex items-center">
            <div className="max-w-3xl mx-auto text-center animate-slide-up">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Tu Evento Perfecto
                <span className="block text-primary">Al Pie del Asador</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                El plan perfecto empieza con el lugar correcto. Reserva nuestro espacio para tu próxima celebración.
              </p>
              <SocialButtons 
                whatsappLink="https://wa.me/528118166128" 
                facebookLink="https://www.facebook.com/fiestapoolparty/?locale=es_LA"
              />
            </div>
          </div>
        </div>

        {/* Flechas de navegación */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Imagen anterior"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Imagen siguiente"
        >
          <ChevronRight className="w-6 h-6 text-foreground" />
        </button>

        {/* Indicadores de puntos */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-3">
          {indicators}
        </div>
      </div>

      {/* Modal de pantalla completa */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center animate-fade-in"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Botón cerrar */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-200"
            aria-label="Cerrar pantalla completa"
          >
            <X className="w-8 h-8 text-white" />
          </button>

          {/* Imagen completa */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={IMAGES[currentIndex]}
              alt={`Imagen ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
              loading="eager"
            />

            {/* Flechas en fullscreen */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-4 transition-all duration-200"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-4 transition-all duration-200"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>

            {/* Indicadores en fullscreen */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
              {fullscreenIndicators}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

