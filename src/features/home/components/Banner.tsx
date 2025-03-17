import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

export interface BannerItem {
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  link: string;
}

interface BannerProps {
  banners: BannerItem[];
  autoplayInterval?: number;
}

const Banner = ({ banners, autoplayInterval = 5000 }: BannerProps) => {
  const [currentBanner, setCurrentBanner] = useState(0);

  // Cambiar banner automáticamente
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, autoplayInterval);
    
    return () => clearInterval(interval);
  }, [banners.length, autoplayInterval]);

  // Animaciones con GSAP
  useEffect(() => {
    const bannerContent = document.querySelector('.banner-content');
    if (!bannerContent) return;
    
    gsap.fromTo(
      bannerContent,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7 }
    );
  }, [currentBanner]);

  if (banners.length === 0) return null;

  const banner = banners[currentBanner];

  return (
    <div className="relative w-full h-[500px] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
        style={{ backgroundImage: `url(${banner.image})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      <div className="banner-content relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{banner.title}</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl">{banner.subtitle}</p>
        <Link 
          to={banner.link} 
          className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-md font-medium transition-colors"
        >
          {banner.cta}
        </Link>
      </div>
      
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentBanner ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
              aria-label={`Ver banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Banner;
