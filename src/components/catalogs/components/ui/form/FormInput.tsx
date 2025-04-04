import React from 'react';

interface FormInputProps {
  id: string;
  label: string;
  value: string | number | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  min?: string;
  step?: string;
  className?: string;
  helperText?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
  min,
  step,
  className = '',
  helperText
}) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        id={id}
        value={value !== null ? value : ''}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primario focus:border-primario"
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        step={step}
      />
      {helperText && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
};

export default FormInput;
