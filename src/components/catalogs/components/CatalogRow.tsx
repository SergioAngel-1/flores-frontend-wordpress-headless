import React from 'react';
import { Catalog } from '../../../types/catalog';
import CatalogIcon from './CatalogIcon';
import CatalogActions from './CatalogActions';
// Función para formatear fecha en formato legible
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

interface CatalogRowProps {
  catalog: Catalog;
  onCatalogClick: (catalogId: number, catalogName: string) => void;
  onDeleteCatalog: (catalogId: number) => void;
  onEditCatalog: (catalog: Catalog) => void;
}

const CatalogRow: React.FC<CatalogRowProps> = ({ 
  catalog, 
  onCatalogClick, 
  onDeleteCatalog, 
  onEditCatalog 
}) => {
  return (
    <tr 
      key={catalog.id} 
      className="catalog-item hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onCatalogClick(catalog.id, catalog.name)}
    >
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="flex justify-center">
          <CatalogIcon logoUrl={catalog.logo_url} />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {catalog.name}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{catalog.product_count} productos</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{formatDate(catalog.created_at)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(catalog.updated_at)}
      </td>
      <CatalogActions 
        catalog={catalog} 
        onDeleteCatalog={onDeleteCatalog} 
        onEditCatalog={onEditCatalog} 
      />
    </tr>
  );
};

export default CatalogRow;
