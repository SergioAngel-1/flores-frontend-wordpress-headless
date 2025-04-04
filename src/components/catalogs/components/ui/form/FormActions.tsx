import React from 'react';

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  loadingLabel?: string;
}

const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  isSubmitting,
  submitLabel = 'Guardar cambios',
  cancelLabel = 'Cancelar',
  loadingLabel = 'Guardando...'
}) => {
  return (
    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primario"
        disabled={isSubmitting}
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-white bg-primario border border-transparent rounded-md hover:bg-primario-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primario"
        disabled={isSubmitting}
      >
        {isSubmitting ? loadingLabel : submitLabel}
      </button>
    </div>
  );
};

export default FormActions;
