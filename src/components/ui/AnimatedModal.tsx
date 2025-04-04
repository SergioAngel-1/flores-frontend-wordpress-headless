import React, { useEffect, useState, useRef } from 'react';
import './AnimatedModal.css';

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  hideCloseButton?: boolean;
  maxWidth?: string;
}

const AnimatedModal: React.FC<AnimatedModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  className = "",
  title = "",
  hideCloseButton = false,
  maxWidth = "max-w-xl"
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
      
      // Forzar una actualización para activar la animación
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else if (isAnimating) {
      setIsVisible(false);
      
      // Limpiar cualquier timeout anterior
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      // Esperar a que termine la animación de salida
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        // Restaurar el overflow solo después de que termine la animación
        document.body.style.overflow = '';
      }, 350); // Un poco más de tiempo que la duración de la transición
    }
    
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      // Asegurarse de restaurar el overflow si el componente se desmonta
      document.body.style.overflow = '';
    };
  }, [isOpen, isAnimating]);

  if (!isAnimating) return null;
  
  return (
    <div 
      className={`animated-modal-overlay ${isVisible ? 'visible' : ''}`}
      onClick={onClose}
    >
      <div 
        className={`animated-modal-content ${isVisible ? 'visible' : ''} ${className} ${maxWidth}`}
        onClick={(e) => e.stopPropagation()}
      >
        {!hideCloseButton && (
          <div className="animated-modal-header">
            {title && <h2 className="animated-modal-title">{title}</h2>}
            <button 
              className="animated-modal-close-btn" 
              onClick={onClose} 
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        )}
        <div className="animated-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AnimatedModal;
