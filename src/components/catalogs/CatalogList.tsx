import React from 'react';
import { Catalog } from '../../types/catalog';
import CatalogTable from './components/CatalogTable';

interface CatalogListProps {
  catalogs: Catalog[];
  onCatalogClick: (catalogId: number, catalogName: string) => void;
  onDeleteCatalog: (catalogId: number) => void;
  onEditCatalog: (catalog: Catalog) => void;
}

/**
 * Componente que muestra la lista de catálogos en una tabla
 * Utiliza componentes más pequeños para mejorar la mantenibilidad
 */
const CatalogList: React.FC<CatalogListProps> = ({ 
  catalogs, 
  onCatalogClick, 
  onDeleteCatalog, 
  onEditCatalog 
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <CatalogTable 
        catalogs={catalogs}
        onCatalogClick={onCatalogClick}
        onDeleteCatalog={onDeleteCatalog}
        onEditCatalog={onEditCatalog}
      />
    </div>
  );
};

export default CatalogList;
