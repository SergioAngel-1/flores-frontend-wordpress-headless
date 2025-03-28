import React from 'react';
import SocialNetworkCard from './SocialNetworkCard';

interface SocialNetwork {
  id: string;
  title: string;
  subtitle?: string;
  cta: string;
  link: string;
  icon: string;
  color: string;
}

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image?: string;
  imageMobile?: string;
  cta: string;
  link: string;
  order?: number;
  type?: string;
  socialNetworks?: Array<{
    title: string;
    subtitle?: string;
    cta: string;
    link: string;
    icon: string;
    color: string;
  }>;
  socialIcon?: string;
  socialColor?: string;
}

interface SocialNetworksProps {
  banners: Banner[];
}

const SocialNetworks: React.FC<SocialNetworksProps> = ({ banners }) => {
  console.log('SocialNetworks - Renderizando componente');
  console.log('SocialNetworks - Banners recibidos:', banners);

  if (!banners || banners.length === 0) {
    console.warn('SocialNetworks: No hay banners disponibles');
    return null;
  }

  // Extraer todas las redes sociales de todos los banners
  let allSocialNetworks: SocialNetwork[] = [];
  
  banners.forEach(banner => {
    console.log(`Procesando banner ID ${banner.id}:`, banner);
    
    // Si el banner tiene redes sociales definidas, usarlas
    if (banner.socialNetworks && Array.isArray(banner.socialNetworks) && banner.socialNetworks.length > 0) {
      console.log(`Banner ${banner.id} tiene ${banner.socialNetworks.length} redes sociales definidas:`, banner.socialNetworks);
      
      const networks = banner.socialNetworks.map((network, index) => ({
        id: `${banner.id}-${index}`,
        title: network.title || banner.title || '',
        subtitle: network.subtitle || banner.subtitle || '',
        cta: network.cta || banner.cta || 'Visitar',
        link: network.link || banner.link || '#',
        icon: network.icon || banner.socialIcon || 'facebook',
        color: network.color || banner.socialColor || '#3b5998'
      }));
      
      console.log(`Redes sociales procesadas para banner ${banner.id}:`, networks);
      allSocialNetworks = [...allSocialNetworks, ...networks];
    } 
    // Si el banner tiene socialIcon y socialColor definidos, usarlos
    else if (banner.socialIcon && banner.socialColor) {
      console.log(`Banner ${banner.id} usando socialIcon y socialColor:`, banner.socialIcon, banner.socialColor);
      
      const network = {
        id: banner.id.toString(),
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        cta: banner.cta || 'Visitar',
        link: banner.link || '#',
        icon: banner.socialIcon,
        color: banner.socialColor
      };
      
      console.log(`Red social creada para banner ${banner.id}:`, network);
      allSocialNetworks.push(network);
    }
    // Si el banner es de tipo "bottom", crear una red social predeterminada
    else if (banner.type === 'bottom') {
      console.log(`Banner ${banner.id} es de tipo bottom, creando red social predeterminada`);
      
      const network = {
        id: banner.id.toString(),
        title: banner.title || 'Red Social',
        subtitle: banner.subtitle || 'Síguenos',
        cta: banner.cta || 'Visitar',
        link: banner.link || '#',
        icon: 'facebook', // Valor predeterminado
        color: '#3b5998' // Valor predeterminado
      };
      
      console.log(`Red social predeterminada creada para banner ${banner.id}:`, network);
      allSocialNetworks.push(network);
    }
  });

  // Para depuración
  console.log('SocialNetworks - Redes sociales procesadas:', allSocialNetworks);

  if (allSocialNetworks.length === 0) {
    console.warn('SocialNetworks: No hay redes sociales para mostrar');
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-[var(--claro)]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primario">Síguenos en redes sociales</h2>
          <p className="text-gray-600 text-lg">Conéctate con nosotros y mantente al día con nuestras novedades</p>
          <div className="w-20 h-1 bg-primario mx-auto mt-6 rounded-full"></div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
          {allSocialNetworks.map((network) => (
            <SocialNetworkCard
              key={network.id}
              id={network.id}
              title={network.title}
              subtitle={network.subtitle}
              cta={network.cta}
              link={network.link}
              icon={network.icon}
              color={network.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialNetworks;
