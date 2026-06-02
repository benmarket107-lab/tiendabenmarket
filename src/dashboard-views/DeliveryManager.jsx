import React from 'react';
import DeliveryConfig from '../components/DeliveryConfig';
import WhatsAppConfig from '../components/WhatsAppConfig';

export default function DeliveryManager() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Configuración de la Tienda</h1>
        <p className="text-slate-500 text-sm mt-1">Administra los parámetros de entrega y contacto de BenMarket.</p>
      </div>
      
      <div className="max-w-3xl space-y-6">
        <DeliveryConfig />
        <WhatsAppConfig />
      </div>
    </div>
  );
}
