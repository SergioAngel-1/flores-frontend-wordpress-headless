import { useState, useEffect } from 'react';
import alertService from '../../../services/alertService';
import { useAuth, Address } from '../../../contexts/AuthContext';

const AddressesSection = () => {
  const { user, saveAddress, deleteAddress, setDefaultAddress } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<Address, 'id' | 'isDefault'>>({
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Colombia',
    phone: ''
  });

  // Cargar direcciones del usuario
  useEffect(() => {
    if (user && user.addresses) {
      setAddresses(user.addresses);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Verificar límite de direcciones
      if (!editingAddressId && addresses.length >= 3) {
        alertService.error('Has alcanzado el límite máximo de 3 direcciones');
        return;
      }
      
      const addressData: Partial<Address> = {
        ...formData
      };
      
      // Si estamos editando, incluir el ID
      if (editingAddressId !== null) {
        addressData.id = editingAddressId;
      }
      
      await saveAddress(addressData);
      
      if (editingAddressId !== null) {
        alertService.success('Dirección actualizada correctamente');
      } else {
        alertService.success('Dirección agregada correctamente');
      }
      
      resetForm();
    } catch (error: any) {
      alertService.error(error.message || 'Error al guardar la dirección');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Colombia',
      phone: ''
    });
    setShowAddForm(false);
    setEditingAddressId(null);
  };

  const handleEdit = (address: Address) => {
    setFormData({
      name: address.name,
      address: address.address,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone
    });
    setEditingAddressId(address.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    alertService.confirm(
      '¿Estás seguro de que deseas eliminar esta dirección?',
      async () => {
        try {
          await deleteAddress(id);
          alertService.success('Dirección eliminada correctamente');
        } catch (error: any) {
          alertService.error(error.message || 'Error al eliminar la dirección');
        }
      }
    );
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
      alertService.success('Dirección establecida como predeterminada');
    } catch (error: any) {
      alertService.error(error.message || 'Error al establecer la dirección predeterminada');
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-700">Mis direcciones</h4>
        {!showAddForm && addresses.length < 3 && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primario hover:bg-hover"
            style={{ borderColor: 'transparent' }}
          >
            Agregar dirección
          </button>
        )}
      </div>

      {/* Mensaje de límite de direcciones */}
      {addresses.length >= 3 && !showAddForm && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            Has alcanzado el límite máximo de 3 direcciones. Para agregar una nueva, debes eliminar alguna existente.
          </p>
        </div>
      )}

      {showAddForm ? (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h5 className="text-md font-medium text-gray-700 mb-4">
            {editingAddressId !== null ? 'Editar dirección' : 'Agregar nueva dirección'}
          </h5>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la dirección
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Casa, Trabajo, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primario focus:border-primario"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primario focus:border-primario"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Calle, número, apartamento, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primario focus:border-primario"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primario focus:border-primario"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primario focus:border-primario"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código postal
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primario focus:border-primario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primario focus:border-primario"
                  required
                >
                  <option value="Colombia">Colombia</option>
                  <option value="Ecuador">Ecuador</option>
                  <option value="Perú">Perú</option>
                  <option value="Venezuela">Venezuela</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={resetForm}
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
                {editingAddressId !== null ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-md">
              <p className="text-gray-500">No tienes direcciones guardadas</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-primario hover:text-hover"
                style={{ border: 'none', backgroundColor: 'transparent', padding: '0.5em 1em' }}
              >
                Agregar tu primera dirección
              </button>
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address.id}
                className={`border ${
                  address.isDefault ? 'border-primario' : 'border-gray-200'
                } rounded-md p-4 relative`}
              >
                {address.isDefault && (
                  <span className="absolute top-2 right-2 bg-primario text-white text-xs px-2 py-1 rounded-full">
                    Predeterminada
                  </span>
                )}
                <div>
                  <h5 className="font-medium text-gray-900">{address.name}</h5>
                  <p className="text-gray-600 mt-1">{address.address}</p>
                  <p className="text-gray-600">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-gray-600">{address.country}</p>
                  <p className="text-gray-600 mt-1">Tel: {address.phone}</p>
                </div>
                
                {/* Botones de acción */}
                <div className="flex justify-end mt-4 space-x-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="px-3 py-1 text-xs border border-blue-600 text-blue-600 rounded-md transition-colors duration-200"
                      style={{ 
                        backgroundColor: 'white', 
                        borderColor: 'rgb(37, 99, 235)'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgb(37, 99, 235)';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.color = 'rgb(37, 99, 235)';
                      }}
                    >
                      Predeterminada
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(address)}
                    className="px-3 py-1 text-xs border border-blue-600 text-blue-600 rounded-md transition-colors duration-200"
                    style={{ 
                      backgroundColor: 'white', 
                      borderColor: 'rgb(37, 99, 235)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgb(37, 99, 235)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = 'rgb(37, 99, 235)';
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="px-3 py-1 text-xs border border-red-600 text-red-600 rounded-md transition-colors duration-200"
                    style={{ 
                      backgroundColor: 'white', 
                      borderColor: 'rgb(220, 38, 38)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgb(220, 38, 38)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = 'rgb(220, 38, 38)';
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AddressesSection;
