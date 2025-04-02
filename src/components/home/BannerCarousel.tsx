import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import logger from "../../utils/logger";

// Registrar el plugin useGSAP
gsap.registerPlugin(useGSAP);

// Interfaces
export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  cta?: string;
  link?: string;
  image?: string;
  imageMobile?: string;
  carouselImages?: Array<{
    url: string;
    title?: string;
    link?: string;
    description?: string;
    subtitle?: string;
    cta?: string;
  }>;
}

interface BannerCarouselProps {
  banners: Banner[];
  loading: boolean;
  error: string | null;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  loading,
  error,
}) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [currentCarouselImage, setCurrentCarouselImage] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bannerElements = useRef<(HTMLDivElement | null)[]>([]);

  // Función para transición con GSAP
  const animateTransition = useCallback(
    (fromIndex: number, toIndex: number, isCarouselImage: boolean = false, onCompleteCallback?: () => void) => {
      if (isAnimating) return;
      setIsAnimating(true);

      const fadeOutElement = isCarouselImage
        ? document.querySelector(`.carousel-image-${fromIndex}`)
        : bannerElements.current[fromIndex];

      const fadeInElement = isCarouselImage
        ? document.querySelector(`.carousel-image-${toIndex}`)
        : bannerElements.current[toIndex];

      if (!fadeOutElement || !fadeInElement) {
        setIsAnimating(false);
        if (onCompleteCallback) onCompleteCallback();
        return;
      }

      logger.debug('BannerCarousel', `Animando transición de ${fromIndex} a ${toIndex}, tipo: ${isCarouselImage ? 'carrusel' : 'banner'}`);

      // Timeline para transición suave
      const tl = gsap.timeline({
        onComplete: () => {
          setIsAnimating(false);
          // Ejecutar callback después de completar la animación
          if (onCompleteCallback) onCompleteCallback();
        },
      });

      // Animar salida y entrada
      tl.to(fadeOutElement, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      })
        .set(fadeOutElement, { zIndex: 0, display: "none" })
        .set(fadeInElement, {
          opacity: 0,
          zIndex: 10,
          display: "block",
        })
        .to(fadeInElement, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.in",
        });

      // Animar contenido del banner
      const textElements = fadeInElement.querySelectorAll(".hero-animate");
      if (textElements.length > 0) {
        gsap.fromTo(
          textElements,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power2.out",
            delay: 0.5,
          },
        );
      }
    },
    [isAnimating],
  );

  // Función para avanzar al siguiente banner - usando useCallback para mantener la referencia estable
  const nextBanner = useCallback(() => {
    if (banners.length === 0 || isAnimating) {
      logger.debug('BannerCarousel', "No hay banners disponibles o hay una animación en curso");
      return;
    }

    // Verificar si el banner actual tiene imágenes de carrusel
    const currentBannerObject = banners[currentBanner];
    const hasCarouselImages =
      currentBannerObject?.carouselImages &&
      Array.isArray(currentBannerObject.carouselImages) &&
      currentBannerObject.carouselImages.length > 1;

    if (hasCarouselImages && currentBannerObject.carouselImages) {
      // Si hay más de una imagen en el carrusel, avanzar a la siguiente imagen
      const nextCarouselImage =
        (currentCarouselImage + 1) % currentBannerObject.carouselImages.length;
      logger.debug('BannerCarousel', `Avanzando a la imagen ${nextCarouselImage} del carrusel en el banner ${currentBanner}`);

      // Primero animar la transición y dentro del callback actualizar el estado
      animateTransition(currentCarouselImage, nextCarouselImage, true, () => {
        setCurrentCarouselImage(nextCarouselImage);
      });
    } else if (banners.length > 1) {
      // Si hay más de un banner, avanzar al siguiente banner
      const nextIndex = (currentBanner + 1) % banners.length;
      logger.debug('BannerCarousel', `Avanzando al banner ${nextIndex} desde ${currentBanner}`);

      // Primero animar la transición y dentro del callback actualizar el estado
      animateTransition(currentBanner, nextIndex, false, () => {
        setCurrentBanner(nextIndex);
        setCurrentCarouselImage(0);
      });
    } else {
      logger.debug('BannerCarousel', "Solo hay un banner sin múltiples imágenes de carrusel");
    }
  }, [
    banners,
    currentBanner,
    currentCarouselImage,
    animateTransition,
    isAnimating,
  ]);

  // Función para retroceder al banner anterior
  const prevBanner = useCallback(() => {
    if (banners.length === 0 || isAnimating) {
      logger.debug('BannerCarousel', "No hay banners disponibles o hay una animación en curso");
      return;
    }

    // Verificar si el banner actual tiene imágenes de carrusel
    const currentBannerObject = banners[currentBanner];
    const hasCarouselImages =
      currentBannerObject?.carouselImages &&
      Array.isArray(currentBannerObject.carouselImages) &&
      currentBannerObject.carouselImages.length > 1;

    if (hasCarouselImages && currentBannerObject.carouselImages) {
      // Si hay más de una imagen en el carrusel, retroceder a la imagen anterior
      const imagesCount = currentBannerObject.carouselImages.length;
      const prevCarouselImage =
        (currentCarouselImage - 1 + imagesCount) % imagesCount;
      logger.debug('BannerCarousel', `Retrocediendo a la imagen ${prevCarouselImage} del carrusel en el banner ${currentBanner}`);

      // Primero animar la transición y dentro del callback actualizar el estado
      animateTransition(currentCarouselImage, prevCarouselImage, true, () => {
        setCurrentCarouselImage(prevCarouselImage);
      });
    } else if (banners.length > 1) {
      // Si hay más de un banner, retroceder al banner anterior
      const prevIndex = (currentBanner - 1 + banners.length) % banners.length;
      logger.debug('BannerCarousel', `Retrocediendo al banner ${prevIndex} desde ${currentBanner}`);

      // Primero animar la transición y dentro del callback actualizar el estado
      animateTransition(currentBanner, prevIndex, false, () => {
        setCurrentBanner(prevIndex);
        setCurrentCarouselImage(0);
      });
    } else {
      logger.debug('BannerCarousel', "Solo hay un banner sin múltiples imágenes de carrusel");
    }
  }, [
    banners,
    currentBanner,
    currentCarouselImage,
    animateTransition,
    isAnimating,
  ]);

  // Función para ir a un banner específico
  const goToBanner = useCallback((index: number) => {
    if (index < 0 || index >= banners.length || index === currentBanner || isAnimating) {
      return;
    }
    
    logger.debug('BannerCarousel', `Yendo al banner ${index} desde ${currentBanner}`);
    
    // Animar la transición y luego actualizar el estado
    animateTransition(currentBanner, index, false, () => {
      setCurrentBanner(index);
      setCurrentCarouselImage(0);
    });
  }, [currentBanner, banners, animateTransition, isAnimating]);

  // Función para ir a una imagen específica del carrusel
  const goToCarouselImage = useCallback((index: number) => {
    if (!banners[currentBanner] || 
        !banners[currentBanner].carouselImages || 
        index < 0 || 
        index >= banners[currentBanner].carouselImages.length || 
        index === currentCarouselImage ||
        isAnimating) {
      return;
    }
    
    logger.debug('BannerCarousel', `Yendo a la imagen ${index} del carrusel desde ${currentCarouselImage}`);
    
    // Animar la transición y luego actualizar el estado
    animateTransition(currentCarouselImage, index, true, () => {
      setCurrentCarouselImage(index);
    });
  }, [currentBanner, currentCarouselImage, banners, animateTransition, isAnimating]);

  // Iniciar carrusel automático
  const startCarousel = useCallback(() => {
    if (intervalRef.current || banners.length <= 1) return;

    logger.debug('BannerCarousel', "Iniciando carrusel automático");
    intervalRef.current = setInterval(() => {
      logger.debug('BannerCarousel', "Ejecución automática - avanzando al siguiente banner");
      nextBanner();
    }, 10000); // Cambiado de 5000 a 10000 ms (10 segundos)

    setAutoplay(true);
  }, [banners.length, nextBanner]);

  // Detener carrusel automático
  const stopCarousel = useCallback(() => {
    if (!intervalRef.current) return;

    logger.debug('BannerCarousel', "Deteniendo carrusel automático");
    clearInterval(intervalRef.current);
    intervalRef.current = null;

    setAutoplay(false);
  }, []);

  // Efecto para iniciar/detener el carrusel automático cuando cambian los banners
  useEffect(() => {
    logger.debug('BannerCarousel', `Inicializando carrusel con ${banners.length} banners`);

    // Limpiar cualquier intervalo existente
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Solo iniciar si hay más de un banner o si el único banner tiene múltiples imágenes
    let shouldAutoplay = false;

    if (banners.length > 1) {
      shouldAutoplay = true;
      logger.debug('BannerCarousel', "Hay múltiples banners, iniciando autoplay");
    } else if (banners.length === 1) {
      const firstBanner = banners[0];
      if (
        firstBanner.carouselImages &&
        Array.isArray(firstBanner.carouselImages) &&
        firstBanner.carouselImages.length > 1
      ) {
        shouldAutoplay = true;
        logger.debug(
          'BannerCarousel',
          `El único banner tiene ${firstBanner.carouselImages.length} imágenes de carrusel, iniciando autoplay`,
        );
      }
    }

    if (shouldAutoplay) {
      startCarousel();
    } else {
      logger.debug('BannerCarousel', "No hay suficientes banners o imágenes para autoplay");
    }

    return () => {
      logger.debug('BannerCarousel', "Limpiando carrusel automático");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [banners.length, startCarousel]);

  // Usar useGSAP para manejar las animaciones
  useGSAP({ scope: containerRef });

  // Funciones de manejo de eventos
  const handlePrevClick = (e: React.MouseEvent) => {
    logger.debug('BannerCarousel', "Clic en botón anterior");
    e.preventDefault();
    e.stopPropagation();
    stopCarousel();
    prevBanner();
    setTimeout(() => {
      startCarousel();
    }, 2000);
  };

  const handleNextClick = (e: React.MouseEvent) => {
    logger.debug('BannerCarousel', "Clic en botón siguiente");
    e.preventDefault();
    e.stopPropagation();
    stopCarousel();
    nextBanner();
    setTimeout(() => {
      startCarousel();
    }, 2000);
  };

  const handleIndicatorClick = (e: React.MouseEvent, index: number) => {
    logger.debug('BannerCarousel', `Clic en indicador ${index}`);
    e.preventDefault();
    e.stopPropagation();
    stopCarousel();
    goToBanner(index);
    setTimeout(() => {
      startCarousel();
    }, 2000);
  };

  const handleCarouselIndicatorClick = (e: React.MouseEvent, index: number) => {
    logger.debug('BannerCarousel', `Clic en indicador de carrusel ${index}`);
    e.preventDefault();
    e.stopPropagation();
    stopCarousel();
    goToCarouselImage(index);
    setTimeout(() => {
      startCarousel();
    }, 2000);
  };

  // Verificar si hay banners disponibles
  useEffect(() => {
    logger.debug('BannerCarousel', "Banners recibidos en BannerCarousel:", banners);
    logger.debug('BannerCarousel', "Cantidad de banners:", banners.length);

    // Inicializar el array de referencias a elementos
    bannerElements.current = banners.map(() => null);

    if (banners.length > 0) {
      // Validar las imágenes de los banners
      banners.forEach((banner, index) => {
        logger.debug('BannerCarousel', `Banner ${index}:`, banner);
        logger.debug('BannerCarousel', `Banner ${index} ID:`, banner.id);
        logger.debug('BannerCarousel', `Banner ${index} Título:`, banner.title);

        if (banner.image) {
          logger.debug('BannerCarousel', `Banner ${index} tiene imagen:`, banner.image);
        } else {
          logger.warn('BannerCarousel', `Banner ${index} no tiene imagen`);
        }

        if (banner.carouselImages && banner.carouselImages.length > 0) {
          logger.debug(
            'BannerCarousel',
            `Banner ${index} tiene ${banner.carouselImages.length} imágenes de carrusel`,
          );
        }
      });
    } else {
      logger.warn('BannerCarousel', "No se recibieron banners en BannerCarousel");
    }
  }, [banners]);

  // Renderizado condicional
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px] md:h-[550px] bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primario"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[400px] md:h-[550px] bg-gray-100 rounded-lg">
        <div className="text-center text-red-500 p-4">
          <p>Error al cargar los banners. Por favor, intenta nuevamente.</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="flex justify-center items-center h-[400px] md:h-[550px] bg-gray-100 rounded-lg">
        <p className="text-gray-500">No hay banners disponibles.</p>
      </div>
    );
  }

  // Verificar si el banner actual tiene imágenes de carrusel
  const currentBannerObject = banners[currentBanner];

  // Determinar si mostrar los controles del carrusel
  const showCarouselControls =
    currentBannerObject?.carouselImages &&
    Array.isArray(currentBannerObject.carouselImages) &&
    currentBannerObject.carouselImages.length > 1;

  // Hay banners para mostrar
  return (
    <div
      className="relative bg-gradient-to-r from-oscuro to-primario text-white rounded-lg overflow-hidden h-full shadow-lg"
      onMouseEnter={stopCarousel}
      onMouseLeave={startCarousel}
      ref={containerRef}
    >
      <div className="relative h-[400px] md:h-[550px] lg:h-full overflow-hidden">
        {/* Carrusel de banners */}
        <div className="w-full h-full">
          {banners.map((banner, index) => {
            // Determinar qué imágenes mostrar (carrusel o imagen única)
            return (
              <div
                key={`banner-${banner.id}-${index}`}
                className={`banner-${index} absolute inset-0 w-full h-full`}
                style={{
                  opacity: index === currentBanner ? 1 : 0,
                  zIndex: index === currentBanner ? 10 : 0,
                  display: index === currentBanner ? "block" : "none",
                }}
                ref={(el) => {
                  bannerElements.current[index] = el;
                }}
              >
                {/* Imágenes del banner */}
                {banner.carouselImages && banner.carouselImages.length > 0 ? (
                  // Mostrar imágenes del carrusel
                  <>
                    {banner.carouselImages.map((_, imgIndex) => (
                      <div
                        key={`carousel-image-${index}-${imgIndex}`}
                        className={`carousel-image-${imgIndex} absolute inset-0 w-full h-full`}
                        style={{
                          opacity:
                            imgIndex === currentCarouselImage &&
                            index === currentBanner
                              ? 1
                              : 0,
                          zIndex:
                            imgIndex === currentCarouselImage &&
                            index === currentBanner
                              ? 10
                              : 0,
                          display:
                            imgIndex === currentCarouselImage &&
                            index === currentBanner
                              ? "block"
                              : "none",
                        }}
                      >
                        <picture>
                          {banner.carouselImages && banner.carouselImages[imgIndex] && (
                            <img
                              src={banner.carouselImages[imgIndex].url}
                              alt={
                                banner.carouselImages[imgIndex].title ||
                                banner.title
                              }
                              className="absolute inset-0 w-full h-full object-cover"
                              loading={
                                index === 0 && imgIndex === 0 ? "eager" : "lazy"
                              }
                              onError={(e) => {
                                logger.error('BannerCarousel', `Error loading carousel image ${imgIndex} for banner ID ${banner.id}`);
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                target.parentElement!.style.backgroundColor =
                                  "#4A5568";
                              }}
                            />
                          )}
                        </picture>
                      </div>
                    ))}
                  </>
                ) : (
                  // No mostrar imagen única si no hay carrusel
                  null
                )}
                {/* Contenido del banner: título, descripción, etc. */}
                <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16 z-10">
                  <div className="max-w-md backdrop-blur-lg bg-gradient-to-r from-claro/90 to-claro/70 p-8 rounded-xl shadow-2xl border border-white/20">
                    {banner.carouselImages && banner.carouselImages.length > 0 && currentCarouselImage >= 0 ? (
                      // Mostrar contenido de la imagen de carrusel actual
                      <>
                        <div className="flex flex-col space-y-3">
                          <div className="inline-block bg-primario/20 px-3 py-1 rounded-full text-sm text-primario font-medium mb-1 hero-animate">
                            Destacado
                          </div>
                          <h2 
                            className="text-2xl md:text-4xl lg:text-5xl font-bold text-oscuro mb-2 md:mb-3 hero-animate"
                          >
                            {banner.carouselImages[currentCarouselImage]?.title || ''}
                          </h2>
                          {banner.carouselImages[currentCarouselImage]?.subtitle && (
                            <h3 
                              className="text-xl md:text-2xl font-medium text-primario mb-2 md:mb-3 hero-animate"
                            >
                              {banner.carouselImages[currentCarouselImage].subtitle}
                            </h3>
                          )}
                          {banner.carouselImages[currentCarouselImage]?.description && (
                            <div 
                              className="mb-4 md:mb-5 text-oscuro/80 text-base md:text-lg hero-animate"
                              dangerouslySetInnerHTML={{ __html: banner.carouselImages[currentCarouselImage].description }}
                            />
                          )}
                          {banner.carouselImages[currentCarouselImage]?.link && (
                            <div className="mt-2">
                              <Link 
                                to={banner.carouselImages[currentCarouselImage].link || ''} 
                                className="inline-flex items-center bg-primario hover:bg-primario-dark text-white font-bold py-3 px-6 rounded-lg transition duration-300 hero-animate hover:!text-white shadow-lg"
                              >
                                {banner.carouselImages[currentCarouselImage]?.cta || 'Ver más'}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </Link>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      // No mostrar ningún contenido si no hay imágenes de carrusel
                      null
                    )}
                  </div>
                </div>

                {/* Overlay para mejorar legibilidad */}
                <div className="absolute inset-0 bg-gradient-to-r from-oscuro/80 via-oscuro/40 to-transparent"></div>
              </div>
            );
          })}
        </div>

        {/* Sólo mostrar controles si hay múltiples imágenes para navegar */}
        {(banners.length > 1 || showCarouselControls) && (
          <>
            {/* Controles del carrusel */}
            <div className="absolute bottom-4 right-4 z-20">
              {/* Botones de navegación */}
              <div className="flex space-x-2">
                <button
                  onClick={handlePrevClick}
                  className="bg-primario/60 hover:bg-primario/80 text-white p-2 rounded-full backdrop-blur-md transition-colors duration-300"
                  aria-label="Imagen anterior"
                  disabled={isAnimating}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleNextClick}
                  className="bg-primario/60 hover:bg-primario/80 text-white p-2 rounded-full backdrop-blur-md transition-colors duration-300"
                  aria-label="Siguiente imagen"
                  disabled={isAnimating}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Indicadores de posición - adaptados para mostrar las imágenes del carrusel */}
            <div className="absolute bottom-4 left-4 z-20">
              <div className="flex space-x-2">
                {banners.length > 1
                  ? // Mostrar indicadores para múltiples banners
                    banners.map((banner, index) => (
                      <button
                        key={`indicator-${banner.id}`}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentBanner
                            ? "bg-primario w-6"
                            : "bg-white/60"
                        }`}
                        onClick={(e) => handleIndicatorClick(e, index)}
                        aria-label={`Ir al banner ${index + 1}`}
                        disabled={isAnimating}
                      />
                    ))
                  : // Mostrar indicadores para las imágenes del carrusel
                    showCarouselControls &&
                    banners[0]?.carouselImages?.map((_, index) => (
                      <button
                        key={`carousel-indicator-${index}`}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentCarouselImage
                            ? "bg-primario w-6"
                            : "bg-white/60"
                        }`}
                        onClick={(e) => handleCarouselIndicatorClick(e, index)}
                        aria-label={`Ir a la imagen ${index + 1}`}
                        disabled={isAnimating}
                      />
                    ))}
              </div>
            </div>

            {/* Indicador de autoplay */}
            <div className="absolute top-4 right-4 z-20">
              <div
                className={`w-3 h-3 rounded-full ${autoplay ? "bg-green-400" : "bg-red-400"}`}
                title={
                  autoplay
                    ? "Reproducción automática activada"
                    : "Reproducción automática pausada"
                }
              ></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BannerCarousel;
