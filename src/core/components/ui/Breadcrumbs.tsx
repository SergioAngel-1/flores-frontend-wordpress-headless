import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

const Breadcrumbs = ({ items = [], showHome = true, className = '' }: BreadcrumbsProps) => {
  const location = useLocation();
  
  // Si no hay items personalizados, generamos breadcrumbs basados en la ruta actual
  const breadcrumbItems = items.length > 0 
    ? items 
    : generateBreadcrumbsFromPath(location.pathname);
  
  // Aseguramos que siempre haya un item "Inicio" al principio si showHome es true
  const finalItems = showHome 
    ? [{ name: 'Inicio', path: '/' }, ...breadcrumbItems.filter(item => item.path !== '/')] 
    : breadcrumbItems;
  
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {finalItems.map((item, index) => {
          const isLast = index === finalItems.length - 1;
          
          return (
            <li key={item.path} className="inline-flex items-center">
              {index > 0 && (
                <svg
                  className="w-3 h-3 mx-1 text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
              )}
              
              {isLast ? (
                <span className="text-gray-500 ml-1 md:ml-2 text-sm font-medium">
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-primary-600 hover:text-primary-800 ml-1 md:ml-2 text-sm font-medium"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Función para generar breadcrumbs basados en la ruta actual
const generateBreadcrumbsFromPath = (path: string): BreadcrumbItem[] => {
  // Ignoramos la primera barra y dividimos la ruta en segmentos
  const segments = path.split('/').filter(Boolean);
  
  // Mapeamos los segmentos a nombres más legibles (esto podría mejorarse con un diccionario)
  const pathToName: Record<string, string> = {
    'products': 'Productos',
    'flowers': 'Flores',
    'plants': 'Plantas',
    'arrangements': 'Arreglos',
    'cart': 'Carrito',
    'checkout': 'Finalizar compra',
    'account': 'Mi cuenta',
    'orders': 'Mis pedidos',
    'about': 'Nosotros',
    'contact': 'Contacto',
    'faq': 'Preguntas frecuentes',
    'blog': 'Blog',
  };
  
  // Construimos los items de breadcrumb
  const items: BreadcrumbItem[] = [];
  let currentPath = '';
  
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    items.push({
      name: pathToName[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      path: currentPath,
    });
  });
  
  return items;
};

export default Breadcrumbs;
