import React from 'react';
import { Catalog } from '../../../types/catalog';

interface CatalogActionsProps {
  catalog: Catalog;
  onDeleteCatalog: (catalogId: number) => void;
  onEditCatalog: (catalog: Catalog) => void;
}

const CatalogActions: React.FC<CatalogActionsProps> = ({ catalog, onDeleteCatalog, onEditCatalog }) => {
  // Función para manejar el clic en el botón de eliminar
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el evento se propague al tr
    onDeleteCatalog(catalog.id);
  };

  // Función para manejar el clic en el botón de editar
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el evento se propague al tr
    onEditCatalog(catalog);
  };

  return (
    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
      <button
        onClick={handleDeleteClick}
        className="text-red-600 hover:text-red-900 transition-colors inline-flex items-center justify-center"
        title="Eliminar catálogo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
      <button
        onClick={handleEditClick}
        className="text-blue-600 hover:text-blue-900 transition-colors ml-4 inline-flex items-center justify-center"
        title="Editar catálogo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2a2 2 0 01-2-2V7a2 2 0 112 2h7.414a2 2 0 011.414 1.414l1.414-1.414a2 2 0 01.828-2.828V9z" />
        </svg>
      </button>
    </td>
  );
};

export default CatalogActions;
