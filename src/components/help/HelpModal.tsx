import { useState } from 'react';
import { FaQuestionCircle, FaInfoCircle } from 'react-icons/fa';
import AnimatedModal from '../ui/AnimatedModal';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'help' | 'howToOrder';
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, initialTab = 'help' }) => {
  const [activeTab, setActiveTab] = useState<'help' | 'howToOrder'>(initialTab);

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-3xl"
      title="Centro de Ayuda"
    >
      {/* Tabs */}
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            className={`px-3 py-2 rounded-md flex items-center ${
              activeTab === 'help' 
                ? 'bg-primario text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('help')}
          >
            <FaQuestionCircle className="mr-2" />
            <span>Ayuda y PQRS</span>
          </button>
          <button
            className={`px-3 py-2 rounded-md flex items-center ${
              activeTab === 'howToOrder' 
                ? 'bg-primario text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('howToOrder')}
          >
            <FaInfoCircle className="mr-2" />
            <span>¿Cómo pedir?</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white px-4 pt-5 pb-6 sm:p-6 overflow-y-auto max-h-[calc(80vh-150px)]">
        {activeTab === 'help' ? (
          <div className="help-section">
            <h4 className="text-lg font-medium mb-4">Preguntas Frecuentes y PQRS</h4>
            
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h5 className="font-medium text-primario mb-2">¿Cómo puedo rastrear mi pedido?</h5>
                <p>Puedes rastrear tu pedido iniciando sesión en tu cuenta y visitando la sección "Mis pedidos". Allí encontrarás información actualizada sobre el estado de tu entrega.</p>
              </div>
              
              <div className="border rounded-md p-4">
                <h5 className="font-medium text-primario mb-2">¿Cuáles son los métodos de pago aceptados?</h5>
                <p>Aceptamos pagos con tarjetas de crédito/débito, transferencias bancarias y pagos contra entrega en efectivo.</p>
              </div>
              
              <div className="border rounded-md p-4">
                <h5 className="font-medium text-primario mb-2">¿Cómo puedo solicitar un reembolso?</h5>
                <p>Si necesitas solicitar un reembolso, por favor contáctanos dentro de los 7 días posteriores a la recepción de tu pedido. Puedes hacerlo a través de nuestro formulario de contacto o llamando a nuestro servicio al cliente.</p>
              </div>
              
              <div className="border rounded-md p-4">
                <h5 className="font-medium text-primario mb-2">¿Tienen servicio de atención al cliente?</h5>
                <p>Sí, nuestro equipo de atención al cliente está disponible de lunes a viernes de 8:00 AM a 6:00 PM y los sábados de 9:00 AM a 1:00 PM. Puedes contactarnos por teléfono, correo electrónico o chat en línea.</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h5 className="font-medium text-lg mb-3">Contacto para PQRS</h5>
              <p className="mb-4">Si tienes alguna petición, queja, reclamo o sugerencia, puedes utilizar cualquiera de los siguientes canales:</p>
              
              <ul className="list-disc pl-5 space-y-2">
                <li>Correo electrónico: <a href="mailto:pqrs@floresinc.com" className="text-primario hover:underline">pqrs@floresinc.com</a></li>
                <li>Teléfono: <a href="tel:+573001234567" className="text-primario hover:underline">+57 300 123 4567</a></li>
                <li>Formulario web: Completa nuestro <a href="#" className="text-primario hover:underline">formulario de PQRS</a></li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="how-to-order-section">
            <h4 className="text-lg font-medium mb-4">Instrucciones para realizar tu pedido</h4>
            
            <div className="space-y-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primario text-white font-bold">1</div>
                </div>
                <div className="ml-4">
                  <h5 className="text-lg font-medium text-primario">Explora nuestro catálogo</h5>
                  <p className="mt-1">Navega por nuestras categorías o utiliza la barra de búsqueda para encontrar los productos que necesitas.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primario text-white font-bold">2</div>
                </div>
                <div className="ml-4">
                  <h5 className="text-lg font-medium text-primario">Agrega productos al carrito</h5>
                  <p className="mt-1">Haz clic en "Agregar al carrito" en los productos que deseas comprar. Puedes ajustar las cantidades según necesites.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primario text-white font-bold">3</div>
                </div>
                <div className="ml-4">
                  <h5 className="text-lg font-medium text-primario">Revisa tu carrito</h5>
                  <p className="mt-1">Verifica los productos seleccionados, cantidades y el total de tu compra antes de proceder al pago.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primario text-white font-bold">4</div>
                </div>
                <div className="ml-4">
                  <h5 className="text-lg font-medium text-primario">Selecciona dirección de entrega</h5>
                  <p className="mt-1">Elige una de tus direcciones guardadas o agrega una nueva para la entrega de tu pedido.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primario text-white font-bold">5</div>
                </div>
                <div className="ml-4">
                  <h5 className="text-lg font-medium text-primario">Elige método de pago y finaliza</h5>
                  <p className="mt-1">Selecciona tu método de pago preferido, confirma los detalles y completa tu compra.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h5 className="font-medium text-lg text-yellow-800 mb-2">Tiempos de entrega</h5>
              <p className="text-yellow-700">Nuestros tiempos de entrega varían según tu ubicación:</p>
              <ul className="list-disc pl-5 mt-2 text-yellow-700">
                <li>Zona urbana: 1-2 días hábiles</li>
                <li>Zona rural: 2-4 días hábiles</li>
                <li>Pedidos especiales: 3-5 días hábiles</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </AnimatedModal>
  );
};

export default HelpModal;
