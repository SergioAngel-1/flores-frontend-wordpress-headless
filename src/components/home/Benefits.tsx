import React from 'react';
import { FaTruck, FaLock, FaHeadset, FaMoneyBillWave } from 'react-icons/fa';

const Benefits: React.FC = () => {
  const benefits = [
    {
      id: 1,
      icon: <FaTruck className="text-3xl text-primario" />,
      title: 'Envío Gratis',
      description: 'En pedidos mayores a $50.000'
    },
    {
      id: 2,
      icon: <FaLock className="text-3xl text-primario" />,
      title: 'Pago Seguro',
      description: 'Transacciones 100% seguras'
    },
    {
      id: 3,
      icon: <FaHeadset className="text-3xl text-primario" />,
      title: 'Soporte 24/7',
      description: 'Atención al cliente permanente'
    },
    {
      id: 4,
      icon: <FaMoneyBillWave className="text-3xl text-primario" />,
      title: 'Garantía de Devolución',
      description: 'Devolución sin complicaciones'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-16 md:px-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primario">Nuestros Beneficios</h2>
          <p className="text-gray-600 text-lg">Lo que nos hace diferentes</p>
          <div className="w-20 h-1 bg-primario mx-auto mt-6 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit) => (
            <div 
              key={benefit.id} 
              className="flex flex-col items-center p-6 text-center bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="mb-4 bg-primario/10 p-4 rounded-full transform transition-transform hover:scale-110">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
