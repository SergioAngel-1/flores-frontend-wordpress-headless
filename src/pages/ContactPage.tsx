import React, { useState } from 'react';
import { FiMail, FiLock, FiPhone, FiUser, FiMapPin, FiShield } from 'react-icons/fi';
import alertify from 'alertifyjs';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.name || !formData.email || !formData.message) {
      alertify.error('Por favor completa los campos obligatorios');
      return;
    }
    
    // Simulación de envío
    setIsSubmitting(true);
    
    try {
      // Aquí iría la lógica real de envío del formulario
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Éxito
      alertify.success('Mensaje enviado correctamente. Te contactaremos pronto.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      alertify.error('Hubo un error al enviar el mensaje. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-primario mb-2">Contacto</h1>
        <p className="text-gray-600 mb-8">Estamos aquí para ayudarte, manteniendo tu privacidad como prioridad</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de contacto */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-oscuro mb-6 flex items-center">
              <FiMail className="mr-2 text-primario" /> Envíanos un mensaje
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-primario focus:border-primario"
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-primario focus:border-primario"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-primario focus:border-primario"
                      placeholder="Tu número de teléfono"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Asunto
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-primario focus:border-primario"
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="consulta">Consulta general</option>
                    <option value="pedido">Información sobre mi pedido</option>
                    <option value="productos">Información sobre productos</option>
                    <option value="privacidad">Privacidad y datos personales</option>
                    <option value="otro">Otro asunto</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full py-2 px-4 border border-gray-300 rounded-md focus:ring-primario focus:border-primario"
                  placeholder="¿En qué podemos ayudarte?"
                  required
                ></textarea>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="privacy"
                    type="checkbox"
                    className="focus:ring-primario h-4 w-4 text-primario border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="privacy" className="font-medium text-gray-700">
                    Acepto la <a href="/privacidad" className="text-primario hover:underline">política de privacidad</a> y el tratamiento de mis datos personales
                  </label>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-primario hover:bg-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primario transition-colors ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </>
                  ) : 'Enviar mensaje'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Información de contacto y privacidad */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-oscuro mb-4 flex items-center">
                <FiMapPin className="mr-2 text-primario" /> Información de contacto
              </h2>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <FiMapPin className="mt-1 mr-3 text-primario" />
                  <span>Calle 123 #45-67, Bogotá, Colombia</span>
                </li>
                <li className="flex items-start">
                  <FiPhone className="mt-1 mr-3 text-primario" />
                  <span>+57 (601) 123-4567</span>
                </li>
                <li className="flex items-start">
                  <FiMail className="mt-1 mr-3 text-primario" />
                  <span>contacto@floresinc.com</span>
                </li>
              </ul>
              
              <div className="mt-6">
                <h3 className="font-medium text-gray-700 mb-2">Horario de atención:</h3>
                <p className="text-gray-600">Lunes a Viernes: 8:00 AM - 6:00 PM</p>
                <p className="text-gray-600">Sábados: 9:00 AM - 1:00 PM</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-oscuro mb-4 flex items-center">
                <FiLock className="mr-2 text-primario" /> Compromiso de privacidad
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primario/10 text-primario">
                      <FiShield size={20} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-md font-medium text-gray-700">Datos protegidos</h3>
                    <p className="text-sm text-gray-500">Toda la información que compartes con nosotros está protegida y encriptada.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primario/10 text-primario">
                      <FiLock size={20} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-md font-medium text-gray-700">No compartimos tu información</h3>
                    <p className="text-sm text-gray-500">Nunca compartiremos tus datos con terceros sin tu consentimiento explícito.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primario/10 text-primario">
                      <FiUser size={20} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-md font-medium text-gray-700">Control sobre tus datos</h3>
                    <p className="text-sm text-gray-500">Tienes derecho a acceder, modificar o eliminar tus datos personales en cualquier momento.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <a href="/privacidad" className="text-primario hover:underline flex items-center">
                  Ver política de privacidad completa <span className="ml-1">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
