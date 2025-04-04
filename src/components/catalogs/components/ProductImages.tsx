import React from 'react';
import FormImageInput from './ui/form/FormImageInput';
import FormSecondaryImages from './ui/form/FormSecondaryImages';
import { cleanImageUrlForStorage, processSecondaryImage } from '../../../utils/formatters';

interface ProductImagesProps {
  mainImage: string;
  secondaryImage1: string;
  secondaryImage2: string;
  onMainImageChange: (value: string) => void;
  onSecondaryImage1Change: (value: string) => void;
  onSecondaryImage2Change: (value: string) => void;
}

const ProductImages: React.FC<ProductImagesProps> = ({
  mainImage,
  secondaryImage1,
  secondaryImage2,
  onMainImageChange,
  onSecondaryImage1Change,
  onSecondaryImage2Change
}) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-2">Imágenes del producto</h3>
      
      {/* Imagen principal */}
      <div className="mb-6">
        <FormImageInput
          label="Imagen principal"
          imageUrl={mainImage}
          onChange={onMainImageChange}
          placeholder="URL de la imagen principal"
          size="large"
        />
      </div>
      
      {/* Imágenes secundarias */}
      <FormSecondaryImages
        image1Url={processSecondaryImage(secondaryImage1)}
        image2Url={processSecondaryImage(secondaryImage2)}
        onImage1Change={(value) => onSecondaryImage1Change(cleanImageUrlForStorage(value))}
        onImage2Change={(value) => onSecondaryImage2Change(cleanImageUrlForStorage(value))}
      />
    </div>
  );
};

export default ProductImages;
