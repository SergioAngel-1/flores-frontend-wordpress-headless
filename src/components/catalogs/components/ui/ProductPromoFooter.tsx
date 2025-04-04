import React from 'react';

const ProductPromoFooter: React.FC = () => {
  return (
    <div className="p-3 bg-secundario/20 border-t border-secundario mt-auto">
      <span className="text-sm font-medium text-texto flex flex-col items-center justify-center">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primario" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span className="text-primario font-semibold">¡Oferta especial!</span>
        </div>
        <span>Lleva 4g y te regalamos 1g</span>
      </span>
    </div>
  );
};

export default ProductPromoFooter;
