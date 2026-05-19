import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, ShoppingBag, CreditCard, Truck } from 'lucide-react';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  const faqs = [
    {
      question: "¿Cómo realizo una compra en Benmarket?",
      answer: "Navega por nuestras categorías, selecciona los productos que deseas y agrégalos al carrito. Una vez listo, ve a 'Finalizar Compra', completa tus datos de envío, elige tu método de pago preferido y confirma el pedido.",
      icon: <ShoppingBag className="w-5 h-5 text-primary" />
    },
    {
      question: "¿Cuáles son los métodos de pago aceptados?",
      answer: "Aceptamos transferencias bancarias, billeteras virtuales (Tigo Money, Billetera Personal, Zimple), tarjetas de crédito/débito y pago en efectivo contra entrega (solo válido para ciertas zonas).",
      icon: <CreditCard className="w-5 h-5 text-primary" />
    },
    {
      question: "¿Tienen servicio de delivery?",
      answer: "Sí, contamos con servicio de delivery a Ciudad del Este. El costo varía según la zona.",
      icon: <Truck className="w-5 h-5 text-primary" />
    },
    {
      question: "¿Puedo retirar mi pedido en la tienda física?",
      answer: "¡Por supuesto! Al finalizar tu compra, puedes seleccionar la opción 'Retiro en Tienda'. Te notificaremos vía WhatsApp cuando tu pedido esté listo para ser retirado en Av. Julio Cesar Riquelme, km 7.",
      icon: <MessageCircle className="w-5 h-5 text-primary" />
    },
    {
      question: "¿Qué pasa si un producto llega en mal estado o incompleto?",
      answer: "En Benmarket garantizamos la calidad de nuestros productos. Si tienes algún inconveniente, comunícate con nosotros por WhatsApp dentro de las primeras 24 horas y realizaremos el cambio o reembolso correspondiente sin costo adicional.",
      icon: <HelpCircle className="w-5 h-5 text-primary" />
    },
    {
      question: "¿Cuáles son los horarios de atención y entregas?",
      answer: "Nuestra plataforma web está abierta las 24 horas. Las entregas se realizan de Lunes a Sábados de 07:00 a 22:00 hrs, y Domingos de 08:00 a 14:00 hrs. El local físico atiende en el mismo horario.",
      icon: <HelpCircle className="w-5 h-5 text-primary" />
    }
  ];

  return (
    <div className="w-full bg-surface min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 mb-20 md:mb-0">
      <div className="max-w-3xl mx-auto">
        
        {/* Encabezado */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="font-headline text-3xl sm:text-5xl font-black text-on-surface mb-4 tracking-tight">
            Preguntas <span className="text-primary">Frecuentes</span>
          </h1>
          <p className="text-on-surface-variant text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Resolvemos tus dudas más comunes para que tu experiencia en Benmarket sea rápida y segura.
          </p>
        </div>

        {/* Lista de FAQs */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`bg-surface-container-lowest border rounded-2xl overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'border-primary/50 shadow-md' : 'border-outline-variant/20 hover:border-primary/30'
              }`}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none"
              >
                <div className="flex items-center gap-4">
                  <div className="shrink-0 bg-primary/5 p-2 rounded-xl">
                    {faq.icon}
                  </div>
                  <h3 className={`font-bold text-base sm:text-lg transition-colors ${openIndex === index ? 'text-primary' : 'text-on-surface'}`}>
                    {faq.question}
                  </h3>
                </div>
                <div className="shrink-0 ml-4 text-on-surface-variant">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>
              
              <div 
                className={`px-5 sm:px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pl-14 text-on-surface-variant text-sm sm:text-base leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action (Contacto) */}
        <div className="mt-12 bg-primary/5 rounded-3xl p-8 text-center border border-primary/10">
          <h3 className="font-bold text-xl text-on-surface mb-3">¿Aún tienes dudas?</h3>
          <p className="text-on-surface-variant mb-6 max-w-lg mx-auto">
            Nuestro equipo de atención al cliente está listo para ayudarte con cualquier consulta adicional que tengas.
          </p>
          <a 
            href="#" 
            className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30"
          >
            <MessageCircle className="w-5 h-5" />
            Contáctanos por WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}
