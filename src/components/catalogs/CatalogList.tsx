import React from 'react';
import { Catalog } from '../../types/catalog';

interface CatalogListProps {
  catalogs: Catalog[];
  onCatalogClick: (catalogId: number, catalogName: string) => void;
  onDeleteCatalog: (catalogId: number) => void;
  onEditCatalog: (catalog: Catalog) => void;
}

const CatalogList: React.FC<CatalogListProps> = ({ catalogs, onCatalogClick, onDeleteCatalog, onEditCatalog }) => {
  // Función para formatear fecha en formato legible
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Función para manejar el clic en el botón de eliminar
  const handleDeleteClick = (e: React.MouseEvent, catalogId: number) => {
    e.stopPropagation(); // Evitar que el evento se propague al tr
    onDeleteCatalog(catalogId);
  };

  // Función para manejar el clic en el botón de editar
  const handleEditClick = (e: React.MouseEvent, catalog: Catalog) => {
    e.stopPropagation(); // Evitar que el evento se propague al tr
    onEditCatalog(catalog);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Productos
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actualizado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {catalogs.map((catalog) => (
              <tr 
                key={catalog.id} 
                className="catalog-item hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onCatalogClick(catalog.id, catalog.name)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primario/10 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primario" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {catalog.name}
                      </div>
                    </div>
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
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => handleDeleteClick(e, catalog.id)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                    title="Eliminar catálogo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => handleEditClick(e, catalog)}
                    className="text-blue-600 hover:text-blue-900 transition-colors ml-2"
                    title="Editar catálogo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2a2 2 0 01-2-2V7a2 2 0 112 2h7.414a2 2 0 011.414 1.414l1.414-1.414a2 2 0 01.828-2.828V9z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CatalogList;
