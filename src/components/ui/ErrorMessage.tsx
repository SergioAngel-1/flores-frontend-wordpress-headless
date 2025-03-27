import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 flex flex-col items-center justify-center text-center">
      <FaExclamationTriangle className="text-red-500 text-3xl mb-2" />
      <p className="text-red-700 mb-3">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primario text-white rounded-md hover:bg-hover transition-colors"
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
