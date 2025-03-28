import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import alertService from '../../../services/alertService';

const ProfileSection = () => {
  const { user, updateProfile } = useAuth();
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
    
    try {
      console.log('Enviando datos de perfil:', formData); // Depuración
      
      // Verificar si es menor de edad
      if (!formData.isAdult) {
        // Mostrar advertencia
        alertService.confirm(
          'Has indicado que eres menor de 18 años. Tu cuenta será desactivada ya que nuestro servicio es solo para mayores de edad. ¿Deseas continuar?',
          async () => {
            // Actualizar perfil con estado inactivo
            await updateProfile({
              ...formData,
              active: false
            });
            alertService.warning('Tu cuenta ha sido desactivada por ser menor de edad.');
            setIsEditing(false);
          },
          () => {
            // El usuario canceló, no hacer nada
          }
        );
      } else {
        // Usuario mayor de edad, actualizar perfil normalmente
        await updateProfile({
          ...formData,
          active: true
        });
        alertService.success('Perfil actualizado correctamente');
        setIsEditing(false);
      }
    } catch (error: any) {
      alertService.error(error.message || 'Error al actualizar el perfil');
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
                style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primario hover:bg-hover"
                style={{ borderColor: 'transparent' }}
              >
                Guardar
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primario hover:bg-hover"
              style={{ borderColor: 'transparent' }}
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
