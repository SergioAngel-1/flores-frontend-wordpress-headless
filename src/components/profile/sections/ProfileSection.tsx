import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import alertService from '../../../services/alertService';

const ProfileSection = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    documentId: user?.documentId || '',
    birthDate: user?.birthDate || '',
    gender: user?.gender || '',
    newsletter: user?.newsletter || false
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para actualizar el perfil
    // Por ahora solo mostraremos una alerta
    alertService.success('Perfil actualizado correctamente');
    setIsEditing(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primario focus:border-primario"
                required
              />
            ) : (
              <p className="text-gray-900">{formData.firstName || 'No especificado'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido
            </label>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primario focus:border-primario"
                required
              />
            ) : (
              <p className="text-gray-900">{formData.lastName || 'No especificado'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primario focus:border-primario"
                required
              />
            ) : (
              <p className="text-gray-900">{formData.email || 'No especificado'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primario focus:border-primario"
              />
            ) : (
              <p className="text-gray-900">{formData.phone || 'No especificado'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cédula de ciudadanía
            </label>
            {isEditing ? (
              <input
                type="text"
                name="documentId"
                value={formData.documentId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primario focus:border-primario"
              />
            ) : (
              <p className="text-gray-900">{formData.documentId || 'No especificado'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de nacimiento
            </label>
            {isEditing ? (
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primario focus:border-primario"
              />
            ) : (
              <p className="text-gray-900">{formData.birthDate || 'No especificado'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Género
            </label>
            {isEditing ? (
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primario focus:border-primario"
              >
                <option value="">Seleccionar</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            ) : (
              <p className="text-gray-900">
                {formData.gender === 'male' ? 'Masculino' : 
                 formData.gender === 'female' ? 'Femenino' : 
                 formData.gender === 'other' ? 'Otro' : 'No especificado'}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <div className="flex items-center">
              {isEditing ? (
                <input
                  type="checkbox"
                  name="newsletter"
                  checked={formData.newsletter}
                  onChange={handleChange}
                  className="h-4 w-4 text-primario focus:ring-primario border-gray-300 rounded"
                />
              ) : (
                <div className={`h-4 w-4 border rounded ${formData.newsletter ? 'bg-primario' : 'bg-white'}`}></div>
              )}
              <label className="ml-2 block text-sm text-gray-700">
                Quiero recibir el boletín informativo con promociones
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primario hover:bg-hover"
              >
                Guardar cambios
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primario hover:bg-hover"
            >
              Editar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileSection;
