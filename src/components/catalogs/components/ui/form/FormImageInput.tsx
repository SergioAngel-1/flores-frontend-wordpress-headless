import React from 'react';

interface FormImageInputProps {
  label: string;
  imageUrl: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: 'small' | 'medium' | 'large';
  fallbackImage?: string;
}

const FormImageInput: React.FC<FormImageInputProps> = ({
  label,
  imageUrl,
  onChange,
  placeholder = 'URL de la imagen',
  size = 'medium',
  fallbackImage = '/wp-content/themes/FloresInc/assets/img/no-image.svg'
}) => {
  // Determinar dimensiones basadas en el tamaño
  const dimensions = {
    small: 'h-24 w-24',
    medium: 'h-32 w-32',
    large: 'h-40 w-40'
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = fallbackImage;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className={`relative ${dimensions[size]} mx-auto mb-2 border border-gray-300 rounded-md overflow-hidden`}>
        <img
          className="h-full w-full object-cover"
          src={imageUrl || fallbackImage}
          alt={label}
          onError={handleError}
        />
      </div>
      <input
        type="text"
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primario focus:border-primario sm:text-sm"
        placeholder={placeholder}
        value={imageUrl || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default FormImageInput;
