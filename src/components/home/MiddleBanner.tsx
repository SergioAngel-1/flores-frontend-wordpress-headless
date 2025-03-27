import { Link } from 'react-router-dom';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  imageMobile: string;
  cta: string;
  link: string;
  order?: number;
  type?: string;
  socialNetworks?: Array<{
    title: string;
    subtitle: string;
    cta: string;
    link: string;
    icon: string;
    color: string;
  }>;
  socialIcon?: string;
  socialColor?: string;
}

interface MiddleBannerProps {
  banners: Banner[];
}

const MiddleBanner: React.FC<MiddleBannerProps> = ({ banners }) => {
  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="py-6 bg-white">
      <div className="container mx-auto px-16 md:px-16 max-w-full">
        {banners.map((banner) => (
          <div 
            key={banner.id} 
            className="relative overflow-hidden rounded-lg"
            style={{
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
              transform: 'translateZ(0)',
              willChange: 'transform',
              position: 'relative',
              zIndex: 1
            }}
          >
            <Link to={banner.link || "#"} className="block">
              <picture>
                <source media="(max-width: 640px)" srcSet={banner.imageMobile || banner.image || undefined} />
                <img 
                  src={banner.image || undefined} 
                  alt={banner.title} 
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: '200px', objectPosition: 'center' }}
                  loading="lazy"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-oscuro/80 to-transparent flex flex-col justify-center p-6">
                <h2 className="text-white text-2xl font-bold mb-2">{banner.title}</h2>
                {banner.subtitle && (
                  <p className="text-white/90 text-sm md:text-base mb-4 max-w-md">{banner.subtitle}</p>
                )}
                {banner.cta && (
                  <span className="inline-block bg-primario hover:bg-hover text-white px-4 py-2 rounded-md transition-colors duration-300 text-sm font-medium">
                    {banner.cta}
                  </span>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MiddleBanner;
