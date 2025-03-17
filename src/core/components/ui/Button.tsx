import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  // Estilos base
  let baseStyles = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  
  // Estilos según variante
  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500';
      break;
    case 'secondary':
      variantStyles = 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500';
      break;
    case 'outline':
      variantStyles = 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500';
      break;
    case 'text':
      variantStyles = 'text-primary-600 hover:text-primary-800 focus:ring-primary-500';
      break;
    default:
      variantStyles = 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500';
  }
  
  // Estilos según tamaño
  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'text-sm px-3 py-1.5';
      break;
    case 'md':
      sizeStyles = 'text-base px-4 py-2';
      break;
    case 'lg':
      sizeStyles = 'text-lg px-6 py-3';
      break;
    default:
      sizeStyles = 'text-base px-4 py-2';
  }
  
  // Estilos adicionales
  const additionalStyles = [
    fullWidth ? 'w-full' : '',
    disabled || loading ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ');
  
  // Combinar todos los estilos
  const buttonStyles = `${baseStyles} ${variantStyles} ${sizeStyles} ${additionalStyles}`;
  
  return (
    <button
      className={buttonStyles}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
