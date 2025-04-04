import React from 'react';
import { Catalog } from '../../../types/catalog';
import CatalogTableHeader from './CatalogTableHeader';
import CatalogRow from './CatalogRow';

interface CatalogTableProps {
  catalogs: Catalog[];
  onCatalogClick: (catalogId: number, catalogName: string) => void;
  onDeleteCatalog: (catalogId: number) => void;
  onEditCatalog: (catalog: Catalog) => void;
}

const CatalogTable: React.FC<CatalogTableProps> = ({ 
  catalogs, 
  onCatalogClick, 
  onDeleteCatalog, 
  onEditCatalog 
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <CatalogTableHeader />
        <tbody className="bg-white divide-y divide-gray-200">
          {catalogs.map((catalog) => (
            <CatalogRow
              key={catalog.id}
              catalog={catalog}
              onCatalogClick={onCatalogClick}
              onDeleteCatalog={onDeleteCatalog}
              onEditCatalog={onEditCatalog}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CatalogTable;
