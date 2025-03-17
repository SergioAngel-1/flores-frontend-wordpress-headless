import { CheckoutFormData } from './CheckoutForm';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onChange: (method: 'card' | 'transfer' | 'cash') => void;
  formData: CheckoutFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PaymentMethodSelector = ({
  selectedMethod,
  onChange,
  formData,
  handleChange
}: PaymentMethodSelectorProps) => {
  return (
    <div>
      <div className="space-y-4 mb-6">
        {/* Tarjeta de crédito/débito */}
        <div className="flex items-center">
          <input
            type="radio"
            id="card"
            name="paymentMethod"
            value="card"
            checked={selectedMethod === 'card'}
            onChange={() => onChange('card')}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
          />
          <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-700">
            Tarjeta de crédito/débito
          </label>
        </div>
        
        {/* Transferencia bancaria */}
        <div className="flex items-center">
          <input
            type="radio"
            id="transfer"
            name="paymentMethod"
            value="transfer"
            checked={selectedMethod === 'transfer'}
            onChange={() => onChange('transfer')}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
          />
          <label htmlFor="transfer" className="ml-3 block text-sm font-medium text-gray-700">
            Transferencia bancaria
          </label>
        </div>
        
        {/* Efectivo en entrega */}
        <div className="flex items-center">
          <input
            type="radio"
            id="cash"
            name="paymentMethod"
            value="cash"
            checked={selectedMethod === 'cash'}
            onChange={() => onChange('cash')}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
          />
          <label htmlFor="cash" className="ml-3 block text-sm font-medium text-gray-700">
            Efectivo en entrega
          </label>
        </div>
      </div>
      
      {/* Campos adicionales según el método de pago seleccionado */}
      {selectedMethod === 'card' && (
        <div className="bg-gray-50 p-4 rounded-md space-y-4">
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Número de tarjeta *
            </label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber || ''}
              onChange={handleChange}
              placeholder="1234 5678 9012 3456"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre en la tarjeta *
            </label>
            <input
              type="text"
              id="cardName"
              name="cardName"
              value={formData.cardName || ''}
              onChange={handleChange}
              placeholder="Juan Pérez"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de expiración *
              </label>
              <input
                type="text"
                id="cardExpiry"
                name="cardExpiry"
                value={formData.cardExpiry || ''}
                onChange={handleChange}
                placeholder="MM/AA"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700 mb-1">
                CVC/CVV *
              </label>
              <input
                type="text"
                id="cardCvc"
                name="cardCvc"
                value={formData.cardCvc || ''}
                onChange={handleChange}
                placeholder="123"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      )}
      
      {selectedMethod === 'transfer' && (
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-700">
            Realiza una transferencia a nuestra cuenta bancaria. Por favor, usa tu número de pedido como referencia.
            Te enviaremos los detalles de nuestra cuenta bancaria por correo electrónico después de realizar el pedido.
          </p>
        </div>
      )}
      
      {selectedMethod === 'cash' && (
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-700">
            Paga en efectivo al momento de la entrega. Ten en cuenta que nuestro repartidor puede no tener cambio para billetes grandes.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
