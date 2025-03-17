import { useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  // Determinar el ancho del modal según el tamaño
  const getModalWidth = () => {
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'md': return 'max-w-lg';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
      default: return 'max-w-lg';
    }
  };

  // Manejar animaciones
  useEffect(() => {
    if (isOpen) {
      // Animar apertura
      const overlay = document.querySelector('.modal-overlay');
      const content = document.querySelector('.modal-content');
      
      if (overlay && content) {
        gsap.fromTo(
          overlay,
          { opacity: 0 },
          { opacity: 1, duration: 0.3 }
        );
        
        gsap.fromTo(
          content,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.3 }
        );
      }
    }
  }, [isOpen]);

  // Manejar cierre con animación
  const handleClose = () => {
    const overlay = document.querySelector('.modal-overlay');
    const content = document.querySelector('.modal-content');
    
    if (overlay && content) {
      gsap.to(overlay, { opacity: 0, duration: 0.2 });
      gsap.to(content, { 
        opacity: 0, 
        y: -20, 
        duration: 0.2,
        onComplete: onClose
      });
    } else {
      onClose();
    }
  };

  // Manejar cierre al presionar Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="modal-overlay fixed inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      ></div>
      
      {/* Modal */}
      <div className={`modal-content relative bg-white rounded-lg shadow-xl ${getModalWidth()} w-full max-h-[90vh] overflow-hidden z-10`}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          {title && <h2 className="text-xl font-semibold text-gray-800">{title}</h2>}
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
