import React from 'react';
import FormInput from './form/FormInput';

interface CatalogHeaderProps {
  name: string;
  logoUrl: string;
  onNameChange: (value: string) => void;
  onLogoUrlChange: (value: string) => void;
  isEditing: boolean;
}

const CatalogHeader: React.FC<CatalogHeaderProps> = ({
  name,
  logoUrl,
  onNameChange,
  onLogoUrlChange,
  isEditing
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {isEditing ? 'Editar catálogo' : 'Crear catálogo'}
      </h2>
      
      <FormInput
        id="catalog-name"
        label="Nombre del catálogo"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Ingresa un nombre para el catálogo"
      />
      
      <FormInput
        id="catalog-logo"
        label="Logo del catálogo"
        value={logoUrl}
        onChange={(e) => onLogoUrlChange(e.target.value)}
        placeholder="Ingresa la URL del logo del catálogo"
      />
    </div>
  );
};

export default CatalogHeader;
