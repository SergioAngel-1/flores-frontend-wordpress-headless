import { ReactNode } from 'react';
import Breadcrumbs from './Breadcrumbs';

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
  backgroundImage?: string;
  actions?: ReactNode;
  className?: string;
}

const PageHeader = ({
  title,
  subtitle,
  breadcrumbs,
  showBreadcrumbs = true,
  backgroundImage,
  actions,
  className = '',
}: PageHeaderProps) => {
  // Estilos condicionales para el fondo
  const bgStyles = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  // Estilos de texto condicionales basados en si hay imagen de fondo
  const textColorClass = backgroundImage ? 'text-white' : 'text-gray-800';
  const subtitleColorClass = backgroundImage ? 'text-gray-200' : 'text-gray-600';

  return (
    <div
      className={`py-8 ${backgroundImage ? 'py-16' : ''} ${className}`}
      style={bgStyles}
    >
      <div className="container mx-auto px-4">
        {showBreadcrumbs && (
          <div className={`mb-4 ${backgroundImage ? 'text-white' : ''}`}>
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${textColorClass}`}>{title}</h1>
            {subtitle && (
              <p className={`mt-2 text-lg ${subtitleColorClass}`}>{subtitle}</p>
            )}
          </div>

          {actions && <div className="mt-4 md:mt-0">{actions}</div>}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
