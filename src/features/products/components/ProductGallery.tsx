import { useState, useEffect } from 'react';
import { gsap } from 'gsap';

interface ProductImage {
  id: number;
  src: string;
  alt: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
  defaultImage?: string;
}

const ProductGallery = ({ images, defaultImage }: ProductGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Establecer la imagen seleccionada por defecto
  useEffect(() => {
    if (images.length > 0) {
      setSelectedImage(defaultImage || images[0].src);
    }
  }, [images, defaultImage]);

  // Manejar animación al cambiar de imagen
  useEffect(() => {
    if (selectedImage) {
      const mainImage = document.querySelector('.main-image');
      if (mainImage) {
        gsap.fromTo(
          mainImage,
          { opacity: 0.5 },
          { opacity: 1, duration: 0.3 }
        );
      }
    }
  }, [selectedImage]);

  // Manejar zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (images.length === 0) {
    return (
      <div className="bg-gray-200 rounded-lg flex items-center justify-center h-96">
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      {/* Imagen principal */}
      <div
        className={`relative overflow-hidden rounded-lg mb-4 ${
          isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
        }`}
        onMouseMove={handleMouseMove}
        onClick={toggleZoom}
        style={{ height: '400px' }}
      >
        {selectedImage && (
          <div
            className="main-image w-full h-full bg-no-repeat"
            style={{
              backgroundImage: `url(${selectedImage})`,
              backgroundSize: isZoomed ? '150%' : 'contain',
              backgroundPosition: isZoomed
                ? `${zoomPosition.x}% ${zoomPosition.y}%`
                : 'center',
              backgroundRepeat: 'no-repeat',
              transition: isZoomed ? 'none' : 'background-size 0.3s ease',
            }}
          />
        )}
        
        {/* Indicador de zoom */}
        <div className="absolute bottom-2 right-2 bg-white bg-opacity-75 rounded-full p-1">
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isZoomed
                  ? 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7'
                  : 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7'
              }
            />
          </svg>
        </div>
      </div>
      
      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              className={`relative rounded-md overflow-hidden border-2 ${
                selectedImage === image.src
                  ? 'border-primary-600'
                  : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => setSelectedImage(image.src)}
            >
              <div className="aspect-w-1 aspect-h-1">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
