import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import alertService from '../../../services/alertService';

const ProfileSection = () => {
  const { user, updateProfile, getCurrentUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthDate: user?.birthDate || '',
    gender: user?.gender || '',
    newsletter: user?.newsletter || false,
    isAdult: true // Nueva propiedad para controlar si es mayor de edad
  });
  const [isEditing, setIsEditing] = useState(false);

  // Actualizar el formulario cuando cambie el usuario
  useEffect(() => {
    if (user) {
      console.log('Actualizando formData con datos del usuario:', user);
      console.log('Email del usuario:', user.email); // Depuración adicional para el email
      
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        birthDate: user.birthDate || prev.birthDate,
        gender: user.gender || prev.gender,
        newsletter: user.newsletter || prev.newsletter
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  // Verificar la edad cuando cambia la fecha de nacimiento
  useEffect(() => {
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      setFormData(prev => ({
        ...prev,
        isAdult: age >= 18
      }));
    }
  }, [formData.birthDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación para menor de edad
    if (!formData.isAdult) {
      alertService.confirm(
        'Si eres menor de edad, tu cuenta será desactivada y no podrás realizar compras.',
        async () => {
          try {
            console.log('Actualizando perfil (menor de edad):', formData);
            
            // Actualizar perfil con estado inactivo
            await updateProfile({
              ...formData,
              active: false
            });
            
            // Recargar los datos del usuario para asegurar que se actualicen correctamente
            await getCurrentUser();
            
            // Mostrar mensaje de éxito
            alertService.success('Tu perfil ha sido actualizado. Tu cuenta ha sido desactivada por ser menor de edad.');
            
            // Desactivar modo de edición
            setIsEditing(false);
          } catch (error) {
            alertService.error('No se pudo actualizar el perfil. Por favor, inténtalo de nuevo.');
          }
        }
      );
    } else {
      try {
        // Log para depuración
        console.log('Enviando datos de perfil para actualizar:', formData);
        
        // Actualizar perfil
        await updateProfile({
          ...formData,
          active: true
        });
        
        // Recargar los datos del usuario para asegurar que se actualicen correctamente
        await getCurrentUser();
        
        // Mostrar mensaje de éxito
        alertService.success('Tu perfil ha sido actualizado correctamente.');
        
        // Desactivar modo de edición
        setIsEditing(false);
      } catch (error) {
        alertService.error('No se pudo actualizar el perfil. Por favor, inténtalo de nuevo.');
      }
    }
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
              <p className="text-gray-900" data-component-name="ProfileSection">{formData.email || 'No especificado'}</p>
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
              Fecha de nacimiento
            </label>
            {isEditing ? (
              <div>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primario focus:border-primario"
                />
                {!formData.isAdult && formData.birthDate && (
                  <p className="text-red-500 text-xs mt-1">
                    Debes ser mayor de 18 años para utilizar nuestro servicio.
                  </p>
                )}
              </div>
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
                <option value="prefer_not_to_say">Prefiero no decir</option>
              </select>
            ) : (
              <p className="text-gray-900">
                {formData.gender === 'male' ? 'Masculino' :
                 formData.gender === 'female' ? 'Femenino' :
                 formData.gender === 'other' ? 'Otro' :
                 formData.gender === 'prefer_not_to_say' ? 'Prefiero no decir' :
                 'No especificado'}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            {isEditing ? (
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="newsletter"
                  name="newsletter"
                  checked={formData.newsletter}
                  onChange={handleChange}
                  className="h-4 w-4 text-primario focus:ring-primario border-gray-300 rounded"
                />
                <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700">
                  Suscribirme al boletín de noticias
                </label>
              </div>
            ) : (
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-700">Suscripción al boletín:</span>
                <span className="ml-2 text-gray-900">{formData.newsletter ? 'Suscrito' : 'No suscrito'}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          {isEditing ? (
            <div className="flex space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primario"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primario hover:bg-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primario"
              >
                Guardar cambios
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primario hover:bg-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primario"
              onClick={() => setIsEditing(true)}
            >
              Editar perfil
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileSection;
