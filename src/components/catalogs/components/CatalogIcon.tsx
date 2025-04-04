import React from 'react';

interface CatalogIconProps {
  logoUrl?: string;
}

const CatalogIcon: React.FC<CatalogIconProps> = ({ logoUrl }) => {
  // Si hay logo, mostrarlo, sino mostrar el icono por defecto
  if (logoUrl) {
    return (
      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full overflow-hidden">
        <img 
          src={logoUrl} 
          alt="Logo del catálogo" 
          className="h-full w-full object-cover"
          onError={(e) => {
            // Si hay error al cargar la imagen, mostrar el icono por defecto
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement?.classList.add('bg-primario/10');
          }}
        />
      </div>
    );
  }
  
  // Icono por defecto si no hay logo
  return (
    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primario/10 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primario" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  );
};

export default CatalogIcon;
