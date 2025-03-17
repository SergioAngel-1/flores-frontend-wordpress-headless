import { Link } from 'react-router-dom';

interface FooterLink {
  id: number;
  name: string;
  url: string;
}

interface FooterColumn {
  id: number;
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  id: number;
  name: string;
  url: string;
  icon: React.ReactNode;
}

interface FooterProps {
  columns: FooterColumn[];
  socialLinks: SocialLink[];
  copyrightText: string;
}

const Footer = ({ columns, socialLinks, copyrightText }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        {/* Secciones principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo y descripción */}
          <div>
            <Link to="/" className="text-2xl font-bold text-white mb-4 inline-block">
              FloresInc
            </Link>
            <p className="text-gray-400 mb-4">
              Flores y plantas de la mejor calidad para decorar tu hogar y oficina. 
              Envíos a todo Colombia.
            </p>
            
            {/* Redes sociales */}
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
          
          {/* Columnas de enlaces */}
          {columns.map((column) => (
            <div key={column.id}>
              <h3 className="text-lg font-semibold mb-4 text-white">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      to={link.url}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Newsletter */}
        <div className="border-t border-gray-800 pt-8 pb-4">
          <div className="max-w-xl mx-auto">
            <h3 className="text-lg font-semibold mb-2 text-center">Suscríbete a nuestro newsletter</h3>
            <p className="text-gray-400 text-center mb-4">
              Recibe nuestras ofertas y novedades directamente en tu correo.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>
            {copyrightText.replace('{year}', currentYear.toString())}
          </p>
          <div className="mt-2 space-x-4">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Política de privacidad
            </Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">
              Términos de servicio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
