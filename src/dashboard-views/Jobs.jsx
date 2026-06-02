import React, { useState } from 'react';
import { Briefcase, Send, CheckCircle } from 'lucide-react';

export default function Jobs() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica real de envío (API)
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      e.target.reset();
    }, 5000);
  };

  return (
    <div className="w-full bg-surface min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 mb-20 md:mb-0">
      <div className="max-w-3xl mx-auto">
        
        {/* Encabezado */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
            <Briefcase className="w-8 h-8" />
          </div>
          <h1 className="font-headline text-3xl sm:text-5xl font-black text-on-surface mb-4 tracking-tight">
            Trabaja con <span className="text-primary">nosotros</span>
          </h1>
          <p className="text-on-surface-variant text-base sm:text-xl max-w-xl mx-auto leading-relaxed">
            Buscamos personas apasionadas, proactivas y con ganas de crecer. ¡Suma tu talento al equipo de Benmarket!
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-surface-container-lowest p-6 sm:p-10 rounded-3xl border border-outline-variant/20 shadow-lg relative overflow-hidden">
          
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
              <div className="bg-green-100 text-green-600 p-4 rounded-full mb-4">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-on-surface mb-2">¡Solicitud Enviada!</h2>
              <p className="text-on-surface-variant max-w-md">
                Gracias por tu interés en formar parte de nuestro equipo. Hemos recibido tu información y nos pondremos en contacto contigo pronto.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-bold text-on-surface">Nombre Completo *</label>
                  <input 
                    type="text" 
                    id="name" 
                    required
                    className="w-full bg-surface-container-low border border-outline-variant/50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface placeholder:text-outline-variant"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-bold text-on-surface">Teléfono / WhatsApp *</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    required
                    className="w-full bg-surface-container-low border border-outline-variant/50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface placeholder:text-outline-variant"
                    placeholder="Ej. 0981 123 456"
                  />
                </div>
              </div>

              {/* Correo */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold text-on-surface">Correo Electrónico *</label>
                <input 
                  type="email" 
                  id="email" 
                  required
                  className="w-full bg-surface-container-low border border-outline-variant/50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface placeholder:text-outline-variant"
                  placeholder="tu@correo.com"
                />
              </div>

              {/* Área de interés */}
              <div className="space-y-2">
                <label htmlFor="area" className="text-sm font-bold text-on-surface">Área de Interés *</label>
                <select 
                  id="area" 
                  required
                  className="w-full bg-surface-container-low border border-outline-variant/50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface appearance-none cursor-pointer"
                >
                  <option value="">Selecciona un área...</option>
                  <option value="atencion">Atención al Cliente / Cajero</option>
                  <option value="repositor">Repositor / Almacén</option>
                  <option value="logistica">Logística / Delivery</option>
                  <option value="administracion">Administración / Finanzas</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Mensaje / Experiencia */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-bold text-on-surface">Cuéntanos sobre ti y tu experiencia</label>
                <textarea 
                  id="message" 
                  rows="4"
                  className="w-full bg-surface-container-low border border-outline-variant/50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface placeholder:text-outline-variant resize-none"
                  placeholder="Escribe brevemente tu experiencia laboral y por qué te gustaría trabajar con nosotros..."
                ></textarea>
              </div>

              {/* Enlace a CV (Opcional) */}
              <div className="space-y-2">
                <label htmlFor="cv" className="text-sm font-bold text-on-surface">Enlace a tu CV (Google Drive, LinkedIn, etc.)</label>
                <input 
                  type="url" 
                  id="cv" 
                  className="w-full bg-surface-container-low border border-outline-variant/50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface placeholder:text-outline-variant"
                  placeholder="https://..."
                />
                <p className="text-xs text-outline-variant mt-1">Asegúrate de que el enlace sea público.</p>
              </div>

              {/* Botón Enviar */}
              <button 
                type="submit" 
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Send className="w-5 h-5" />
                Enviar Solicitud
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
