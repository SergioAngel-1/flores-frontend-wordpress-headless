import React from 'react';
import { 
  FaFacebook, 
  FaInstagram,
  FaWhatsapp,
  FaTelegram,
  FaGlobe
} from 'react-icons/fa';

interface SocialNetworkCardProps {
  id: string;
  title: string;
  subtitle?: string;
  cta: string;
  link: string;
  icon: string;
  color: string;
}

const SocialNetworkCard: React.FC<SocialNetworkCardProps> = ({
  title,
  subtitle,
  cta,
  link,
  icon,
  color
}) => {
  // Función para renderizar el ícono de red social correspondiente
  const renderSocialIcon = (socialIcon: string, size: number = 28) => {
    switch (socialIcon.toLowerCase()) {
      case 'facebook':
        return <FaFacebook size={size} />;
      case 'instagram':
        return <FaInstagram size={size} />;
      case 'whatsapp':
        return <FaWhatsapp size={size} />;
      case 'telegram':
        return <FaTelegram size={size} />;
      default:
        return <FaGlobe size={size} />;
    }
  };

  // Determinar el color predeterminado según la red social
  const getDefaultColor = (socialIcon: string): string => {
    switch (socialIcon.toLowerCase()) {
      case 'facebook':
        return '#3b5998';
      case 'instagram':
        return '#e1306c';
      case 'whatsapp':
        return '#25D366';
      case 'telegram':
        return '#0088cc';
      default:
        return '#3b5998';
    }
  };

  // Usar el color proporcionado o el color predeterminado según la red social
  const socialColor = color || getDefaultColor(icon);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl" style={{ width: '220px', height: '250px', display: 'flex', flexDirection: 'column' }}>
      <div className="p-6 flex flex-col flex-grow">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-white mx-auto mb-4"
          style={{ backgroundColor: socialColor }}
        >
          {renderSocialIcon(icon)}
        </div>
        
        <div className="flex-grow">
          <h3 className="text-xl font-bold mb-2 text-center text-gray-800">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-600 mb-4 text-center">{subtitle}</p>
          )}
        </div>
        
        <div className="text-center mt-auto">
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-5 py-2 bg-primario text-white rounded-full font-medium text-sm hover:bg-primario-dark hover:text-white transition-colors duration-300"
          >
            {cta}
          </a>
        </div>
      </div>
    </div>
  );
};

export default SocialNetworkCard;
