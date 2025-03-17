import { useState } from 'react';
import alertService from '../../../services/alertService';

// Tipo para las direcciones
interface Address {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const AddressesSection = () => {
  // Direcciones de ejemplo
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 1,
      name: 'Casa',
      address: 'Calle 123 #45-67',
      city: 'Bogotá',
      state: 'Cundinamarca',
      postalCode: '110111',
      country: 'Colombia',
      phone: '3194417983',
      isDefault: true
    },
    {
      id: 2,
      name: 'Oficina',
      address: 'Carrera 7 #71-21, Oficina 701',
      city: 'Bogotá',
      state: 'Cundinamarca',
      postalCode: '110231',
      country: 'Colombia',
      phone: '3194417983',
      isDefault: false
    }
  ]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAddressId !== null) {
      // Actualizar dirección existente
      setAddresses(addresses.map(addr => 
        addr.id === editingAddressId 
          ? { ...addr, ...formData } 
          : addr
      ));
      alertService.success('Dirección actualizada correctamente');
    } else {
      // Agregar nueva dirección
      const newAddress: Address = {
        id: Date.now(),
        ...formData,
        isDefault: addresses.length === 0
      };
      setAddresses([...addresses, newAddress]);
      alertService.success('Dirección agregada correctamente');
    }
    
    resetForm();
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

  const handleDelete = (id: number) => {
    alertService.confirm(
      '¿Estás seguro de que deseas eliminar esta dirección?',
      () => {
        setAddresses(addresses.filter(addr => addr.id !== id));
        alertService.success('Dirección eliminada correctamente');
      }
    );
  };

  const setAsDefault = (id: number) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
    alertService.success('Dirección establecida como predeterminada');
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-700">Mis direcciones</h4>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primario hover:bg-hover"
          >
            Agregar dirección
          </button>
        )}
      </div>

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
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primario hover:bg-hover"
              >
                {editingAddressId !== null ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No tienes direcciones guardadas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map(address => (
            <div 
              key={address.id} 
              className={`border rounded-md p-4 ${address.isDefault ? 'border-primario bg-secundario/10' : 'border-gray-200'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium text-gray-900">{address.name}</h5>
                  {address.isDefault && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primario text-white mt-1">
                      Predeterminada
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="text-gray-500 hover:text-primario"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                <p>{address.address}</p>
                <p>{address.city}, {address.state}, {address.postalCode}</p>
                <p>{address.country}</p>
                <p className="mt-1">Tel: {address.phone}</p>
              </div>
              {!address.isDefault && (
                <div className="mt-3">
                  <button
                    onClick={() => setAsDefault(address.id)}
                    className="text-sm text-primario hover:text-hover"
                  >
                    Establecer como predeterminada
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressesSection;
