import React from 'react';
import FormImageInput from './FormImageInput';

interface FormSecondaryImagesProps {
  image1Url: string;
  image2Url: string;
  onImage1Change: (value: string) => void;
  onImage2Change: (value: string) => void;
}

const FormSecondaryImages: React.FC<FormSecondaryImagesProps> = ({
  image1Url,
  image2Url,
  onImage1Change,
  onImage2Change
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <FormImageInput
        label="Imagen secundaria 1"
        imageUrl={image1Url}
        onChange={onImage1Change}
        placeholder="URL de imagen secundaria 1"
        size="small"
      />
      
      <FormImageInput
        label="Imagen secundaria 2"
        imageUrl={image2Url}
        onChange={onImage2Change}
        placeholder="URL de imagen secundaria 2"
        size="small"
      />
    </div>
  );
};

export default FormSecondaryImages;
